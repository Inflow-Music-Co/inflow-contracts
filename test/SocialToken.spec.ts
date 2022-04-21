// import { ethers } from "hardhat";
// import { utils, Contract, Signer, BigNumber, BigNumberish } from "ethers";
// import { expect } from "chai";
// import { formatUsdc, parseUsdc, getTxEventData } from "./utils";
// import { abi as SOCIALTOKEN_ABI } from "../artifacts/contracts/token/social/SocialToken.sol/SocialToken.json";
// import {
//   SocialToken,
//   MockUSDC,
//   MockUSDT,
//   MockUSDT__factory,
//   MockUSDC__factory,
// } from "../typechain";
// import { parseEther } from "ethers/lib/utils";

// describe("SocialToken Tests", async function () {
//     this.timeout(300000)
//   let signers: Signer[],
//     accounts: string[],
//     admin: Signer,
//     minter: Signer,
//     adminAddress: string,
//     minterAddress: string,
//     creatorAddress:string,
//     social: SocialToken,
//     socialMinter: SocialToken,
//     usdcFactory: MockUSDC__factory,
//     usdtFactory:MockUSDT__factory,
//     usdc: MockUSDC,
//     usdt:MockUSDT,
//     usdcMinter: MockUSDC,
//     usdtMinter : MockUSDT;

//   const AMOUNT = utils.parseEther("100");

//   before(async () => {
//     try {
//       signers = await ethers.getSigners();
//       [admin, minter] = signers.slice(0, 3);
//       accounts = await Promise.all(
//         signers.map((signer) => signer.getAddress())
//       );
//       [adminAddress, minterAddress,creatorAddress] = accounts;
//       [usdcFactory, usdtFactory] = await Promise.all([
//         ethers.getContractFactory(
//           "MockUSDC",
//           admin
//         ) as Promise<MockUSDC__factory>,
//         ethers.getContractFactory(
//             "MockUSDT",
//             admin
//           ) as Promise<MockUSDT__factory>,
//       ]);
//       const _socialToken = ethers.getContractFactory("SocialToken");

//       [usdc,usdt] = await Promise.all([
//        await usdcFactory.deploy(),
//        await usdtFactory.deploy()   
//       ]);

//       social =  await (await _socialToken).deploy({
//         creator: adminAddress,
//         usdcCollateral: usdc.address,
//         usdtCollateral: usdt.address,
//         maxSupply: utils.parseEther("1000000000000000").toString(),
//         slope: utils.parseEther("1").toString(),
//         name: "test",
//         symbol: "TEST"}
//         ),

//       usdcMinter = usdc.connect(minter);
//       usdtMinter = usdt.connect(minter);


//       social = new Contract(
//         social.address,
//         SOCIALTOKEN_ABI,
//         admin
//       ) as SocialToken;

//       socialMinter = social.connect(minter);
//       expect(await social.owner()).to.equal(adminAddress);
//     } catch (err) {
//       console.error(err);
//     }
//   });

//   it(" 1 - mints tokens using USDC ", async () => {
//     try {
//       await mint(socialMinter, usdcMinter, AMOUNT);
//       expect(await social.balanceOf(minterAddress)).to.equal(AMOUNT);
//       expect(await usdc.balanceOf(minterAddress)).to.equal(0);
//       expect(await usdt.balanceOf(minterAddress)).to.equal(0);
//     } catch (err) {
//       console.error(err);
//     }
//   });
 
//   it(" 2 - mint tx reverts if amount is 0", async () => {
//     try {
//       await expect(socialMinter.mint(0,usdc.address)).to.be.reverted;
//     } catch (err) {
//       console.error(err);
//     }
//   });

//   it(" 3 - mint tx reverts if amount resolves negative or 0 mint price", async () => {
//     try {
//       const mintPrice = await social.getMintPrice(1);
//       expect(mintPrice).to.equal(0);
//       await expect(socialMinter.mint(1,usdc.address)).to.be.reverted;
//     } catch (err) {
//       console.error(err);
//     }
//   });

//   it(" 4 - mint tx reverts if current supply + mint amount is greater than max supply", async () => {
//     try {
//       const supply = await social.totalSupply();
//       const maxSupply = await social.maxSupply();
//       const diff = maxSupply.sub(supply);
//       await expect(socialMinter.mint(diff.add(10),usdc.address)).to.be.reverted;
//     } catch (err) {
//       console.error(err);
//     }
//   });

//   it(" 5 - burns tokens", async () => {
//     try {
//       const burnPrice = await burn(socialMinter, AMOUNT);
//       expect(await social.balanceOf(minterAddress)).to.equal(0);
//       expect(await usdc.balanceOf(minterAddress)).to.equal(burnPrice);
//     } catch (err) {
//       console.error(err);
//     }
//   });

//   it(" 6 - burn tx reverts if amount is 0", async () => {
//     try {
//       await expect(socialMinter.burn(0)).to.be.reverted;
//       const supply = await social.totalSupply();
//       await expect(socialMinter.burn(supply.add(1))).to.be.reverted;
//     } catch (err) {
//       console.error(err);
//     }
//   });

