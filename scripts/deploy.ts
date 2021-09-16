import { ethers } from "hardhat";
import * as fs from "fs";
import { SocialTokenFactory } from '../typechain/SocialTokenFactory.d';

const contractName = "SocialTokenFactory";
const constructorParams: any[] = [];
const deploymentsPath = "deployments/";

async function deploy(): Promise<void> {
  const factory = await ethers.getContractFactory(contractName);
  const contract = await factory.deploy(...constructorParams);
  await contract.deployed();
  console.log(`${contractName} deployed at: ${contract.address}`);
  updateDeploymentsJSON(deploymentsPath, contractName, contract.address);
}

deploy()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });

function updateDeploymentsJSON(
  path: string,
  contractName: string,
  contractAddress: string
): void {
  const buffer = fs.readFileSync(path);
  const deploymentsObj = JSON.parse(buffer.toString());
  deploymentsObj[contractName] = contractAddress;
  fs.writeFileSync(path, JSON.stringify(deploymentsObj));
}
