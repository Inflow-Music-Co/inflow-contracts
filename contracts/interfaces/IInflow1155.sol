// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "../rarible/libs/LibPart.sol";

interface IInflow1155 is IERC1155 {
    struct Token {
        address creator;
        uint256 supply;
        uint256 maxSupply;
        string uri;
    }

    struct CreateData {
        uint256 supply;
        uint256 maxSupply;
        string uri;
        LibPart.Part[] royalties;
    }

    event Created(
        address indexed creator,
        uint256 indexed tokenId,
        uint256 indexed supply,
        uint256 maxSupply,
        string uri
    );
    event MintedSingle(
        address indexed minter,
        uint256 indexed tokenId,
        uint256 indexed amount
    );
    event MintedBatch(
        address indexed minter,
        uint256[] indexed ids,
        uint256[] indexed values
    );
    event Burned(
        address indexed burner,
        uint256 indexed tokenId,
        uint256 indexed amount
    );

    function create(CreateData memory data) external returns (uint256);

    function mint(uint256, uint256) external;

    function mintBatch(uint256[] memory ids, uint256[] memory amounts) external;

    function burn(uint256, uint256) external;

    function updateRoyaltyAccount(
        uint256,
        address,
        address
    ) external;

    function getToken(uint256) external view returns (Token memory);

    function setBaseUri(string memory _baseUri) external;
}
