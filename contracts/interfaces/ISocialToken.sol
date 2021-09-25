// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface ISocialToken is IERC20 {
    struct CreateData {
        address creator;
        address collateral;
        uint256 maxSupply;
        uint256 slope;
        string name;
        string symbol;
        string version;
    }

    event Minted(
        address indexed minter,
        uint256 indexed amount,
        uint256 indexed mintPrice,
        uint256 tokenSupply,
        uint256 royaltyPaid,
        uint256 reserve
    );
    event Burned(
        address indexed burner,
        uint256 indexed amount,
        uint256 indexed burnPrice,
        uint256 tokenSupply,
        uint256 reserve
    );

    function mint(uint256) external;

    function burn(uint256) external;

    function withdraw() external;

    function getMintPrice(uint256) external view returns (uint256);

    function getBurnPrice(uint256) external view returns (uint256);

    function getCreatorFee(uint256) external pure returns (uint256);
}
