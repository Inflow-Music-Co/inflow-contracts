const { ethers } = require("hardhat");

describe("Should mint", function () {
  it("Should mint token", async function () {
    const [owner] = await ethers.getSigners();
    const usdc = await ethers.getContractAt(
      "MockUSDC",
      "0x63af7615e795f2cfb8a2f93afad7cd1b4d35ba5c",
      owner
    );
    const usdcMinter = usdc.connect(owner);
    const mint = await usdcMinter.mint(1000000);
    console.info("mint", mint);
  });
});
