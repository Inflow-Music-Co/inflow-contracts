// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface ISocialToken is IERC20 {
    struct CreateData {
        address creator;
        address usdcCollateral;
        address usdtCollateral;
        uint256 maxSupply;
        uint256 slope; 
        string name;
        string symbol;
    }

    event Minted(
        address indexed minter,
        address indexed tokenAddress,
        uint256 indexed mintPrice,
        uint256 amount,
        uint256 tokenSupply,
        uint256 royaltyPaid,
        uint256 reserve
    );
    event Burned(
        address indexed burner,
        address indexed tokenAddress,
        uint256 indexed burnPrice,
        uint256 amount,
        uint256 tokenSupply,
        uint256 reserve
    );

    function mint(uint256, address) external;

    function burn(uint256) external;

    function withdraw() external;

    function updateCreator(address) external;

    function getMintPrice(uint256) external view returns (uint256);

    function getBurnPrice(uint256) external view returns (uint256);

    function getCreatorFee(uint256) external pure returns (uint256);
}
