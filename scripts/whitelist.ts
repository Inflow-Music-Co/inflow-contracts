import { ethers } from "hardhat";

// fill addresses
const factoryAddress = "0xBA7cE2ECB379695fC221F14893ff9274F77651aD";
const whiteAddress = "0x4f24E47a94873F4DF3830cD22f7f393Df90BCC4E";

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
