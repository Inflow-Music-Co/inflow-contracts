import { ethers } from "hardhat";

import { SLOPE } from "../constants";

const factoryAddress = "0x41C659319885598d77CF5bd8E792A5162bC72A04";
const mintParams = {
  creator: "0x09C1cA8211e107BA4089de25Aa5c65cF486ef1C6",
  usdcCollateral: "0x63aF7615e795F2cFb8A2f93aFAd7CD1B4d35bA5c",
  usdtCollateral: "0xb34Ca2cDE88dE520E4Be8b1ccEc374D3052ae021",
  slope: ethers.utils.parseEther(SLOPE).toString(),
  maxSupply: ethers.utils.parseEther("10000000").toString(),
  name: "test_artist_7",
  symbol: "TESTARTIST",
};

describe("Mint and Burn total supply", async () => {
  let token = "";
  let signers: any;
  before(async () => {
    const whiteAddress = "0x09C1cA8211e107BA4089de25Aa5c65cF486ef1C6";
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
  });

  it("should mint and burn all supply", async () => {
    console.info("token", token);
    const owner = signers[0];
    const amount = ethers.utils.parseEther("10000000").toString();
    console.info("amount", amount);
    const socialToken = await ethers.getContractAt("SocialToken", token, owner);
    console.info("socialToken");
    const usdcContract = await ethers.getContractAt(
      "MockUSDC",
      mintParams.usdcCollateral,
      owner
    );

    console.info("usdcContract");
    const price = await socialToken.getMintPrice(amount);
    console.info("price", price);
    const priceInUsdc = ethers.utils.formatUnits(price, 6);
    console.info("priceInUsdc", priceInUsdc);
    await usdcContract.approve(token, ethers.utils.parseUnits(priceInUsdc, 18));

    const socialTokenMinter = socialToken.connect(owner);
    const mint = await (
      await socialTokenMinter.mint(amount, mintParams.usdcCollateral)
    ).wait();

    console.log("mint", mint);

    const burn = await socialTokenMinter.burn(amount);

    console.info("burn", burn);
  });
});
