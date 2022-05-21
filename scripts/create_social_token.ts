import { ethers } from "hardhat";

const factoryAddress = "0x41C659319885598d77CF5bd8E792A5162bC72A04";
const mintParams = {
  creator: "0xd5Cdda038127d15Ea44Dd012DFfb9e95a72e6D32",
  usdcCollateral: "0x63aF7615e795F2cFb8A2f93aFAd7CD1B4d35bA5c",
  usdtCollateral: "0xb34Ca2cDE88dE520E4Be8b1ccEc374D3052ae021",
  slope: ethers.utils.parseEther("0.5").toString(),
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
