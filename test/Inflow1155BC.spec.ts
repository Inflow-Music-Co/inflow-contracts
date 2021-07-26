import "dotenv/config";
import { ethers } from "hardhat";
import { expect } from "chai";
import { utils, Signer, BigNumber, BigNumberish, Contract } from "ethers";
import {
  formatUsdc,
  parseUsdc,
  getEventData,
  formatCreators,
  Part,
} from "./utils";
import { abi as SOCIALTOKEN_ABI } from "../artifacts/contracts/token/social/SocialToken.sol/SocialToken.json";
import {
  Inflow1155BC,
  Inflow1155BC__factory,
  SocialToken,
  SocialTokenFactory,
  SocialTokenFactory__factory,
  MockUSDC,
  MockUSDC__factory,
  MockMinter,
  MockMinter__factory,
} from "../typechain";

interface CreateData {
  curve: BigNumberish;
  social: string;
  price: BigNumberish;
  socialBalance: BigNumberish;
  maxSupply: BigNumberish;
  uri: string;
  royalties: Part[];
}

describe("Inflow1155BC Tests", () => {
  let signers: Signer[],
    admin: Signer,
    accounts: string[],
    adminAddress: string,
    minter: Signer,
    minterAddress: string,
    creator: Signer,
    creatorAddress: string,
    nonWhitelisted: Signer,
    nonWhitelistedAddress: string,
    inflowFactory: Inflow1155BC__factory,
    inflow: Inflow1155BC,
    inflowCreator: Inflow1155BC,
    inflowMinter: Inflow1155BC,
    usdcFactory: MockUSDC__factory,
    usdc: MockUSDC,
    usdcCreator: MockUSDC,
    usdcMinter: MockUSDC,
    social: SocialToken,
    socialMinter: SocialToken,
    socialFactoryFactory: SocialTokenFactory__factory,
    socialFactory: SocialTokenFactory,
    mockMinter: MockMinter,
    mockMinterFactory: MockMinter__factory,
    _tokenId: BigNumber;
  const OLD_BASE_URI = "https://ipfs.io/ipfs/",
    NEW_BASE_URI = "ipfs.io/ipfs/",
    REQUIRED_SOCIAL_TOKEN_BALANCE = utils.parseEther("1");

  before(async () => {
    try {
      signers = await ethers.getSigners();
      [admin, minter, creator, nonWhitelisted] = signers;
      accounts = await Promise.all(
        signers.map((signer) => signer.getAddress())
      );
      [adminAddress, minterAddress, creatorAddress, nonWhitelistedAddress] =
        accounts;
      [inflowFactory, usdcFactory, socialFactoryFactory, mockMinterFactory] =
        await Promise.all([
          ethers.getContractFactory(
            "Inflow1155BC",
            admin
          ) as Promise<Inflow1155BC__factory>,
          ethers.getContractFactory("MockUSDC") as Promise<MockUSDC__factory>,
          ethers.getContractFactory(
            "SocialTokenFactory",
            admin
          ) as Promise<SocialTokenFactory__factory>,
          ethers.getContractFactory(
            "MockMinter"
          ) as Promise<MockMinter__factory>,
        ]);
      usdc = await usdcFactory.deploy();
      usdcCreator = usdc.connect(creator);
      usdcMinter = usdc.connect(minter);
      [inflow, socialFactory] = await Promise.all([
        inflowFactory.deploy(usdc.address),
        socialFactoryFactory.deploy(),
      ]);
      inflowCreator = inflow.connect(creator);
      inflowMinter = inflow.connect(minter);
      // use social token factory to deploy new social token
      // whitelist creator
      (await socialFactory.whitelist(adminAddress)).wait();
      const socialTokenAddress = await getEventData(
        socialFactory.create({
          creator: adminAddress,
          collateral: usdc.address,
          maxSupply: utils.parseEther("10000000").toString(),
          slope: utils.parseEther("1").toString(),
          name: "test",
          symbol: "TEST",
        }),
        0
      );
      // initialize social token contract object
      social = new Contract(
        socialTokenAddress,
        SOCIALTOKEN_ABI,
        admin
      ) as SocialToken;
      socialMinter = social.connect(minter);
      expect(await social.owner()).to.equal(adminAddress);
      mockMinter = await mockMinterFactory.deploy(
        inflow.address,
        social.address,
        usdc.address
      );
      // whitelist creator
      (await inflow.whitelist(creatorAddress)).wait();
      _tokenId = await create(inflowCreator, usdcCreator, {
        curve: 2,
        social: social.address,
        socialBalance: REQUIRED_SOCIAL_TOKEN_BALANCE,
        price: 0,
        maxSupply: 100,
        uri: "BEFORE_HOOK",
        royalties: formatCreators(accounts.slice(18)),
      });
    } catch (err) {
      console.error(err);
    }
  });

  it("creates/mints/burns for all curves", async () => {
    try {
      for (let crv = 0; crv < 3; crv++) {
        // create token
        const creators = accounts.slice((crv + 1) * 3, (crv + 2) * 3);
        const data: CreateData = {
          curve: crv,
          social: social.address,
          socialBalance: REQUIRED_SOCIAL_TOKEN_BALANCE.add(
            utils.parseEther(crv.toString())
          ),
          price: crv === 0 ? parseUsdc("100") : 0,
          maxSupply: 10 + crv,
          uri: "TESTING_1_2_3" + crv.toString(),
          royalties: formatCreators(creators),
        };
        const tokenId = await create(inflowCreator, usdcCreator, data);
        const token = await inflow.getToken(tokenId);
        const creatorTokenBalance = await inflow.balanceOf(
          creatorAddress,
          tokenId
        );
        expect(creatorTokenBalance).to.equal(1);
        expect(token.curve).to.equal(data.curve);
        expect(token.creator).to.equal(creatorAddress);
        expect(token.supply._value).to.equal(1);
        expect(token.maxSupply).to.equal(data.maxSupply);
        expect(token.uri).to.equal(data.uri);

        // mint token
        await mintSocial(socialMinter, usdcMinter, data.socialBalance);
        const creatorPreBalances = await Promise.all(
          creators.map(async (account) => await usdc.balanceOf(account))
        );
        await mint(inflowMinter, usdcMinter, tokenId);
        expect(await inflow.balanceOf(minterAddress, tokenId)).to.equal(1);
        const creatorPostBalances = await Promise.all(
          creators.map((account) => usdc.balanceOf(account))
        );
        const fees = await getPrevFeesPaid(inflow, tokenId);
        creatorPreBalances.forEach((preBalance, i) =>
          expect(creatorPostBalances[i]).to.be.above(preBalance)
        );
        fees.forEach((fee, i) => expect(creatorPostBalances[i]).to.equal(fee));

        // burn token
        const preBurnBalance = await usdc.balanceOf(minterAddress);
        (await inflowMinter.burn(tokenId, 1)).wait();
        expect(await usdc.balanceOf(minterAddress)).to.be.above(preBurnBalance);
      }
    } catch (err) {
      console.error(err);
    }
  });

  it("only whitelisted accounts can create tokens", async () => {
    try {
      await expect(
        inflow.connect(signers[5]).create({
          curve: 2,
          social: social.address,
          socialBalance: REQUIRED_SOCIAL_TOKEN_BALANCE,
          price: 0,
          maxSupply: 100,
          uri: "BEFORE_HOOK",
          royalties: formatCreators(accounts.slice(18)),
        })
      ).to.be.reverted;
    } catch (err) {
      console.error(err);
    }
  });

  it("create tx reverts with const curve and zero price", async () => {
    try {
      const createPrice = await inflow.createPrice();
      await usdcMintAndApprove(usdc, inflow.address, createPrice);
      await expect(
        inflowCreator.create({
          curve: 0,
          social: social.address,
          socialBalance: REQUIRED_SOCIAL_TOKEN_BALANCE,
          price: 0,
          maxSupply: 100,
          uri: "BEFORE_HOOK",
          royalties: formatCreators(accounts.slice(18)),
        })
      ).to.be.reverted;
    } catch (err) {
      console.error(err);
    }
  });

  it("create tx reverts with non-const curve and non-zero price", async () => {
    try {
      const createPrice = await inflow.createPrice();
      await usdcMintAndApprove(usdc, inflow.address, createPrice);
      await expect(
        inflowCreator.create({
          curve: 2,
          social: social.address,
          socialBalance: REQUIRED_SOCIAL_TOKEN_BALANCE,
          price: 1,
          maxSupply: 100,
          uri: "BEFORE_HOOK",
          royalties: formatCreators(accounts.slice(18)),
        })
      ).to.be.reverted;
    } catch (err) {
      console.error(err);
    }
  });

  it("create tx reverts if max supply is 0", async () => {
    try {
      const createPrice = await inflow.createPrice();
      await usdcMintAndApprove(usdc, inflow.address, createPrice);
      await expect(
        inflowCreator.create({
          curve: 2,
          social: social.address,
          socialBalance: REQUIRED_SOCIAL_TOKEN_BALANCE,
          price: 0,
          maxSupply: 0,
          uri: "BEFORE_HOOK",
          royalties: formatCreators(accounts.slice(18)),
        })
      ).to.be.reverted;
    } catch (err) {
      console.error(err);
    }
  });

  it("mint tx reverts if minter has less than required social token balance", async () => {
    try {
      const { price, curve } = await inflow.getToken(_tokenId);
      const mintPrice =
        curve === 0 ? price : await getNextMintPrice(inflow, _tokenId);
      await usdcMintAndApprove(usdc, inflow.address, mintPrice);
      await (await inflow.whitelist(accounts[10])).wait();
      await expect(inflow.connect(signers[10]).mint(_tokenId)).to.be.reverted;
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

  it("burn tx reverts if minimum supply argument is greater than or equal to current supply", async () => {
    try {
      const { supply } = await inflow.getToken(1);
      const minimumSupply = supply._value.add(1);
      await expect(inflow.burn(300, supply._value)).to.be.reverted;
      await expect(inflow.burn(300, minimumSupply)).to.be.reverted;
    } catch (err) {
      console.error(err);
    }
  });

  it("if supply is 1, burn transactions also clear tokens mapping", async () => {
    try {
      const data: CreateData = {
        curve: 1,
        social: social.address,
        socialBalance: REQUIRED_SOCIAL_TOKEN_BALANCE,
        price: 0,
        maxSupply: 10,
        uri: "TESTING_1_2_3",
        royalties: formatCreators(accounts.slice(0, 3)),
      };
      const tokenId = await create(inflowCreator, usdcCreator, data);
      await (await inflowCreator.burn(tokenId, 1)).wait();
      const token = await inflow.getToken(tokenId);
      const creatorTokenBalance = await inflow.balanceOf(
        creatorAddress,
        tokenId
      );
      expect(creatorTokenBalance).to.equal(0);
      expect(token.curve).to.equal(0);
      expect(token.creator).to.equal(
        "0x0000000000000000000000000000000000000000"
      );
      expect(token.supply._value).to.equal(0);
      expect(token.maxSupply).to.equal(0);
      expect(token.uri).to.equal("");
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

  it("getToken returns uninitialized Token struct if given uninitialized tokenId", async () => {
    try {
      const token = await inflow.getToken(300);
      expect(token.curve).to.equal(0);
      expect(token.creator).to.equal(
        utils.formatBytes32String("").slice(0, 42)
      );
      expect(token.social).to.equal(utils.formatBytes32String("").slice(0, 42));
      expect(token.socialBalance).to.equal(0);
      expect(token.maxSupply).to.equal(0);
      expect(token.supply._value).to.equal(0);
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

  it("calculates mint and burn prices using all curves", async () => {
    try {
      const supply = 2;
      for (let crv = 0; crv < 3; crv++) {
        const [
          mintPrice,
          mintPriceIncSupply,
          mintPriceDecSupply,
          burnPrice,
          burnPriceIncSupply,
          burnPriceDecSupply,
        ] = await Promise.all([
          inflow.getMintPrice(crv, supply),
          inflow.getMintPrice(crv, supply + 1),
          inflow.getMintPrice(crv, supply - 1),
          inflow.getBurnPrice(crv, supply),
          inflow.getBurnPrice(crv, supply + 1),
          inflow.getBurnPrice(crv, supply - 1),
        ]);
        if (crv === 0) {
          expect(mintPrice).to.equal(0);
          expect(mintPriceIncSupply).to.equal(0);
          expect(mintPriceDecSupply).to.equal(0);
          expect(burnPrice).to.equal(0);
          expect(burnPriceIncSupply).to.equal(0);
          expect(burnPriceDecSupply).to.equal(0);
        } else {
          expect(mintPrice).to.below(mintPriceIncSupply);
          expect(mintPrice).to.above(mintPriceDecSupply);
          expect(burnPrice).to.below(burnPriceIncSupply);
          expect(burnPrice).to.above(burnPriceDecSupply);
        }
      }
    } catch (err) {
      console.error(err);
    }
  });

  it("implements raribleV2 royalties", async () => {
    try {
      const royalties = formatCreators(accounts.slice(18));
      const preRoyalties = await inflow.getRoyalties(_tokenId);
      preRoyalties.forEach(([account, value], i) => {
        expect(account).to.equal(royalties[i].account);
        expect(value).to.equal(royalties[i].value);
      });
      await (
        await inflow
          .connect(signers[18])
          .updateRoyaltyAccount(_tokenId, accounts[18], accounts[5])
      ).wait();
      const postRoyalties = await inflow.getRoyalties(_tokenId);
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
      await expect(
        inflow.updateRoyaltyAccount(_tokenId, accounts[7], accounts[0])
      ).to.be.reverted;
    } catch (err) {
      console.error(err);
    }
  });

  it("royalties length must be <= 16", async () => {
    try {
      await expect(
        inflow.create({
          curve: 1,
          social: social.address,
          socialBalance: REQUIRED_SOCIAL_TOKEN_BALANCE,
          price: 0,
          maxSupply: 10,
          uri: "TEST_URI",
          royalties: formatCreators(accounts.slice(0, 17)),
        })
      ).to.be.reverted;
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

  it("setBaseUri tx reverts if called from non-owner account", async () => {
    try {
      await expect(inflow.connect(signers[8]).setBaseUri("Updated")).to.be
        .reverted;
    } catch (err) {
      console.error(err);
    }
  });

  it("withdraws funds to owner", async () => {
    try {
      const preBalance = await usdc.balanceOf(adminAddress);
      (await usdc.mintTo(inflow.address, parseUsdc("100"))).wait();
      (await inflow.withdraw()).wait();
      const postBalance = await usdc.balanceOf(adminAddress);
      expect(postBalance).to.be.above(preBalance);
    } catch (err) {
      console.error(err);
    }
  });

  it("withdraw tx reverts if msg.sender is not owner", async () => {
    try {
      await (await usdc.mintTo(social.address, parseUsdc("100"))).wait();
      await expect(inflow.connect(signers[2]).withdraw()).to.be.reverted;
    } catch (err) {
      console.error(err);
    }
  });

  it("sets create prices", async () => {
    try {
      (await inflow.setCreatePrice(parseUsdc("100"))).wait();
      expect(formatUsdc(await inflow.createPrice())).to.equal("100");
    } catch (err) {
      console.error(err);
    }
  });

  it("setCreatePrice tx reverts if called from non-owner account", async () => {
    try {
      await expect(inflow.connect(signers[8]).setCreatePrice(parseUsdc("100")))
        .to.be.reverted;
    } catch (err) {
      console.error(err);
    }
  });

  it("enables contract addresses to mint tokens", async () => {
    try {
      (await inflow.setContractMintEnabled(true)).wait();
      const mintNFTPrice = await getNextMintPrice(inflow, _tokenId);
      (await usdc.mintTo(mockMinter.address, mintNFTPrice)).wait();
      const requiredBalance = REQUIRED_SOCIAL_TOKEN_BALANCE.add(
        utils.parseEther("2")
      );
      await mintSocial(social, usdc, requiredBalance);
      (await social.transfer(mockMinter.address, requiredBalance)).wait();
      (await mockMinter.approveCollateral(inflow.address, mintNFTPrice)).wait();
      (await mockMinter.mint(_tokenId)).wait();
      expect(await inflow.balanceOf(mockMinter.address, _tokenId)).to.equal(1);
    } catch (err) {
      console.error(err);
    }
  });

  it("disables contract addresses from minting tokens", async () => {
    try {
      (await inflow.setContractMintEnabled(false)).wait();
      await expect(mockMinter.mint(_tokenId)).to.be.reverted;
    } catch (err) {
      console.error(err);
    }
  });

  it("setContractMintEnabled tx reverts if caller is non-owner", async () => {
    try {
      await expect(inflow.connect(signers[5]).setContractMintEnabled(false)).to
        .be.reverted;
    } catch (err) {
      console.error(err);
    }
  });

  it("supports interfaces for ERC1155 and ERC165", async () => {
    try {
      expect(await inflow.supportsInterface("0xd9b67a26")).to.be.true;
      expect(await inflow.supportsInterface("0x0e89341c")).to.be.true;
      expect(await inflow.supportsInterface("0x01ffc9a7")).to.be.true;
    } catch (err) {
      console.error(err);
    }
  });

  it("gets token uri", async () => {
    try {
      const baseUri = await inflow.baseUri();
      expect(await inflow.uri(_tokenId)).to.equal(baseUri + "BEFORE_HOOK");
      const tokenId2 = await create(inflowCreator, usdcCreator, {
        curve: 1,
        social: social.address,
        socialBalance: 10,
        price: 0,
        maxSupply: 10,
        uri: "",
        royalties: formatCreators(accounts.slice(6, 12)),
      });
      expect(await inflow.uri(tokenId2)).to.equal(
        baseUri + tokenId2.toNumber()
      );
      (await inflow.setBaseUri("")).wait();
      expect(await inflow.uri(_tokenId)).to.equal("BEFORE_HOOK");
    } catch (err) {
      console.error(err);
    }
  });

  it("disables whitelist to create with non-whitelisted accounts", async () => {
    await (await inflow.setWhitelistEnabled(false)).wait();
    const data = {
      curve: 1,
      social: social.address,
      socialBalance: 10,
      price: 0,
      maxSupply: 10,
      uri: "",
      royalties: formatCreators(accounts.slice(6, 12)),
    };
    const tokenId = await create(
      inflow.connect(nonWhitelisted),
      usdc.connect(nonWhitelisted),
      data
    );
    expect(await inflow.balanceOf(nonWhitelistedAddress, tokenId)).to.equal(1);
  });
});

async function mint(
  inflow: Inflow1155BC,
  usdc: MockUSDC,
  tokenId: BigNumberish
): Promise<void> {
  const { price, curve } = await inflow.getToken(tokenId);
  const mintPrice =
    curve === 0 ? price : await getNextMintPrice(inflow, tokenId);
  await usdcMintAndApprove(usdc, inflow.address, mintPrice);
  (await inflow.mint(tokenId)).wait();
}

async function getNextMintPrice(
  inflow: Inflow1155BC,
  tokenId: BigNumberish
): Promise<BigNumber> {
  const { supply, curve, price } = await inflow.getToken(tokenId);
  const newSupply = supply._value.add(1);
  return curve === 0 ? price : await inflow.getMintPrice(curve, newSupply);
}

async function mintSocial(
  social: SocialToken,
  usdc: MockUSDC,
  amount: BigNumberish
): Promise<BigNumber> {
  const mintPrice = await social.getMintPrice(amount);
  await usdcMintAndApprove(usdc, social.address, mintPrice);
  (await social.mint(amount)).wait();
  return mintPrice;
}

async function usdcMintAndApprove(
  usdc: MockUSDC,
  spender: string,
  amount: BigNumberish
): Promise<void> {
  (await usdc.mint(amount)).wait();
  (await usdc.approve(spender, amount)).wait();
}

async function create(
  inflow: Inflow1155BC,
  usdc: MockUSDC,
  data: CreateData
): Promise<BigNumber> {
  const createPrice = await inflow.createPrice();
  await usdcMintAndApprove(usdc, inflow.address, createPrice);
  const tokenId = await getEventData(inflow.create(data), 1);
  return tokenId;
}

async function getPrevFeesPaid(
  inflow: Inflow1155BC,
  tokenId: BigNumberish
): Promise<BigNumber[]> {
  const { supply, curve, price } = await inflow.getToken(tokenId);
  const mintPrice =
    curve === 0 ? price : await inflow.getMintPrice(curve, supply._value);
  const burnPrice =
    curve === 0
      ? price.mul(85).div(100)
      : await inflow.getBurnPrice(curve, supply._value);
  const totalFee = mintPrice.sub(burnPrice);
  const totalCreatorFee = await inflow.getCreatorFee(totalFee);
  const royalties = await inflow.getRoyalties(tokenId);
  return royalties.map(({ value }) => totalCreatorFee.mul(value).div(10000));
}
