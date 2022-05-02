import { ethers } from "hardhat";

const tokenAddress = "0x2FFc139D8Dc7e8228d904c04cbFaDe6923eaef7b";
const MockUSDC = "0x63aF7615e795F2cFb8A2f93aFAd7CD1B4d35bA5c";

// mint social token
async function getSocialTokenDetails(): Promise<void> {
  const [owner] = await ethers.getSigners();
  const sociaoToken = await ethers.getContractAt(
    //ABI
    "SocialToken",
    tokenAddress,
    owner
  );

  const creator = await sociaoToken.creator();
  const slope = await sociaoToken.slope();
  const maxSupply = await sociaoToken.maxSupply();
  const reserve = await sociaoToken.reserve();

  console.log({ creator, slope, maxSupply, reserve });
}

getSocialTokenDetails();
