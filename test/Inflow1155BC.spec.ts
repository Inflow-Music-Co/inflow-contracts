// import "dotenv/config";
// import { ethers } from "hardhat";
// import { expect } from "chai";
// import { utils, Signer, BigNumber, BigNumberish, Contract } from "ethers";
// import {
//   formatUsdc,
//   parseUsdc,
//   getEventData,
//   formatCreators,
//   Part,
// } from "./utils";
// import { abi as SOCIALTOKEN_ABI } from "../artifacts/contracts/token/social/SocialToken.sol/SocialToken.json";
// import {
//   Inflow1155BC,
//   Inflow1155BC__factory,
//   SocialToken,
//   SocialTokenFactory,
//   SocialTokenFactory__factory,
//   MockUSDC,
//   MockUSDC__factory,
//   MockMinter,
//   MockMinter__factory,
//   SocialToken__factory,
//   MockUSDT,
//   MockUSDT__factory,
// } from "../typechain";

// interface CreateData {
//   curve: BigNumberish;
//   social: string;
//   price: BigNumberish;
//   socialBalance: BigNumberish;
//   maxSupply: BigNumberish;
//   uri: string;
//   royalties: Part[];
// }
// const sleep = (waitTimeInMs: any) => new Promise(resolve => setTimeout(resolve, waitTimeInMs));
// describe("Inflow1155BC  Tests",async function () {
//   this.timeout(2000000)
//   let signers: Signer[],
//     admin: Signer,
//     accounts: string[],
//     adminAddress: string,
//     minter: Signer,
//     minterAddress: string,
//     creator: Signer,
//     creatorAddress: string,
//     nonWhitelisted: Signer,
//     nonWhitelistedAddress: string,
//     inflowFactory: Inflow1155BC__factory,
//     inflow: Inflow1155BC,
//     inflowCreator: Inflow1155BC,
//     inflowMinter: Inflow1155BC,
//     usdcFactory: MockUSDC__factory,
//     usdc: MockUSDC,
//     usdcCreator: MockUSDC,
//     usdcMinter: MockUSDC,
//     social: SocialToken,
//     socialMinter: SocialToken,
//     socialFactoryFactory: SocialTokenFactory__factory,
//     socialFactory: SocialTokenFactory,
//     mockMinter: MockMinter,
//     mockMinterFactory: MockMinter__factory,
//     usdtFactory:MockUSDT__factory,
//     usdt:MockUSDT,
//     _tokenId: BigNumber;
//   const OLD_BASE_URI = "https://ipfs.io/ipfs/",
//     NEW_BASE_URI = "ipfs.io/ipfs/",
//     REQUIRED_SOCIAL_TOKEN_BALANCE = utils.parseEther("1");

//   before(async  function() {
//     try {
//       signers = await ethers.getSigners();
//       [admin, minter, creator, nonWhitelisted] = signers;
//       accounts = await Promise.all(
//         signers.map((signer) => signer.getAddress())
//       );
//       [adminAddress, minterAddress, creatorAddress, nonWhitelistedAddress] =
//         accounts;
//       [inflowFactory, usdcFactory, socialFactoryFactory, mockMinterFactory, usdtFactory] =
//         await Promise.all([
//           ethers.getContractFactory(
//             "Inflow1155BC",
//             admin
//           ) as Promise<Inflow1155BC__factory>,
//           ethers.getContractFactory("MockUSDC") as Promise<MockUSDC__factory>,
//           ethers.getContractFactory(
//             "SocialTokenFactory",
//             admin
//           ) as Promise<SocialTokenFactory__factory>,
//           ethers.getContractFactory(
//             "MockMinter"
//           ) as Promise<MockMinter__factory>,
//             ethers.getContractFactory(
//                 "MockUSDT",
//                 admin
//               ) as Promise<MockUSDT__factory>,
//         ]);
//       const _socialToken = ethers.getContractFactory("SocialToken");
//       usdc = await usdcFactory.deploy();
//       usdt = await usdtFactory.deploy()  ;
//       await sleep(50000)
//       usdcCreator = usdc.connect(creator);
//       usdcMinter = usdc.connect(minter);
     
