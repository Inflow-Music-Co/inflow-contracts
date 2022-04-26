import { ethers } from "hardhat";

import { abi as SocialTokenFactory }  from "../artifacts/contracts/token/social/SocialTokenFactory.sol/SocialTokenFactory.json";
import { abi as SocialToken }  from "../artifacts/contracts/token/social/SocialToken.sol/SocialToken.json";

describe("Social Token", function () {
  it("Should return social token address", async function () {
    const [owner] = await ethers.getSigners();
    const socialTokenFactory = await ethers.getContractAt(
      SocialTokenFactory,
      "0x696b7880Cd45765013C34CD8F98E31528c44FcB1",
      owner
    );
    const socialToken = await ethers.getContractAt(
      SocialToken,
      "0xCbaE7200bEA1245DC9d46d90c5e7742AEf3559dC",
      owner
    );
    const socialTokenContract = socialTokenFactory.connect(owner);
    const token = await socialTokenContract.getToken(
      "0xd553b4E3FD4618f33c36d58F540257F911268c04"
    );
    console.info("token", token);
  });
});
