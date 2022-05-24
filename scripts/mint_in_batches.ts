import fs from "fs";
import { ethers } from "hardhat";

import { SLOPE } from "../constants";

const createCsvWriter = require("csv-writer").createObjectCsvWriter;

const csvWriter = createCsvWriter({
  path: "report.csv",
  header: [
    { id: "supply", title: "Supply" },
    { id: "amount", title: "Amount" },
    { id: "price", title: "Unit Price" },
    { id: "totalPrice", title: "Total Price" },
  ],
});

const factoryAddress = "0x41C659319885598d77CF5bd8E792A5162bC72A04";
const mintParams = {
  creator: "0x7D1D444A016FaFB601C27bC1bE4678D9D7871E86",
  usdcCollateral: "0x63aF7615e795F2cFb8A2f93aFAd7CD1B4d35bA5c",
  usdtCollateral: "0xb34Ca2cDE88dE520E4Be8b1ccEc374D3052ae021",
  slope: ethers.utils.parseEther(SLOPE).toString(),
  maxSupply: ethers.utils.parseEther("10000000").toString(),
  name: "test_artist_32",
  symbol: "TESTARTIST",
};

let token = "";
let signers: any;
const prices: {
  supply: string;
  amount: number;
  price: string;
  totalPrice: string;
}[] = [];

async function createSocialToken() {
  const whiteAddress = "0x7D1D444A016FaFB601C27bC1bE4678D9D7871E86";
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

let initialAmount = 1;

async function mintInBatch(max: number) {
  await createSocialToken();
  console.info("token", token);
  const owner = signers[0];

  const socialToken = await ethers.getContractAt("SocialToken", token, owner);

  const usdcContract = await ethers.getContractAt(
    "MockUSDC",
    mintParams.usdcCollateral,
    owner
  );

  let i = 0;
  while (i < max) {
    const amountOne = ethers.utils.parseEther("1").toString();
    const priceOne = await socialToken.getMintPrice(amountOne);
    const priceOneInUsdc = ethers.utils.formatUnits(priceOne, 6);

    const amount = ethers.utils.parseEther(initialAmount + "").toString();
    const price = await socialToken.getMintPrice(amount);
    console.info("price", price);
    const priceInUsdc = ethers.utils.formatUnits(price, 6);
    console.info("priceInUsdc", priceInUsdc);

    await (
      await usdcContract.approve(
        token,
        ethers.utils.parseUnits(priceInUsdc, 18)
      )
    ).wait();

    const socialTokenMinter = socialToken.connect(owner);

    await (
      await socialTokenMinter.mint(amount, mintParams.usdcCollateral)
    ).wait();

    let supply: any = await socialTokenMinter.totalSupply();
    supply = ethers.utils.formatEther(supply);

    prices.push({
      supply,
      price: priceOneInUsdc,
      amount: initialAmount,
      totalPrice: priceInUsdc,
    });

    initialAmount = initialAmount * 10;
    i++;
  }

  fs.createWriteStream("report.csv");

  csvWriter
    .writeRecords(prices) // returns a promise
    .then(() => {
      console.log("...Done");
    });
}

mintInBatch(5)
  .then(async () => {
    console.log("Successfully minted");
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
