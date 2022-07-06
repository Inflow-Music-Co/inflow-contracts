import "@nomiclabs/hardhat-waffle";
import "@nomiclabs/hardhat-ethers";
import "@typechain/hardhat";
import "solidity-coverage";
import "hardhat-gas-reporter";
import "@nomiclabs/hardhat-etherscan";

import { HardhatUserConfig } from "hardhat/config";
require("dotenv").config();
require("hardhat-abi-exporter");
const config: HardhatUserConfig = {
  defaultNetwork: "rinkeby",
  // defaultNetwork: "hardhat",
  networks: {
    // hardhat: {
    //   forking: {
    //     url: "https://eth-mainnet.alchemyapi.io/v2/6crZyzd6pmy54K5s1A8uCmWQP-Z7I7BC",
    //     blockNumber: 12400000,
    //   },
    // },
    /**Run hardhat network:
     * npx hardhat node 
     * ex: npx hardhat run --network localhost scripts/deploy.ts
     */
    hardhat: {
      forking: {
        url: "http://127.0.0.1:8545/",
      },
      accounts: [
        {
          privateKey: "70f7987fe6d17bbe2772de71cb20a5dbdfb49e30e0bdd1fc277b8ff4457252a1",
          balance: "10000",
        },
      ],
      gas: 3000000,
      gasPrice: 8000000000,
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
    mainnet : {
      url: `https://eth-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
      accounts: [
        process.env.DEV_PRIVATE_KEY as string,
      ]
    },
    rinkeby: {
      url: `https://rinkeby.infura.io/v3/${process.env.INFURA_API_KEY}`,
      accounts: [
        process.env.DEV_PRIVATE_KEY as string,
        //  process.env.DEV_PRIVATE_KEY2 as string,
        //  process.env.DEV_PRIVATE_KEY3 as string,
        //  process.env.DEV_PRIVATE_KEY4 as string,
        //  process.env.DEV_PRIVATE_KEY5 as string,
        //  process.env.DEV_PRIVATE_KEY6 as string,
      ],
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
export default config;
