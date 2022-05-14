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
    "0x0075c7aaa1D50857Dd5d293590d105f378A6f5Ff",
    "0xf591cA90dA60B9532631A612b1951c9C9a506565"
  )
  .then(async (res) => {
    console.log("Token address is", res);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
