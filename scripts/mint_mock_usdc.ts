import { ethers } from "hardhat";

const MockUSDC = "0x5FC8d32690cc91D4c39d9d3abcBD16989F875707";

//mint 10 to the power of digits of usdc
async function mintMockUSD(digits: number): Promise<void> {
  const [owner] = await ethers.getSigners();
  const usdc = await ethers.getContractAt("MockUSDC", MockUSDC, owner);
  const usdcMinter = usdc.connect(owner);
  const mint = await usdcMinter.mint(ethers.utils.parseUnits("10000", digits));
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
