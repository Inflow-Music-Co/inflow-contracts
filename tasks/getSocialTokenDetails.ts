import { task } from "hardhat/config";

async function getSocialTokenDetails(
  tokenAddress: string,
  ethers: any
): Promise<void> {
  const [owner] = await ethers.getSigners();
  const sociaoToken = await ethers.getContractAt(
    //ABI
    "SocialToken",
    tokenAddress,
    owner
  );

  const creator = await sociaoToken.creator();
  const slope = await sociaoToken.slope();
  const maxSupply = await sociaoToken.maxSupply();
  const reserve = await sociaoToken.reserve();

  console.log({ creator, slope, maxSupply, reserve });
}

task("socialTokenDetails", "Get Social Token Details")
  .addParam("tokenAddress", "Token Address")
  .setAction(async ({ tokenAddress }, hre) => {
    console.info({ tokenAddress });
    await getSocialTokenDetails(tokenAddress, hre.ethers);
  });

/**
 * Command to run task:
 * npx hardhat socialTokenDetails --token-address `tokenAddress`
 */
