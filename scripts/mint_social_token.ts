import { ethers } from "hardhat";

const tokenAddress = "0xF4a787203fA30185F99D768E0cf43d863A103Cde";
const MockUSDC = "0x63aF7615e795F2cFb8A2f93aFAd7CD1B4d35bA5c"


// mint social token
async function mintSocialToken( amount: string): Promise<void>{
    const [owner] = await ethers.getSigners();
    const sociaoToken = await ethers.getContractAt(
        //ABI
        "SocialToken",
        tokenAddress,
        owner
    );
    const socialTokenMinter = sociaoToken.connect(owner);
    const mint = await socialTokenMinter.mint(ethers.BigNumber.from(amount),MockUSDC);
    console.log("mint", mint);
}

mintSocialToken("200000000000000000000");