import { ethers } from "hardhat";

const factoryAddress = "0x22b4708F2081dB7965aaD432bA2A0405be6055e0";
const mintParams = {
    creator: "0x4A83b8CDC54a01A0ceB258B7b7E92b6eDD12Cd70",
    usdcCollateral:"0x63aF7615e795F2cFb8A2f93aFAd7CD1B4d35bA5c",
    usdtCollateral: "0x63aF7615e795F2cFb8A2f93aFAd7CD1B4d35bA5c",
    maxSupply:"100000000000000000000",
    slope:"1000000000000000000000",
    name: "gida3sn2",
    symbol: "GId3N2"
}


async function createSocialToken(): Promise<void>{
    const [owner] = await ethers.getSigners();
    const factory = await ethers.getContractAt(
        //ABI
        "SocialTokenFactory",
        factoryAddress,
        owner
    );
    const socialTokenCreator = factory.connect(owner);
    const create = await socialTokenCreator.create(mintParams);
    console.log("create", create);
}

createSocialToken()
    .then(async() => {
        console.log("Successfully sent the transaction");
    })
    .catch((err) => {
        console.error(err);
        process.exit(1);
});