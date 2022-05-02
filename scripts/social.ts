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
  "0x5c1e4da1d1DC1123b6E6331259dBb41c7cb69F47",
  "0x2E8992A98d58C3CA3b54e8042fF14be36Cc98dB1"
)
  .then(async (res) => {
    console.log("Token address is", res);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
