import { ethers } from "hardhat";

import { SLOPE } from "../constants";

const factoryAddress = "0xBA7cE2ECB379695fC221F14893ff9274F77651aD";
const mintParams = {
  creator: "0xdB0EBbA81aF56aFf92637fEAC7f5832376fEa50B",
  usdcCollateral: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
  usdtCollateral: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
  slope: ethers.utils.parseEther(SLOPE).toString(),
  maxSupply: ethers.utils.parseEther("10000000").toString(),
  name: "charo-knight",
  symbol: "FLF",
};

async function createSocialToken(): Promise<void> {
  const [owner] = await ethers.getSigners();
  const factory = await ethers.getContractAt(
    //ABI
    "SocialTokenFactory",
    factoryAddress,
    owner
  );
  const socialTokenCreator = factory.connect(owner);
  const create = await socialTokenCreator.create(mintParams);
  console.log("create", create);
}

createSocialToken()
  .then(async () => {
    console.log("Successfully sent the transaction");
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
