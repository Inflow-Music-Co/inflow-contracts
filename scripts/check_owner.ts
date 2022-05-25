import { ethers } from "hardhat";

const tokenAddress = "0x2FFc139D8Dc7e8228d904c04cbFaDe6923eaef7b";

async function checkAddress() {
    const [owner] = await ethers.getSigners();
    const socialToken = await ethers.getContractAt(
            //ABI
    "SocialToken",
    tokenAddress,
    owner
  );
   const socialTokenOwner = socialToken.owner();
   console.log({owner})
}

checkAddress();