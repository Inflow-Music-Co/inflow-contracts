import { ethers } from "hardhat";

const factoryAddress = "0x0075c7aaa1D50857Dd5d293590d105f378A6f5Ff";
const mintParams = {
    creator: "0xf591cA90dA60B9532631A612b1951c9C9a506565",
    usdcCollateral: "0x63aF7615e795F2cFb8A2f93aFAd7CD1B4d35bA5c",
    usdtCollateral: "0xb34Ca2cDE88dE520E4Be8b1ccEc374D3052ae021",
    slope: ethers.utils.parseEther("0.005").toString(),
    maxSupply: ethers.utils.parseEther("10000000").toString(),
    name: "Kitty",
    symbol: "KITTY",
  };


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