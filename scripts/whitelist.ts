import { ethers } from "hardhat";

// fill addresses
const factoryAddress="";
const whiteAddress = "";

async function whitelist(whiteAddress: string): Promise<void> {
    const [owner] = await ethers.getSigners();
    const factory = await ethers.getContractAt(
        "SocialTokenFactory",
        factoryAddress,
        owner
    );
    const SocialTokenFactory = factory.connect(owner);
    const whitelist = await SocialTokenFactory.whitelist(whiteAddress);
    console.log("whitelist", whitelist);
}

whitelist(whiteAddress)    
    .then(async() => {
        console.log("Successfully sent the transaction");
    }).catch((err) => {
        console.error(err);
        process.exit(1);
});;