// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "../../utils/Whitelistable.sol";
import "../../interfaces/IInflow1155.sol";
import "../../rarible/impl/RoyaltiesV2Impl.sol";
import "../../rarible/libs/LibPart.sol";

contract Inflow1155 is
  IInflow1155,
  Whitelistable,
  ERC1155(""),
  RoyaltiesV2Impl
{
  using Counters for Counters.Counter;

  /////////////////////////
  /// STORAGE VARIABLES ///
  /////////////////////////

  /// @dev TokenId counter
  Counters.Counter private _tokenIds;
  /// @dev Maps tokenId to Token struct
  mapping(uint256 => Token) private _tokens;
  /// @dev Base uri prepended to all token uris
  string public baseUri;

  ////////////////////////////////
  /// EXTERNAL TOKEN FUNCTIONS ///
  ////////////////////////////////

  /// @dev Create an original token
  /// @param data (CreateData memory): mint data
  /// @return tokenId (uint256): TokenId of minted token
  function create(CreateData memory data)
    external
    override
    onlyWhitelist
    returns (uint256 tokenId)
  {
    require(data.maxSupply > 0, "Inflow1155: invalid max supply");
    require(
      data.royalties.length <= 16,
      "Inflow1155: invalid royalties length"
    );
    _tokenIds.increment();
    tokenId = _tokenIds.current();
    _tokens[tokenId] = Token({
      creator: msg.sender,
      supply: data.supply,
      maxSupply: data.maxSupply,
      uri: data.uri
    });
    _saveRoyalties(tokenId, data.royalties);
    _mint(msg.sender, tokenId, data.supply, "");
    emit Created(msg.sender, tokenId, data.supply, data.maxSupply, data.uri);
  }

  /// @dev Mint tokens for existing tokenId
  /// @param tokenId (uint256): Numeric identifier of token
  /// @param amount (uint256): Amount of tokens to mint
  function mint(uint256 tokenId, uint256 amount) external override {
    Token storage token = _tokens[tokenId];
    require(token.creator == msg.sender, "Inflow1155: only creator");
    require(
      token.supply + amount <= token.maxSupply,
      "Inflow1155: invalid amount"
    );
    token.supply += amount;
    _mint(msg.sender, tokenId, amount, "");
    emit MintedSingle(msg.sender, tokenId, amount);
  }

  /// @dev Batch mint tokens for existing tokenIds
  /// @param tokenIds (uint256[]): Numeric identifiers of tokens
  /// @param amounts (uint256[]): Amounts of tokens to mint
  function mintBatch(uint256[] memory tokenIds, uint256[] memory amounts)
    external
    override
  {
    require(
      tokenIds.length == amounts.length,
      "Inflow1155: invalid array lengths"
    );
    Token storage token;
    for (uint256 i = 0; i < tokenIds.length; i++) {
      token = _tokens[tokenIds[i]];
      require(token.creator == msg.sender, "Inflow1155: only creator");
      require(
        token.supply + amounts[i] <= token.maxSupply,
        "Inflow1155: invalid amount"
      );
      token.supply += amounts[i];
    }
    _mintBatch(msg.sender, tokenIds, amounts, "");
    emit MintedBatch(msg.sender, tokenIds, amounts);
  }

  /// @dev Burn tokens
  /// @param tokenId (uint256): Numeric identifier of token
  /// @param amount (uint256): The amount of tokens to burn
  function burn(uint256 tokenId, uint256 amount) external override {
    Token storage token = _tokens[tokenId];
    require(token.creator != address(0), "Inflow1155: token does not exist");
    token.supply -= amount;
    if (token.supply == 0) delete _tokens[tokenId];
    _burn(msg.sender, tokenId, amount);
    emit Burned(msg.sender, tokenId, amount);
  }

  ////////////////////////////////////
  /// EXTERNAL ROYALTIES FUNCTIONS ///
  ////////////////////////////////////

  function updateRoyaltyAccount(
    uint256 tokenId,
    address from,
    address to
  ) external override {
    require(msg.sender == from, "Inflow1155: only current royalty account");
    _updateAccount(tokenId, from, to);
  }

  ////////////////////////////////
  /// EXTERNAL ADMIN FUNCTIONS ///
  ////////////////////////////////

  /// @dev Set the base URI for all tokenIds
  /// @param _baseUri (string memory): New base uri string
  /// Prepended to result of {uri} or to the tokenId if {_tokens[tokenId].uri} is empty.
  function setBaseUri(string memory _baseUri) external override onlyOwner {
    baseUri = _baseUri;
  }

  /////////////////////////////////
  /// EXTERNAL GETTER FUNCTIONS ///
  /////////////////////////////////

  /// @dev Returns Token struct at tokenId
  /// @param tokenId (uint256): Numeric identifier of token
  /// @return (Token memory): Token struct at tokenId
  function getToken(uint256 tokenId)
    external
    view
    override
    returns (Token memory)
  {
    require(tokenId > 0, "Inflow1155: getToken query for tokenId zero");
    return _tokens[tokenId];
  }

  ////////////////////////////
  /// PUBLIC URI FUNCTIONS ///
  ////////////////////////////

  /// @dev Returns token's uri
  /// @param tokenId (uint256): Numeric identifier of new token
  /// @return uri_ (string memory)
  function uri(uint256 tokenId)
    public
    view
    virtual
    override
    returns (string memory uri_)
  {
    Token storage token = _tokens[tokenId];
    require(token.creator != address(0), "Inflow1155: token does not exist");
    string memory base = baseUri;
    if (bytes(base).length == 0) {
      uri_ = token.uri;
    } else if (bytes(token.uri).length > 0) {
      uri_ = string(abi.encodePacked(base, token.uri));
    } else {
      uri_ = string(abi.encodePacked(base, Strings.toString(tokenId)));
    }
  }
}