//       [social,inflow,socialFactory] = await Promise.all([ 
//         social =  await (await _socialToken).deploy({
//             creator: adminAddress,
//             usdcCollateral: usdc.address,
//             usdtCollateral: usdt.address,
//             maxSupply: utils.parseEther("1000000000000000").toString(),
//             slope: utils.parseEther("1").toString(),
//             name: "test",
//             symbol: "TEST"}
//             ),
    
        
//       await inflowFactory.deploy(usdc.address),
//       await socialFactoryFactory.deploy()
//       ]);

//       inflowCreator = inflow.connect(creator);
//       inflowMinter = inflow.connect(minter);
//       // use social token factory to deploy new social token
//       // whitelist creator
//       await(await socialFactory.whitelist(adminAddress)).wait();
//       // initialize social token contract object
//       social = new Contract(
//         social.address,
//         SOCIALTOKEN_ABI,
//         admin
//       ) as SocialToken;
//       socialMinter = social.connect(minter);
//       expect(await social.owner()).to.equal(adminAddress);
//       mockMinter = (await mockMinterFactory.deploy(
//         inflow.address,
//         social.address,
//         usdc.address
//       ));
//       await sleep(5000);
//       // whitelist creator
//       await(await inflow.whitelist(creatorAddress)).wait();
//       await sleep(5000);
     
//       _tokenId = await create(inflowCreator, usdcCreator, {
//         curve: 2,
//         social: social.address,
//         socialBalance: REQUIRED_SOCIAL_TOKEN_BALANCE,
//         price: 0,
//         maxSupply: 100,
//         uri: "BEFORE_HOOK",
//         royalties: formatCreators(accounts.slice(3)),
//       });
//     } catch (err) {
//       console.error(err);
//     }
//   });

//   it(" 1 - creates/mints/burns for all curves", async () => {
//     try {
//       for (let crv = 0; crv < 1; crv++) {
//         // create token
//         const creators = accounts.slice((crv + 1) * 1, (crv + 2) * 1);
//         const data: CreateData = {
//           curve: crv,
//           social: social.address,
//           socialBalance: REQUIRED_SOCIAL_TOKEN_BALANCE.add(
//             utils.parseEther(crv.toString())
//           ),
//           price: crv === 0 ? parseUsdc("100") : 0,
//           maxSupply: 10 + crv,
//           uri: "TESTING_1_2_3" + crv.toString(),
//           royalties: formatCreators(creators),
//         };
//         await sleep(9000)
//         const tokenId = await create(inflowCreator, usdcCreator, data);
//         const token = await inflow.getToken(tokenId);
//         const creatorTokenBalance = await inflow.balanceOf(
//           creatorAddress,
//           tokenId
//         );
//         expect(creatorTokenBalance).to.equal(1);
//         expect(token.curve).to.equal(data.curve);
//         expect(token.creator).to.equal(creatorAddress);
//         expect(token.supply._value).to.equal(1);
//         expect(token.maxSupply).to.equal(data.maxSupply);
//         expect(token.uri).to.equal(data.uri);

//         await sleep(3000)
//         // mint token
//         await mintSocial(socialMinter, usdcMinter, data.socialBalance);
//         await sleep(3000)
//         const creatorPreBalances = await Promise.all(
//           creators.map(async (account) => await usdc.balanceOf(account))
//         );
//         await sleep(4000)
//         await mint(inflowMinter, usdcMinter, tokenId);
//         await sleep(4000)
//         expect(await inflow.balanceOf(minterAddress, tokenId)).to.equal(1);
//         const creatorPostBalances = await Promise.all(
//           creators.map((account) => usdc.balanceOf(account))
//         );
//         const fees = await getPrevFeesPaid(inflow, tokenId);
//         creatorPreBalances.forEach((preBalance, i) =>
//           expect(creatorPostBalances[i]).to.be.above(preBalance)
//         );
//         fees.forEach((fee, i) => expect(creatorPostBalances[i]).to.equal(fee));
//         // burn token
//         const preBurnBalance = await usdc.balanceOf(minterAddress);
//         await(await inflowMinter.burn(tokenId, 1)).wait();
//         expect(await usdc.balanceOf(minterAddress)).to.be.above(preBurnBalance);
//       }
//     } catch (err) {
//       console.error(err);
//     }
//   });

//   it(" 2 - only whitelisted accounts can create tokens", async () => {
//     try {
//       await expect(
//          (await inflow.connect(signers[5]).create({
//           curve: 2,
//           social: social.address,
//           socialBalance: REQUIRED_SOCIAL_TOKEN_BALANCE,
//           price: 0,
//           maxSupply: 100,
//           uri: "BEFORE_HOOK",
//           royalties: formatCreators(accounts.slice(0,3)),
//         })).wait()
//       ).to.be.reverted;
//     } catch (err) {
//       console.error(err);
//     }
//   });

