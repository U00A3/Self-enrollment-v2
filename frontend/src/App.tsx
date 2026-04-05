import "./App.css";
import { RedbellyAuthWidget } from "./components/RedbellyAuthWidget";

function App() {
  return (
    <>
      <div style={{ padding: "20px", textAlign: "center" }}>
        <h1>
          <span style={{ color: "#ff5a54" }}>Redbelly</span> DAO Platform
        </h1>
        <p style={{ color: "#848B91", marginTop: "-8px", marginBottom: "8px", fontSize: "15px" }}>
          Self-enrollment-v2
        </p>
        <h2>Membership – Eligibility &amp; Join</h2>
        <p style={{ marginTop: "8px", marginBottom: "4px", fontSize: "13px", color: "#848B91", lineHeight: "1.5" }}>
          The MembershipRegistry contract is fully deployed and verified on the Redbelly Testnet.
        </p>
        <p style={{ margin: 0, marginBottom: "20px", fontSize: "12px", color: "#848B91", wordBreak: "break-all", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", flexWrap: "wrap" }}>
          Address: 0x3BED86cb84004b19c3e5663B7b45f019C30D227a{" "}
          <a
            href="https://redbelly.testnet.routescan.io/address/0x3BED86cb84004b19c3e5663B7b45f019C30D227a"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#FA423C", display: "inline-flex" }}
            aria-label="View contract on Routescan"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
          </a>
        </p>
        <p style={{ color: "#848B91", marginBottom: "30px" }}>
          Your wallet address must be verified on Redbelly Testnet (Permission / CAT).
        </p>

        <RedbellyAuthWidget />

        <div
          style={{
            marginTop: "30px",
            padding: "18px",
            background:
              "linear-gradient(135deg, rgba(250, 66, 60, 0.1) 0%, rgba(250, 66, 60, 0.05) 100%)",
            borderRadius: "12px",
            maxWidth: "500px",
            margin: "30px auto",
            border: "2px solid rgba(250, 66, 60, 0.3)",
            boxShadow: "0 4px 16px rgba(20, 37, 48, 0.2)",
          }}
        >
          <p style={{ margin: 0, fontSize: "13px", color: "#848B91", lineHeight: "1.6" }}>
            <strong style={{ color: "#ECEBEC" }}>MembershipRegistry</strong> on Redbelly Testnet.
            Backend enforces CAT (Permission) and region caps; join is signed and submitted via API.
          </p>
        </div>
      </div>
    </>
  );
}

export default App;
