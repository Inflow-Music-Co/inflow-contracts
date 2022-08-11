import { task } from "hardhat/config";

import { SLOPE, USDC_ADDRESS, USDT_ADDRESS } from "../constants";

let token = "";
let ethers: any;
let factoryAddress = "";

async function createSocialToken(mintParams: any) {
  const whiteAddress = mintParams.creator; // this is wrong the admin should be whitlisted not creator(artist)

  const [owner] = await ethers.getSigners();
  const factory = await ethers.getContractAt(
    "SocialTokenFactory",
    factoryAddress,
    owner
  );
  const SocialTokenFactory = factory.connect(owner);
  await (await SocialTokenFactory.whitelist(whiteAddress)).wait();

  console.log("whitelist done");

  const socialTokenCreator = factory.connect(owner);
  const create = await (await socialTokenCreator.create(mintParams)).wait();
  console.log("create", create);

  const socialTokenContract = factory.connect(owner);
  token = await socialTokenContract.getToken(whiteAddress);
  console.info(`Social token address is ${token}`);
  return token;
}

task("social", "Create social token")
  .addParam("factoryAddress", "Factory Address")
  .addParam("creator", "Token creator")
  .addParam("tokenName", "Token Name")
  .addParam("tokenSymbol", "Token Symbol")
  .setAction(async (data, hre) => {
    console.info('running task "social"');
    ethers = hre.ethers;

    const mintParams = {
      creator: data.creator,
      usdcCollateral: USDC_ADDRESS,
      usdtCollateral: USDT_ADDRESS,
      slope: ethers.utils.parseEther(SLOPE).toString(),
      maxSupply: ethers.utils.parseEther("10000000").toString(),
      name: data.tokenName,
      symbol: data.tokenSymbol,
    };
    factoryAddress = data.factoryAddress;
    await createSocialToken(mintParams);
    console.info('finished task "social"');
    console.info('Next task is "mint"');
  });

/**
 * Command to run task:
 * npx hardhat social --factory-address <factory> --creator <creator> --token-name <name> --token-symbol <symbol> --network <network>
 * Example:
 * npx hardhat social --factory-address 0xb2ab9754BADf43A46A0E2e13Ee370886eCCC3ABE --creator 0x16808B32761e4C3FC68D2Ceae2f9B54bf59326cC --token-name testArtist --token-symbol TNT --network rinkeby
 */
