# Deployment guide

This document describes how to deploy the Redbelly DAO self-enrollment stack: contract, backend, and frontend.

---

## Prerequisites

- **Node.js** (v18+ recommended)
- **Wallet** with RBNT on Redbelly Testnet (for contract deploy and backend gas)
- **Redbelly Permission (CAT)** – Bootstrap contract on testnet; backend uses it for eligibility. Default testnet bootstrap: `0xDAFEA492D9c6733ae3d56b7Ed1ADB60692c98Bc5`

---

## 1. Environment variables

### Project root (`.env`)

Used by deploy scripts and optionally by backend if run from root.

| Variable | Description |
|----------|-------------|
| `RPC_URL` | Redbelly RPC (e.g. `https://governors.testnet.redbelly.network`) |
| `NETWORK_NAME` | Optional; used by Hardhat |
| `DEPLOYER_PRIVATE_KEY` | EOA private key for contract deploy |
| `BACKEND_ADDRESS` | EOA address allowed to call `join`/`migrate` (usually same as deployer) |
| `DAO_ADDRESS` | Optional. EOA allowed to call `revoke`, `updateBackend`, `updateDAO`. Defaults to `BACKEND_ADDRESS` |
| `DAO_CONTRACT_ADDRESS` | Set **after** first deploy; contract address |

### Backend (`backend/.env`)

Copy from `backend/.env.sample` and fill in.

| Variable | Description |
|----------|-------------|
| `RPC_URL` | Same Redbelly RPC |
| `BACKEND_PRIVATE_KEY` | Private key of the backend signer (must match `backend` role in contract) |
| `DAO_CONTRACT_ADDRESS` | MembershipRegistry contract address |
| `BOOTSTRAP_ADDRESS` | Redbelly Bootstrap contract for Permission (CAT). Testnet: `0xDAFEA492D9c6733ae3d56b7Ed1ADB60692c98Bc5` |
| `PORT` | Backend port (e.g. `3003`) |
| `CORS_ORIGIN` | Allowed frontend origin (e.g. `https://your-app.example.com` or `*` for dev) |

---

## 2. Deploy the contract

From the **project root**:

```bash
npm install
npx hardhat compile
node scripts/deploy.js
```

The script reads `RPC_URL`, `DEPLOYER_PRIVATE_KEY`, `BACKEND_ADDRESS`, and optionally `DAO_ADDRESS` from `.env`. It deploys `MembershipRegistry` with `backend` and `dao` set to those addresses.

**Output:** Contract address. Add it to `.env` and `backend/.env` as `DAO_CONTRACT_ADDRESS`.

Example:

```bash
# After deploy
echo "DAO_CONTRACT_ADDRESS=0x..." >> .env
echo "DAO_CONTRACT_ADDRESS=0x..." >> backend/.env
```

**Verification (optional):** To verify on Routescan, use the steps in the project’s verification docs (e.g. manual verification with `MembershipRegistry.sol`, compiler 0.8.20, constructor args). A script `scripts/deploy-for-verify.js` can be used for a deployment that matches Routescan’s compilation.

---

## 3. Run the backend

From the **backend** directory:

```bash
cd backend
npm install
cp .env.sample .env   # if not already done
# Edit .env with RPC_URL, BACKEND_PRIVATE_KEY, DAO_CONTRACT_ADDRESS, BOOTSTRAP_ADDRESS, PORT, CORS_ORIGIN
npm start
```

Backend listens on `PORT` and exposes:

- `GET /api/eligibility?address=0x…` – eligibility (CAT + isMember)
- `GET /api/regions` – region list and current/cap
- `POST /api/join` – join (body: address, region, signature, message)
- `POST /api/migrate` – migrate membership to new address
- `POST /api/leave` – leave (signed message)
- `POST /api/admin/revoke` – revoke member (DAO only)
- `GET /api/health` – health check

**Production:** Use a process manager (e.g. systemd, PM2). Example unit file: `backend/redbelly-dao-backend.service`.

---

## 4. Build and serve the frontend

From the **frontend** directory:

```bash
cd frontend
npm install
npm run build
```

Static output is in `frontend/dist/`. Serve it with any static host (Nginx, Vercel, Netlify, etc.). Ensure the frontend’s API base URL points to your backend (see frontend env or config if you add one; default may be relative or localhost).

**Development:**

```bash
npm run dev
```

Configure backend `CORS_ORIGIN` to match the dev URL (e.g. `http://localhost:5173`) so the browser can call the API.

---

## 5. Summary checklist

1. Create `.env` at project root with `RPC_URL`, `DEPLOYER_PRIVATE_KEY`, `BACKEND_ADDRESS`, optional `DAO_ADDRESS`.
2. Run `npx hardhat compile && node scripts/deploy.js`; copy contract address.
3. Set `DAO_CONTRACT_ADDRESS` in `.env` and `backend/.env`.
4. Create `backend/.env` from `backend/.env.sample`; set `RPC_URL`, `BACKEND_PRIVATE_KEY`, `DAO_CONTRACT_ADDRESS`, `BOOTSTRAP_ADDRESS`, `PORT`, `CORS_ORIGIN`.
5. Start backend: `cd backend && npm start`.
6. Build frontend: `cd frontend && npm run build`; deploy `dist/` to your host.
7. (Optional) Verify contract on Routescan; link to contract in UI if desired.

After deployment, users can connect a wallet, check eligibility, and join the DAO via the frontend; backend enforces CAT and region caps and submits joins to the contract.
