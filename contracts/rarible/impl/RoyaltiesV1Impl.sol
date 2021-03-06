// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;
import "./AbstractRoyalties.sol";
import "../interfaces/IRoyaltiesV1.sol";

contract RoyaltiesV1Impl is AbstractRoyalties, IRoyaltiesV1 {
    function getFeeRecipients(uint256 tokenId)
        public
        view
        override
        returns (address payable[] memory)
    {
        LibPart.Part[] memory _royalties = royalties[tokenId];
        address payable[] memory result = new address payable[](
            _royalties.length
        );
        for (uint256 i = 0; i < _royalties.length; i++) {
            result[i] = _royalties[i].account;
        }
        return result;
    }

    function getFeeBps(uint256 tokenId)
        public
        view
        override
        returns (uint256[] memory)
    {
        LibPart.Part[] memory _royalties = royalties[tokenId];
        uint256[] memory result = new uint256[](_royalties.length);
        for (uint256 i = 0; i < _royalties.length; i++) {
            result[i] = _royalties[i].value;
        }
        return result;
    }

    function _onRoyaltiesSet(uint256 tokenId, LibPart.Part[] memory _royalties)
        internal
        override
    {
        address[] memory recipients = new address[](_royalties.length);
        uint256[] memory bps = new uint256[](_royalties.length);
        for (uint256 i = 0; i < _royalties.length; i++) {
            recipients[i] = _royalties[i].account;
            bps[i] = _royalties[i].value;
        }
        emit SecondarySaleFees(tokenId, recipients, bps);
    }
}
