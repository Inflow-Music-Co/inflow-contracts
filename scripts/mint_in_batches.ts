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
    { id: "artistFee", title: "Artist Fee" },
    { id: "platformFee", title: "Platform Fee" },
  ],
});

const factoryAddress = "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9";
const mintParams = {
  creator: "0x70997970c51812dc3a010c7d01b50e0d17dc79c8",
  usdcCollateral: "0x5FC8d32690cc91D4c39d9d3abcBD16989F875707",
  usdtCollateral: "0x0165878A594ca255338adfa4d48449f69242Eb8F",
  slope: ethers.utils.parseEther(SLOPE).toString(),
  maxSupply: ethers.utils.parseEther("10000000").toString(),
  name: "test_artist_41",
  symbol: "TESTARTIST",
};

let token = "";
let signers: any;
const prices: {
  supply: string;
  amount: number;
  price: string;
  totalPrice: string;
  artistFee: number;
  platformFee: number;
}[] = [];

async function createSocialToken() {
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

let initialAmount = 1000;
let remainingSupply = 10000000;

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
  while (remainingSupply > 0) {
    if (initialAmount > remainingSupply) initialAmount = remainingSupply;

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
    remainingSupply = remainingSupply - initialAmount;

    console.info("remainingSupply", remainingSupply);
    console.info("initialAmount", initialAmount);

    prices.push({
      supply,
      price: priceOneInUsdc,
      amount: initialAmount,
      totalPrice: priceInUsdc,
      artistFee: +priceInUsdc * 0.15,
      platformFee: +priceInUsdc * 0.05,
    });

    initialAmount = initialAmount + 100;
    i++;
  }

  fs.createWriteStream("report.csv");

  csvWriter
    .writeRecords(prices) // returns a promise
    .then(() => {
      console.log("...Done");
    });
}

mintInBatch(10)
  .then(async () => {
    console.log("Successfully minted");
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
