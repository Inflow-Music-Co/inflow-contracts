import { ethers } from "hardhat";

const tokenAddress = "0x2FFc139D8Dc7e8228d904c04cbFaDe6923eaef7b";
const MockUSDC = "0x63aF7615e795F2cFb8A2f93aFAd7CD1B4d35bA5c";

// mint social token
async function mintSocialToken(amount: string): Promise<void> {
  const [owner] = await ethers.getSigners();
  const sociaoToken = await ethers.getContractAt(
    //ABI
    "SocialToken",
    tokenAddress,
    owner
  );
  const socialTokenMinter = sociaoToken.connect(owner);
  const mint = await socialTokenMinter.mint(
    ethers.BigNumber.from(amount),
    MockUSDC
  );
  console.log("mint", mint);
}

mintSocialToken("200000000000");
