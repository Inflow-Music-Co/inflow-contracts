import { ethers } from "hardhat";

// fill addresses
const factoryAddress = "0x0075c7aaa1D50857Dd5d293590d105f378A6f5Ff";
const whiteAddress = "0x16808B32761e4C3FC68D2Ceae2f9B54bf59326cC";

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
  .then(async () => {
    console.log("Successfully sent the transaction");
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
