// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;
pragma abicoder v2;

import "../libs/LibPart.sol";

interface IRoyaltiesV2 {
    event RoyaltiesSet(uint256 tokenId, LibPart.Part[] royalties);

    function getRoyalties(uint256 tokenId)
        external
        view
        returns (LibPart.Part[] memory);
}
