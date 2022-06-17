import hre from "hardhat";

async function main() {
  const MockUSDC = await hre.ethers.getContractFactory("MockUSDC");
  const contract = await MockUSDC.deploy();

  await contract.deployed();

  console.log("MockUSDC deployed to:", contract.address);
}

//0xb34Ca2cDE88dE520E4Be8b1ccEc374D3052ae021

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