//   it(" 3 - create tx reverts with const curve and zero price", async () => {
//     try {
//       const createPrice = await inflow.createPrice();
//       await usdcMintAndApprove(usdc, inflow.address, createPrice);
//       await expect((await
//         inflowCreator.create({
//           curve: 0,
//           social: social.address,
//           socialBalance: REQUIRED_SOCIAL_TOKEN_BALANCE,
//           price: 0,
//           maxSupply: 100,
//           uri: "BEFORE_HOOK",
//           royalties: formatCreators(accounts.slice(0,3)),
//         })).wait()
//         ).to.be.reverted;
//     } catch (err) {
//       console.error(err);
//     }
//   });;

//   it(" 4 - create tx reverts with non-const curve and non-zero price", async () => {
//     try {
//       const createPrice = await inflow.createPrice();
//       await usdcMintAndApprove(usdc, inflow.address, createPrice);
//       await expect((await inflowCreator.create({
//         curve: 2,
//         social: social.address,
//         socialBalance: REQUIRED_SOCIAL_TOKEN_BALANCE,
//         price: 1,
//         maxSupply: 100,
//         uri: "BEFORE_HOOK",
//         royalties: formatCreators(accounts.slice(0,3)),
//       })).wait()
//       ).to.be.reverted;
//     } catch (err) {
//       console.error(err);
//     }
//   });;

//   it(" 5 - create tx reverts if max supply is 0", async () => {
//     try {
//       const createPrice = await inflow.createPrice();
//       await usdcMintAndApprove(usdc, inflow.address, createPrice);
//       await expect((await inflowCreator.create({
//         curve: 2,
//         social: social.address,
//         socialBalance: REQUIRED_SOCIAL_TOKEN_BALANCE,
//         price: 0,
//         maxSupply: 0,
//         uri: "BEFORE_HOOK",
//         royalties: formatCreators(accounts.slice(0,3)),
//       })).wait()
//       ).to.be.reverted;
//     } catch (err) {
//       console.error(err);
//     }
//   });;

//   it(" 6 - mint tx reverts if minter has less than required social token balance", async () => {
//     try {
//       const { price, curve } = await inflow.getToken(_tokenId);
//       const mintPrice =
//         curve === 0 ? price : await getNextMintPrice(inflow, _tokenId);
//       await usdcMintAndApprove(usdc, inflow.address, mintPrice);
//       await (await inflow.whitelist(accounts[4])).wait();
//       await expect((await inflow.connect(signers[4]).mint(_tokenId)).wait()).to.be.reverted;
//     } catch (err) {
//       console.error(err);
//     }
//   });;

//   it(" 7 - burn tx reverts if token does not exist", async () => {
//     try {
//       await expect((await (inflow.burn(300, 1))).wait()).to.be.reverted;
//     } catch (err) {
//       console.error(err);
//     }
//   });;

//   it(" 8 - burn tx reverts if minimum supply argument is greater than or equal to current supply", async () => {
//     try {
//       const { supply } = await inflow.getToken(1);
//       const minimumSupply = supply._value.add(1);
//       await expect((await inflow.burn(300, supply._value)).wait()).to.be.reverted;
//       await expect((await inflow.burn(300, minimumSupply)).wait()).to.be.reverted;
//     } catch (err) {
//       console.error(err);
//     }
//   })

//   it(" 9 - if supply is 1, burn transactions also clear tokens mapping", async () => {
//     try {
//       const data: CreateData = {
//         curve: 1,
//         social: social.address,
//         socialBalance: REQUIRED_SOCIAL_TOKEN_BALANCE,
//         price: 0,
//         maxSupply: 10,
//         uri: "TESTING_1_2_3",
//         royalties: formatCreators(accounts.slice(0, 3)),
//       };
//       const tokenId = await create(inflowCreator, usdcCreator, data);
//       await (await inflowCreator.burn(tokenId, 1)).wait();
//       const token = await inflow.getToken(tokenId);
//       const creatorTokenBalance = await inflow.balanceOf(
//         creatorAddress,
//         tokenId
//       );
//       expect(creatorTokenBalance).to.equal(0);
//       expect(token.curve).to.equal(0);
//       expect(token.creator).to.equal(
//         "0x0000000000000000000000000000000000000000"
//       );
//       expect(token.supply._value).to.equal(0);
//       expect(token.maxSupply).to.equal(0);
//       expect(token.uri).to.equal("");
//     } catch (err) {
//       console.error(err);
//     }
//   });;

