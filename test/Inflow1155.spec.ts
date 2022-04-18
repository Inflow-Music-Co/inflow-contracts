import "dotenv/config";
import { ethers } from "hardhat";
import { Signer, BigNumber, BigNumberish } from "ethers";
import { expect } from "chai";
import { getEventData, formatCreators, Part } from "./utils";
import { Inflow1155, Inflow1155__factory } from "../typechain";

type CreateData = {
  supply: BigNumberish;
  maxSupply: BigNumberish;
  uri: string;
  royalties: Part[];
};

describe("Inflow1155 Tests", () => {
const sleep = (waitTimeInMs: any) => new Promise(resolve => setTimeout(resolve, waitTimeInMs));
  let signers: Signer[],
    admin: Signer,
    accounts: string[],
    inflowFactory: Inflow1155__factory,
    inflow: Inflow1155,
    inflowCreator: Inflow1155,
    creator: string,
    data: CreateData;
  const OLD_BASE_URI = "https://ipfs.io/ipfs/",
    NEW_BASE_URI = "ipfs.io/ipfs/",
    URI = "TEST_URI";

  before(async function (){
      this.timeout(120000)
    try {
      signers = await ethers.getSigners();
      [admin] = signers;
      accounts = await Promise.all(
        signers.map((signer) => signer.getAddress())
      );
      inflowFactory = (await ethers.getContractFactory(
        "Inflow1155",
        admin
      )) as Inflow1155__factory;
      inflow = await inflowFactory.deploy();
      (await inflow.whitelist(accounts[1])).wait();
      inflowCreator = inflow.connect(signers[1]);
      creator = accounts[1];
      data = {
        supply: 10,
        maxSupply: 100,
        uri: URI,
        royalties: formatCreators(accounts.slice(0, 3)),
      };
    } catch (err) {
      console.error(err);
    }
  });

  it(" 1 - creates tokens", async () => {
    try {
      const tokenId = await create(inflowCreator, data);
      expect(await inflow.balanceOf(creator, tokenId)).to.equal(data.supply);
    } catch (err) {
      console.error(err);
    }
  }).timeout(120000);

it(" 2 - create tx reverts if max supply is 0", async () => {
    await sleep(1000);
    try {
      await expect(( await inflowCreator.create({
          supply: 10,
          maxSupply: 0,
          uri: URI,
          royalties: formatCreators(accounts.slice(0, 3)),
        })
      ).wait()).to.be.reverted;
    } catch (err) {
      console.error(err);
    }
  }).timeout(120000);

  it(" 3 - mints tokens", async () => {
    await sleep(3000);
    try {
      const tokenId = await create(inflowCreator, data);
      expect(await inflow.balanceOf(creator, tokenId)).to.equal(data.supply);
      await (await inflowCreator.mint(tokenId, 90)).wait();
      expect(await inflow.balanceOf(creator, tokenId)).to.equal(data.maxSupply);
    } catch (err) {
      console.error(err);
    }
  }).timeout(120000);

  it(" 4 - mint tx reverts if msg.sender is not creator", async () => {
    await sleep(2000);
    try {
      const tokenId = await create(inflowCreator, data);
      await expect((await (inflow.connect(signers[2]).mint(tokenId, 1))).wait()).to.be.reverted;
    } catch (err) {
      console.error(err);
    }
  }).timeout(120000);

  it(" 5 - mint tx reverts if current supply + mint amount is greater than max supply", async () => {
    await sleep(2000);
    try {
      const tokenId = await create(inflowCreator, data);
      const { supply, maxSupply } = await inflow.getToken(tokenId);
      const supplyDiff = maxSupply.sub(supply);
      await expect((await (inflowCreator.mint(tokenId, supplyDiff.add(10)))).wait()).to.be.reverted;
    } catch (err) {
      console.error(err);
    }
  }).timeout(120000);

  it(" 6 - batch mints tokens", async () => {
    await sleep(3000);
    try {
      const { supply, maxSupply } = data;
      const tokenId = await create(inflowCreator, data);
      const tokenId2 = await create(inflowCreator, data);
      expect(await inflow.balanceOf(creator, tokenId)).to.equal(supply);
      expect(await inflow.balanceOf(creator, tokenId2)).to.equal(supply);
      await (
        await inflowCreator.mintBatch([tokenId, tokenId2], [90, 90])
      ).wait();
      expect(await inflow.balanceOf(creator, tokenId)).to.equal(maxSupply);
      expect(await inflow.balanceOf(creator, tokenId2)).to.equal(maxSupply);
    } catch (err) {
      console.error(err);
    }
  }).timeout(120000);

  it(" 7 - batch mint tx reverts if tokenIds length does not equal amounts length", async () => {
    await sleep(3000);
    try {
      const tokenId = await create(inflowCreator, data);
      await expect((await (inflowCreator.mintBatch([tokenId], [1, 1]))).wait()).to.be.reverted;
    } catch (err) {
      console.error(err);
    }
  }).timeout(120000);

  it(" 8 - batch mint tx reverts if msg.sender is not creator", async () => {
    await sleep(3000);
    try {
      const tokenId = await create(inflowCreator, data);
      expect(inflow.connect(signers[3]).mintBatch([tokenId], [1])).to.be
     .revertedWith;
    } catch (err) {
      console.error(err);
    }
  }).timeout(120000);

  it(" 9 - batch mint tx reverts if Tokens amount is greater then max supply", async () => {
    await sleep(3000);
    try {
      const tokenId = await create(inflowCreator, data);
      const { supply, maxSupply } = await inflow.getToken(tokenId);
      const supplyDiff = maxSupply.sub(supply);
      expect(inflowCreator.mintBatch([tokenId], [supplyDiff.add(10)])).to
        .be.revertedWith;
    } catch (err) {
      console.error(err);
    }
  }).timeout(120000);

  it(" 10 - burns tokens", async () => {
    await sleep(3000);
    try {
      const tokenId = await create(inflowCreator, data);
      expect(await inflow.balanceOf(creator, tokenId)).to.equal(data.supply);
      await (await inflowCreator.burn(tokenId, data.supply)).wait();
      expect(await inflow.balanceOf(creator, tokenId)).to.equal(0);
      expect(inflowCreator.mint(tokenId, 90)).to.be.revertedWith;
    } catch (err) {
      console.error(err);
    }
  }).timeout(120000);

  it(" 11 - burn tx reverts if token does not exist", async () => {
    try {
      expect(inflow.burn(300, 1)).to.be.revertedWith;
    } catch (err) {
      console.error(err);
    }
  }).timeout(120000);

  it(" 12 - updates base uri", async () => {
    try {
      expect(await inflow.baseUri()).to.equal("");
      await(await inflow.setBaseUri(OLD_BASE_URI)).wait()
      await sleep(1000);
      expect(await inflow.baseUri()).to.equal(OLD_BASE_URI);
      await (await inflow.setBaseUri(NEW_BASE_URI)).wait();
      await sleep(2000);
      expect(await inflow.baseUri()).to.equal(NEW_BASE_URI);
    } catch (err) {
      console.error(err);
    }
  }).timeout(120000);

  it(" 13 - uri function reverts if token does not exist", async () => {
    try {
      await expect(inflow.uri(300)).to.be.reverted;
    } catch (err) {
      console.error(err);
    }
  }).timeout(120000);

  it(" 14 - gets token uri", async () => {
    try {
      const tokenId = await create(inflowCreator, data);
      expect(await inflow.balanceOf(creator, tokenId)).to.equal(data.supply);
      const baseUri = await inflow.baseUri();
      expect(await inflow.uri(tokenId)).to.equal(baseUri + URI);
      const data2 = data;
      data2.uri = "";
      await sleep(2000);
      const tokenId2 = await create(inflowCreator, data2);
      await sleep(2000);
      expect(await inflow.uri(tokenId2)).to.equal(
        baseUri + tokenId2.toNumber()
      );
      await sleep(2000);
      await(await inflow.setBaseUri("")).wait();
      await sleep(2000);
      expect(await inflow.uri(tokenId)).to.equal(URI);
    } catch (err) {
      console.error(err);
    }
  }).timeout(120000);

  it(" 15 - gets token given tokenId", async () => {
    await sleep(3000);
      
    try {
      const tokenId = await create(inflowCreator, data);
      const token = await inflow.getToken(tokenId);
      expect(token.creator).to.equal(creator);
      expect(token.supply).to.equal(data.supply);
      expect(token.maxSupply).to.equal(data.maxSupply);
      expect(token.uri).to.equal(data.uri);
    } catch (err) {
      console.error(err);
    }
  }).timeout(120000);

  it(" 16 - getToken returns uninitialized Token struct if given uninitialized tokenId", async () => {
    try {
      const token = await inflow.getToken(300);
      expect(token.creator).to.equal(
        ethers.utils.formatBytes32String("").slice(0, 42)
      );
      expect(token.supply).to.equal(0);
      expect(token.maxSupply).to.equal(0);
      expect(token.uri).to.equal("");
    } catch (err) {
      console.error(err);
    }
  }).timeout(120000);

  it(" 17 - getToken reverts if tokenId is 0", async () => {
    try {
      await expect(inflow.getToken(0)).to.be.reverted;
    } catch (err) {
      console.error(err);
    }
  }).timeout(120000);

  it(" 18 - disables whitelist to create with non-whitelisted accounts", async () => {
    await sleep(3000);
    await (await inflow.setWhitelistEnabled(false)).wait();
    const idx = 3;
    await sleep(20000);
    const tokenId = await create(inflow.connect(signers[idx]), data);
    expect(await inflow.balanceOf(accounts[idx], tokenId)).to.equal(
      data.supply
    );
  }).timeout(120000);

  it(" 19 - implements raribleV2 royalties", async () => {
    await sleep(3000);
    try {
      const royalties = formatCreators(accounts.slice(0, 3));
      const tokenId = await create(inflowCreator, data);
      const preRoyalties = await inflow.getRoyalties(tokenId);
      preRoyalties.forEach(([account, value], i) => {
        expect(account).to.equal(royalties[i].account);
        expect(value).to.equal(royalties[i].value);
      });
      await (
        await inflow.updateRoyaltyAccount(
          tokenId,
          royalties[0].account,
          accounts[5]
        )
      ).wait();
      const postRoyalties = await inflow.getRoyalties(tokenId);
      royalties[0].account = accounts[5];
      postRoyalties.forEach(([account, value], i) => {
        expect(account).to.equal(royalties[i].account);
        expect(value).to.equal(royalties[i].value);
      });
    } catch (err) {
      console.error(err);
    }
  }).timeout(120000);

  it(" 20 - royalty account must be msg.sender to update royalty account", async () => {
    try {
      await expect(inflow.updateRoyaltyAccount(1, accounts[7], accounts[0])).to
        .be.reverted;
    } catch (err) {
      console.error(err);
    }
  }).timeout(120000);

  it(" 21 - royalties length must be <= 16", async () => {
    try {
      expect((await inflow.create({
          supply: 10,
          maxSupply: 100,
          uri: URI,
          royalties: formatCreators(accounts.slice(0, 18)),
        })).wait()).to.be.revertedWith;
    } catch (err) {
      console.error(err);
    }
  });
}).timeout(120000);

async function create(
  inflow: Inflow1155,
  createData: CreateData
): Promise<BigNumber> {
  const tokenId = await getEventData(inflow.create(createData), 1,2);
  return tokenId;
}
