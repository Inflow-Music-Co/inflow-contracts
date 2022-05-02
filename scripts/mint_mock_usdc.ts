import { ethers } from "hardhat";

const MockUSDC = "0x63aF7615e795F2cFb8A2f93aFAd7CD1B4d35bA5c";

//mint 10 to the power of digits of usdc
async function mintMockUSD(digits: number): Promise<void> {
  const [owner] = await ethers.getSigners();
  const usdc = await ethers.getContractAt("MockUSDC", MockUSDC, owner);
  const usdcMinter = usdc.connect(owner);
  const mint = await usdcMinter.mint(ethers.utils.parseUnits("1", digits));
  console.info("mint", mint);
}

mintMockUSD(20)
  .then(async () => {
    console.log("Successfully sent the transaction");
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