//   it(" 10 - uri function reverts if token does not exist", async () => {
//     try {
//       await expect(inflow.uri(300)).to.be.reverted;
//     } catch (err) {
//       console.error(err);
//     }
//   });;

//   it(" 11 - getToken returns uninitialized Token struct if given uninitialized tokenId", async () => {
//     try {
//       const token = await inflow.getToken(300);
//       expect(token.curve).to.equal(0);
//       expect(token.creator).to.equal(
//         utils.formatBytes32String("").slice(0, 42)
//       );
//       expect(token.social).to.equal(utils.formatBytes32String("").slice(0, 42));
//       expect(token.socialBalance).to.equal(0);
//       expect(token.maxSupply).to.equal(0);
//       expect(token.supply._value).to.equal(0);
//       expect(token.uri).to.equal("");
//     } catch (err) {
//       console.error(err);
//     }
//   });;

//   it(" 12 - getToken reverts if tokenId is 0", async () => {
//     try {
//       await expect(inflow.getToken(0)).to.be.reverted;
//     } catch (err) {
//       console.error(err);
//     }
//   });;

//   it(" 13 - calculates mint and burn prices using all curves", async () => {
//     try {
//       const supply = 2;
//       for (let crv = 0; crv < 3; crv++) {
//         const [
//           mintPrice,
//           mintPriceIncSupply,
//           mintPriceDecSupply,
//           burnPrice,
//           burnPriceIncSupply,
//           burnPriceDecSupply,
//         ] = await Promise.all([
//           inflow.getMintPrice(crv, supply),
//           inflow.getMintPrice(crv, supply + 1),
//           inflow.getMintPrice(crv, supply - 1),
//           inflow.getBurnPrice(crv, supply),
//           inflow.getBurnPrice(crv, supply + 1),
//           inflow.getBurnPrice(crv, supply - 1),
//         ]);
//         if (crv === 0) {
//           expect(mintPrice).to.equal(0);
//           expect(mintPriceIncSupply).to.equal(0);
//           expect(mintPriceDecSupply).to.equal(0);
//           expect(burnPrice).to.equal(0);
//           expect(burnPriceIncSupply).to.equal(0);
//           expect(burnPriceDecSupply).to.equal(0);
//         } else {
//           expect(mintPrice).to.below(mintPriceIncSupply);
//           expect(mintPrice).to.above(mintPriceDecSupply);
//           expect(burnPrice).to.below(burnPriceIncSupply);
//           expect(burnPrice).to.above(burnPriceDecSupply);
//         }
//       }
//     } catch (err) {
//       console.error(err);
//     }
//   });;

//   it(" 14 - implements raribleV2 royalties", async () => {
//     try {
//       const royalties = formatCreators(accounts.slice(3));
//       const preRoyalties = await inflow.getRoyalties(_tokenId);
//       preRoyalties.forEach(([account, value], i) => {
//         expect(account).to.equal(royalties[i].account);
//         expect(value).to.equal(royalties[i].value);
//       });
//       await (
//         await inflow
//           .connect(signers[3])
//           .updateRoyaltyAccount(_tokenId, accounts[3], accounts[4])
//       ).wait();
//       const postRoyalties = await inflow.getRoyalties(_tokenId);
//       royalties[0].account = accounts[4];
//       postRoyalties.forEach(([account, value], i) => {
//         expect(account).to.equal(royalties[i].account);
//         expect(value).to.equal(royalties[i].value);
//       });
//     } catch (err) {
//       console.error(err);
//     }
//   });

//   it(" 15 - royalty account must be msg.sender to update royalty account", async () => {
//     try {
//       await expect(
//         inflow.updateRoyaltyAccount(_tokenId, accounts[7], accounts[0])
//       ).to.be.reverted;
//     } catch (err) {
//       console.error(err);
//     }
//   });;

