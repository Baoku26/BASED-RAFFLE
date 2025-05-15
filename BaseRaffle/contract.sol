// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract RafflePlatform {
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

    event RaffleCreated(uint256 indexed raffleId, address indexed creator, uint256 prizePool);
    event RaffleEntered(uint256 indexed raffleId, address indexed participant);
    event RaffleFinalized(uint256 indexed raffleId, address[] winners);
    event PlatformFeeWithdrawn(address owner, uint256 amount);

    constructor() {
        owner = msg.sender;
    }

    /**
     * @notice Creates a new raffle with a pre-funded prize pool.
     * @param _joinFee The fee (in wei) that each participant will pay to join.
     * @param _numWinners The number of winners that will be drawn.
     * @param _endTime The UNIX timestamp when the raffle expires (must be in the future).
     * @param _image The image URL for the raffle.
     */
    function createRaffle(
        uint256 _joinFee,
        uint256 _numWinners,
        uint256 _endTime,
        string memory _image,
        string memory _name,
    ) external payable {
        require(msg.value > 0, "Prize pool must be non-zero");
        require(_endTime > block.timestamp, "End time must be in the future");
        require(_numWinners > 0, "At least one winner is required");

        uint256 creatorFee = (msg.value * 2) / 100;
        uint256 netPrize = msg.value - creatorFee;
        platformFees += creatorFee;

        Raffle storage raffle = raffles[raffleCount];
        raffle.creator = msg.sender;
        raffle.prizePool = netPrize;
        raffle.joinFee = _joinFee;
        raffle.numWinners = _numWinners;
        raffle.endTime = _endTime;
        raffle.isFinalized = false;
        raffle.image = _image;
        raffle.name = _name

        emit RaffleCreated(raffleCount, msg.sender, netPrize);
        raffleCount++;
    }

    /**
     * @notice Allows a user to join an active raffle.
     * @param _raffleId The identifier of the raffle to join.
     */
    function joinRaffle(uint256 _raffleId) external payable {
        require(_raffleId < raffleCount, "Invalid raffle ID");
        Raffle storage raffle = raffles[_raffleId];
        require(block.timestamp < raffle.endTime, "Raffle has ended");
        require(!raffle.isFinalized, "Raffle already finalized");
        require(msg.value == raffle.joinFee, "Incorrect join fee sent");

        platformFees += msg.value;
        raffle.participants.push(msg.sender);

        emit RaffleEntered(_raffleId, msg.sender);
    }

    /**
     * @notice Finalizes a raffle manually after its end time using block randomness.
     * @param _raffleId The identifier of the raffle to finalize.
     */
    function finalizeRaffle(uint256 _raffleId) external {
        Raffle storage raffle = raffles[_raffleId];
        require(block.timestamp >= raffle.endTime, "Raffle not ended yet");
        require(!raffle.isFinalized, "Already finalized");
        require(raffle.participants.length >= raffle.numWinners, "Not enough participants");

        raffle.isFinalized = true;

        address[] memory winners = new address[](raffle.numWinners);
        uint256 seed = uint256(block.prevrandao) + block.timestamp;
        uint256 participantsLength = raffle.participants.length;

        for (uint256 i = 0; i < raffle.numWinners; i++) {
            uint256 index = uint256(keccak256(abi.encode(seed, i))) % participantsLength;
            winners[i] = raffle.participants[index];
        }

        raffle.winners = winners;

        uint256 share = raffle.prizePool / raffle.numWinners;
        for (uint256 i = 0; i < winners.length; i++) {
            payable(winners[i]).transfer(share);
        }

        emit RaffleFinalized(_raffleId, winners);
    }

    /**
     * @notice Withdraw platform fees manually (only owner).
     */
    function withdrawFees() external {
        require(msg.sender == owner, "Only owner can withdraw fees");
        require(platformFees > 0, "No fees to withdraw");

        uint256 amount = platformFees;
        platformFees = 0;
        payable(owner).transfer(amount);

        emit PlatformFeeWithdrawn(owner, amount);
    }

    receive() external payable {}
}
