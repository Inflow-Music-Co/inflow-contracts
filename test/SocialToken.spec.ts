import { ethers } from "hardhat";
import { utils, Contract, Signer, BigNumber, BigNumberish } from "ethers";
import { expect } from "chai";
import { formatUsdc, parseUsdc, getTxEventData } from "./utils";
import { abi as SOCIALTOKEN_ABI } from "../artifacts/contracts/token/social/SocialToken.sol/SocialToken.json";
import {
  SocialToken,
  SocialTokenFactory,
  SocialTokenFactory__factory,
  MockUSDC,
  MockUSDC__factory,
} from "../typechain";

describe("SocialToken Tests", () => {
  let signers: Signer[],
    accounts: string[],
    admin: Signer,
    minter: Signer,
    adminAddress: string,
    minterAddress: string,
    social: SocialToken,
    socialMinter: SocialToken,
    socialFactoryFactory: SocialTokenFactory__factory,
    socialFactory: SocialTokenFactory,
    usdcFactory: MockUSDC__factory,
    usdc: MockUSDC,
    usdcMinter: MockUSDC;
  const AMOUNT = utils.parseEther("100");

  before(async () => {
    try {
      signers = await ethers.getSigners();
      [admin, minter] = signers.slice(0, 3);
      accounts = await Promise.all(
        signers.map((signer) => signer.getAddress())
      );
      [adminAddress, minterAddress] = accounts;
      [usdcFactory, socialFactoryFactory] = await Promise.all([
        ethers.getContractFactory(
          "MockUSDC",
          admin
        ) as Promise<MockUSDC__factory>,
        ethers.getContractFactory(
          "SocialTokenFactory",
          admin
        ) as Promise<SocialTokenFactory__factory>,
      ]);
      [usdc, socialFactory] = await Promise.all([
        usdcFactory.deploy(),
        socialFactoryFactory.deploy(),
      ]);
      usdcMinter = usdc.connect(minter);
      (await socialFactory.whitelist(adminAddress)).wait();
      const [socialTokenAddress] = await getTxEventData(
        socialFactory.create({
          creator: adminAddress,
          collateral: usdc.address,
          maxSupply: utils.parseEther("10000000"),
          slope: utils.parseEther("1"),
          name: "name",
          symbol: "SYMBOL",
        }),
        "SocialTokenCreated(address, address)",
        socialFactory.interface
      );
      social = new Contract(
        socialTokenAddress,
        SOCIALTOKEN_ABI,
        admin
      ) as SocialToken;
      socialMinter = social.connect(minter);
      expect(await social.owner()).to.equal(adminAddress);
    } catch (err) {
      console.error(err);
    }
  });

  it("mints tokens", async () => {
    try {
      await mint(socialMinter, usdcMinter, AMOUNT);
      expect(await social.balanceOf(minterAddress)).to.equal(AMOUNT);
      expect(await usdc.balanceOf(minterAddress)).to.equal(0);
    } catch (err) {
      console.error(err);
    }
  });

  it("mint tx reverts if amount is 0", async () => {
    try {
      await expect(socialMinter.mint(0)).to.be.reverted;
    } catch (err) {
      console.error(err);
    }
  });

  it("mint tx reverts if amount resolves negative or 0 mint price", async () => {
    try {
      const mintPrice = await social.getMintPrice(1);
      expect(mintPrice).to.equal(0);
      await expect(socialMinter.mint(1)).to.be.reverted;
    } catch (err) {
      console.error(err);
    }
  });

  it("mint tx reverts if current supply + mint amount is greater than max supply", async () => {
    try {
      const supply = await social.totalSupply();
      const maxSupply = await social.maxSupply();
      const diff = maxSupply.sub(supply);
      await expect(socialMinter.mint(diff.add(10))).to.be.reverted;
    } catch (err) {
      console.error(err);
    }
  });

  it("burns tokens", async () => {
    try {
      const burnPrice = await burn(socialMinter, AMOUNT);
      expect(await social.balanceOf(minterAddress)).to.equal(0);
      expect(await usdc.balanceOf(minterAddress)).to.equal(burnPrice);
    } catch (err) {
      console.error(err);
    }
  });

  it("burn tx reverts if amount is 0", async () => {
    try {
      await expect(socialMinter.burn(0)).to.be.reverted;
      const supply = await social.totalSupply();
      await expect(socialMinter.burn(supply.add(1))).to.be.reverted;
    } catch (err) {
      console.error(err);
    }
  });

  it("burn tx reverts if amount is greater than outstanding supply", async () => {
    try {
      const supply = await social.totalSupply();
      await expect(socialMinter.burn(supply.add(1))).to.be.reverted;
    } catch (err) {
      console.error(err);
    }
  });

  it("getBurnPrice function reverts if amount is 0", async () => {
    try {
      await expect(socialMinter.getBurnPrice(0)).to.be.reverted;
    } catch (err) {
      console.error(err);
    }
  });

  it("getBurnPrice function reverts if amount is greater than outstanding supply", async () => {
    try {
      const supply = await social.totalSupply();
      await expect(socialMinter.getBurnPrice(supply.add(1))).to.be.reverted;
    } catch (err) {
      console.error(err);
    }
  });

  it("withdraws funds to owner", async () => {
    try {
      await (await usdc.mintTo(social.address, parseUsdc("100"))).wait();
      const preBalance = await usdc.balanceOf(adminAddress);
      await (await social.withdraw()).wait();
      const postBalance = await usdc.balanceOf(adminAddress);
      expect(postBalance).to.be.above(preBalance);
    } catch (err) {
      console.error(err);
    }
  });

  it("withdraw tx reverts if msg.sender is not owner", async () => {
    try {
      await (await usdc.mintTo(social.address, parseUsdc("100"))).wait();
      await expect(social.connect(signers[2]).withdraw()).to.be.reverted;
    } catch (err) {
      console.error(err);
    }
  });

  it("getMintPrice uses simple integral calculation if supply is 0", async () => {
    try {
      const supply = await social.totalSupply();
      expect(supply).to.equal(0);
      const slope = await social.slope();
      const price = await social.getMintPrice(AMOUNT);
      expect(price).to.equal(
        slope
          .mul(supply.add(AMOUNT).pow(2))
          .div(2)
          .div(BigNumber.from(1).mul(BigNumber.from(10).pow(48)))
      );
    } catch (err) {
      console.error(err);
    }
  });

  it("getMintPrice uses implicit reserve integral calculation if supply is greater than 0", async () => {
    try {
      await mint(socialMinter, usdcMinter, AMOUNT);
      const supply = await social.totalSupply();
      const price = await social.getMintPrice(AMOUNT);
      const reserve = await social.reserve();
      expect(price).to.equal(
        reserve.mul(supply.add(AMOUNT).pow(2)).div(supply.pow(2)).sub(reserve)
      );
    } catch (err) {
      console.error(err);
    }
  });
});

async function mint(
  social: SocialToken,
  usdc: MockUSDC,
  amount: BigNumberish
): Promise<BigNumber> {
  const mintPrice = await social.getMintPrice(amount);
  await (await usdc.mint(mintPrice)).wait();
  await (await usdc.approve(social.address, mintPrice)).wait();
  await (await social.mint(amount)).wait();
  return mintPrice;
}

async function burn(
  social: SocialToken,
  amount: BigNumberish
): Promise<BigNumber> {
  const burnPrice = await social.getBurnPrice(amount);
  await (await social.burn(amount)).wait();
  return burnPrice;
}
