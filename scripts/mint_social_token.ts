import { ethers } from "hardhat";

const tokenAddress = "0xBEBCEe0dE6cb7b153D0937F9f1259d73063C022C";
const MockUSDC = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";

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

mintSocialToken("10.0");
