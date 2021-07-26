// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;
pragma abicoder v2;

import "./AbstractRoyalties.sol";
import "../interfaces/IRoyaltiesV2.sol";

contract RoyaltiesV2Impl is AbstractRoyalties, IRoyaltiesV2 {
    function getRoyalties(uint256 tokenId)
        external
        view
        override
        returns (LibPart.Part[] memory)
    {
        return royalties[tokenId];
    }

    function _onRoyaltiesSet(uint256 tokenId, LibPart.Part[] memory _royalties)
        internal
        override
    {
        emit RoyaltiesSet(tokenId, _royalties);
    }
}
