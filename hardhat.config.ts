import "@nomiclabs/hardhat-waffle";
import "@nomiclabs/hardhat-ethers";
import "@typechain/hardhat";
import "solidity-coverage";
import "hardhat-gas-reporter";
import "@nomiclabs/hardhat-etherscan";
import { HardhatUserConfig } from "hardhat/config";
require("dotenv").config();
require('hardhat-abi-exporter');

const config: HardhatUserConfig = {
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      forking: {
        url: "https://polygon-mainnet.g.alchemy.com/v2/YKCKYqogO-8zEa5tKpOVdeQ8tuTG_hfu",
        blockNumber: 12400000,
      },
    },
    matic: {
      url: "https://matic-mumbai.chainstacklabs.com",
      accounts: [`${process.env.DEV_PRIVATE_KEY}`]
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
  // abiExporter: {
  //   path: './data/abi',
  //   clear: true,
  //   flat: true,
  //   only: [],
  //   spacing: 2,
  //   pretty: true,
  // },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
  
};

export default config;
