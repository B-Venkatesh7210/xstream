//This whole contract was written and tested in REMIX IDE

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";


contract XstreamNFT is ERC1155 {

    string public name;
    string public symbol;

    constructor() ERC1155("XStreamNFT") {
        name="Xstream";
        symbol="XST";
    }

    mapping(uint256=>uint) public streamerIdToNftSupply;
    mapping(uint256=>bool) public nftSold;
    mapping(uint256=>string) public idToMetadata;

    function mint(address account, uint256 id, uint256 amount, bytes memory data, uint totalNftSupply)
        public 
    {
        require(streamerIdToNftSupply[id]<totalNftSupply, "All NFTs have been minted");
        require(!nftSold[id], "All Nfts have been sold");
        _mint(account, id, amount, data);
        if(streamerIdToNftSupply[id]==totalNftSupply-1){
            nftSold[id]=true;
            streamerIdToNftSupply[id]+=1;
        }
        else{
        nftSold[id]=false;
        streamerIdToNftSupply[id]+=1;
        }
        
    }

    function addMetadata(string memory _metadata, uint256 id) public {
        idToMetadata[id] = _metadata;
    }

    function uri(uint256 id) public
        view
        virtual
        override
        returns (string memory) {
            return idToMetadata[id];
    }

    // function uri(uint256 id) public
    //     view
    //     virtual
    //     override
    //     returns (string memory) {
    //         return string(
    //                     abi.encodePacked(
    //                         "ipfs://",
    //                         "hgyjgjy/",id,".png"
    //                     )
    //                 );
    // }

    // function setURI(string memory newuri) public {
    //     _setURI(newuri);
    // }

}