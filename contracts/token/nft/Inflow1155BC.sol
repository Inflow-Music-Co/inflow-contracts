// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "../../utils/Whitelistable.sol";
import "../../rarible/impl/RoyaltiesV2Impl.sol";
import "../../interfaces/IInflow1155BC.sol";
import "../../interfaces/ISocialToken.sol";
import "../../libraries/BondingCurveMath.sol";
import "../../libraries/FeeLib.sol";

contract Inflow1155BC is
  IInflow1155BC,
  ERC1155,
  ReentrancyGuard,
  Whitelistable,
  RoyaltiesV2Impl
{
  using SafeERC20 for IERC20;
  using Counters for Counters.Counter;
  using FeeLib for uint256;

  /////////////////////////
  /// STORAGE VARIABLES ///
  /////////////////////////

  /// @dev Lock for contract accounts minting tokens
  bool private _contractMintEnabled;
  /// @dev Collateral token contract
  IERC20 public collateral;
  /// @dev Price to create an original token
  uint256 public createPrice = 50e6;
  /// @dev Funds reserved for burns
  uint256 public reserve;
  /// @dev TokenId counter
  Counters.Counter private _tokenIds;
  /// @dev Maps tokenId to Token struct
  mapping(uint256 => Token) private _tokens;
  /// @dev Base uri prepended to all token uris
  string public baseUri;

  constructor(address _collateral) ERC1155("") {
    collateral = IERC20(_collateral);
  }

  ////////////////////////////////
  /// EXTERNAL TOKEN FUNCTIONS ///
  ////////////////////////////////

  /// @dev Create an original token
  /// @param data (CreateData calldata): Struct containing data for minting origintal token
  /// @return tokenId (uint256): TokenId of minted token
  function create(CreateData calldata data)
    external
    override
    nonReentrant
    onlyWhitelist
    returns (uint256 tokenId)
  {
    data.curve == Curve.Const
      ? require(data.price > 0, "Inflow1155BC: needs non-zero price")
      : require(data.price == 0, "Inflow1155BC: needs zero price");
    require(data.maxSupply > 0, "Inflow1155BC: invalid max supply");
    require(
      data.royalties.length <= 16,
      "Inflow1155BC: invalid royalties length"
    );
    _tokenIds.increment();
    tokenId = _tokenIds.current();
    Token storage token = _tokens[tokenId];
    token.curve = data.curve;
    token.creator = msg.sender;
    token.social = ISocialToken(data.social);
    token.price = data.price;
    token.socialBalance = data.socialBalance;
    token.maxSupply = data.maxSupply;
    token.supply.increment();
    token.uri = data.uri;
    _saveRoyalties(tokenId, data.royalties);
    _mint(msg.sender, tokenId, 1, "");
    reserve += (createPrice * 85) / 100;
    collateral.safeTransferFrom(msg.sender, address(this), createPrice);
    emit Created(
      msg.sender,
      tokenId,
      data.curve,
      data.social,
      data.price,
      data.socialBalance,
      data.maxSupply,
      data.uri
    );
  }

  /// @dev Mint a token
  /// @notice Contracts can bypass check if mint is called from a constructor
  /// @param tokenId (uint256): Numeric identifier of token
  function mint(uint256 tokenId) external override nonReentrant {
    if (Address.isContract(msg.sender)) {
      require(
        _contractMintEnabled,
        "Inflow1155BC: minting from contracts disabled"
      );
    }
    Token storage token = _tokens[tokenId];
    require(
      token.social.balanceOf(msg.sender) >= token.socialBalance,
      "Inflow1155BC: insufficient social token balance"
    );
    token.supply.increment();
    uint256 newSupply = token.supply.current();
    uint256 mintPrice = token.curve == Curve.Const
      ? token.price
      : getMintPrice(token.curve, newSupply);
    uint256 burnPrice = token.curve == Curve.Const
      ? (mintPrice * 85) / 100
      : getBurnPrice(token.curve, newSupply);
    reserve += burnPrice;
    uint256 creatorFee = getCreatorFee(mintPrice - burnPrice);
    _mint(msg.sender, tokenId, 1, "");
    IERC20 _collateral = collateral;
    _collateral.safeTransferFrom(msg.sender, address(this), mintPrice);
    _transferCreatorFee(tokenId, creatorFee);
    emit Minted(
      msg.sender,
      tokenId,
      mintPrice,
      token.curve == Curve.Const
        ? token.price
        : getMintPrice(token.curve, newSupply + 1),
      burnPrice,
      newSupply,
      creatorFee,
      reserve,
      token.creator
    );
  }

  /// @dev Burn a token
  /// @param tokenId (uint256): Numeric identifier of token
  /// @param minimumSupply (uint256): The minimum token supply for burn to succeed, this is a way to set slippage. Set minimumSupply to 1 to allow burn to go through no matter the mint price
  function burn(uint256 tokenId, uint256 minimumSupply)
    external
    override
    nonReentrant
  {
    Token storage token = _tokens[tokenId];
    require(token.creator != address(0), "Inflow1155BC: token does not exist");
    uint256 supply = token.supply.current();
    require(supply >= minimumSupply, "Inflow1155BC: invalid minimum supply");
    uint256 burnPrice = token.curve == Curve.Const
      ? (token.price * 85) / 100
      : getBurnPrice(token.curve, supply);
    token.supply.decrement();
    uint256 newSupply = token.supply.current();
    reserve -= burnPrice;
    if (newSupply == 0) delete _tokens[tokenId];
    _burn(msg.sender, tokenId, 1);
    collateral.safeTransfer(msg.sender, burnPrice);
    emit Burned(
      msg.sender,
      tokenId,
      burnPrice,
      token.curve == Curve.Const
        ? token.price
        : getMintPrice(token.curve, supply),
      token.curve == Curve.Const
        ? (token.price * 85) / 100
        : getBurnPrice(token.curve, newSupply),
      newSupply,
      reserve
    );
  }

  ////////////////////////////////////
  /// EXTERNAL ROYALTIES FUNCTIONS ///
  ////////////////////////////////////

  /// @dev Update address of a royalty account
  /// @notice Sender must be current royalty account
  /// @param tokenId (uint256): Numeric identifier of token
  /// @param from (address): Old royalty account's address
  /// @param to (address): New royalty account's address
  function updateRoyaltyAccount(
    uint256 tokenId,
    address from,
    address to
  ) external override {
    require(msg.sender == from, "Inflow1155BC: only current royalty account");
    _updateAccount(tokenId, from, to);
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
    require(tokenId > 0, "Inflow1155BC: getToken query for tokenId zero");
    return _tokens[tokenId];
  }

  ////////////////////////////////
  /// EXTERNAL ADMIN FUNCTIONS ///
  ////////////////////////////////

  /// @dev Withdraw earned funds from create and mint fees
  /// @notice Cannot withdraw the reserve funds
  function withdraw() external override onlyOwner nonReentrant {
    IERC20 _collateral = collateral;
    uint256 withdrawableFunds = _collateral.balanceOf(address(this)) - reserve;
    _collateral.safeTransfer(msg.sender, withdrawableFunds);
  }

  /// @dev Set the price for minting an original token
  /// @param price (uint256): New price to mint an original token
  function setCreatePrice(uint256 price) external override onlyOwner {
    createPrice = price;
  }

  /// @dev Enable/disable mint from a contract
  /// @param enabled (bool): Flag to turn mint from a contract on or off
  function setContractMintEnabled(bool enabled) external override onlyOwner {
    _contractMintEnabled = enabled;
  }

  /// @dev Set the base uri for all tokens
  /// @param _baseUri (string calldata): New base uri string
  /// Prepended to result of {uri} or to the tokenId if {_tokens[tokenId].uri} is empty
  function setBaseUri(string calldata _baseUri) external override onlyOwner {
    baseUri = _baseUri;
  }

  //////////////////////////////
  /// PUBLIC PRICE FUNCTIONS ///
  //////////////////////////////

  /// @dev Calculate price of next minted token
  /// @param curve (Curve): Bonding curve id
  /// @param supply (uint256): The token supply after then next minting Ex. if there are 2 existing images, and you want to get the next image price, then this should be 3 as you are getting the price to mint the 3rd image
  /// @return price (uint256): Calculated price for given curve and supply
  function getMintPrice(Curve curve, uint256 supply)
    public
    pure
    override
    returns (uint256 price)
  {
    if (curve == Curve.Lin) price = BondingCurveMath.lin(supply);
    else if (curve == Curve.Exp) price = BondingCurveMath.exp(supply);
    price *= 1e6;
  }

  /// @dev Calculate funds received on burn
  /// @param curve (Curve): Bonding curve id
  /// @param supply (uint256): The supply of images before burning. Ex. if there are 2 existing images, to get the funds receive on burn the supply should be 2
  /// @return uint256
  function getBurnPrice(Curve curve, uint256 supply)
    public
    pure
    override
    returns (uint256)
  {
    uint256 mintPrice = getMintPrice(curve, supply);
    return (mintPrice * 85) / 100;
  }

  /// @dev Calculate creator's royalty
  /// @param fee (uint256): Total fee frm which to calculate creator's royalty fee
  /// @return (uint256): Creator's royalty
  function getCreatorFee(uint256 fee) public pure override returns (uint256) {
    return (fee * 8) / 10;
  }

  ////////////////////////////
  /// PUBLIC URI FUNCTIONS ///
  ////////////////////////////

  /// @dev Returns token's uri
  /// @param tokenId (uint256): Numeric identifier of token
  /// @return _uri (string memory)
  function uri(uint256 tokenId)
    public
    view
    virtual
    override
    returns (string memory _uri)
  {
    Token memory token = _tokens[tokenId];
    require(token.creator != address(0), "Inflow1155BC: token does not exist");
    string memory base = baseUri;
    if (bytes(base).length == 0) {
      _uri = token.uri;
    } else if (bytes(token.uri).length > 0) {
      _uri = string(abi.encodePacked(base, token.uri));
    } else {
      _uri = string(abi.encodePacked(base, Strings.toString(tokenId)));
    }
  }

  //////////////////////////////////////
  /// PUBLIC INTROSPECTION FUNCTIONS ///
  //////////////////////////////////////

  /// @dev Checks if contract supports interface
  /// @param interfaceId (bytes4): Interface selector
  /// @return bool
  function supportsInterface(bytes4 interfaceId)
    public
    view
    virtual
    override(ERC1155, IERC165)
    returns (bool)
  {
    return ERC1155.supportsInterface(interfaceId);
  }

  //////////////////////////
  /// INTERNAL FUNCTIONS ///
  //////////////////////////

  /// @dev Transfer creator fees
  /// @param tokenId (uint256): Numeric identifier of token
  /// @param creatorFee (uint256): Total fee owed to creator(s)
  function _transferCreatorFee(uint256 tokenId, uint256 creatorFee) internal {
    LibPart.Part[] memory fees = royalties[tokenId];
    uint256 owed = creatorFee;
    IERC20 _collateral = collateral;
    for (uint256 i = 0; i < fees.length; i++) {
      (uint256 remaining, uint256 fee) = owed.subFeeInBp(
        creatorFee,
        fees[i].value
      );
      owed = remaining;
      if (fee > 0) _collateral.safeTransfer(fees[i].account, fee);
    }
  }
}
