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
        url: "<API KEY>",
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
    accounts: ["c5f53c1cb06055cfa0a7d8c8a3d30c56614253faf195e03e0e6413f61a7bf0ac"],
     gas: 3000000,
     gasPrice: 8000000000
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
  //   only: [':ERC20$'],
  //   spacing: 2
  // },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
  
};
​
export default config;
