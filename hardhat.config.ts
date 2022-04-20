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
        url: "https://polygon-mainnet.g.alchemy.com/v2/VCxmFXYm1xVreMCetqxlmauONTMRMMPu",
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
    url: "https://eth-rinkeby.alchemyapi.io/v2/ISnePXFV9Trh4rAs9xhN68ICYuGsEJe0",
    accounts: [
     process.env.DEV_PRIVATE_KEY1 as string,
     process.env.DEV_PRIVATE_KEY2 as string,
     process.env.DEV_PRIVATE_KEY3 as string,
     process.env.DEV_PRIVATE_KEY4 as string,
     process.env.DEV_PRIVATE_KEY5 as string,
     process.env.DEV_PRIVATE_KEY6 as string,
     ],
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