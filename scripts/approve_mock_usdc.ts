import { ethers } from "hardhat";

const tokenAddress = "0xF4a787203fA30185F99D768E0cf43d863A103Cde";
const MockUSDC = "0x63aF7615e795F2cFb8A2f93aFAd7CD1B4d35bA5c"

async function approveMockUSD(): Promise<void>{
    const [owner] = await ethers.getSigners();
    const usdc = await ethers.getContractAt(
      "MockUSDC",
      MockUSDC,
      owner
    );
    const usdcMinter = usdc.connect(owner);
    const approve = await usdcMinter.approve(tokenAddress,ethers.utils.parseUnits("1", 20));
    console.info("approve", approve);
}

approveMockUSD()
    .then(async() => {
        console.log("Successfully sent the transaction");
    }).catch((err) => {
        console.error(err);
        process.exit(1);
});