const hre = require("hardhat");

async function main() {
  const MockUSDT = await hre.ethers.getContractFactory("MockUSDT");
  const contract = await MockUSDT.deploy();

  await contract.deployed();

  console.log("MockUSDT deployed to:", contract.address);
}

//0xb34Ca2cDE88dE520E4Be8b1ccEc374D3052ae021

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
