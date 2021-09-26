// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "../../interfaces/ISocialToken.sol";
import "../../libraries/BondingCurveMath.sol";
import "../../metatx-standard/EIP712MetaTransaction.sol";

contract SocialToken is ISocialToken, Ownable, ERC20, ReentrancyGuard, EIP712MetaTransaction {
  using SafeERC20 for IERC20;

  /////////////////////////
  /// STORAGE VARIABLES ///
  /////////////////////////

  /// @dev Creator's address
  address public creator;
  /// @dev Collateral token
  IERC20 public collateral;
  /// @dev Slope to apply to bonding curve calculations
  uint256 public slope;
  /// @dev Max total supply set by owner
  uint256 public maxSupply;
  /// @dev Funds reserved for burns
  uint256 public reserve;
  // /// @dev CreatorFee balance that is stored in this contract itself
  uint256 public claimAmount;

  constructor(CreateData memory data) ERC20(data.name, data.symbol) EIP712MetaTransaction(data.name, data.version) {
    creator = data.creator;
    collateral = IERC20(data.collateral);
    slope = data.slope;
    maxSupply = data.maxSupply;
  }

  ////////////////////////////////
  /// EXTERNAL TOKEN FUNCTIONS ///
  ////////////////////////////////

  /// @dev Mint tokens
  /// @param amount (uint256): Amount to mint
  function mint(uint256 amount) external override nonReentrant {
    require(amount > 0, "SocialToken: amount is zero");
    uint256 mintPrice = getMintPrice(amount);
    require(mintPrice > 0, "SocialToken: amount too low");
    uint256 supply = totalSupply();
    require(supply + amount <= maxSupply, "SocialToken: amount too large");
    uint256 fee = (mintPrice * 15) / 100;
    uint256 creatorFee = getCreatorFee(fee);
    reserve += mintPrice - fee;
    _mint(msgSender(), amount);
    IERC20 _collateral = collateral;
    _collateral.safeTransferFrom(msgSender(), address(this), mintPrice);
    claimAmount += creatorFee;
    emit Minted(
      msgSender(),
      amount,
      mintPrice,
      supply + amount,
      creatorFee,
      reserve
    );
  }

  /// @dev Burn tokens
  /// @param amount (uint256): Amount to burn
  function burn(uint256 amount) external override nonReentrant {
    uint256 supply = totalSupply();
    require(supply > 0, "SocialToken: supply is zero");
    require(amount <= supply, "SocialToken: amount greater than supply");
    uint256 burnPrice = getBurnPrice(amount);
    reserve -= burnPrice;
    _burn(msgSender(), amount);
    collateral.safeTransfer(msgSender(), burnPrice);
    emit Burned(msgSender(), amount, burnPrice, supply - amount, reserve);
  }

  ////////////////////////////////
  /// EXTERNAL ADMIN FUNCTIONS ///
  ////////////////////////////////

  /// @dev Withdraw earned funds from minting fees
  /// @notice Cannot withdraw the reserve funds
  function withdraw() external override onlyOwner nonReentrant {
    IERC20 _collateral = collateral;
    uint256 withdrawableFunds = _collateral.balanceOf(address(this)) - reserve;
    _collateral.safeTransfer(msgSender(), withdrawableFunds);
  }

  /// @dev Withdraw creator Fee from the contract
  /// @param walletAddress (address): Address of wallet to transfer
  /// @param amount (uint256): Amount to transfer
  function claimCreatorFee(address walletAddress, uint256 amount) external nonReentrant {
    require(msgSender() == creator, "SocialToken: Not owner of social token");
    require(walletAddress != address(0), "SocialToken: invalid wallet address");
    require(amount <= claimAmount, "SocialToken: transfer amount greater than balance");
    IERC20 _collateral = collateral;
    claimAmount -= amount;
    _collateral.safeTransfer(walletAddress, amount);
  }

  //////////////////////////////
  /// PUBLIC PRICE FUNCTIONS ///
  //////////////////////////////

  /// @dev Calculate collateral price to mint
  /// @param amount (uint256): Amount of social tokens to mint
  /// @return (uint256): Collateral required to mint social token amount
  function getMintPrice(uint256 amount) public view override returns (uint256) {
    uint256 supply = totalSupply();
    uint256 newSupply = supply + amount;
    uint256 _reserve = reserve;
    return
      supply == 0
        ? (slope * amount * amount) / 2 / 1e48
        : (((_reserve * newSupply * newSupply) / (supply * supply)) - _reserve);
  }

  /// @dev Calculate collateral received on burn
  /// @param amount (uint256): Amount of social tokens to burn
  /// @return (uint256): Collateral received if input social token amount is burned
  function getBurnPrice(uint256 amount) public view override returns (uint256) {
    uint256 supply = totalSupply();
    require(supply > 0, "SocialToken: supply is zero");
    require(amount <= supply, "SocialToken: amount greater than supply");
    uint256 newSupply = supply - amount;
    uint256 _reserve = reserve;
    return _reserve - ((_reserve * newSupply * newSupply) / (supply * supply));
  }

  /// @dev Calculate creator's fee
  /// @param fee (uint256): Total fee from which to calculate creator's fee
  /// @return (uint256): Creator's fee
  function getCreatorFee(uint256 fee) public pure override returns (uint256) {
    return (fee * 8) / 10;
  }
}
