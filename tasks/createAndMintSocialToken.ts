import { task } from "hardhat/config";

import { SLOPE } from "../constants";

let token = "";
let signers: any;
let ethers: any;

const factoryAddress = "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9";

async function createSocialToken(mintParams: any) {
  const whiteAddress = "0x70997970c51812dc3a010c7d01b50e0d17dc79c8";
  signers = await ethers.getSigners();

  const [owner] = await ethers.getSigners();
  const factory = await ethers.getContractAt(
    "SocialTokenFactory",
    factoryAddress,
    owner
  );
  const SocialTokenFactory = factory.connect(owner);
  const whitelist = await (
    await SocialTokenFactory.whitelist(whiteAddress)
  ).wait();
  console.log("whitelist", whitelist);

  const socialTokenCreator = factory.connect(owner);
  const create = await (await socialTokenCreator.create(mintParams)).wait();
  console.log("create", create);

  const socialTokenContract = factory.connect(owner);
  token = await socialTokenContract.getToken(whiteAddress);

  return token;
}

async function mint(mintParams: any) {
  await createSocialToken(mintParams);
  console.info("token", token);
  const owner = signers[0];

  const socialToken = await ethers.getContractAt("SocialToken", token, owner);

  const usdcContract = await ethers.getContractAt(
    "MockUSDC",
    mintParams.usdcCollateral,
    owner
  );

  const amount = ethers.utils.parseEther("1").toString();
  const price = await socialToken.getMintPrice(amount);
  console.info("price", price);
  const priceInUsdc = ethers.utils.formatUnits(price, 6);
  console.info("priceInUsdc", priceInUsdc);

  await (
    await usdcContract.approve(token, ethers.utils.parseUnits(priceInUsdc, 18))
  ).wait();

  const socialTokenMinter = socialToken.connect(owner);

  await (
    await socialTokenMinter.mint(amount, mintParams.usdcCollateral)
  ).wait();

  let supply: any = await socialTokenMinter.totalSupply();
  supply = ethers.utils.formatEther(supply);
}

task("socialTokenDetails", "Get Social Token Details")
  // .addParam("tokenAddress", "Token Address")
  .addParam("factoryAddress", "Factory Address")
  .addParam("creator", "Token creator")
  .addParam("usdcAddress", "USDC Address")
  .addParam("usdtAddress", "USDT Address")
  .addParam("tokenName", "Token Name")
  .addParam("tokenSymbol", "Token Symbol")
  .setAction(async (data, hre) => {
    console.info({ data });
    ethers = hre.ethers;

    const mintParams = {
      creator: data.creator,
      usdcCollateral: data.usdcAddress,
      usdtCollateral: data.usdtAddress,
      slope: ethers.utils.parseEther(SLOPE).toString(),
      maxSupply: ethers.utils.parseEther("10000000").toString(),
      name: data.tokenName,
      symbol: data.tokenSymbol,
    };

    await mint(mintParams);
  });

/**
 * Command to run task:
 * npx hardhat socialTokenDetails --token-address `tokenAddress`
 */
