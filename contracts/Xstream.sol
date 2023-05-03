//This whole contract was written and tested in REMIX IDE

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/Counters.sol";
import "./XstreamNFT.sol";


contract xstream {
    using Counters for Counters.Counter;
    Counters.Counter public streamId;

    using Counters for Counters.Counter;
    Counters.Counter public streamerId;

    XstreamNFT public nftContract;

    struct Streamer {
        uint256 streamerId;
        address payable streamerAdd;
        string name;
        string desp;
        string nftImage;
        uint totalNfts;
        address[] subscribers;
        bool isLive;
    }
    
    struct Stream{
        uint streamId;
        address payable streamer;
        string streamerName;
        string roomId;
        string title;
        string desp;
        string thumbnail;
        bool exclusive;
        bool isLive;
        uint256 totalAmount;
    }

    struct Chat{
        address sender;
        string message;
        uint256 amount;
        bool isSubscriber;
    }

    constructor(address _nftContractAddress){
        nftContract = XstreamNFT(_nftContractAddress);
    }

    mapping(address=>bool) public isStreamer;
    mapping(address=>Streamer) public addToStreamer;
    mapping(uint=>Stream) public idToStream;
    mapping(uint=>Chat[]) public idToChats;
    mapping(address=>uint256) public streamerToBalance;
    Stream[] public liveStreams;
    uint[] public liveStreamIndices;

    event ChatReceived(address sender, string message, uint256 amount, bool isSubscriber);
    event StreamStarted(uint streamId, address streamer);
    event StreamStopped(uint streamId, address streamer);

    function createStreamer (string memory _name, string memory _desp, string memory _metadata, string memory _nftImage, uint _totalNfts) public {
        require(!isStreamer[msg.sender], "You are already streamer");
        Streamer storage currStreamer = addToStreamer[msg.sender];
        address[] memory empty;
        uint256 currStreamerId = streamerId.current();
        currStreamer.streamerId = currStreamerId;
        currStreamer.streamerAdd = payable(msg.sender);
        currStreamer.name = _name;
        currStreamer.desp = _desp;
        currStreamer.nftImage = _nftImage;
        currStreamer.totalNfts = _totalNfts;
        currStreamer.subscribers = empty;
        currStreamer.isLive = false;
        isStreamer[msg.sender] = true;
        addToStreamer[msg.sender] = currStreamer;
        nftContract.addMetadata(_metadata, currStreamerId);
        //  ipfs://baf
        streamerId.increment();
    }

    function startStream (string memory _title, string memory _thumbnail, string memory _desp, string memory _roomId, bool _exclusive) public {
        Streamer storage currStreamer = addToStreamer[msg.sender];
        require(isStreamer[msg.sender], "You are not a streamer");
        require(!currStreamer.isLive, "You are already live streaming");
        uint currStreamId = streamId.current();
        Stream storage currStream = idToStream[currStreamId];
        currStream.streamId = currStreamId;
        currStream.streamer = payable(msg.sender);
        currStream.streamerName = currStreamer.name;
        currStream.roomId = _roomId;
        currStream.title = _title;
        currStream.desp = _desp;
        currStream.thumbnail = _thumbnail;
        currStream.exclusive = _exclusive;
        currStream.isLive = true;
        currStream.totalAmount = 0;
        currStreamer.isLive = true;
        liveStreams.push(currStream);
        liveStreamIndices.push(currStreamId);
        streamId.increment();
        emit StreamStarted(currStreamId, msg.sender);
    }

    function stopStream (uint _streamId) public {
        Stream storage currStream = idToStream[_streamId];
        Streamer storage currStreamer = addToStreamer[msg.sender];
        uint currStreamId = streamId.current();
        require(_streamId < currStreamId, "Stream ID is out of bounds");
        require(currStream.streamer == msg.sender, "You are not the streamer");
        require(currStream.isLive, "Stream is not live");
        currStream.isLive = false;
        currStreamer.isLive = false;
    //      if (_streamId < currStreamId-1) {
    //     liveStreams[_streamId] = liveStreams[currStreamId - 2];
    //     idToStream[liveStreams[_streamId].streamId].streamId = _streamId;
    // }
    // liveStreams.pop();
         // Find the index of the stream in the liveStreams array
    uint index = 0;
    for (uint i = 0; i < liveStreams.length; i++) {
        if (liveStreams[i].streamId == _streamId) {
            index = i;
            break;
        }
    }

    // Remove the stream from the liveStreams array
    if (index < liveStreams.length - 1) {
        liveStreams[index] = liveStreams[liveStreams.length - 1];
    }
    liveStreams.pop();
    for (uint i = 0; i < liveStreamIndices.length; i++) {
        if (liveStreamIndices[i] == _streamId) {
            if (i < liveStreamIndices.length - 1) {
                liveStreamIndices[i] = liveStreamIndices[liveStreamIndices.length - 1];
            }
            liveStreamIndices.pop();
            break;
        }
    }
    emit StreamStopped(_streamId, currStream.streamer);
    }
    
    function getLiveStreams() public view returns (Stream[] memory) {
        return liveStreams;
    }

    function watchStream(uint _streamId) public view {
        Stream storage currStream = idToStream[_streamId];
        require(currStream.isLive, "The stream is not live");
    }

    function chat(uint _streamId, string memory _message, bool _isSubscriber) public payable {
        Stream storage currStream = idToStream[_streamId];
        require(currStream.isLive, "The stream is not live");
        if(msg.value>0){
        currStream.totalAmount+=msg.value;
        streamerToBalance[currStream.streamer]+=msg.value;
        idToChats[_streamId].push(Chat({sender: msg.sender, message: _message, amount: msg.value, isSubscriber: _isSubscriber}));
        emit ChatReceived(msg.sender, _message, msg.value, _isSubscriber);
        }else{
        idToChats[_streamId].push(Chat({sender: msg.sender, message: _message, amount: 0, isSubscriber: _isSubscriber}));
        emit ChatReceived(msg.sender, _message, 0, _isSubscriber);
        }
       
    }

    function mintNft(address _streamer) public {
        require(isStreamer[_streamer], "Address given is not a streamer");
        require(msg.sender!=_streamer, "You cannot mint NFT to yourself");
        Streamer storage currStreamer = addToStreamer[_streamer];
        uint256 balance = nftContract.balanceOf(msg.sender, currStreamer.streamerId);
        require(balance==0, "You already own an NFT");
        nftContract.mint(msg.sender, currStreamer.streamerId, 1, "", currStreamer.totalNfts);
    }

    function extractBalance() public payable {
        require(isStreamer[msg.sender],"You are not a streamer");
        payable(msg.sender).transfer(streamerToBalance[msg.sender]);
        streamerToBalance[msg.sender] = 0;
    }

    function getAllChats(uint256 _streamId) public view returns (Chat[] memory) {
        return idToChats[_streamId];
    }
}