//   it(" 16 - royalties length must be <= 16", async () => {
//     try {
//       await expect((await inflow.create({
//         curve: 1,
//         social: social.address,
//         socialBalance: REQUIRED_SOCIAL_TOKEN_BALANCE,
//         price: 0,
//         maxSupply: 10,
//         uri: "TEST_URI",
//         royalties: formatCreators(accounts.slice(0, 17)),
//       })).wait()  
//       ).to.be.reverted;
//     } catch (err) {
//       console.error(err);
//     }
//   });;

//   it(" 17 - updates base uri", async () => {
//     try {
//       expect(await inflow.baseUri()).to.equal("");
//       await(await inflow.setBaseUri(OLD_BASE_URI)).wait();
//       expect(await inflow.baseUri()).to.equal(OLD_BASE_URI);
//       await(await inflow.setBaseUri(NEW_BASE_URI)).wait();
//       expect(await inflow.baseUri()).to.equal(NEW_BASE_URI);
//     } catch (err) {
//       console.error(err);
//     }
//   });;

//   it(" 18 - setBaseUri tx reverts if called from non-owner account", async () => {
//     try {
//       await expect(inflow.connect(signers[8]).setBaseUri("Updated")).to.be
//         .reverted;
//     } catch (err) {
//       console.error(err);
//     }
//   });;

//   it(" 19 - withdraws funds to owner", async () => {
//     try {
//       const preBalance = await usdc.balanceOf(adminAddress);
//       await(await usdc.mintTo(inflow.address, parseUsdc("100"))).wait();
//       await(await inflow.withdraw()).wait();
//       const postBalance = await usdc.balanceOf(adminAddress);
//       expect(postBalance).to.be.above(preBalance);
//     } catch (err) {
//       console.error(err);
//     }
//   });;

//   it(" 20 - withdraw tx reverts if msg.sender is not owner", async () => {
//     try {
//       await (await usdc.mintTo(social.address, parseUsdc("100"))).wait();
//       await expect((await inflow.connect(signers[2]).withdraw()).wait()).to.be.reverted;
//     } catch (err) {
//       console.error(err);
//     }
//   });;

//   it(" 21 - sets create prices", async () => {
//     try {
//       await(await inflow.setCreatePrice(parseUsdc("100"))).wait();
//       expect(formatUsdc(await inflow.createPrice())).to.equal("100");
//     } catch (err) {
//       console.error(err);
//     }
//   });;

//   it(" 22 - setCreatePrice tx reverts if called from non-owner account", async () => {
//     try {
//       await expect(inflow.connect(signers[8]).setCreatePrice(parseUsdc("100")))
//         .to.be.reverted;
//     } catch (err) {
//       console.error(err);
//     }
//   });;

//   it("23 - enables contract addresses to mint tokens", async () => {
//     try {
//       (await inflow.setContractMintEnabled(true)).wait();
//       const mintNFTPrice = await getNextMintPrice(inflow, _tokenId);
//       (await usdc.mintTo(mockMinter.address, mintNFTPrice)).wait();
//       const requiredBalance = REQUIRED_SOCIAL_TOKEN_BALANCE.add(
//         utils.parseEther("2")
//       );
//       await mintSocial(social, usdc, requiredBalance);
//       await(await social.transfer(mockMinter.address, requiredBalance)).wait();
//       await(await mockMinter.approveCollateral(inflow.address, mintNFTPrice)).wait();
//       await(await mockMinter.mint(_tokenId)).wait();
//       expect(await inflow.balanceOf(mockMinter.address, _tokenId)).to.equal(1);
//     } catch (err) {
//       console.error(err);
//     }
//   });

//   it(" 24 - disables contract addresses from minting tokens", async () => {
//     try {
//       (await inflow.setContractMintEnabled(false)).wait();
//       await expect((await mockMinter.mint(_tokenId)).wait()).to.be.reverted;
//     } catch (err) {
//       console.error(err);
//     }
//   });;

//   it(" 25 - setContractMintEnabled tx reverts if caller is non-owner", async () => {
//     try {
//       await expect((await (inflow.connect(signers[5]).setContractMintEnabled(false))).wait()).to
//         .be.reverted;
//     } catch (err) {
//       console.error(err);
//     }
//   });;

//   it(" 26 - supports interfaces for ERC1155 and ERC165", async () => {
//     try {
//       expect(await inflow.supportsInterface("0xd9b67a26")).to.be.true;
//       expect(await inflow.supportsInterface("0x0e89341c")).to.be.true;
//       expect(await inflow.supportsInterface("0x01ffc9a7")).to.be.true;
//     } catch (err) {
//       console.error(err);
//     }
//   });;

