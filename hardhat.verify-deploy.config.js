/**
 * Hardhat config for deploy that matches Routescan verification.
 * Compiles from project root so source name is "MembershipRegistry.sol" (not "contracts/MembershipRegistry.sol").
 * No metadata.appendCBOR: false – same as Routescan (metadata appended).
 */
require("dotenv").config();
require("@nomicfoundation/hardhat-ethers");

module.exports = {
  paths: {
    sources: ".",
  },
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: { enabled: true, runs: 200 },
      evmVersion: "paris",
      // no metadata.appendCBOR – default (metadata appended), same as Routescan
    },
  },
  networks: {
    default: {
      url: process.env.RPC_URL || "https://governors.testnet.redbelly.network",
      accounts: process.env.DEPLOYER_PRIVATE_KEY ? [process.env.DEPLOYER_PRIVATE_KEY] : [],
    },
  },
  defaultNetwork: "default",
};
