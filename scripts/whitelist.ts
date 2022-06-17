import { ethers } from "hardhat";

// fill addresses
const factoryAddress = "0x0075c7aaa1D50857Dd5d293590d105f378A6f5Ff";
const whiteAddress = "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266";

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