//   it(" 27 - gets token uri", async () => {
//     try {
//       const baseUri = await inflow.baseUri();
//       expect(await inflow.uri(_tokenId)).to.equal(baseUri + "BEFORE_HOOK");
//       const tokenId2 = await create(inflowCreator, usdcCreator, {
//         curve: 1,
//         social: social.address,
//         socialBalance: 10,
//         price: 0,
//         maxSupply: 10,
//         uri: "",
//         royalties: formatCreators(accounts.slice(1, 2)),
//       });
//       expect(await inflow.uri(tokenId2)).to.equal(
//         baseUri + tokenId2.toNumber()
//       );
//      await (await inflow.setBaseUri("")).wait();
//       expect(await inflow.uri(_tokenId)).to.equal("BEFORE_HOOK");
//     } catch (err) {
//       console.error(err);
//     }
//   });

//   it(" 28 - disables whitelist to create with non-whitelisted accounts", async () => {
//     await (await inflow.setWhitelistEnabled(false)).wait();
//     const data = {
//       curve: 1,
//       social: social.address,
//       socialBalance: 10,
//       price: 0,
//       maxSupply: 10,
//       uri: "",
//       royalties: formatCreators(accounts.slice(1, 2)),
//     };
//     const tokenId = await create(
//       inflow.connect(nonWhitelisted),
//       usdc.connect(nonWhitelisted),
//       data
//     );
//     expect(await inflow.balanceOf(nonWhitelistedAddress, tokenId)).to.equal(1);
//   })
// });

// async function mint(
//   inflow: Inflow1155BC,
//   usdc: MockUSDC,
//   tokenId: BigNumberish
// ): Promise<void> {
//   const { price, curve } = await inflow.getToken(tokenId);
//   const mintPrice =
//     curve === 0 ? price : await getNextMintPrice(inflow, tokenId);
//   await sleep(5000)
//   await usdcMintAndApprove(usdc, inflow.address, mintPrice);
//   await sleep(5000)
//   await(await inflow.mint(tokenId)).wait();
// }

// async function getNextMintPrice(
//   inflow: Inflow1155BC,
//   tokenId: BigNumberish
// ): Promise<BigNumber> {
//   const { supply, curve, price } = await inflow.getToken(tokenId);
//   const newSupply = supply._value.add(1);
//   return curve === 0 ? price : await inflow.getMintPrice(curve, newSupply);
// }

// async function mintSocial(
//   social: SocialToken,
//   usdc: MockUSDC,
//   amount: BigNumberish
// ): Promise<BigNumber> {
//   const mintPrice = await social.getMintPrice(amount);
//   await sleep(4000)
//   await usdcMintAndApprove(usdc, social.address, mintPrice);
//   await sleep(4000);
//   await(await social.mint(amount,usdc.address)).wait();
//   return mintPrice;
// }

// async function usdcMintAndApprove(
//   usdc: MockUSDC,
//   spender: string,
//   amount: BigNumberish
// ): Promise<void> {
//   await sleep(10000);
//   await(await usdc.mint(amount)).wait();
//   await sleep(3000);
//   await(await usdc.approve(spender, amount)).wait();
// }

// async function create(
//   inflow: Inflow1155BC,
//   usdc: MockUSDC,
//   data: CreateData
// ): Promise<BigNumber> {
//   const createPrice = await inflow.createPrice();
//   await sleep(10000)
//   await usdcMintAndApprove(usdc, inflow.address, createPrice);
//   await sleep(5000)
//   const tokenId = await getEventData(inflow.create(data), 1,4);
//   return tokenId;
// }

// async function getPrevFeesPaid(
//   inflow: Inflow1155BC,
//   tokenId: BigNumberish
// ): Promise<BigNumber[]> {
//   const { supply, curve, price } = await inflow.getToken(tokenId);
//   const mintPrice =
//     curve === 0 ? price : await inflow.getMintPrice(curve, supply._value);
//   const burnPrice =
//     curve === 0
//       ? price.mul(85).div(100)
//       : await inflow.getBurnPrice(curve, supply._value);
//   const totalFee = mintPrice.sub(burnPrice);
//   const totalCreatorFee = await inflow.getCreatorFee(totalFee);
//   const royalties = await inflow.getRoyalties(tokenId);
//   return royalties.map(({ value }) => totalCreatorFee.mul(value).div(10000));
// }
