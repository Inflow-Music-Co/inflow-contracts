import { ethers } from "hardhat";

const socialTokenAddress = "0x0075c7aaa1D50857Dd5d293590d105f378A6f5Ff";

async function executeWithdraw(): Promise<void> {
  const [owner] = await ethers.getSigners();
  const socialToken = await ethers.getContractAt(
    //ABI
    "SocialToken",
    socialTokenAddress,
    owner,
  );
  const socialTokenInstance = socialToken.connect(owner);
  const withdraw = await socialTokenInstance.withdraw();
  console.log({ withdraw });
}

executeWithdraw(
  )
  .then(async () => {
    console.log("Successfully withdrew funds");
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);    
  });
