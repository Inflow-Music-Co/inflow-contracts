import { ethers } from "hardhat";

// fill addresses
const factoryAddress = "0x41C659319885598d77CF5bd8E792A5162bC72A04";
const whiteAddress = "0x2E8992A98d58C3CA3b54e8042fF14be36Cc98dB1";

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
