import { ethers } from "hardhat";
import { Contract, Signer, BytesLike, BigNumber } from "ethers";
import { expect } from "chai";
import { getTxEventData } from "./utils";
import { abi as SPLITTER_ABI } from "../artifacts/contracts/utils/Splitter.sol/Splitter.json";
import {
  Splitter,
  SplitterFactory,
  SplitterFactory__factory,
  MockUSDC,
  MockUSDC__factory,
} from "../typechain";

describe("Splitter Tests", () => {
  let signers: Signer[],
    admin: Signer,
    payees: string[],
    splitter: Splitter,
    splitterFactoryFactory: SplitterFactory__factory,
    splitterFactory: SplitterFactory,
    usdcFactory: MockUSDC__factory,
    usdc: MockUSDC;

  const PAYMENT = ethers.utils.parseEther("100"),
    SHARES = ethers.utils.parseEther(".5");

  beforeEach(async () => {
    try {
      signers = await ethers.getSigners();
      admin = signers[0];
      payees = await Promise.all(
        signers.slice(0, 3).map((signer) => signer.getAddress())
      );
      [usdcFactory, splitterFactoryFactory] = await Promise.all([
        ethers.getContractFactory(
          "MockUSDC",
          admin
        ) as Promise<MockUSDC__factory>,
        ethers.getContractFactory(
          "SplitterFactory",
          admin
        ) as Promise<SplitterFactory__factory>,
      ]);
      [usdc, splitterFactory] = await Promise.all([
        usdcFactory.deploy(),
        splitterFactoryFactory.deploy(),
      ]);
      const [splitterAddress] = await getTxEventData(
        splitterFactory
          .connect(signers[1])
          .create(usdc.address, payees, [SHARES, SHARES, SHARES]),
        "SplitterCreated(address, address)",
        splitterFactory.interface
      );
      splitter = new Contract(
        splitterAddress,
        SPLITTER_ABI,
        signers[1]
      ) as Splitter;
    } catch (err) {
      console.error(err);
    }
  });

  it("returns shares by payee", async () => {
    try {
      payees.forEach(async (payee) => {
        expect(await splitter.shares(payee)).to.equal(SHARES);
      });
    } catch (err) {
      console.error(err);
    }
  });

  it("returns total shares outstanding", async () => {
    try {
      expect(await splitter.totalShares()).to.equal(SHARES.mul(3));
    } catch (err) {
      console.error(err);
    }
  });

  it("releases individual payments", async () => {
    try {
      await (await usdc.mintTo(splitter.address, PAYMENT)).wait();
      payees.forEach(async (payee) => {
        await (await splitter.release(payee)).wait();
        expect(await usdc.balanceOf(payee)).to.equal(PAYMENT.div(3));
      });
    } catch (err) {
      console.error(err);
    }
  });

  it("batch releases payments", async () => {
    try {
      await (await usdc.mintTo(splitter.address, PAYMENT)).wait();
      await (await splitter.batchRelease(payees)).wait();
      payees.forEach(async (payee) => {
        expect(await usdc.balanceOf(payee)).to.equal(PAYMENT.div(3));
      });
    } catch (err) {
      console.error(err);
    }
  });

  it("returns total released", async () => {
    try {
      await (await usdc.mintTo(splitter.address, PAYMENT)).wait();
      await (await splitter.batchRelease(payees)).wait();
      expect(await splitter.totalReleased()).to.equal(PAYMENT.div(3).mul(3));
    } catch (err) {
      console.error(err);
    }
  });

  it("returns payee at index in payees array", async () => {
    try {
      payees.forEach(async (payee, i) => {
        expect(await splitter.payee(i)).to.equal(payee);
      });
    } catch (err) {
      console.error(err);
    }
  });

  it("returns each payee's released amount", async () => {
    try {
      await (await usdc.mintTo(splitter.address, PAYMENT)).wait();
      await (await splitter.batchRelease(payees)).wait();
      payees.forEach(async (payee) => {
        expect(await splitter.released(payee)).to.equal(PAYMENT.div(3));
      });
    } catch (err) {
      console.error(err);
    }
  });
});
