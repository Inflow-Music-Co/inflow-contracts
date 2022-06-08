import { ethers } from "hardhat";

import { abi as SocialTokenFactory } from "../artifacts/contracts/token/social/SocialTokenFactory.sol/SocialTokenFactory.json";

async function getSocialToken(contractAddress: string, userAddress: string) {
  const [owner] = await ethers.getSigners();
  const socialTokenFactory = await ethers.getContractAt(
    SocialTokenFactory,
    contractAddress,
    owner
  );

  const socialTokenContract = socialTokenFactory.connect(owner);
  const token = await socialTokenContract.getToken(userAddress);

  return token;
}

getSocialToken(
  "0x5FbDB2315678afecb367f032d93F642f64180aa3",
  "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266"
)
  .then(async (res) => {
    console.log("Token address is", res);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
