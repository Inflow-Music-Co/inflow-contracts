import { ethers } from "hardhat";

const tokenAddress = "0x2FFc139D8Dc7e8228d904c04cbFaDe6923eaef7b";

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
