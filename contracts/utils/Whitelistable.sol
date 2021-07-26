// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";

contract Whitelistable is Ownable {
  using EnumerableSet for EnumerableSet.AddressSet;

  //////////////
  /// EVENTS ///
  //////////////

  event Whitelisted(address indexed account);
  event Unwhitelisted(address indexed account);

  /////////////////////////
  /// STORAGE VARIABLES ///
  /////////////////////////

  /// @dev Lock for enforcing whitelist
  bool private _whitelistEnabled = true;
  /// @dev Set holding whitelisted addresses for creating original tokens
  EnumerableSet.AddressSet private _whitelist;

  /////////////////
  /// MODIFIERS ///
  /////////////////

  modifier onlyWhitelist() {
    if (_whitelistEnabled) {
      require(
        _whitelist.contains(msg.sender),
        "Whitelistable: whitelisted only"
      );
    }
    _;
  }

  /////////////////////////////////////
  /// PUBLIC ADMIN SETTER FUNCTIONS ///
  /////////////////////////////////////

  /// @dev Enable/disable whitelist
  /// @param enabled (bool): Flag to turn whitelist on or off
  function setWhitelistEnabled(bool enabled) public onlyOwner {
    _whitelistEnabled = enabled;
  }

  /// @dev Whitelist an account
  /// @param account (address): Account to add to whitelist
  /// @return success (bool): Returns true if add is successful, else false
  /// @notice success == false means account was already present in whitelist
  function whitelist(address account) public onlyOwner returns (bool success) {
    success = _whitelist.add(account);
    if (success) emit Whitelisted(account);
  }

  /// @dev Unwhitelist an account
  /// @param account (address): Account to remove from whitelist
  /// @return success (bool): Returns true if remove is successful, else false
  /// @notice success == false means account was not present in whitelist
  function unwhitelist(address account)
    public
    onlyOwner
    returns (bool success)
  {
    success = _whitelist.remove(account);
    if (success) emit Unwhitelisted(account);
  }

  ///////////////////////////////
  /// PUBLIC GETTER FUNCTIONS ///
  ///////////////////////////////

  /// @dev Returns bool if account is whitelisted
  /// @param account (address): Check if this account is whitelisted
  /// @return (bool)
  function isWhitelisted(address account) public view returns (bool) {
    return _whitelist.contains(account);
  }
}
