require("dotenv").config();
require("@nomicfoundation/hardhat-ethers");
require("@nomicfoundation/hardhat-verify");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: { enabled: true, runs: 200 },
      evmVersion: "paris",
    },
  },
  networks: {
    hardhat: {},
    default: {
      url: process.env.RPC_URL || "http://127.0.0.1:8545",
      accounts: process.env.DEPLOYER_PRIVATE_KEY ? [process.env.DEPLOYER_PRIVATE_KEY] : [],
    },
    redbelly: {
      url: process.env.RPC_URL || "https://governors.testnet.redbelly.network",
      chainId: 153,
      accounts: process.env.DEPLOYER_PRIVATE_KEY ? [process.env.DEPLOYER_PRIVATE_KEY] : [],
    },
  },
  defaultNetwork: process.env.NETWORK_NAME || "default",
  sourcify: {
    enabled: true,
  },
  etherscan: {
    apiKey: {
      default: "ANYTHING",
      redbelly: "ANYTHING",
    },
    customChains: [
      {
        network: "default",
        chainId: 153,
        urls: {
          apiURL: "https://redbelly.testnet.routescan.io/api",
          browserURL: "https://redbelly.testnet.routescan.io",
        },
      },
      {
        network: "redbelly",
        chainId: 153,
        urls: {
          apiURL: "https://redbelly.testnet.routescan.io/api",
          browserURL: "https://redbelly.testnet.routescan.io",
        },
      },
    ],
  },
};
