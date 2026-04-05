/**
 * Try contract verification via Routescan API (Etherscan-like).
 * Uses: module=contract, action=verifysourcecode (POST).
 *
 * If Routescan API for Redbelly testnet (153) supports the same format,
 * set ROUTESCAN_API_URL in .env and run: node scripts/verify-api.js
 *
 * Current attempts:
 * - https://redbelly.testnet.routescan.io/api → 403 (blocked)
 * - https://api.routescan.io/v2/network/evm/153/etherscan/api → "Missing Or invalid Action name"
 * So manual verification via https://routescan.io/verifycontract is recommended.
 */
require("dotenv").config();
const fs = require("fs");
const path = require("path");
const https = require("https");
const http = require("http");

const CONTRACT_ADDRESS = process.env.DAO_CONTRACT_ADDRESS || "0xec26445cA20c257Ed852cF4ae47763cf90EA5F0f";
const BACKEND = process.env.BACKEND_ADDRESS || "0xA2c6a3fC1E12dF79B9e3D099FaA2Ffe860450F76";
const DAO = process.env.DAO_ADDRESS || process.env.BACKEND_ADDRESS || BACKEND;

const API_URL = process.env.ROUTESCAN_API_URL || "https://api.routescan.io/v2/network/evm/153/etherscan/api";
const API_KEY = process.env.ROUTESCAN_API_KEY || "ANYTHING";

function getFlattenedSource() {
  const flatPath = path.join(__dirname, "..", "contracts", "MembershipRegistry_flat.sol");
  if (!fs.existsSync(flatPath)) {
    throw new Error("Run: npx hardhat flatten contracts/MembershipRegistry.sol > contracts/MembershipRegistry_flat.sol");
  }
  return fs.readFileSync(flatPath, "utf8");
}

function buildStandardJsonInput() {
  const source = getFlattenedSource();
  const content = {};
  content["MembershipRegistry_flat.sol"] = { content: source };
  return {
    language: "Solidity",
    sources: content,
    settings: {
      optimizer: { enabled: true, runs: 200 },
      outputSelection: { "*": { "*": ["abi", "evm.bytecode"] } },
    },
  };
}

async function main() {
  const standardJson = JSON.stringify(buildStandardJsonInput());
  const compilerVersion = "v0.8.20+commit.a1b79de6";
  const pad = (addr) => addr.slice(2).toLowerCase().padStart(64, "0");
  const constructorArgsAbi = "0x" + pad(BACKEND) + pad(DAO);

  const params = new URLSearchParams({
    apikey: API_KEY,
    chainid: "153",
    module: "contract",
    action: "verifysourcecode",
    contractaddress: CONTRACT_ADDRESS,
    sourceCode: standardJson,
    codeformat: "solidity-standard-json-input",
    contractname: "MembershipRegistry_flat.sol:MembershipRegistry",
    compilerversion: compilerVersion,
    constructorArguements: constructorArgsAbi,
  });

  const url = new URL(API_URL);
  const isHttps = url.protocol === "https:";
  const postData = params.toString();

  const options = {
    hostname: url.hostname,
    port: url.port || (isHttps ? 443 : 80),
    path: url.pathname + url.search,
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Content-Length": Buffer.byteLength(postData),
    },
  };

  return new Promise((resolve, reject) => {
    const req = (isHttps ? https : http).request(options, (res) => {
      let body = "";
      res.on("data", (chunk) => (body += chunk));
      res.on("end", () => {
        try {
          const json = JSON.parse(body);
          console.log("Response:", JSON.stringify(json, null, 2));
          if (json.result && json.result !== "Error! Missing Or invalid Action name") {
            console.log("Verification submitted. Check status with GUID:", json.result);
          } else {
            console.log("Verification failed or API format not supported. Use manual verification: https://routescan.io/verifycontract");
          }
        } catch (e) {
          console.log("Response (raw):", body.slice(0, 500));
        }
        resolve();
      });
    });
    req.on("error", reject);
    req.write(postData);
    req.end();
  });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
