/**
 * Deploy using artifact from verify-deploy compile (source "MembershipRegistry.sol").
 * Artifact path: artifacts/MembershipRegistry.sol/MembershipRegistry.json
 */
require("dotenv").config();
const { ethers } = require("ethers");
const path = require("path");
const fs = require("fs");

async function main() {
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

  const artifactPath = path.join(__dirname, "..", "artifacts", "MembershipRegistry.sol", "MembershipRegistry.json");
  if (!fs.existsSync(artifactPath)) {
    throw new Error("Compile first with: npx hardhat compile --config hardhat.verify-deploy.config.js");
  }
  const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));

  const factory = new ethers.ContractFactory(artifact.abi, artifact.bytecode, signer);
  const registry = await factory.deploy(backend, dao);
  await registry.waitForDeployment();
  const address = await registry.getAddress();

  console.log("MembershipRegistry deployed to:", address);
  console.log("Backend (join/migrate):", backend);
  console.log("DAO (revoke/update):", dao);
  console.log("Add to .env and backend/.env: DAO_CONTRACT_ADDRESS=" + address);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
