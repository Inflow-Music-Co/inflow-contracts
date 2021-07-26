// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import "../interfaces/IInflow1155BC.sol";

contract Splitter is Ownable {
  using SafeERC20 for IERC20;
  using EnumerableSet for EnumerableSet.AddressSet;

  event PayeeAdded(address account, uint256 shares_);
  event PaymentReleased(address to, uint256 amount);
  event PaymentReceived(address from, uint256 amount);

  IERC20 private _collateral;
  uint256 private _totalShares;
  uint256 private _totalReleased;
  mapping(address => uint256) private _shares;
  mapping(address => uint256) private _released;
  EnumerableSet.AddressSet private _payees;

  constructor(
    address collateral,
    address[] memory payees,
    uint256[] memory shares_
  ) {
    require(
      payees.length == shares_.length,
      "Splitter: payees and shares length mismatch"
    );
    require(payees.length > 0, "Splitter: no payees");
    _collateral = IERC20(collateral);
    for (uint256 i = 0; i < payees.length; i++) {
      _addPayee(payees[i], shares_[i]);
    }
  }

  receive() external payable {}

  ////////////////////////
  /// PUBLIC FUNCTIONS ///
  ////////////////////////

  /// @dev Triggers a transfer to `account` of the amount of token they are owed, according to their percentage of the total shares and their previous withdrawals.
  /// @param account (address): Payee's address
  function release(address account) public {
    require(_shares[account] > 0, "Splitter: account has no shares");
    IERC20 collateral = _collateral;
    uint256 totalReceived = collateral.balanceOf(address(this)) +
      _totalReleased;
    uint256 payment = (totalReceived * _shares[account]) /
      _totalShares -
      _released[account];
    require(payment != 0, "Splitter: account is not due payment");
    _released[account] += payment;
    _totalReleased += payment;
    collateral.safeTransfer(account, payment);
    emit PaymentReleased(account, payment);
  }

  /// @dev Batch triggers transfers to `payees` of the amount of token they are owed, according to their percentage of the total shares and their previous withdrawals.
  /// @notice All payees must have shares or transaction will revert
  /// @param payees (address[] memory): Payees' addresses
  function batchRelease(address[] memory payees) public {
    for (uint256 i = 0; i < payees.length; i++) {
      release(payees[i]);
    }
  }

  /// @dev Update royalty account for Inflow1155BC contract, which implements raribleV2 royalties
  /// @param inflow1155BC (address): Inflow1155BC contract address
  /// @param tokenId (uint256): Numeric identifier of token
  /// @param account (address): New royalty account's address
  function updateRoyaltyAccount(
    address inflow1155BC,
    uint256 tokenId,
    address account
  ) public onlyOwner {
    IInflow1155BC(inflow1155BC).updateRoyaltyAccount(
      tokenId,
      address(this),
      account
    );
  }

  ///////////////////////////////
  /// PUBLIC GETTER FUNCTIONS ///
  ///////////////////////////////

  /// @dev Getter for the total shares held by payees
  function totalShares() public view returns (uint256) {
    return _totalShares;
  }

  /// @dev Getter for the total amount of Ether already released
  function totalReleased() public view returns (uint256) {
    return _totalReleased;
  }

  /// @dev Getter for the amount of shares held by an account
  function shares(address account) public view returns (uint256) {
    return _shares[account];
  }

  /// @dev Getter for the amount of Ether already released to a account
  function released(address account) public view returns (uint256) {
    return _released[account];
  }

  /// @dev Getter for the address of the payee number `idx`
  function payee(uint256 idx) public view returns (address) {
    return _payees.at(idx);
  }

  //////////////////////////
  /// INTERNAL FUNCTIONS ///
  //////////////////////////

  /// @dev Add a new payee to the contract.
  /// @param account The address of the payee to add.
  /// @param shares_ The number of shares owned by the account
  function _addPayee(address account, uint256 shares_) private {
    require(account != address(0), "Splitter: account is the zero address");
    require(shares_ > 0, "Splitter: shares are 0");
    require(_shares[account] == 0, "Splitter: account already has shares");
    _payees.add(account);
    _shares[account] = shares_;
    _totalShares += shares_;
    emit PayeeAdded(account, shares_);
  }
}
