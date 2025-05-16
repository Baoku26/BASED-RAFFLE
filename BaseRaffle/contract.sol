// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract RaffleContract {
    struct Raffle {
        address creator;
        uint256 prizePool;
        uint256 joinFee;
        uint256 numWinners;
        uint256 endTime;
        string image;
        address[] participants;
        bool isFinalized;
        address[] winners;
        string name;
    }

    mapping(uint256 => Raffle) public raffles;
    uint256 public raffleCount = 0;
    address public owner;
    uint256 public platformFees;

    constructor() {
        owner = msg.sender;
    }

    event RaffleCreated(uint256 indexed raffleId, address indexed creator, uint256 prizePool);
    event RaffleEntered(uint256 indexed raffleId, address indexed participant);
    event RaffleFinalized(uint256 indexed raffleId, address[] winners);
    event PlatformFeeWithdrawn(address owner, uint256 amount);

    function createRaffle(
        uint256 _joinFee,
        uint8 _numWinners,
        uint256 _endTime,
        string memory _image,
        string memory _name
    ) public payable {
        require(msg.value > 0, "Prize must be greater than 0");
        require(_numWinners > 0, "Must have at least one winner");

        address[] memory emptyArray;

        raffles[raffleCount] = Raffle({
            creator: msg.sender,
            prizePool: msg.value,
            joinFee: _joinFee,
            numWinners: _numWinners,
            endTime: block.timestamp + _endTime,
            image: _image,
            name: _name,
            participants: emptyArray,
            isFinalized: false,
            winners: emptyArray
        });

        emit RaffleCreated(raffleCount, msg.sender, msg.value);
        raffleCount++;
    }

    function enterRaffle(uint256 _raffleId) public payable {
        Raffle storage raffle = raffles[_raffleId];
        require(block.timestamp < raffle.endTime, "Raffle has ended");
        require(msg.value == raffle.joinFee, "Incorrect join fee amount");

        raffle.participants.push(msg.sender);
        emit RaffleEntered(_raffleId, msg.sender);
    }

    function getRaffleById(uint256 _raffleId) public view returns (Raffle memory) {
        require(_raffleId < raffleCount, "Raffle does not exist");
        return raffles[_raffleId];
    }


    function finalizeRaffle(uint256 _raffleId) external {
        Raffle storage raffle = raffles[_raffleId];
        require(block.timestamp >= raffle.endTime, "Raffle not ended yet");
        require(!raffle.isFinalized, "Already finalized");
        require(raffle.participants.length >= raffle.numWinners, "Not enough participants");

        raffle.isFinalized = true;

        address[] memory winners = new address[](raffle.numWinners);
        uint256 seed = uint256(keccak256(abi.encodePacked(block.timestamp, msg.sender)));

        for (uint256 i = 0; i < raffle.numWinners; i++) {
            uint256 index = seed % raffle.participants.length;
            winners[i] = raffle.participants[index];
            seed = uint256(keccak256(abi.encodePacked(seed, i))); 
        }

        raffle.winners = winners;
        uint256 share = raffle.prizePool / raffle.numWinners;

        for (uint256 i = 0; i < winners.length; i++) {
            payable(winners[i]).transfer(share);
        }

        emit RaffleFinalized(_raffleId, winners);
    }

    function withdrawFees() external {
        require(msg.sender == owner, "Only owner can withdraw fees");
        require(platformFees > 0, "No fees to withdraw");

        uint256 amount = platformFees;
        platformFees = 0;
        payable(owner).transfer(amount);

        emit PlatformFeeWithdrawn(owner, amount);
    }
}