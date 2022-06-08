import { ethers } from "hardhat";

import { SLOPE } from "../constants";

const factoryAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
const mintParams = {
  creator: "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266",
  usdcCollateral: "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0",
  usdtCollateral: "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9",
  slope: ethers.utils.parseEther(SLOPE).toString(),
  maxSupply: ethers.utils.parseEther("10000000").toString(),
  name: "luke_test_3",
  symbol: "LUKETEST3",
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
