# Redbelly DAO Platform – Self-enrollment-v2

<p align="center">
  <a href="https://redbelly.network/"><img src="https://img.shields.io/badge/Redbelly-Testnet-c41e3a?logo=data%3Aimage%2Fsvg%2Bxml%3Bbase64%2CPHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1MDAgNTUwIj48cGF0aCBmaWxsPSIjZmZmIiBkPSJNNDYyLjI1LDE0NS41NiwyNTYuMDcsMjYuNjNhMTIuMTMsMTIuMTMsMCwwLDAtMTIuMTQsMEwzNy43NSwxNDUuNTZhMTIuMTUsMTIuMTUsMCwwLDAtNi4wNywxMC41MVYzOTMuOTRhMTIuMTYsMTIuMTYsMCwwLDAsNi4wNywxMC41MUwyNDMuOTMsNTIzLjM4YTEyLjE4LDEyLjE4LDAsMCwwLDEyLjE0LDBMNDYyLjI1LDQwNC40NWExMi4xNiwxMi4xNiwwLDAsMCw2LjA3LTEwLjUxVjE1Ni4wN0ExMi4xNSwxMi4xNSwwLDAsMCw0NjIuMjUsMTQ1LjU2Wk0yNTAsNTEuMTVsMTkwLjYzLDExMGMtMzEuMDUsMTcuNTItNTcuMjUsMzkuNzctNzkuMzUsNjQuNTctNDMuMTItNTAuODQtMTAzLTEwMS0xODQuMzgtMTMyLjM3Wk00MDQuMzUsMzA4LjkxYTEzLjcsMTMuNywwLDAsMS0xMi41NS04LjIxLDEzLjU4LDEzLjU4LDAsMSwxLDI1LjA5LDBBMTMuNjksMTMuNjksMCwwLDEsNDA0LjM1LDMwOC45MVptMC00MC43M2EyNy4yMywyNy4yMywwLDAsMC05LjU0LDEuOGMtNy43Ny0xMS40Ny0xNi4xOC0yMy4xNC0yNS43LTM0LjkyYTMwMi4zNiwzMDIuMzYsMCwwLDEsNzAuNDctNTkuMjksNjYxLjI5LDY2MS4yOSwwLDAsMC0zNC4yNyw5Mi41MUM0MDUsMjY4LjI3LDQwNC42OCwyNjguMTgsNDA0LjM1LDI2OC4xOFpNMzUzLjI4LDIzNWMtMjEuOSwyNi4zNi0zOS40Nyw1NS4xOS01My41Niw4NC02LjgxLTk4LjczLTgyLjctMTc2LjA2LTEyMy40My0yMTNDMjU0LjM3LDEzNi45NCwzMTEuODQsMTg1LjczLDM1My4yOCwyMzVabS02MiwxMjdhMTMuNywxMy43LDAsMCwxLTEyLjU1LTguMjEsMTMuNDQsMTMuNDQsMCwwLDEtMS01LjEyLDEzLjYyLDEzLjYyLDAsMSwxLDEzLjU3LDEzLjMzWm0tMy43NC00MC4zNWEyNy40NywyNy40NywwLDAsMC02LjgxLDEuNzQsNDgwLjk0LDQ4MC45NCwwLDAsMC0xMDEuNzQtMTAyLjQsMjcsMjcsMCwwLDAsMy43Ni0xMy42MiwyNy4zOCwyNy4zOCwwLDAsMC0yMS4zOS0yNi42OFYxMDguOUMxOTguNzcsMTQyLjA2LDI4MS4zOSwyMjAuOTIsMjg3LjQ5LDMyMS41N1pNMTY3LjgzLDIxMi40MWExMy43LDEzLjcsMCwwLDEtMjUuMSwwLDEzLjM5LDEzLjM5LDAsMCwxLTEtNS4xMSwxMy41NywxMy41NywwLDAsMSwyNy4xNCwwQTEzLjM5LDEzLjM5LDAsMCwxLDE2Ny44MywyMTIuNDFabS0xOC42Ny0xMDMuMXY3MS4zM2EyNy4zMiwyNy4zMiwwLDAsMC0xNiwxMC41NEE0NDMuMjcsNDQzLjI3LDAsMCwwLDYzLDE1OVpNNTYsMTgwLjUzYzE4LjEyLDI2Ljg0LDUzLjczLDg0LjEzLDc1LjMxLDE0OC4yLS4yNC4xNS0uNTEuMjctLjc0LjQzQTQ1Mi42LDQ1Mi42LDAsMCwwLDU2LDI3Ni42OVpNMTU5LjU2LDM1MS43OGExMy40NCwxMy40NCwwLDAsMS0xLDUuMTIsMTMuNTIsMTMuNTIsMCwxLDEsMS01LjEyWm0tMTEsODguNTRMNTYsMzg2LjkzVjI5MC42N2E0MzUuMTMsNDM1LjEzLDAsMCwxLDY2LjI0LDQ3LjcxQTI3LjA5LDI3LjA5LDAsMCwwLDE0NC4zMiwzNzlDMTQ4LjE2LDM5OS42MiwxNTAsNDIwLjI5LDE0OC41Myw0NDAuMzJaTTE2MC4xNiw0NDdjMi40LTIyLjkyLjcxLTQ2LjU2LTMuNTUtNzBhMjcsMjcsMCwwLDAsMy43MS0yLDUxOS41Miw1MTkuNTIsMCwwLDEsODIsMTE5LjQxWm04OC43NywzMy41N2E1MzAuODgsNTMwLjg4LDAsMCwwLTgwLTExMy44OUEyNy4zNSwyNy4zNSwwLDAsMCwxNDYsMzI0LjM4YTI3Ljg4LDI3Ljg4LDAsMCwwLTMuMDUuMzFDMTIwLjczLDI1OC4zNCw4NCwxOTkuODcsNjUuNTQsMTcyLjg0YTQzMi4xLDQzMi4xLDAsMCwxLDYyLjgyLDI5LjQ5LDI3Ljg5LDI3Ljg5LDAsMCwwLS41LDUsMjcuNCwyNy40LDAsMCwwLDQyLjkxLDIyLjU5QTQ2Ny45LDQ2Ny45LDAsMCwxLDI3MC44OCwzMzAuMzlhMjcuMDgsMjcuMDgsMCwwLDAsNi42MSw0MS43OEE2NDAuMTYsNjQwLjE2LDAsMCwwLDI0OC45Myw0ODAuNlptMTAuMjEsMTNhNjI0LjY3LDYyNC42NywwLDAsMSwyOS43OS0xMTcuODNjLjc3LjA3LDEuNTEuMjMsMi4zLjIzYTI3LjA3LDI3LjA3LDAsMCwwLDguNzEtMS41NEE1MjMuNzEsNTIzLjcxLDAsMCwxLDMzNi40MSw0NDlabTg3LjkxLTUwLjcxYTUzNy4yLDUzNy4yLDAsMCwwLTM2Ljc1LTc0LjY1QTI3LjE0LDI3LjE0LDAsMCwwLDMwOSwzMjcuODVjMTMuNjgtMjguNTksMzAuNjgtNTcuMjMsNTIuMTYtODMuNCw4LjY2LDEwLjgyLDE2LjQsMjEuNTQsMjMuNTcsMzIuMDlhMjcuMjMsMjcuMjMsMCwwLDAsNy45LDQzLjY5LDUzOS42NSw1MzkuNjUsMCwwLDAtMTAuODQsMTAyLjYzWk0zOTQsNDE1Ljc5QTUzMC4zNCw1MzAuMzQsMCwwLDEsNDA0LjQ5LDMyM2EyNy4wOCwyNy4wOCwwLDAsMCw3Ljc4LTEuMjgsNTAzLjE1LDUwMy4xNSwwLDAsMSwzMC4zMyw2Ni4wOFptNTAtNTdjLTUuMzgtMTIuMzgtMTIuNTEtMjcuMTEtMjEuMjQtNDMuMUEyNy4xNCwyNy4xNCwwLDAsMCw0MTcsMjcxLjM5LDY1My4zMiw2NTMuMzIsMCwwLDEsNDQ0LDE5NS41NVoiIC8%2BPC9zdmc%2B&logoWidth=36&style=plastic" alt="Redbelly Testnet" /></a>
  <a href="https://soliditylang.org/"><img src="https://img.shields.io/badge/Solidity-0.8.20-363636?logo=solidity&logoColor=white&style=plastic" alt="Solidity" /></a>
  <a href="https://hardhat.org/"><img src="https://img.shields.io/badge/Hardhat-2.x-FFF100?logo=hardhat&logoColor=black&style=plastic" alt="Hardhat" /></a>
  <a href="https://nodejs.org/"><img src="https://img.shields.io/badge/Node.js-18%2B-339933?logo=node.js&logoColor=white&style=plastic" alt="Node.js" /></a>
  <a href="https://expressjs.com/"><img src="https://img.shields.io/badge/Express-4-000000?logo=express&logoColor=white&style=plastic" alt="Express" /></a>
  <br /><br />
  <a href="https://react.dev"><img src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black&style=plastic" alt="React" /></a>
  <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white&style=plastic" alt="TypeScript" /></a>
  <a href="https://vitejs.dev/"><img src="https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white&style=plastic" alt="Vite" /></a>
  <a href="https://docs.ethers.org/"><img src="https://img.shields.io/badge/ethers.js-6-24384B?logo=ethereum&logoColor=white&style=plastic" alt="ethers.js" /></a>