//   it(" 7 - burn tx reverts if amount is greater than outstanding supply", async () => {
//     try {
//       const supply = await social.totalSupply();
//       await expect(socialMinter.burn(supply.add(1))).to.be.reverted;
//     } catch (err) {
//       console.error(err);
//     }
//   });

//   it(" 8 - getBurnPrice function reverts if amount is 0", async () => {
//     try {
//       await expect(socialMinter.getBurnPrice(0)).to.be.reverted;
//     } catch (err) {
//       console.error(err);
//     }
//   });

//   it(" 9 - getBurnPrice function reverts if amount is greater than outstanding supply", async () => {
//     try {
//       const supply = await social.totalSupply();
//       await expect(socialMinter.getBurnPrice(supply.add(1))).to.be.reverted;
//     } catch (err) {
//       console.error(err);
//     }
//   });

//   it(" 10 - withdraws funds to owner", async () => {
//     try {
//       await (await usdc.mintTo(social.address, parseUsdc("100"))).wait();
//       const preBalance = await usdc.balanceOf(adminAddress);
//       await (await social.withdraw()).wait();
//       const postBalance = await usdc.balanceOf(adminAddress);
//       expect(postBalance).to.be.above(preBalance);
//     } catch (err) {
//       console.error(err);
//     }
//   });

//   it(" 11 - withdraw tx reverts if msg.sender is not owner", async () => {
//     try {
//       await (await usdc.mintTo(social.address, parseUsdc("100"))).wait();
//       await expect(social.connect(signers[2]).withdraw()).to.be.reverted;
//     } catch (err) {
//       console.error(err);
//     }
//   });

//   it(" 12 - getMintPrice uses simple integral calculation if supply is 0", async () => {
//     try {
//       const supply = await social.totalSupply();
//       expect(supply).to.equal(0);
//       const slope = await social.slope();
//       const price = await social.getMintPrice(AMOUNT);
//       expect(price).to.equal(
//         slope
//           .mul(supply.add(AMOUNT).pow(2))
//           .div(2)
//           .div(BigNumber.from(1).mul(BigNumber.from(10).pow(48)))
//       );
//     } catch (err) {
//       console.error(err);
//     }
//   });

//   it(" 13 - getMintPrice uses implicit reserve integral calculation if supply is greater than 0", async () => {
//     try {
//       await mint(socialMinter, usdcMinter, AMOUNT);
//       const supply = await social.totalSupply();
//       const price = await social.getMintPrice(AMOUNT);
//       const reserve = await social.reserve();
//       expect(price).to.equal(
//         reserve.mul(supply.add(AMOUNT).pow(2)).div(supply.pow(2)).sub(reserve)
//       );
//     } catch (err) {
//       console.error(err);
//     }
//   });

//     it(" 14 - mints tokens using USDT ", async () => {
//     try {
//       await mint(socialMinter, usdtMinter, AMOUNT);
//       expect(await social.balanceOf(minterAddress)).to.equal(AMOUNT.add(AMOUNT));
//       expect(await usdt.balanceOf(minterAddress)).to.equal(0);
//     } catch (err) {
//       console.error(err);
//     }
//   });
//   it(" 15 - if burn price is greater then USDC-Colleteral balance then send remaing burnPrice in USDT ", async () => {
//     try {
//       const _usdc_bal = await usdc.balanceOf(social.address);
//       const _minter_bal = await usdc.balanceOf(minterAddress);
//       const _getburnPrice = await social.getBurnPrice(AMOUNT);
//       const burnPrice = await burn(socialMinter, AMOUNT);
//       expect(await social.balanceOf(minterAddress)).to.equal(AMOUNT);
//       expect(await usdc.balanceOf(minterAddress)).to.equal(_minter_bal.add(_usdc_bal));
//       expect(await usdt.balanceOf(minterAddress)).to.equal(_getburnPrice.sub(_usdc_bal))
//     } catch (err) {
//       console.error(err);
//     }
//   });

//   it(" 16 - Update the Creator address ", async () => {
//     try {
//        const updateCreator = await social.updateCreator(creatorAddress);
//        expect(await social.creator()).to.equal(creatorAddress);
//     } catch (err) {
//       console.error(err);
//     }
//   });

//   it("Should emit MintedData",async () => { 
//     try{ 
//         expect(mint(socialMinter, usdcMinter, AMOUNT)).to.emit(social,"Minted").withArgs(AMOUNT,usdc.address); 
//     }catch(err){ 
//         console.error(err); 
//     } 
//   }) 


// });



// async function mint(
//     social: SocialToken,
//     _coletrel: MockUSDC |MockUSDT,
//     amount: BigNumberish
//   ): Promise<BigNumber> {
//     const mintPrice = await social.getMintPrice(amount);
//     await (await _coletrel.mint(mintPrice) ).wait();
//     await (await _coletrel.approve(social.address, mintPrice)).wait();
//     await (await social.mint(amount,_coletrel.address)).wait();
//     return mintPrice;
//   }

// async function burn(
//   social: SocialToken,
//   amount: BigNumberish
// ): Promise<BigNumber> {
//   const burnPrice = await social.getBurnPrice(amount);
//   await (await social.burn(amount)).wait();
//   return burnPrice;
// }
