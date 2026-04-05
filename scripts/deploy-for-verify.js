/**
 * Deploy MembershipRegistry using the EXACT same standard JSON as Routescan.
 * Source key "MembershipRegistry.sol", settings: optimizer 200, evmVersion paris (no metadata override).
 *
 * Run from project root: node scripts/deploy-for-verify.js
 * Then verify on Routescan with Contract name: MembershipRegistry.sol:MembershipRegistry
 */
require("dotenv").config();
const fs = require("fs");
const path = require("path");
const solc = require("solc");
const { ethers } = require("ethers");

const rootDir = path.join(__dirname, "..");
const sourcePath = path.join(rootDir, "contracts", "MembershipRegistry.sol");
const sourceContent = fs.readFileSync(sourcePath, "utf8");

// EXACTLY like Routescan inner sourceCode: only optimizer, NO evmVersion (so compiler default is used)
// Routescan does not inject top-level evmVersion into the compilation
const standardJson = {
  language: "Solidity",
  settings: {
    optimizer: { enabled: true, runs: 200 },
    outputSelection: { "*": { "*": ["abi", "evm.bytecode"] } },
  },
  sources: {
    "MembershipRegistry.sol": { content: sourceContent },
  },
};

console.log("Compiling with EXACT Routescan inner JSON (MembershipRegistry.sol, optimizer 200, no evmVersion)...");
const output = JSON.parse(solc.compile(JSON.stringify(standardJson)));

if (output.errors) {
  const errs = output.errors.filter((e) => e.severity === "error");
  if (errs.length) {
    console.error(errs);
    process.exit(1);
  }
}

const contract = output.contracts["MembershipRegistry.sol"]["MembershipRegistry"];
const bytecode = "0x" + contract.evm.bytecode.object;
const abi = contract.abi;

const rpcUrl = process.env.RPC_URL;
const privateKey = (process.env.DEPLOYER_PRIVATE_KEY || "").trim().replace(/^["']|["']$/g, "");
const rawBackend = (process.env.BACKEND_ADDRESS || "").trim().replace(/^["']|["']$/g, "");
const rawDao = (process.env.DAO_ADDRESS || "").trim().replace(/^["']|["']$/g, "");

if (!rpcUrl || !privateKey) {
  throw new Error("Set in .env: RPC_URL, DEPLOYER_PRIVATE_KEY");
}

const provider = new ethers.JsonRpcProvider(rpcUrl);
const signer = new ethers.Wallet(privateKey, provider);

let backend;
if (rawBackend.length === 42 && rawBackend.startsWith("0x") && /^0x[0-9a-fA-F]{40}$/.test(rawBackend)) {
  backend = ethers.getAddress(rawBackend);
} else {
  backend = signer.address;
  console.log("BACKEND_ADDRESS not set – using deployer address:", backend);
}

let dao;
if (rawDao.length === 42 && rawDao.startsWith("0x") && /^0x[0-9a-fA-F]{40}$/.test(rawDao)) {
  dao = ethers.getAddress(rawDao);
} else {
  dao = backend;
  console.log("DAO_ADDRESS not set – using backend address (for self-exit / revoke):", dao);
}

async function main() {
  const factory = new ethers.ContractFactory(abi, bytecode, signer);
  const registry = await factory.deploy(backend, dao);
  await registry.waitForDeployment();
  const address = await registry.getAddress();

  console.log("MembershipRegistry deployed to:", address);
  console.log("Backend (join/migrate):", backend);
  console.log("DAO (revoke/update):", dao);
  console.log("Add to .env and backend/.env: DAO_CONTRACT_ADDRESS=" + address);
  console.log(`
--- Verification on Routescan (match the form exactly) ---
1. Open https://routescan.io/verifycontract
2. Chain: Redbelly Testnet (153)
3. Contract address: ${address}
4. Contract code: paste ONLY the contents of contracts/MembershipRegistry.sol
5. Contract name: MembershipRegistry.sol:MembershipRegistry
6. Compiler: 0.8.20, Optimizer enabled, Runs 200. Leave EVM version empty/default (must match Routescan)
7. Constructor arguments (ABI-encoded, no 0x):
   000000000000000000000000a2c6a3fc1e12df79b9e3d099faa2ffe860450f76000000000000000000000000a2c6a3fc1e12df79b9e3d099faa2ffe860450f76
8. Submit. Bytecode matches Routescan (same settings: only optimizer, no evmVersion in compilation).
`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
