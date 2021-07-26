// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;
// pragma abicoder v2;

import "./Splitter.sol";

contract SplitterFactory {
  //////////////
  /// EVENTS ///
  //////////////

  event SplitterCreated(address indexed splitter, address indexed creator);

  //////////////////////////
  /// EXTERNAL FUNCTIONS ///
  //////////////////////////

  /// @dev Create a splitter contract
  /// @param accounts (address[] memory): Accounts receiving shares of PaymentSplitter
  /// @param shares (uint256[] memory): Shares to assign to accounts
  function create(
    address collateral,
    address[] memory accounts,
    uint256[] memory shares
  ) external {
    Splitter splitter = new Splitter(collateral, accounts, shares);
    splitter.transferOwnership(msg.sender);
    emit SplitterCreated(address(splitter), msg.sender);
  }
}
