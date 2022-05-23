import fs from "fs";
import { ethers } from "hardhat";

import { SLOPE } from "../constants";

const createCsvWriter = require("csv-writer").createObjectCsvWriter;

const csvWriter = createCsvWriter({
  path: "report.csv",
  header: [
    { id: "date", title: "Date" },
    { id: "price", title: "Price" },
  ],
});

const factoryAddress = "0x41C659319885598d77CF5bd8E792A5162bC72A04";
const mintParams = {
  creator: "0x2F556C07a1d1f6a14a6C95A406da459D4Fc607bf",
  usdcCollateral: "0x63aF7615e795F2cFb8A2f93aFAd7CD1B4d35bA5c",
  usdtCollateral: "0xb34Ca2cDE88dE520E4Be8b1ccEc374D3052ae021",
  slope: ethers.utils.parseEther(SLOPE).toString(),
  maxSupply: ethers.utils.parseEther("10000000").toString(),
  name: "test_artist_8",
  symbol: "TESTARTIST",
};

let token = "";
let signers: any;
const prices: { date: Date; price: string }[] = [];

async function createSocialToken() {
  const whiteAddress = "0x2F556C07a1d1f6a14a6C95A406da459D4Fc607bf";
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

async function mintInBatch(max: number) {
  await createSocialToken();
  console.info("token", token);
  const owner = signers[0];
  const amount = ethers.utils.parseEther("1000").toString();
  console.info("amount", amount);
  const socialToken = await ethers.getContractAt("SocialToken", token, owner);

  const usdcContract = await ethers.getContractAt(
    "MockUSDC",
    mintParams.usdcCollateral,
    owner
  );

  let i = 0;
  while (i < max) {
    const price = await socialToken.getMintPrice(amount);
    console.info("price", price);
    const priceInUsdc = ethers.utils.formatUnits(price, 6);
    console.info("priceInUsdc", priceInUsdc);
    prices.push({ date: new Date(), price: priceInUsdc });
    await (
      await usdcContract.approve(
        token,
        ethers.utils.parseUnits(priceInUsdc, 18)
      )
    ).wait();

    const socialTokenMinter = socialToken.connect(owner);
    const mint = await (
      await socialTokenMinter.mint(amount, mintParams.usdcCollateral)
    ).wait();

    i++;
  }

  fs.createWriteStream("report.csv");

  csvWriter
    .writeRecords(prices) // returns a promise
    .then(() => {
      console.log("...Done");
    });
}

mintInBatch(15)
  .then(async () => {
    console.log("Successfully minted");
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
