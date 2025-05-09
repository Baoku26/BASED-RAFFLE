// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import '../lib/openzeppelin-contracts/contracts/token/ERC721/IERC721.sol';
import "../lib/openzeppelin-contracts/contracts/token/ERC20/IERC20.sol";
import "../lib/openzeppelin-contracts/contracts/utils/ReentrancyGuard.sol";
import "../lib/openzeppelin-contracts/contracts/access/Ownable.sol";
import "../lib/chainlink/contracts/src/v0.8/vrf/VRFConsumerBaseV2.sol";
import "../lib/chainlink/contracts/src/v0.8/vrf/interfaces/VRFCoordinatorV2Interface.sol";
import "../lib/chainlink/contracts/src/v0.8/automation/AutomationCompatible.sol";


/**
 * @title RaffleSystem
 * @dev A decentralized raffle system for NFTs and ERC20 tokens with Chainlink VRF for randomness
 * and Chainlink Keepers for automatic raffle completion.
 */
contract RaffleSystem is Ownable, VRFConsumerBaseV2, AutomationCompatibleInterface, ReentrancyGuard{
    // ============= Enums =============
    enum RaffleStatus {
        OPEN,
        PENDING_DRAWING,
        COMPLETED,
        CANCELLED
    }

    enum PrizeType {
        ERC721,
        ERC20
    }

    // ============= Structs =============
    struct Raffle {
        address creator;
        address prizeToken;
        uint256 prizeTokenId;    // Used for NFTs, ignored for ERC20
        uint256 prizeAmount;     // Used for ERC20, ignored for NFTs
        PrizeType prizeType;
        uint256 entryFee;
        uint256 maxParticipants;
        uint256 deadline;
        address[] participants;
        address winner;
        RaffleStatus status;
        uint256 requestId;       // For Chainlink VRF
    }

    // ============= State Variables =============
    uint256 private _raffleCounter;
    mapping(uint256 => Raffle) public raffles;
    mapping(uint256 => mapping(address => uint256)) public entryCounts;
    mapping(uint256 => uint256) public raffleToRandomNumber;
    
    // Chainlink VRF variables
    VRFCoordinatorV2Interface private immutable i_vrfCoordinator;
    bytes32 private immutable i_keyHash;
    uint64 private immutable i_subscriptionId;
    uint16 private constant REQUEST_CONFIRMATIONS = 3;
    uint32 private constant NUM_WORDS = 1;
    uint32 private immutable i_callbackGasLimit;
    
    // Fee settings
    uint256 public platformFeePercentage = 2; // 2% fee
    
    // Chainlink Keeper variables
    uint256 public immutable checkInterval;
    uint256 public lastTimeStamp;

    // ============= Events =============
    event RaffleCreated(
        uint256 indexed raffleId,
        address indexed creator,
        address prizeToken,
        uint256 prizeTokenId,
        uint256 prizeAmount,
        PrizeType prizeType,
        uint256 entryFee,
        uint256 maxParticipants,
        uint256 deadline
    );
    
    event RaffleEntered(
        uint256 indexed raffleId,
        address indexed participant,
        uint256 entriesCount
    );
    
    event RaffleStatusChanged(
        uint256 indexed raffleId,
        RaffleStatus status
    );
    
    event RaffleWinnerSelected(
        uint256 indexed raffleId,
        address indexed winner
    );
    
    event PrizeClaimed(
        uint256 indexed raffleId,
        address indexed winner,
        PrizeType prizeType,
        address prizeToken,
        uint256 prizeTokenId,
        uint256 prizeAmount
    );
    
    event RaffleCancelled(
        uint256 indexed raffleId
    );
    
    event RefundIssued(
        uint256 indexed raffleId,
        address indexed participant,
        uint256 amount
    );

    // ============= Constructor =============
    constructor(
        address vrfCoordinatorAddress,
        bytes32 keyHash,
        uint64 subscriptionId,
        uint32 callbackGasLimit,
        uint256 interval
    ) VRFConsumerBaseV2(vrfCoordinatorAddress) Ownable(msg.sender) {
        i_vrfCoordinator = VRFCoordinatorV2Interface(vrfCoordinatorAddress);
        i_keyHash = keyHash;
        i_subscriptionId = subscriptionId;
        i_callbackGasLimit = callbackGasLimit;
        checkInterval = interval;
        lastTimeStamp = block.timestamp;
    }

    // ============= External Functions =============
    
    /**
     * @dev Create a new raffle with an NFT prize
     * @param prizeNFT Address of the NFT contract
     * @param prizeTokenId ID of the NFT to raffle
     * @param entryFee Cost to enter the raffle
     * @param maxParticipants Maximum number of participants (0 for unlimited)
     * @param durationInSeconds Duration of the raffle in seconds (0 for no time limit)
     */
    function createNFTRaffle(
        address prizeNFT,
        uint256 prizeTokenId,
        uint256 entryFee,
        uint256 maxParticipants,
        uint256 durationInSeconds
    ) external {
        require(prizeNFT != address(0), "Invalid NFT address");
        
        // Transfer NFT from creator to contract (escrow)
        IERC721(prizeNFT).transferFrom(msg.sender, address(this), prizeTokenId);
        
        uint256 deadline = durationInSeconds > 0 ? block.timestamp + durationInSeconds : 0;
        
        _raffleCounter++;
        Raffle storage newRaffle = raffles[_raffleCounter];
        newRaffle.creator = msg.sender;
        newRaffle.prizeToken = prizeNFT;
        newRaffle.prizeTokenId = prizeTokenId;
        newRaffle.prizeType = PrizeType.ERC721;
        newRaffle.entryFee = entryFee;
        newRaffle.maxParticipants = maxParticipants;
        newRaffle.deadline = deadline;
        newRaffle.status = RaffleStatus.OPEN;
        
        emit RaffleCreated(
            _raffleCounter,
            msg.sender,
            prizeNFT,
            prizeTokenId,
            0,
            PrizeType.ERC721,
            entryFee,
            maxParticipants,
            deadline
        );
    }
    
    /**
     * @dev Create a new raffle with an ERC20 token prize
     * @param prizeToken Address of the ERC20 token contract
     * @param prizeAmount Amount of tokens to raffle
     * @param entryFee Cost to enter the raffle
     * @param maxParticipants Maximum number of participants (0 for unlimited)
     * @param durationInSeconds Duration of the raffle in seconds (0 for no time limit)
     */
    function createTokenRaffle(
        address prizeToken,
        uint256 prizeAmount,
        uint256 entryFee,
        uint256 maxParticipants,
        uint256 durationInSeconds
    ) external {
        require(prizeToken != address(0), "Invalid token address");
        require(prizeAmount > 0, "Prize amount must be greater than 0");
        
        // Transfer tokens from creator to contract (escrow)
        IERC20(prizeToken).transferFrom(msg.sender, address(this), prizeAmount);
        
        uint256 deadline = durationInSeconds > 0 ? block.timestamp + durationInSeconds : 0;
        
        _raffleCounter++;
        Raffle storage newRaffle = raffles[_raffleCounter];
        newRaffle.creator = msg.sender;
        newRaffle.prizeToken = prizeToken;
        newRaffle.prizeAmount = prizeAmount;
        newRaffle.prizeType = PrizeType.ERC20;
        newRaffle.entryFee = entryFee;
        newRaffle.maxParticipants = maxParticipants;
        newRaffle.deadline = deadline;
        newRaffle.status = RaffleStatus.OPEN;
        
        emit RaffleCreated(
            _raffleCounter,
            msg.sender,
            prizeToken,
            0,
            prizeAmount,
            PrizeType.ERC20,
            entryFee,
            maxParticipants,
            deadline
        );
    }
    
    /**
     * @dev Enter a raffle by paying the entry fee
     * @param raffleId ID of the raffle to enter
     * @param numberOfEntries Number of entries to purchase
     */
    function enterRaffle(uint256 raffleId, uint256 numberOfEntries) external payable nonReentrant {
        require(numberOfEntries > 0, "Must enter at least once");
        Raffle storage raffle = raffles[raffleId];
        
        require(raffle.creator != address(0), "Raffle does not exist");
        require(raffle.status == RaffleStatus.OPEN, "Raffle is not open");
        
        // Check if max participants is set and not exceeded
        if (raffle.maxParticipants > 0) {
            require(
                raffle.participants.length + numberOfEntries <= raffle.maxParticipants,
                "Raffle is full"
            );
        }
        
        // Check if deadline is set and not passed
        if (raffle.deadline > 0) {
            require(block.timestamp < raffle.deadline, "Raffle deadline passed");
        }
        
        // Calculate total entry fee
        uint256 totalFee = raffle.entryFee * numberOfEntries;
        require(msg.value >= totalFee, "Insufficient payment");
        
        // Add participant if first entry
        if (entryCounts[raffleId][msg.sender] == 0) {
            raffle.participants.push(msg.sender);
        }
        
        // Increment entry count
        entryCounts[raffleId][msg.sender] += numberOfEntries;
        
        // Refund excess payment
        if (msg.value > totalFee) {
            payable(msg.sender).transfer(msg.value - totalFee);
        }
        
        emit RaffleEntered(raffleId, msg.sender, entryCounts[raffleId][msg.sender]);
        
        // Check if max participants reached
        if (raffle.maxParticipants > 0 && raffle.participants.length == raffle.maxParticipants) {
            _requestRandomWinner(raffleId);
        }
    }
    
    /**
     * @dev Claim prize as the winner of a completed raffle
     * @param raffleId ID of the raffle
     */
    function claimPrize(uint256 raffleId) external nonReentrant {
        Raffle storage raffle = raffles[raffleId];
        require(raffle.status == RaffleStatus.COMPLETED, "Raffle not completed");
        require(raffle.winner == msg.sender, "Not the winner");
        
        if (raffle.prizeType == PrizeType.ERC721) {
            // Transfer NFT to winner
            IERC721(raffle.prizeToken).transferFrom(address(this), msg.sender, raffle.prizeTokenId);
        } else {
            // Transfer tokens to winner
            IERC20(raffle.prizeToken).transfer(msg.sender, raffle.prizeAmount);
        }
        
        emit PrizeClaimed(
            raffleId,
            msg.sender,
            raffle.prizeType,
            raffle.prizeToken,
            raffle.prizeTokenId,
            raffle.prizeAmount
        );
    }
    
    /**
     * @dev Cancel a raffle (only creator or owner, and only if still open)
     * @param raffleId ID of the raffle to cancel
     */
    function cancelRaffle(uint256 raffleId) external {
        Raffle storage raffle = raffles[raffleId];
        require(
            msg.sender == raffle.creator || msg.sender == owner(),
            "Not authorized"
        );
        require(raffle.status == RaffleStatus.OPEN, "Cannot cancel non-open raffle");
        
        raffle.status = RaffleStatus.CANCELLED;
        
        // Return prize to creator
        if (raffle.prizeType == PrizeType.ERC721) {
            IERC721(raffle.prizeToken).transferFrom(address(this), raffle.creator, raffle.prizeTokenId);
        } else {
            IERC20(raffle.prizeToken).transfer(raffle.creator, raffle.prizeAmount);
        }
        
        emit RaffleCancelled(raffleId);
    }
    
    /**
     * @dev Request refund from a cancelled raffle
     * @param raffleId ID of the cancelled raffle
     */
    function requestRefund(uint256 raffleId) external nonReentrant {
        Raffle storage raffle = raffles[raffleId];
        require(raffle.status == RaffleStatus.CANCELLED, "Raffle not cancelled");
        
        uint256 entryCount = entryCounts[raffleId][msg.sender];
        require(entryCount > 0, "No entries to refund");
        
        uint256 refundAmount = entryCount * raffle.entryFee;
        entryCounts[raffleId][msg.sender] = 0;
        
        payable(msg.sender).transfer(refundAmount);
        
        emit RefundIssued(raffleId, msg.sender, refundAmount);
    }
    
    /**
     * @dev Manually end a raffle if conditions are met
     * @param raffleId ID of the raffle to end
     */
    function endRaffle(uint256 raffleId) external {
        Raffle storage raffle = raffles[raffleId];
        require(raffle.status == RaffleStatus.OPEN, "Raffle not open");
        
        // Check if deadline passed or max participants reached
        bool deadlinePassed = raffle.deadline > 0 && block.timestamp >= raffle.deadline;
        require(
            deadlinePassed || (raffle.maxParticipants > 0 && raffle.participants.length >= raffle.maxParticipants),
            "Ending conditions not met"
        );
        
        _requestRandomWinner(raffleId);
    }

    // ============= View Functions =============
    
    /**
     * @dev Get the total number of raffles
     * @return Total number of raffles created
     */
    function getTotalRaffles() external view returns (uint256) {
        return _raffleCounter;
    }
    
    /**
     * @dev Get details about a specific raffle
     * @param raffleId ID of the raffle
     * @return Full raffle data
     */
    function getRaffleDetails(uint256 raffleId) external view returns (Raffle memory) {
        return raffles[raffleId];
    }
    
    /**
     * @dev Get the number of entries a participant has in a raffle
     * @param raffleId ID of the raffle
     * @param participant Address of the participant
     * @return Number of entries
     */
    function getEntryCount(uint256 raffleId, address participant) external view returns (uint256) {
        return entryCounts[raffleId][participant];
    }
    
    /**
     * @dev Get a list of all open raffles
     * @return Array of raffle IDs that are still open
     */
    function getOpenRaffles() external view returns (uint256[] memory) {
        uint256 openCount = 0;
        
        // Count open raffles
        for (uint256 i = 1; i <= _raffleCounter; i++) {
            if (raffles[i].status == RaffleStatus.OPEN) {
                openCount++;
            }
        }
        
        // Create and fill array
        uint256[] memory openRaffleIds = new uint256[](openCount);
        uint256 currentIndex = 0;
        
        for (uint256 i = 1; i <= _raffleCounter; i++) {
            if (raffles[i].status == RaffleStatus.OPEN) {
                openRaffleIds[currentIndex] = i;
                currentIndex++;
            }
        }
        
        return openRaffleIds;
    }
    
    /**
     * @dev Get a list of raffles created by a specific address
     * @param creator Address of the creator
     * @return Array of raffle IDs created by the address
     */
    function getRafflesByCreator(address creator) external view returns (uint256[] memory) {
        uint256 count = 0;
        
        // Count raffles by creator
        for (uint256 i = 1; i <= _raffleCounter; i++) {
            if (raffles[i].creator == creator) {
                count++;
            }
        }
        
        // Create and fill array
        uint256[] memory creatorRaffleIds = new uint256[](count);
        uint256 currentIndex = 0;
        
        for (uint256 i = 1; i <= _raffleCounter; i++) {
            if (raffles[i].creator == creator) {
                creatorRaffleIds[currentIndex] = i;
                currentIndex++;
            }
        }
        
        return creatorRaffleIds;
    }
    
    /**
     * @dev Get a list of raffles a user has participated in
     * @param participant Address of the participant
     * @return Array of raffle IDs the user has entered
     */
    function getRafflesByParticipant(address participant) external view returns (uint256[] memory) {
        uint256 count = 0;
        
        // Count raffles where user participated
        for (uint256 i = 1; i <= _raffleCounter; i++) {
            if (entryCounts[i][participant] > 0) {
                count++;
            }
        }
        
        // Create and fill array
        uint256[] memory participantRaffleIds = new uint256[](count);
        uint256 currentIndex = 0;
        
        for (uint256 i = 1; i <= _raffleCounter; i++) {
            if (entryCounts[i][participant] > 0) {
                participantRaffleIds[currentIndex] = i;
                currentIndex++;
            }
        }
        
        return participantRaffleIds;
    }

    // ============= Chainlink VRF Functions =============
    
    /**
     * @dev Request randomness from Chainlink VRF
     * @param raffleId ID of the raffle needing a random winner
     */
    function _requestRandomWinner(uint256 raffleId) internal {
        Raffle storage raffle = raffles[raffleId];
        require(raffle.participants.length > 0, "No participants");
        
        // Update raffle status
        raffle.status = RaffleStatus.PENDING_DRAWING;
        emit RaffleStatusChanged(raffleId, RaffleStatus.PENDING_DRAWING);
        
        // Request randomness
        uint256 requestId = i_vrfCoordinator.requestRandomWords(
            i_keyHash,
            i_subscriptionId,
            REQUEST_CONFIRMATIONS,
            i_callbackGasLimit,
            NUM_WORDS
        );
        
        // Store requestId for the raffle
        raffle.requestId = requestId;
    }
    
    /**
     * @dev Callback function used by VRF Coordinator
     * @param requestId ID of the randomness request
     * @param randomWords Array of random results from VRF
     */
    function fulfillRandomWords(
        uint256 requestId,
        uint256[] memory randomWords
    ) internal override {
        uint256 raffleId = 0;
        
        // Find the raffle with this requestId
        for (uint256 i = 1; i <= _raffleCounter; i++) {
            if (raffles[i].requestId == requestId) {
                raffleId = i;
                break;
            }
        }
        
        require(raffleId > 0, "Request ID not found");
        Raffle storage raffle = raffles[raffleId];
        
        // Store the random number
        uint256 randomNumber = randomWords[0];
        raffleToRandomNumber[raffleId] = randomNumber;
        
        // Select winner based on random number
        uint256 winnerIndex = randomNumber % raffle.participants.length;
        address winner = raffle.participants[winnerIndex];
        raffle.winner = winner;
        
        // Update raffle status
        raffle.status = RaffleStatus.COMPLETED;
        
        // Transfer platform fee
        uint256 totalRaised = raffle.entryFee * raffle.participants.length;
        uint256 platformFee = (totalRaised * platformFeePercentage) / 100;
        if (platformFee > 0) {
            payable(owner()).transfer(platformFee);
        }
        
        emit RaffleStatusChanged(raffleId, RaffleStatus.COMPLETED);
        emit RaffleWinnerSelected(raffleId, winner);
    }

    // ============= Chainlink Keeper Functions =============
    
    /**
     * @dev Chainlink Keeper checkUpkeep function
     * param checkData Additional data passed to the checkUpkeep function
     * @return upkeepNeeded Boolean indicating if upkeep is needed
     * @return performData Data to be passed to the performUpkeep function
     */
    function checkUpkeep(
        bytes memory //checkData
    ) public view override returns (bool upkeepNeeded, bytes memory ) {
        upkeepNeeded = (block.timestamp - lastTimeStamp) > checkInterval;
        
        // Find expired raffles that are still open
        uint256[] memory expiredRaffles = new uint256[](_raffleCounter);
        uint256 expiredCount = 0;
        
        for (uint256 i = 1; i <= _raffleCounter; i++) {
            Raffle storage raffle = raffles[i];
            if (
                raffle.status == RaffleStatus.OPEN &&
                raffle.deadline > 0 &&
                block.timestamp >= raffle.deadline
            ) {
                expiredRaffles[expiredCount] = i;
                expiredCount++;
            }
        }
        
        // Create properly sized array for performData
        uint256[] memory finalExpiredRaffles = new uint256[](expiredCount);
        for (uint256 i = 0; i < expiredCount; i++) {
            finalExpiredRaffles[i] = expiredRaffles[i];
        }
        
        return (upkeepNeeded, abi.encode(finalExpiredRaffles));
    }
    
    /**
     * @dev Chainlink Keeper performUpkeep function
     * @param performData Data passed from the checkUpkeep function
     */
    function performUpkeep(bytes calldata performData) external override {
        (bool upkeepNeeded, ) = checkUpkeep(bytes(""));
        require(upkeepNeeded, "Upkeep not needed");
        
        lastTimeStamp = block.timestamp;
        
        // Process expired raffles
        uint256[] memory expiredRaffles = abi.decode(performData, (uint256[]));
        for (uint256 i = 0; i < expiredRaffles.length; i++) {
            uint256 raffleId = expiredRaffles[i];
            Raffle storage raffle = raffles[raffleId];
            
            // Double check raffle is still open and expired
            if (
                raffle.status == RaffleStatus.OPEN &&
                raffle.deadline > 0 &&
                block.timestamp >= raffle.deadline
            ) {
                if (raffle.participants.length > 0) {
                    // End raffle with participants
                    _requestRandomWinner(raffleId);
                } else {
                    // Cancel raffle with no participants
                    raffle.status = RaffleStatus.CANCELLED;
                    
                    // Return prize to creator
                    if (raffle.prizeType == PrizeType.ERC721) {
                        IERC721(raffle.prizeToken).transferFrom(
                            address(this),
                            raffle.creator,
                            raffle.prizeTokenId
                        );
                    } else {
                        IERC20(raffle.prizeToken).transfer(raffle.creator, raffle.prizeAmount);
                    }
                    
                    emit RaffleCancelled(raffleId);
                }
            }
        }
    }

    // ============= Admin Functions =============
    
    /**
     * @dev Update the platform fee percentage
     * @param newFeePercentage New fee percentage (0-10)
     */
    function updatePlatformFee(uint256 newFeePercentage) external onlyOwner {
        require(newFeePercentage <= 10, "Fee cannot exceed 10%");
        platformFeePercentage = newFeePercentage;
    }
    
    /**
     * @dev Withdraw contract balance (platform fees)
     */
    function withdrawFees() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No balance to withdraw");
        payable(owner()).transfer(balance);
    }
    
    /**
     * @dev Emergency function to recover any ERC20 tokens accidentally sent to contract
     * @param token Address of the token
     */
    function recoverERC20(address token) external onlyOwner {
        uint256 balance = IERC20(token).balanceOf(address(this));
        IERC20(token).transfer(owner(), balance);
    }
    
    /**
     * @dev Emergency function to recover any ERC721 tokens accidentally sent to contract
     * @param token Address of the NFT contract
     * @param tokenId ID of the NFT
     */
    function recoverERC721(address token, uint256 tokenId) external onlyOwner {
        // Make sure this is not a prize in an active raffle
        for (uint256 i = 1; i <= _raffleCounter; i++) {
            Raffle storage raffle = raffles[i];
            if (
                raffle.status == RaffleStatus.OPEN || 
                raffle.status == RaffleStatus.PENDING_DRAWING
            ) {
                if (
                    raffle.prizeType == PrizeType.ERC721 &&
                    raffle.prizeToken == token &&
                    raffle.prizeTokenId == tokenId
                ) {
                    revert("Token is an active raffle prize");
                }
            }
        }
        
        IERC721(token).transferFrom(address(this), owner(), tokenId);
    }
    
    // ============= Fallback and Receive =============
    
    receive() external payable {}
    fallback() external payable {}
}