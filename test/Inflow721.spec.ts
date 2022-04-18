import "dotenv/config";
import { ethers } from "hardhat";
import { Signer, BigNumber } from "ethers";
import { expect } from "chai";
import { getTxEventData, formatCreators, Part } from "./utils";
import { Inflow721, Inflow721__factory } from "../typechain";

describe("Inflow721 Tests", () => {
  const sleep = (waitTimeInMs: any) => new Promise(resolve => setTimeout(resolve, waitTimeInMs));
  let signers: Signer[],
    admin: Signer,
    accounts: string[],
    inflowFactory: Inflow721__factory,
    inflow: Inflow721,
    inflowMinter: Inflow721;
  const OLD_BASE_URI = "https://ipfs.io/ipfs/",
    NEW_BASE_URI = "ipfs.io/ipfs/",
    URI = "TEST_URI";

  before(async function() {
    this.timeout(1200000)
    try {
      signers = await ethers.getSigners();
      [admin] = signers;
      accounts = await Promise.all(
        signers.map((signer) => signer.getAddress())
      );
      inflowFactory = (await ethers.getContractFactory(
        "Inflow721",
        admin
      )) as Inflow721__factory;
      inflow = await inflowFactory.deploy();
      (await inflow.whitelist(accounts[1])).wait();
      inflowMinter = inflow.connect(signers[1]);
    } catch (err) {
      console.error(err);
    }
  });

  it(" 1 - mints tokens",async function() {
    this.timeout(100000)
    try {
      const tokenId = await mint(
        inflowMinter,
        URI,
        formatCreators(accounts.slice(0, 3))
      );
      expect(await inflow.ownerOf(tokenId)).to.equal(accounts[1]);
    } catch (err) {
      console.error(err);
    }
  });


  it(" 2 - only mints with whitelisted accounts", async () => {
    try {  
      await expect(
          (await ( inflow.connect(signers[3])
            .mint(NEW_BASE_URI,
            formatCreators(accounts.slice(0, 3))))).wait()
          ).to.be.reverted;
    } catch (err) {
      console.error(err);
    }
  }).timeout(120000);



it(" 3 - updates base uri", async () => {
    try {
      expect(await inflow.baseUri()).to.equal("");
      (await inflow.setBaseUri(OLD_BASE_URI)).wait()
      await sleep(1000);
      expect(await inflow.baseUri()).to.equal(OLD_BASE_URI);
      (await inflow.setBaseUri(NEW_BASE_URI)).wait();
      await sleep(2000);
      expect(await inflow.baseUri()).to.equal(NEW_BASE_URI);
    } catch (err) {
      console.error(err);
    }
  }).timeout(120000);
  

  it(" 4 - disables whitelist to mint with non-whitelisted accounts", async () => {
    await sleep(2000)
    await (await inflow.setWhitelistEnabled(false)).wait();
    const idx = 3;
    const tokenId = await mint(
      inflow.connect(signers[idx]),
      URI,
      formatCreators(accounts.slice(0, 3))
    );
    expect(await inflow.ownerOf(tokenId)).to.equal(accounts[idx]);
  }).timeout(1200000);


  it(" 5 - implements raribleV2 royalties", async () => {
    try {
      const royalties = formatCreators(accounts.slice(0, 3));
      const tokenId = await mint(inflowMinter, URI, royalties);
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

  it(" 6 - royalty account must be msg.sender to update royalty account", async () => {
    try {
      const royalties = formatCreators(accounts.slice(0, 3));
      const tokenId = await mint(inflowMinter, URI, royalties);
      expect((inflow.updateRoyaltyAccount(tokenId, accounts[7], accounts[0]))).to.be.reverted;
    } catch (err) {
      console.error(err);
    }
  }).timeout(120000);

  it(" 7 - royalties length must be <= 16", async () => {
    try {
      const royalties = formatCreators(accounts.slice(0, 17));
      expect(inflow.mint(URI, royalties)).to.be.revertedWith;
    } catch (err) {
      console.error(err);
    }
  });
  it(" 8 - burns tokens", async () => {
    try {
      const tokenId = await mint(
        inflowMinter,
        URI,
        formatCreators(accounts.slice(0, 3))
      );
      expect(await inflow.ownerOf(tokenId)).to.equal(accounts[1]);
      await(await inflowMinter.burn(tokenId)).wait();
      expect(inflow.ownerOf(tokenId)).to.be.revertedWith;
    } catch (err) {
      console.error(err);
    }
  }).timeout(120000);
}).timeout(120000);

async function mint(inflow: Inflow721,uri: string,royalties: Part[]): Promise<BigNumber> {
  const [_, __, tokenId] = await getTxEventData(
    inflow.mint(uri, royalties),
    "Transfer(address,address,uint256)",
    inflow.interface,
    0
  );
  return tokenId;
}
