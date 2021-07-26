import "dotenv/config";
import { ethers } from "hardhat";
import { Signer, BigNumber } from "ethers";
import { expect } from "chai";
import { getTxEventData, formatCreators, Part } from "./utils";
import { Inflow721, Inflow721__factory } from "../typechain";

describe("Inflow721 Tests", () => {
  let signers: Signer[],
    admin: Signer,
    accounts: string[],
    inflowFactory: Inflow721__factory,
    inflow: Inflow721,
    inflowMinter: Inflow721;
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

  it("mints tokens", async () => {
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

  it("only mints with whitelisted accounts", async () => {
    try {
      await expect(
        inflow
          .connect(signers[3])
          .mint(NEW_BASE_URI, formatCreators(accounts.slice(0, 3)))
      ).to.be.reverted;
    } catch (err) {
      console.error(err);
    }
  });

  it("burns tokens", async () => {
    try {
      const tokenId = await mint(
        inflowMinter,
        URI,
        formatCreators(accounts.slice(0, 3))
      );
      expect(await inflow.ownerOf(tokenId)).to.equal(accounts[1]);
      await (await inflowMinter.burn(tokenId)).wait();
      await expect(inflow.ownerOf(tokenId)).to.be.reverted;
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

  it("disables whitelist to mint with non-whitelisted accounts", async () => {
    await (await inflow.setWhitelistEnabled(false)).wait();
    const idx = 3;
    const tokenId = await mint(
      inflow.connect(signers[idx]),
      URI,
      formatCreators(accounts.slice(0, 3))
    );
    expect(await inflow.ownerOf(tokenId)).to.equal(accounts[idx]);
  });

  it("implements raribleV2 royalties", async () => {
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
  });

  it("royalty account must be msg.sender to update royalty account", async () => {
    try {
      const royalties = formatCreators(accounts.slice(0, 3));
      const tokenId = await mint(inflowMinter, URI, royalties);
      await expect(
        inflow.updateRoyaltyAccount(tokenId, accounts[7], accounts[0])
      ).to.be.reverted;
    } catch (err) {
      console.error(err);
    }
  });

  it("royalties length must be <= 16", async () => {
    try {
      const royalties = formatCreators(accounts.slice(0, 17));
      await expect(inflow.mint(URI, royalties)).to.be.reverted;
    } catch (err) {
      console.error(err);
    }
  });
});

async function mint(
  inflow: Inflow721,
  uri: string,
  royalties: Part[]
): Promise<BigNumber> {
  const [_, __, tokenId] = await getTxEventData(
    inflow.mint(uri, royalties),
    "Transfer(address,address,uint256)",
    inflow.interface,
    0
  );
  return tokenId;
}