</p>

<p align="center">
  <img src="frontend/public/Screen.png" alt="Redbelly DAO Platform screenshot" width="800" />
</p>

<br />

**Live demo (Redbelly Testnet):** [https://dao-v3.mynode.uk](https://dao-v3.mynode.uk)  
*(May be unavailable in the future; the repository contains the full source code.)*

<br />

Self-enrollment DAO membership platform for **Redbelly Testnet**. Users connect a wallet, prove eligibility via Redbelly Permission (CAT), choose a region, sign a declaration, and join the on-chain **MembershipRegistry**. The backend enforces policy (CAT + region caps) and submits the join transaction.

---

## Overview

- **On-chain:** `MembershipRegistry` contract – single source of truth for who is a member (`isMember(address)`), region hash, join/leave/migrate/revoke.
- **Backend:** Node/Express API – eligibility checks (CAT + contract), region caps, signed join/migrate/leave, admin revoke. Does **not** store PII; only address, region, and audit logs.
- **Frontend:** React (Vite) – connect wallet, check eligibility, select region, sign message, submit join. Displays DAO access status and contract link.

Eligibility to **join** requires:

1. Wallet is **verified on Redbelly (Permission / CAT)**.
2. Wallet is **not** already a member in the contract.
3. Selected **region** is under its cap (policy in backend).

---

## User flow

1. **Connect wallet** – User connects via browser extension (e.g. MetaMask); frontend detects address.
2. **Check eligibility** – Frontend calls `GET /api/eligibility?address=…`. Backend queries:
   - Permission (CAT) contract: `isAllowed(address)`.
   - MembershipRegistry: `isMember(address)`.
   - Returns `{ hasCAT, isMember, canJoin }`.
3. **Regions** – Frontend calls `GET /api/regions` for region list and current/cap counts (from contract + backend caps).
4. **Join (if eligible)** – User selects region, signs message `"I declare region <REGION> and accept DAO Terms v1"`. Frontend sends `POST /api/join` with `{ address, region, signature, message }`. Backend:
   - Verifies signature and message.
   - Re-checks CAT and `isMember`, region cap.
   - Calls `MembershipRegistry.join(user, region, message)` with backend signer.
   - Returns tx hash; frontend shows success and link to explorer.
5. **Leave** – Member signs `"I request to leave the DAO"`; backend calls contract (user can also call `leave()` in the block explorer). **Revoke** – DAO/admin only, via backend `POST /api/admin/revoke` or contract `revoke(user)` from DAO wallet.

Contract reads use `blockTag: "latest"` so eligibility reflects current chain state.

---

## Security

- **Backend key:** Backend holds the key that can call `join` and `migrate` on the contract. It must be kept secret and used only on a trusted server.
- **DAO key:** Only the `dao` address can call `revoke` and `updateBackend`/`updateDAO`. Typically the deployer/DAO wallet; revoke must be called from that wallet (e.g. in block explorer).
- **No PII on-chain:** Contract stores only address, region hash, and active flag. Backend audit log stores address, region, action, timestamp, tx hash – no other PII.
- **Signature verification:** Join/migrate/leave require a signed message; backend verifies signer and exact message format before calling the contract.
- **Policy layer:** CAT (Permission) and region caps are enforced in the backend before any on-chain write; the contract does not enforce caps (backend refuses when cap is reached).
- **CORS:** Backend uses `CORS_ORIGIN`; set to your frontend origin in production.

---

## Extensibility

- **Snapshot / governance:** The contract exposes `isMember(address)` (view). A Snapshot strategy can read this contract (e.g. contract-call with `isMember`) for 1-member-1-vote. Redbelly Testnet may require a self-hosted Snapshot instance with a custom network.
- **Region caps:** Edit `backend/src/db.js` – `DEFAULT_REGIONS` – to add/remove regions or change caps; restart backend.
- **New roles:** The contract has `backend` and `dao`. For separate governance (e.g. board, treasury), deploy additional contracts that read `MembershipRegistry` and/or extend with new roles and update scripts.
- **Verification / compliance:** Backend can be extended with extra checks before join (e.g. KYC, allowlists) while keeping the same contract interface.
- **Frontend:** Widget is self-contained (`RedbellyAuthWidget`); can be embedded in other apps by pointing API base URL to your backend.

---

## Repository structure

- `contracts/` – MembershipRegistry Solidity (and flattened for verification).
- `backend/` – Node API (eligibility, regions, join, migrate, leave, admin revoke).
- `frontend/` – React app and Redbelly auth widget; `frontend/public/Redbelly_Isotype-White.svg` (white isotype for README badges).
- `scripts/` – Deploy and verification scripts.
See **deploy.md** for deployment and environment setup.
