import { task } from "hardhat/config";

/**
   * 1.Deploy Factory
   * 2.Create Social
   * 3.Whitelist admin
   * 4.1.Approve USDC collateral
   * 4.2.Mint Social
   * 5.Burning Token
 */

/**
 * Handle Error
 * Show appropriate message to user
 * Show next steps with script name to user
 */

task("socialTokenDetails", "Get Social Token Details")
  .addParam("tokenAddress", "Token Address")
  .addParam("usdcAddress", "USDC Address")
  .addParam("amount", "Amount")
  .setAction(async (data, hre) => {
    console.info(data);

  });

/**
 * Command to run task:
 * npx hardhat socialTokenDetails --token-address <tokenAddress>
 */
