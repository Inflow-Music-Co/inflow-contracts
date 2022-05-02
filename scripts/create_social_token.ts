import { ethers } from "hardhat";

const factoryAddress = "0x5c1e4da1d1DC1123b6E6331259dBb41c7cb69F47";
const mintParams = {
    creator: "0x2E8992A98d58C3CA3b54e8042fF14be36Cc98dB1",
    usdcCollateral:"0x63aF7615e795F2cFb8A2f93aFAd7CD1B4d35bA5c",
    usdtCollateral: "0x63aF7615e795F2cFb8A2f93aFAd7CD1B4d35bA5c",
    maxSupply:"10000000000000000000000000",
    slope:"500000000000000000",
    name: "luke",
    symbol: "LUKE"
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