// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract EventTicketNFT is ERC721, Ownable {
    struct Ticket {
        uint256 eventId;
        uint256 price;
        address[] splitsRecipients;
        uint256[] splitsPercentages;
        uint256 primaryRoyaltyPercentage;
        uint256 secondaryRoyaltyPercentage;
        uint256 priceCap;
        bool priceCapLifted;
        bool isActive;
        mapping(bytes32 => bool) state;
    }

    mapping(uint256 => Ticket) public tickets;
    uint256 private _ticketIdTracker;
    event TicketListed(uint256 indexed ticketId, uint256 price);

    event TicketMinted(
        uint256 indexed ticketId,
        uint256 eventId,
        address indexed owner
    );
    event TicketBought(uint256 indexed ticketId, address indexed buyer);

    constructor() ERC721("Event Ticket NFT", "ETNFT") {}

    function mintTicket(
        uint256 eventId,
        uint256 price,
        address[] memory splitsRecipients,
        uint256[] memory splitsPercentages,
        uint256 primaryRoyaltyPercentage,
        uint256 secondaryRoyaltyPercentage,
        uint256 priceCap
    ) external returns (uint256) {
        require(price > 0, "Price must be greater than 0");
        require(
            splitsRecipients.length == splitsPercentages.length,
            "Splits arrays length mismatch"
        );
        require(
            primaryRoyaltyPercentage <= 100,
            "Primary royalty percentage must be <= 100"
        );
        require(
            secondaryRoyaltyPercentage <= 100,
            "Secondary royalty percentage must be <= 100"
        );
        require(priceCap >= price, "Price cap must be >= price");

        uint256 ticketId = _ticketIdTracker;

        _safeMint(msg.sender, ticketId);

        Ticket storage ticket = tickets[ticketId];
        ticket.eventId = eventId;
        ticket.price = price;
        ticket.splitsRecipients = splitsRecipients;
        ticket.splitsPercentages = splitsPercentages;
        ticket.primaryRoyaltyPercentage = primaryRoyaltyPercentage;
        ticket.secondaryRoyaltyPercentage = secondaryRoyaltyPercentage;
        ticket.priceCap = priceCap;
        ticket.isActive = true;

        _ticketIdTracker++;

        emit TicketMinted(ticketId, eventId, msg.sender);

        return ticketId;
    }

    function buyTicket(uint256 ticketId) external payable {
        Ticket storage ticket = tickets[ticketId];
        require(ticket.isActive, "Ticket is not active");
        require(msg.value == ticket.price, "Insufficient payment");

        address[] memory splitsRecipients = ticket.splitsRecipients;
        uint256[] memory splitsPercentages = ticket.splitsPercentages;
        uint256 primaryRoyaltyPercentage = ticket.primaryRoyaltyPercentage;
        uint256 secondaryRoyaltyPercentage = ticket.secondaryRoyaltyPercentage;

        uint256 primaryRoyalty = (ticket.price * primaryRoyaltyPercentage) /
            100;
        uint256 secondaryRoyalty = (ticket.price * secondaryRoyaltyPercentage) /
            100;
        uint256 sellerRevenue = ticket.price -
            primaryRoyalty -
            secondaryRoyalty;

        for (uint256 i = 0; i < splitsRecipients.length; i++) {
            require(
                splitsRecipients[i] != address(0),
                "Invalid splits recipient"
            );
            require(
                splitsPercentages[i] > 0 && splitsPercentages[i] <= 100,
                "Invalid splits percentage"
            );
            uint256 split = (ticket.price * splitsPercentages[i]) / 100;
            payable(splitsRecipients[i]).transfer(split);
            sellerRevenue -= split;
        }

        payable(owner()).transfer(primaryRoyalty);
        payable(msg.sender).transfer(sellerRevenue);

        emit TicketBought(ticketId, msg.sender);
    }

    function setTicketState(
        uint256 ticketId,
        bool isActive
    ) external onlyOwner {
        tickets[ticketId].isActive = isActive;
    }

    function setPriceCap(
        uint256 ticketId,
        uint256 priceCap,
        bool priceCapLifted
    ) external onlyOwner {
        tickets[ticketId].priceCap = priceCap;
        tickets[ticketId].priceCapLifted = priceCapLifted;
    }

    function listTicketById(uint256 ticketId, uint256 price) external {
        require(
            ownerOf(ticketId) == msg.sender,
            "You are not the ticket owner"
        );
        require(price > 0, "Price must be greater than 0");

        tickets[ticketId].price = price;

        emit TicketListed(ticketId, price);
    }

    function getAllTickets() external view returns (uint256[] memory) {
        uint256[] memory ticketIds = new uint256[](_ticketIdTracker);

        for (uint256 i = 0; i < _ticketIdTracker; i++) {
            ticketIds[i] = i;
        }

        return ticketIds;
    }

    function getPurchasedTicketsByUser()
        external
        view
        returns (uint256[] memory)
    {
        address user = msg.sender;
        uint256 totalTickets = _ticketIdTracker;
        uint256[] memory purchasedTickets = new uint256[](totalTickets);
        uint256 purchasedTicketCount = 0;

        for (uint256 ticketId = 0; ticketId < totalTickets; ticketId++) {
            if (_exists(ticketId) && ownerOf(ticketId) == user) {
                purchasedTickets[purchasedTicketCount] = ticketId;
                purchasedTicketCount++;
            }
        }

        // Resize the purchasedTickets array to the actual count of purchased tickets
        assembly {
            mstore(purchasedTickets, purchasedTicketCount)
        }

        return purchasedTickets;
    }
}
