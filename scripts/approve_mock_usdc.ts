import { ethers } from "hardhat";

const tokenAddress = "0xBEBCEe0dE6cb7b153D0937F9f1259d73063C022C";
const MockUSDC = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";

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
