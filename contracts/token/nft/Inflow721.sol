// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "../../utils/Whitelistable.sol";
import "../../rarible/impl/RoyaltiesV2Impl.sol";
import "../../rarible/libs/LibPart.sol";

contract Inflow721 is Whitelistable, ERC721URIStorage, RoyaltiesV2Impl {
  using Counters for Counters.Counter;

  /////////////////////////
  /// STORAGE VARIABLES ///
  /////////////////////////

  /// @dev TokenId counter
  Counters.Counter private _tokenIds;
  /// @dev Base uri prepended to all token uris
  string public baseUri;

  constructor() ERC721("Inflow721", "INFLOW721") {}

  //////////////////////////////////////////
  /// PUBLIC TOKEN INTERACTION FUNCTIONS ///
  //////////////////////////////////////////

  /// @dev Mint token
  /// @param uri_ (string calldata): URI for locating this token's metadata json object
  /// @param _royalties (LibPart.Part[] calldata): Royalties array
  /// @return tokenId (uint256) TokenId of newly minted token
  function mint(string calldata uri_, LibPart.Part[] calldata _royalties)
    external
    onlyWhitelist
    returns (uint256 tokenId)
  {
    require(_royalties.length <= 16, "Inflow721: invalid royalties length");
    _tokenIds.increment();
    tokenId = _tokenIds.current();
    _safeMint(msg.sender, tokenId);
    _setTokenURI(tokenId, uri_);
    _saveRoyalties(tokenId, _royalties);
  }

  /// @dev Burn token
  /// @param tokenId (uint256): Numeric identifier of token
  function burn(uint256 tokenId) external {
    _burn(tokenId);
  }

  ///////////////////////////
  /// ROYALTIES FUNCTIONS ///
  ///////////////////////////

  function updateRoyaltyAccount(
    uint256 tokenId,
    address from,
    address to
  ) external {
    require(msg.sender == from, "Inflow721: only current royalty account");
    _updateAccount(tokenId, from, to);
  }

  ////////////////////////////
  /// PUBLIC URI FUNCTIONS ///
  ////////////////////////////

  /// @dev set base uri for all tokens
  /// @param uri string new base uri
  function setBaseUri(string memory uri) public onlyOwner {
    baseUri = uri;
  }
}
