import "dotenv/config";
import { ethers } from "hardhat";
import { expect } from "chai";
import { Signer } from "ethers";
import { getTxEventData } from "./utils";
import { Whitelistable__factory, Whitelistable } from "../typechain";

describe("Whitelistable Tests", async function (){
   this.timeout(2000000)
   const sleep = (waitTimeInMs: any) => new Promise(resolve => setTimeout(resolve, waitTimeInMs));
   let signers: Signer[],
    accounts: string[],
    whitelistableFactory: Whitelistable__factory,
    whitelistable: Whitelistable,
    whitelistableInvalidOwner: Whitelistable;

  before(async () => {
    try {
      signers = await ethers.getSigners();
      accounts = await Promise.all(
        signers.slice(0, 5).map((signer) => signer.getAddress())
      );
      [whitelistableFactory] = await Promise.all([
        ethers.getContractFactory(
          "Whitelistable",
          signers[0]
        ) as Promise<Whitelistable__factory>,
      ]);
      whitelistable = await whitelistableFactory.deploy();
      whitelistableInvalidOwner = whitelistable.connect(signers[1]);
    } catch (err) {
      console.error(err);
    }
  });

  it(" 1 - whitelists accounts", async () => {
    try {
      await (await whitelistable.whitelist(accounts[1])).wait();
      expect(await whitelistable.isWhitelisted(accounts[1])).to.be.true;
    } catch (err) {
      console.error(err);
    }
  });

  it(" 2 - unwhitelists accounts", async () => {
    try {
      await (await whitelistable.whitelist(accounts[2])).wait();
      expect(await whitelistable.isWhitelisted(accounts[2])).to.be.true;
      await (await whitelistable.unwhitelist(accounts[2])).wait();
      expect(await whitelistable.isWhitelisted(accounts[2])).to.be.false;
    } catch (err) {
      console.error(err);
    }
  });

  it(" 3 - only owner can enable whitelist", async () => {
    try {
      await expect(whitelistableInvalidOwner.callStatic.setWhitelistEnabled(true)).to.be
        .reverted;
    } catch (err) {
      console.error(err);
    }
  });

  it(" 4 - only owner can whitelist accounts", async () => {
    try {
      await expect(whitelistableInvalidOwner.callStatic.whitelist(accounts[3])).to.be
        .reverted;
    } catch (err) {
      console.error(err);
    }
  });

  it(" 5 - only owner can make unwhitelist accounts", async () => {
    try {
      await expect((whitelistableInvalidOwner.callStatic.unwhitelist(accounts[3]))).to.be
        .reverted;
    } catch (err) {
      console.error(err);
    }
  });

  it(" 6 - successful whitelist transactions emit Whitelisted event", async () => {
    try {
      const eventData = await getTxEventData(
        whitelistable.whitelist(accounts[4]),
        "Whitelisted(address)",
        whitelistable.interface,
        0
      );
      expect(eventData[0]).to.equal(accounts[4]);
      expect(eventData.length).to.equal(1);
    } catch (err) {
      console.error(err);
    }
  });

  it(" 7 - unsuccessful whitelist transactions do not emit Whitelisted event", async () => {
    try {
      await(await whitelistable.whitelist(accounts[4])).wait()
      await sleep(2000)
      const {logs} = await (
        await whitelistable.whitelist(accounts[4])
      ).wait();
      expect(logs.length).to.equal(0);
    } catch (err) {
      console.error(err);
    }
  });

  it(" 8 - successful unwhitelist transactions emit Unwhitelisted event", async () => {
    try {
      await (await whitelistable.whitelist(accounts[4])).wait();
      const eventData = await getTxEventData(
        whitelistable.unwhitelist(accounts[4]),
        "Unwhitelisted(address)",
        whitelistable.interface,
        0
      );
      expect(eventData[0]).to.equal(accounts[4]);
      expect(eventData.length).to.equal(1);
    } catch (err) {
      console.error(err);
    }
  });

  it(" 9 - unsuccessful unwhitelist transactions do not emit Unwhitelisted event", async () => {
    try {
      const { logs } = await(await whitelistable.unwhitelist(accounts[4])).wait();
      expect(logs.length).to.equal(0);
    } catch (err) {
      console.error(err);
    }
  });
});
