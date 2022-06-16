import { ethers } from "hardhat";

const tokenAddress = "0x0075c7aaa1D50857Dd5d293590d105f378A6f5Ff";
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

mintSocialToken("10");
