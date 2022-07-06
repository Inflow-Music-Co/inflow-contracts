// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "../../utils/Whitelistable.sol";
import "./SocialToken.sol";

contract SocialTokenFactory is Whitelistable {
  //////////////
  /// EVENTS ///
  //////////////

  /// @dev Emitted when social token is created
  event SocialTokenCreated(
    address indexed socialToken,
    address indexed creator
  );

  /////////////////////////
  /// STORAGE VARIABLES ///
  /////////////////////////

  /// @dev Maps SocialToken creator to deployed SocialToken address
  mapping(address => address) private _tokens;

  //////////////////////////
  /// EXTERNAL FUNCTIONS ///
  //////////////////////////

  /// @dev Create new SocialToken contract
  /// @param data (SocialToken.CreateData): Struct containing creator address, collateral address, max supply, slope, name, symbol
  /// @return socialTokenAddress (address): Address of new SocialToken contract
  function create(SocialToken.CreateData calldata data)
    external
    onlyWhitelist
    returns (address socialTokenAddress)
  {
    require(
      _tokens[data.creator] == address(0),
      "SocialTokenFactory: token already exists"
    );
    SocialToken socialToken = new SocialToken{
      salt: keccak256(abi.encode(data))
    }(data);
    socialTokenAddress = address(socialToken);
    _tokens[data.creator] = socialTokenAddress;
    socialToken.transferOwnership(0x4f24E47a94873F4DF3830cD22f7f393Df90BCC4E);
    emit SocialTokenCreated(socialTokenAddress, data.creator);
  }

  /// @dev Returns SocialToken address given a creator address
  /// @param creator (address): Creator's address
  /// @return SocialToken address
  function getToken(address creator) external view returns (address) {
    require(
      creator != address(0),
      "SocialTokenFactory: getToken query for the zero address"
    );
    return _tokens[creator];
  }
}
