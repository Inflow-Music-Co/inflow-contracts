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
  "0x696b7880Cd45765013C34CD8F98E31528c44FcB1",
  "0xd553b4E3FD4618f33c36d58F540257F911268c04"
)
  .then(async (res) => {
    console.log("Token address is", res);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
