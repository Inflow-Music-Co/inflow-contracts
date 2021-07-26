// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Holder.sol";
import "../interfaces/IInflow1155BC.sol";
import "../interfaces/ISocialToken.sol";

contract MockMinter is ERC1155Holder {
  using SafeERC20 for IERC20;

  IInflow1155BC public inflow1155BC;
  ISocialToken public socialToken;
  IERC20 public collateral;

  constructor(
    address _inflow1155BC,
    address _socialToken,
    address _collateral
  ) {
    inflow1155BC = IInflow1155BC(_inflow1155BC);
    socialToken = ISocialToken(_socialToken);
    collateral = IERC20(_collateral);
  }

  function mint(uint256 tokenId) external {
    inflow1155BC.mint(tokenId);
  }

  function approveCollateral(address spender, uint256 amount) external {
    collateral.safeApprove(spender, amount);
  }
}
