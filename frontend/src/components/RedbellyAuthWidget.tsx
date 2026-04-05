import { useState, useCallback, useEffect } from "react";
import { BrowserProvider } from "ethers";
import "./RedbellyWidgetMock.css";

declare global {
  interface Window {
    ethereum?: unknown;
  }
}

const API_BASE = import.meta.env.VITE_API_URL || "";

/** Fetch and parse JSON; if server returns HTML (e.g. 502 or SPA fallback), throw a clear error. */
async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, options);
  const contentType = res.headers.get("content-type") ?? "";
  const isJson =
    contentType.includes("application/json") ||
    (contentType === "" && (res.status === 204 || res.ok));
  if (!isJson) {
    const text = await res.text();
    if (text.trimStart().startsWith("<!") || text.trimStart().startsWith("<html")) {
      throw new Error(
        "Server returned HTML instead of JSON. Is the backend running? (port 3003)"
      );
    }
    throw new Error(res.ok ? "Invalid response format." : `Request failed: ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

const JOIN_MESSAGE_PREFIX = "I declare region ";
const JOIN_MESSAGE_SUFFIX = " and accept DAO Terms v1";

function isUserRejection(e: unknown): boolean {
  if (e instanceof Error) {
    const err = e as { code?: number };
    if (err.code === 4001) return true;
    const msg = e.message.toLowerCase();
    return (
      msg.includes("user rejected") ||
      msg.includes("action_rejected") ||
      (msg.includes("rejected") && msg.includes("reason")) ||
      msg.includes("user denied") ||
      msg.includes("user-denied") ||
      msg.includes("ethers-user-denied") ||
      msg.includes("user cancelled")
    );
  }
  return false;
}

export function RedbellyAuthWidget() {
  const [address, setAddress] = useState<string | null>(null);
  const [eligibility, setEligibility] = useState<{
    hasCAT: boolean;
    isMember: boolean;
    canJoin: boolean;
  } | null>(null);
  const [regions, setRegions] = useState<Record<string, { cap: number; current: number }>>({});
  const [joinTxHash, setJoinTxHash] = useState<string | null>(null);
  const [alreadyMember, setAlreadyMember] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState("EU");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<"connect" | "check" | "join" | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const hasWallet = typeof window !== "undefined" && !!window.ethereum;

  const fetchEligibility = useCallback(async (addr: string) => {
    const data = await fetchJson<{ hasCAT: boolean; isMember: boolean; canJoin: boolean }>(
      `${API_BASE}/api/eligibility?address=${encodeURIComponent(addr)}`
    );
    return data;
  }, []);

  const fetchRegions = useCallback(async () => {
    return fetchJson<Record<string, { cap: number; current: number }>>(
      `${API_BASE}/api/regions`
    );
  }, []);

  /** When user has connected, listen for account change; detect switch and re-check eligibility. */
  useEffect(() => {
    if (!address || !hasWallet || !window.ethereum) return;
    const provider = window.ethereum as { on?: (event: string, handler: (accounts: string[]) => void) => void };
    if (typeof provider.on !== "function") return;
    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        setAddress(null);
        setEligibility(null);
        setRegions({});
        setJoinTxHash(null);
        setAlreadyMember(false);
        setError(null);
        return;
      }
      const newAddr = accounts[0];
      if (newAddr && newAddr !== address) {
        setAddress(newAddr);
        setJoinTxHash(null);
        setAlreadyMember(false);
        setEligibility(null);
        setRegions({});
        setError(null);
        fetchEligibility(newAddr).then((elig) => {
          setEligibility(elig);
          fetchRegions().then(setRegions);
        }).catch(() => {});
      }
    };
    provider.on("accountsChanged", handleAccountsChanged);
    return () => {
      if (typeof (provider as { removeListener?: (e: string, h: (accounts: string[]) => void) => void }).removeListener === "function") {
        (provider as { removeListener: (e: string, h: (accounts: string[]) => void) => void }).removeListener("accountsChanged", handleAccountsChanged);
      }
    };
  }, [address, hasWallet, fetchEligibility, fetchRegions]);

  const handleConnect = async () => {
    if (!hasWallet) {
      setError("No MetaMask / wallet (window.ethereum). Install the extension.");
      return;
    }
    setError(null);
    setLoading("connect");
    try {
      const provider = new BrowserProvider(window.ethereum as never);
      const signer = await provider.getSigner();
      const addr = await signer.getAddress();
      setAddress(addr);
      setJoinTxHash(null);
      setAlreadyMember(false);
      setEligibility(null);
      setRegions({});
    } catch (e) {
      setError(
        isUserRejection(e)
          ? "Connection cancelled."
          : (e instanceof Error ? e.message : "Wallet connection error")
      );
    } finally {
      setLoading(null);
    }
  };

  const handleCheckEligibility = async () => {
    if (!address) {
      setError("Connect your wallet first.");
      return;
    }
    setError(null);
    setLoading("check");
    try {
      const [elig, regs] = await Promise.all([fetchEligibility(address), fetchRegions()]);
      setEligibility(elig);
      setRegions(regs);
      const regionKeys = Object.keys(regs);
      if (regionKeys.length && !regionKeys.includes(selectedRegion)) {
        setSelectedRegion(regionKeys[0]);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Eligibility check failed");
    } finally {
      setLoading(null);
    }
  };

  const handleJoinDAO = async () => {
    if (!address || !window.ethereum) {
      setError("Connect your wallet and check eligibility first.");
      return;
    }
    const message = JOIN_MESSAGE_PREFIX + selectedRegion + JOIN_MESSAGE_SUFFIX;
    setError(null);
    setLoading("join");
    try {
      const provider = new BrowserProvider(window.ethereum as never);
      const signer = await provider.getSigner();
      const signature = await signer.signMessage(message);
      const res = await fetch(`${API_BASE}/api/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          address,
          region: selectedRegion,
          signature,
          message,
        }),
      });
      const contentType = res.headers.get("content-type") ?? "";
      let data: { status?: string; txHash?: string; error?: string };
      if (contentType.includes("application/json")) {
        data = (await res.json()) as { status?: string; txHash?: string; error?: string };
      } else {
        const text = await res.text();
        if (text.trimStart().startsWith("<!")) {
          throw new Error("Server returned HTML. Is the backend running? (port 3003)");
        }
        data = { error: `Request failed: ${res.status}` };
      }
      if (!res.ok) {
        if (res.status === 409 || data.error?.toLowerCase().includes("already")) {
          setAlreadyMember(true);
          setError(null);
        } else {
          setError(data.error || "Join failed");
        }
        return;
      }
      setJoinTxHash(data.txHash ?? null);
      setAlreadyMember(false);
      setEligibility((e) => (e ? { ...e, isMember: true, canJoin: false } : null));
    } catch (e) {
      setError(
        isUserRejection(e)
          ? "Transaction cancelled."
          : (e instanceof Error ? e.message : "Join DAO error")
      );
    } finally {
      setLoading(null);
    }
  };

  const shortAddress = address
    ? `${address.slice(0, 6)}…${address.slice(-4)}`
    : null;

  const handleClose = () => {
    setAddress(null);
    setEligibility(null);
    setRegions({});
    setJoinTxHash(null);
    setAlreadyMember(false);
    setError(null);
  };

  const regionOptions = Object.keys(regions).length ? Object.keys(regions) : ["EU", "AF", "NG", "US", "GB", "AU", "PL"];

  return (
    <div className="redbelly-widget-container">
      <div className="redbelly-widget-header">
        <div className="redbelly-logo">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
            <path d="M12 12L12 8M12 12L16 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <span className="redbelly-flow-text">Connect → Check → Region → Join</span>
        </div>
        <button
          className={`redbelly-toggle-btn ${!isExpanded ? "redbelly-toggle-btn--pulse" : ""}`}
          onClick={() => setIsExpanded(!isExpanded)}
          aria-label={isExpanded ? "Collapse" : "Expand"}
        >
          {isExpanded ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="18 15 12 9 6 15" />
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          )}
        </button>
      </div>

      {isExpanded && (
        <div className="redbelly-widget-content">
          <div className="redbelly-app-name">DAO Platform – Membership (CAT + Region)</div>

          {!hasWallet && (
            <div className="redbelly-step-error">
              <div className="redbelly-error-icon">!</div>
              <h3>No wallet</h3>
              <p>Install MetaMask or another wallet with window.ethereum (e.g. Redbelly Testnet).</p>
            </div>
          )}

          {hasWallet && (
            <>
              {address && (
                <div className="redbelly-success-details" style={{ marginBottom: 16 }}>
                  <div className="redbelly-success-item">
                    <span className="redbelly-label">Wallet:</span>
                    <span className="redbelly-value">{shortAddress}</span>
                  </div>
                  {eligibility !== null && (
                    <>
                      <div className="redbelly-success-item">
                        <span className="redbelly-label">CAT (Permission):</span>
                        <span className={`redbelly-value ${eligibility.hasCAT ? "redbelly-value-success" : ""}`}>
                          {eligibility.hasCAT ? "Verified" : "Not verified"}
                        </span>
                      </div>
                      <div className="redbelly-success-item">
                        <span className="redbelly-label">Member:</span>
                        <span className={`redbelly-value ${eligibility.isMember ? "redbelly-value-success" : ""}`}>
                          {eligibility.isMember ? "Yes" : "No"}
                        </span>
                      </div>
                    </>
                  )}
                  {(joinTxHash || alreadyMember) && (
                    <div className="redbelly-success-item">
                      <span className="redbelly-label">DAO access:</span>
                      <span className="redbelly-value redbelly-value-success">Granted</span>
                    </div>
                  )}
                  {joinTxHash && (
                    <div className="redbelly-success-item">
                      <span className="redbelly-label">Join tx:</span>
                      <span className="redbelly-value" style={{ fontSize: 12, wordBreak: "break-all", display: "flex", alignItems: "center", gap: 6 }}>
                        {joinTxHash.slice(0, 10)}…
                        <a
                          href={`https://redbelly.testnet.routescan.io/tx/${joinTxHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="View in explorer"
                          style={{ display: "inline-flex", color: "#FA423C" }}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                            <polyline points="15 3 21 3 21 9" />
                            <line x1="10" y1="14" x2="21" y2="3" />
                          </svg>
                        </a>
                      </span>
                    </div>
                  )}
                </div>
              )}

              {error && (
                <div className="redbelly-step-error" style={{ padding: 12, marginBottom: 16 }}>
                  <p style={{ margin: 0, fontSize: 13 }}>{error}</p>
                </div>
              )}

              {loading !== null ? (
                <div
                  className="redbelly-step-loading"
                  style={{
                    padding: "50px 50px 40px",
                    position: "relative" as const,
                    zIndex: 2,
                    overflow: "visible" as const,
                  }}
                >
                  <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
                  <div
                    role="progressbar"
                    aria-label="Loading"
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: "50%",
                      margin: "0 auto 24px",
                      border: "4px solid #D9D9D9",
                      borderTopColor: "#FA423C",
                      animation: "spin 1s linear infinite",
                      boxShadow:
                        "0 0 12px rgba(250, 66, 60, 0.28), 0 0 24px rgba(250, 66, 60, 0.18), 0 0 36px rgba(250, 66, 60, 0.1)",
                      position: "relative" as const,
                      zIndex: 2,
                    }}
                  />
                  <p>
                    {loading === "connect"
                      ? "Connecting to wallet…"
                      : loading === "check"
                        ? "Checking eligibility…"
                        : "Sending join request…"}
                  </p>
                  <small>
                    {loading === "connect"
                      ? "Please confirm in your wallet"
                      : loading === "check"
                        ? "Checking Permission (CAT) and membership"
                        : "Sign message and confirm"}
                  </small>
                </div>
              ) : (
                <div className="redbelly-step-initial">
                  {!address ? (
                    <button
                      className="redbelly-primary-btn"
                      onClick={handleConnect}
                      disabled={loading !== null}
                    >
                      Connect wallet
                    </button>
                  ) : (
                    <>
                      {eligibility === null && (
                        <button
                          className="redbelly-primary-btn"
                          onClick={handleCheckEligibility}
                          disabled={loading !== null}
                          style={{ marginBottom: 8 }}
                        >
                          Check eligibility
                        </button>
                      )}
                      {eligibility && !eligibility.hasCAT && (
                        <p style={{ marginTop: 8, fontSize: 13, color: "#FA423C" }}>
                          This wallet is not verified on Redbelly (Permission). Switch to a verified wallet in your browser extension – the app will detect the change automatically.
                        </p>
                      )}
                      {eligibility && eligibility.isMember && !joinTxHash && !alreadyMember && (
                        <div className="redbelly-step-success" style={{ padding: "20px 0" }}>
                          <div className="redbelly-success-icon">✓</div>
                          <h3 style={{ marginBottom: 8, fontSize: 18 }}>Member</h3>
                          <p style={{ margin: 0, fontSize: 13, color: "#848B91" }}>
                            You already have access to this DAO.
                          </p>
                          <button
                            type="button"
                            className="redbelly-secondary-btn"
                            onClick={handleClose}
                            style={{ marginTop: 16 }}
                          >
                            Close
                          </button>
                        </div>
                      )}
                      {(joinTxHash || alreadyMember) ? (
                        <div className="redbelly-step-success" style={{ padding: "20px 0" }}>
                          <div className="redbelly-success-icon">✓</div>
                          <h3 style={{ marginBottom: 8, fontSize: 18 }}>Member</h3>
                          <p style={{ margin: 0, fontSize: 13, color: "#848B91" }}>
                            You have access to this DAO.
                          </p>
                          <button
                            type="button"
                            className="redbelly-secondary-btn"
                            onClick={handleClose}
                            style={{ marginTop: 16 }}
                          >
                            Close
                          </button>
                        </div>
                      ) : eligibility?.canJoin ? (
                        <>
                          <div className="redbelly-step-success" style={{ padding: "20px 0", marginBottom: 8 }}>
                            <div className="redbelly-success-icon">✓</div>
                            <h3 style={{ marginBottom: 8, fontSize: 18 }}>Eligible</h3>
                            <p style={{ margin: 0, fontSize: 13, color: "#848B91" }}>
                              Wallet verified (CAT). Choose region and join.
                            </p>
                          </div>
                          <label
                            style={{
                              display: "block",
                              marginBottom: 8,
                              fontSize: 14,
                              color: "#848B91",
                            }}
                          >
                            Region (Join DAO):
                          </label>
                          <select
                            value={selectedRegion}
                            onChange={(e) => setSelectedRegion(e.target.value)}
                            style={{
                              width: "100%",
                              padding: 12,
                              marginBottom: 12,
                              borderRadius: 12,
                              border: "2px solid rgba(250, 66, 60, 0.2)",
                              background: "#ECEBEC",
                              color: "#142530",
                              fontSize: 14,
                            }}
                          >
                            {regionOptions.map((code) => (
                              <option key={code} value={code}>
                                {code}
                                {regions[code] != null
                                  ? ` (${regions[code].current}/${regions[code].cap})`
                                  : ""}
                              </option>
                            ))}
                          </select>
                          {regions[selectedRegion] != null &&
                            regions[selectedRegion].current >= regions[selectedRegion].cap && (
                            <p style={{ marginBottom: 8, fontSize: 13, color: "#FA423C" }}>
                              Unfortunately, this region is full at the moment. Stay tuned on our official channels (Discord, Telegram, and Twitter) for the next wave of openings.
                            </p>
                          )}
                          <button
                            className="redbelly-primary-btn"
                            onClick={handleJoinDAO}
                            disabled={loading !== null || (regions[selectedRegion] != null && regions[selectedRegion].current >= regions[selectedRegion].cap)}
                          >
                            Join DAO
                          </button>
                        </>
                      ) : eligibility && !eligibility.canJoin && !eligibility.isMember ? (
                        <p style={{ marginTop: 8, fontSize: 13, color: "#848B91" }}>
                          Complete CAT verification on Redbelly to join.
                        </p>
                      ) : null}
                    </>
                  )}
                </div>
              )}
              <div className="redbelly-info">
                <small>MembershipRegistry – backend policy (CAT + region caps)</small>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
