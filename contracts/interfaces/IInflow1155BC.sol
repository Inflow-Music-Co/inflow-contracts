// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "./ISocialToken.sol";
import "../rarible/libs/LibPart.sol";

interface IInflow1155BC is IERC1155 {
    enum Curve {
        Const,
        Lin,
        Exp
    }

    struct Token {
        Curve curve;
        address creator;
        ISocialToken social;
        uint256 price;
        uint256 socialBalance;
        uint256 maxSupply;
        Counters.Counter supply;
        string uri;
    }

    struct CreateData {
        Curve curve;
        address social;
        uint256 price;
        uint256 socialBalance;
        uint256 maxSupply;
        string uri;
        LibPart.Part[] royalties;
    }

    event Created(
        address indexed creator,
        uint256 indexed tokenId,
        Curve curve,
        address social,
        uint256 price,
        uint256 socialBalance,
        uint256 maxSupply,
        string uri
    );
    event Minted(
        address indexed minter,
        uint256 indexed tokenId,
        uint256 pricePaid,
        uint256 nextMintPrice,
        uint256 nextBurnPrice,
        uint256 tokenSupply,
        uint256 royaltyPaid,
        uint256 reserve,
        address indexed royaltyRecipient
    );
    event Burned(
        address indexed burner,
        uint256 indexed tokenId,
        uint256 priceReceived,
        uint256 nextMintPrice,
        uint256 nextBurnPrice,
        uint256 tokenSupply,
        uint256 reserve
    );

    function create(CreateData calldata) external returns (uint256);

    function mint(uint256) external;

    function burn(uint256, uint256) external;

    function updateRoyaltyAccount(
        uint256,
        address,
        address
    ) external;

    function setBaseUri(string memory _baseUri) external;

    function withdraw() external;

    function setCreatePrice(uint256 _createPrice) external;

    function setContractMintEnabled(bool enabled) external;

    function getToken(uint256) external view returns (Token memory);

    function getMintPrice(Curve, uint256) external pure returns (uint256);

    function getBurnPrice(Curve, uint256) external pure returns (uint256);

    function getCreatorFee(uint256) external pure returns (uint256);
}
