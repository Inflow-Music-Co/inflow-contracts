import { task } from "hardhat/config";

import { USDC_ADDRESS } from "../constants";

let ethers: any;

async function mint(mintParams: any) {
  const [owner] = await ethers.getSigners();

  const socialToken = await ethers.getContractAt(
    "SocialToken",
    mintParams.token,
    owner
  );

  const usdcContract = await ethers.getContractAt(
    "MockUSDC",
    mintParams.usdcCollateral,
    owner
  );

  const amount = ethers.utils.parseEther(mintParams.amount).toString();
  const price = await socialToken.getMintPrice(amount);
  console.info("price", price);
  const priceInUsdc = ethers.utils.formatUnits(price, 6);
  console.info("priceInUsdc", priceInUsdc);

  await (
    await usdcContract.approve(
      mintParams.token,
      ethers.utils.parseUnits(priceInUsdc, 18)
    )
  ).wait();

  const socialTokenMinter = socialToken.connect(owner);

  await (
    await socialTokenMinter.mint(amount, mintParams.usdcCollateral)
  ).wait();

  let supply: any = await socialTokenMinter.totalSupply();
  supply = ethers.utils.formatEther(supply);
  console.info(`current supply: ${supply}`);
}

task("mint", "Mint social token")
  .addParam("token", "Social Token Address")
  .addParam("amount", "Amount to be minted")
  .setAction(async (data, hre) => {
    console.info("running mint task");
    ethers = hre.ethers;

    const mintParams = {
      token: data.token,
      amount: data.amount,
      usdcCollateral: USDC_ADDRESS,
    };

    await mint(mintParams);
    console.info("finished mint task");
    console.info('Next task is "burn"');
  });

/**
 * Command to run task:
 * npx hardhat mint --token <tokenAddress> --usdc-address <usdcAddress> --amount <amount> --network <network>
 * Example:
 * npx hardhat mint --token 0xe4BbFD5a3cbc8d93fa3E4eA9d23C7B8B6804F3aE --amount 1 --network localhost
 */
