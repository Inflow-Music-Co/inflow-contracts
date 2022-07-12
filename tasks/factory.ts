import { task } from "hardhat/config";

let ethers: any;

const contractName = "SocialTokenFactory";
const constructorParams: any[] = [];

async function deploy(): Promise<void> {
  const factory = await ethers.getContractFactory(contractName);
  const contract = await factory.deploy(...constructorParams);
  await contract.deployed();
  console.log(`${contractName} deployed at: ${contract.address}`);
}

deploy()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });

task("factory", "Deploy Factory").setAction(
  async (_, hre) => {
    ethers = hre.ethers;
    deploy()
      .then(() => {
        console.info("Factory deployed");
      })
      .catch((err) => {
        console.error(err);
      });
  }
);

/**
 * Command to run task:
 * npx hardhat factory --token-address <tokenAddress>
 */
