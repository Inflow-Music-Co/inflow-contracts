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

task("factory", "Deploy Factory").setAction(async (_, hre) => {
  ethers = hre.ethers;
  console.info('running task "factory"');
  await deploy();
  console.info('finished task "factory"');
  console.info('Next task is "social"');
});

/**
 * Command to run task:
 * npx hardhat factory --network <network>
 */
