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

  before(async () => {
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

  it("creates tokens", async () => {
    try {
      const tokenId = await create(inflowCreator, data);
      expect(await inflow.balanceOf(creator, tokenId)).to.equal(data.supply);
    } catch (err) {
      console.error(err);
    }
  });

  it("create tx reverts if max supply is 0", async () => {
    try {
      await expect(
        inflowCreator.create({
          supply: 10,
          maxSupply: 0,
          uri: URI,
          royalties: formatCreators(accounts.slice(0, 3)),
        })
      ).to.be.reverted;
    } catch (err) {
      console.error(err);
    }
  });

  it("mints tokens", async () => {
    try {
      const tokenId = await create(inflowCreator, data);
      expect(await inflow.balanceOf(creator, tokenId)).to.equal(data.supply);
      await (await inflowCreator.mint(tokenId, 90)).wait();
      expect(await inflow.balanceOf(creator, tokenId)).to.equal(data.maxSupply);
    } catch (err) {
      console.error(err);
    }
  });

  it("mint tx reverts if msg.sender is not creator", async () => {
    try {
      const tokenId = await create(inflowCreator, data);
      await expect(inflow.connect(signers[2]).mint(tokenId, 1)).to.be.reverted;
    } catch (err) {
      console.error(err);
    }
  });

  it("mint tx reverts if current supply + mint amount is greater than max supply", async () => {
    try {
      const tokenId = await create(inflowCreator, data);
      const { supply, maxSupply } = await inflow.getToken(tokenId);
      const supplyDiff = maxSupply.sub(supply);
      await expect(inflowCreator.mint(tokenId, supplyDiff.add(10))).to.be
        .reverted;
    } catch (err) {
      console.error(err);
    }
  });

  it("batch mints tokens", async () => {
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
  });

  it("batch mint tx reverts if tokenIds length does not equal amounts length", async () => {
    try {
      const tokenId = await create(inflowCreator, data);
      await expect(inflowCreator.mintBatch([tokenId], [1, 1])).to.be.reverted;
    } catch (err) {
      console.error(err);
    }
  });

  it("batch mint tx reverts if msg.sender is not creator", async () => {
    try {
      const tokenId = await create(inflowCreator, data);
      await expect(inflow.connect(signers[3]).mintBatch([tokenId], [1])).to.be
        .reverted;
    } catch (err) {
      console.error(err);
    }
  });

  it("batch mint tx reverts if msg.sender is not creator", async () => {
    try {
      const tokenId = await create(inflowCreator, data);
      const { supply, maxSupply } = await inflow.getToken(tokenId);
      const supplyDiff = maxSupply.sub(supply);
      await expect(inflowCreator.mintBatch([tokenId], [supplyDiff.add(10)])).to
        .be.reverted;
    } catch (err) {
      console.error(err);
    }
  });

  it("burns tokens", async () => {
    try {
      const tokenId = await create(inflowCreator, data);
      expect(await inflow.balanceOf(creator, tokenId)).to.equal(data.supply);
      await (await inflowCreator.burn(tokenId, data.supply)).wait();
      expect(await inflow.balanceOf(creator, tokenId)).to.equal(0);
      await expect(inflowCreator.mint(tokenId, 90)).to.be.reverted;
    } catch (err) {
      console.error(err);
    }
  });

  it("burn tx reverts if token does not exist", async () => {
    try {
      await expect(inflow.burn(300, 1)).to.be.reverted;
    } catch (err) {
      console.error(err);
    }
  });

  it("updates base uri", async () => {
    try {
      expect(await inflow.baseUri()).to.equal("");
      (await inflow.setBaseUri(OLD_BASE_URI)).wait();
      expect(await inflow.baseUri()).to.equal(OLD_BASE_URI);
      (await inflow.setBaseUri(NEW_BASE_URI)).wait();
      expect(await inflow.baseUri()).to.equal(NEW_BASE_URI);
    } catch (err) {
      console.error(err);
    }
  });

  it("uri function reverts if token does not exist", async () => {
    try {
      await expect(inflow.uri(300)).to.be.reverted;
    } catch (err) {
      console.error(err);
    }
  });

  it("gets token uri", async () => {
    try {
      const tokenId = await create(inflowCreator, data);
      expect(await inflow.balanceOf(creator, tokenId)).to.equal(data.supply);
      const baseUri = await inflow.baseUri();
      expect(await inflow.uri(tokenId)).to.equal(baseUri + URI);
      const data2 = data;
      data2.uri = "";
      const tokenId2 = await create(inflowCreator, data2);
      expect(await inflow.uri(tokenId2)).to.equal(
        baseUri + tokenId2.toNumber()
      );
      (await inflow.setBaseUri("")).wait();
      expect(await inflow.uri(tokenId)).to.equal(URI);
    } catch (err) {
      console.error(err);
    }
  });

  it("gets token given tokenId", async () => {
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
  });

  it("getToken returns uninitialized Token struct if given uninitialized tokenId", async () => {
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
  });

  it("getToken reverts if tokenId is 0", async () => {
    try {
      await expect(inflow.getToken(0)).to.be.reverted;
    } catch (err) {
      console.error(err);
    }
  });

  it("disables whitelist to create with non-whitelisted accounts", async () => {
    await (await inflow.setWhitelistEnabled(false)).wait();
    const idx = 3;
    const tokenId = await create(inflow.connect(signers[idx]), data);
    expect(await inflow.balanceOf(accounts[idx], tokenId)).to.equal(
      data.supply
    );
  });

  it("implements raribleV2 royalties", async () => {
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
  });

  it("royalty account must be msg.sender to update royalty account", async () => {
    try {
      await expect(inflow.updateRoyaltyAccount(1, accounts[7], accounts[0])).to
        .be.reverted;
    } catch (err) {
      console.error(err);
    }
  });

  it("royalties length must be <= 16", async () => {
    try {
      await expect(
        inflow.create({
          supply: 10,
          maxSupply: 100,
          uri: URI,
          royalties: formatCreators(accounts.slice(0, 17)),
        })
      ).to.be.reverted;
    } catch (err) {
      console.error(err);
    }
  });
});

async function create(
  inflow: Inflow1155,
  createData: CreateData
): Promise<BigNumber> {
  const tokenId = await getEventData(inflow.create(createData), 1);
  return tokenId;
}
