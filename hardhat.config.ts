import "@nomiclabs/hardhat-waffle";
import "@nomiclabs/hardhat-ethers";
import "@typechain/hardhat";
import "solidity-coverage";
import "hardhat-gas-reporter";
import "@nomiclabs/hardhat-etherscan";
import { HardhatUserConfig } from "hardhat/config";
require("dotenv").config();

const config: HardhatUserConfig = {
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      forking: {
        url: `https://eth-mainnet.alchemyapi.io/v2/${process.env.ALCHEMY_API_KEY}`,
        blockNumber: 12400000,
      },
    },
    matic: {
      url: "https://rpc-mainnet.maticvigil.com",
      // accounts: [process.env.DEV_PRIVATE_KEY as string],
    },
    mumbai: {
      url: "https://rpc-mumbai.maticvigil.com",
      // accounts: [process.env.DEV_PRIVATE_KEY as string],
    },
  },
  solidity: {
    compilers: [
      {
        version: "0.8.4",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
          metadata: {
            bytecodeHash: "none",
          },
        },
      },
    ],
  },
  gasReporter: {
    currency: "USD",
    enabled: process.env.REPORT_GAS ? true : false,
    coinmarketcap: process.env.COINMARKETCAP,
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
};

export default config;
