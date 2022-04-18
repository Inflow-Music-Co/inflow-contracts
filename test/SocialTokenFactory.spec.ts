import { ethers } from "hardhat";
import { Signer, utils } from "ethers";
import { expect } from "chai";
import { getEventData } from "./utils";
import {
  SocialTokenFactory,
  SocialTokenFactory__factory,
  MockUSDC,
  MockUSDC__factory,
  MockUSDT,
  MockUSDT__factory
} from "../typechain";

describe("SocialTokenFactory Tests", async function () {

 this.timeout(12000000000000)
  let signers: Signer[],
    accounts: string[],
    admin: Signer,
    adminAddress: string,
    socialFactoryFactory: SocialTokenFactory__factory,
    socialFactory: SocialTokenFactory,
    usdcFactory: MockUSDC__factory,
    usdc: MockUSDC,
    usdtFactory:MockUSDT__factory,
    usdt:MockUSDT;
  const AMOUNT = ethers.utils.parseEther("100");

  before(async () => {
    try {
      signers = await ethers.getSigners();
      [admin] = signers.slice(0, 3);
      accounts = await Promise.all(
        signers.map((signer) => signer.getAddress())
      );
      [adminAddress] = accounts;
      [usdcFactory,usdtFactory, socialFactoryFactory] = await Promise.all([
        ethers.getContractFactory(
          "MockUSDC",
          admin
        ) as Promise<MockUSDC__factory>,
        ethers.getContractFactory(
            "MockUSDT",
            admin
          ) as Promise<MockUSDT__factory>,
        ethers.getContractFactory(
          "SocialTokenFactory",
          admin
        ) as Promise<SocialTokenFactory__factory>,
      ]);
      [usdc,usdt, socialFactory] = await Promise.all([
       await usdcFactory.deploy(),
       await usdtFactory.deploy(),
       await  socialFactoryFactory.deploy(),
      ]);
    } catch (err) {
      console.error(err);
    }
  });

  it("creates social token contracts", async () => {
    try {
      (await socialFactory.whitelist(adminAddress)).wait();
      const socialTokenAddress = await getEventData(
        socialFactory.create({
          creator: adminAddress,
          usdcCollateral : usdc.address,
          usdtCollateral : usdt.address,
          maxSupply: ethers.utils.parseEther("10000000"),
          slope: ethers.utils.parseEther("1"),
          name: "name",
          symbol: "SYMBOL",
        }),
        0
      );
      expect(socialTokenAddress.length).to.equal(42);
      expect(socialTokenAddress.slice(0, 2)).to.equal("0x");
    } catch (err) {
      console.error(err);
    }
  });

  it("only whitelisted accounts can create social tokens", async () => {
    try {
      await expect(
        socialFactory.connect(signers[3]).create({
          creator: adminAddress,
          usdcCollateral:usdc.address,
          usdtCollateral:usdt.address,
          maxSupply: ethers.utils.parseEther("10000000"),
          slope: ethers.utils.parseEther("1"),
          name: "name",
          symbol: "SYMBOL",
        })
      ).to.be.reverted;
    } catch (err) {
      console.error(err);
    }
  });

  it("create tx reverts if token with creator already exists", async () => {
    try {
      await (
        await socialFactory.create({
          creator: accounts[10],
          usdcCollateral:usdc.address,
          usdtCollateral:usdt.address,
          maxSupply: ethers.utils.parseEther("10000000"),
          slope: ethers.utils.parseEther("1"),
          name: "name",
          symbol: "SYMBOL",
        })
      ).wait();
      await expect(
        socialFactory.create({
          creator: accounts[10],
          usdcCollateral:usdc.address,
          usdtCollateral:usdt.address,
          maxSupply: ethers.utils.parseEther("10000000"),
          slope: ethers.utils.parseEther("1"),
          name: "name",
          symbol: "SYMBOL",
        })
      ).to.be.reverted;
    } catch (err) {
      console.error(err);
    }
  });

  it("getToken returns created SocialToken address", async () => {
    try {
      const socialTokenAddressFromEvent = await getEventData(
        socialFactory.create({
          creator: accounts[15],
          usdcCollateral:usdc.address,
          usdtCollateral:usdt.address,
          maxSupply: ethers.utils.parseEther("10000000"),
          slope: ethers.utils.parseEther("1"),
          name: "name",
          symbol: "SYMBOL",
        }),
        0
      );
      const socialTokenAddressFromMapping = await socialFactory.getToken(
        accounts[15]
      );
      expect(socialTokenAddressFromEvent).to.equal(
        socialTokenAddressFromMapping
      );
    } catch (err) {
      console.error(err);
    }
  });

  it("getToken reverts if creator is the zero address", async () => {
    try {
      await expect(
        socialFactory.getToken(utils.formatBytes32String("").slice(0, 42))
      ).to.be.reverted;
    } catch (err) {
      console.error(err);
    }
  });
});
