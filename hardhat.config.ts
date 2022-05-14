import "@nomiclabs/hardhat-waffle";
import "@nomiclabs/hardhat-ethers";
import "@typechain/hardhat";
import "solidity-coverage";
import "hardhat-gas-reporter";
import "@nomiclabs/hardhat-etherscan";
import { HardhatUserConfig } from "hardhat/config";
require("dotenv").config();
require('hardhat-abi-exporter');
​
const config: HardhatUserConfig = {
  defaultNetwork: "rinkeby",
  networks: {
    hardhat: {
      forking: {
        url: "https://eth-mainnet.alchemyapi.io/v2/6crZyzd6pmy54K5s1A8uCmWQP-Z7I7BC",
        blockNumber: 12400000,
      }, 
    },
    // matic: {
    //   url: "https://matic-mumbai.chainstacklabs.com",
    //   accounts: [`${process.env.DEV_PRIVATE_KEY}`]
    // },
    // mumbai: {
    //   url: "https://rpc-mumbai.maticvigil.com",
    //   // accounts: [process.env.DEV_PRIVATE_KEY as string],
    // },
  // },
  rinkeby: {
    url: "https://rinkeby.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161",
    accounts: [process.env.DEV_PRIVATE_KEY as string],
    gas: 3000000,
    gasPrice: 8000000000,
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
​
export default config;
