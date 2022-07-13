import { task } from "hardhat/config";

let ethers: any;

async function burn(burnParams: any) {
  const [owner] = await ethers.getSigners();

  const socialToken = await ethers.getContractAt(
    "SocialToken",
    burnParams.token,
    owner
  );

  const amount = ethers.utils.parseEther(burnParams.amount).toString();
  const price = await socialToken.getBurnPrice(amount);
  console.info("price", price);
  const priceInUsdc = ethers.utils.formatUnits(price, 6);
  console.info("priceInUsdc", priceInUsdc);

  const socialTokenBurner = socialToken.connect(owner);

  await (await socialTokenBurner.burn(amount)).wait();

  let supply: any = await socialTokenBurner.totalSupply();
  supply = ethers.utils.formatEther(supply);
  console.info(`current supply: ${supply}`);
}

task("burn", "Burn social token")
  .addParam("token", "Social Token Address")
  .addParam("amount", "Amount to be burned")
  .setAction(async (data, hre) => {
    console.info("running burn task");
    ethers = hre.ethers;

    const burnParams = {
      token: data.token,
      amount: data.amount,
    };

    await burn(burnParams);
    console.info("finished burn task");
  });

/**
 * Command to run task:
 * npx hardhat burn --token <tokenAddress> --usdc-address <usdcAddress> --amount <amount> --network <network>
 * Example:
 * npx hardhat burn --token 0xe4BbFD5a3cbc8d93fa3E4eA9d23C7B8B6804F3aE --amount 1 --network localhost
 */
