// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract GamblingMarket {
    uint public totalBalance;
    mapping(address => uint) public userBalances;

    address public owner;

    struct Event {
        string description;
        bool resolved;
        bool result;
        uint totalYesBets;
        uint totalNoBets;
        bool active;
    }

    mapping(uint => Event) public events;
    mapping(uint => mapping(address => uint)) public yesBets;
    mapping(uint => mapping(address => uint)) public noBets;
    mapping(uint => address[]) public yesBettors;
    mapping(uint => address[]) public noBettors;

    uint public nextEventId = 1;

    event Deposited(address indexed user, uint amount);
    event Withdrawn(address indexed user, uint amount);
    event BetPlaced(uint indexed eventId, address indexed user, uint amount, bool choice);
    event EventResolved(uint indexed eventId, bool result);
    event WinningsWithdrawn(uint indexed eventId, address winner, uint amount);
    event EventCreated(uint indexed eventId, string description);

    modifier hasBalance(address user, uint amount) {
        require(userBalances[user] >= amount, "Insufficient balance");
        _;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can call this function.");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    receive() external payable {
        require(msg.value > 0, "Must send ETH.");
        userBalances[msg.sender] += msg.value;
        totalBalance += msg.value;
        emit Deposited(msg.sender, msg.value);
    }

    function deposit() external payable {
        require(msg.value > 0, "Deposit amount must be greater than 0.");
        userBalances[msg.sender] += msg.value;
        totalBalance += msg.value;
        emit Deposited(msg.sender, msg.value);
    }

    function createEvent(string memory _description) external onlyOwner {
        events[nextEventId] = Event({
            description: _description,
            resolved: false,
            result: false,
            totalYesBets: 0,
            totalNoBets: 0,
            active: true
        });
        emit EventCreated(nextEventId, _description);
        nextEventId++;
    }

    function placeBet(uint _eventId, bool choice, uint amount) external hasBalance(msg.sender, amount) {
        Event storage e = events[_eventId];
        require(e.active, "Event is not active.");
        require(!e.resolved, "Event already resolved.");
        require(amount > 0, "Amount must be > 0.");

        userBalances[msg.sender] -= amount;

        if (choice) {
            if (yesBets[_eventId][msg.sender] == 0) {
                yesBettors[_eventId].push(msg.sender);
            }
            yesBets[_eventId][msg.sender] += amount;
            e.totalYesBets += amount;
        } else {
            if (noBets[_eventId][msg.sender] == 0) {
                noBettors[_eventId].push(msg.sender);
            }
            noBets[_eventId][msg.sender] += amount;
            e.totalNoBets += amount;
        }

        emit BetPlaced(_eventId, msg.sender, amount, choice);
    }

    function resolveEvent(uint _eventId, bool _result) external onlyOwner {
        Event storage e = events[_eventId];
        require(e.active, "Event is not active.");
        require(!e.resolved, "Already resolved.");

        e.resolved = true;
        e.result = _result;
        e.active = false;

        emit EventResolved(_eventId, _result);
        _payWinners(_eventId, _result);
    }

    function _payWinners(uint _eventId, bool _result) internal {
        Event storage e = events[_eventId];

        uint totalPot = e.totalYesBets + e.totalNoBets;
        uint winningPot = _result ? e.totalYesBets : e.totalNoBets;
        address[] storage bettors = _result ? yesBettors[_eventId] : noBettors[_eventId];
        mapping(address => uint) storage bets = _result ? yesBets[_eventId] : noBets[_eventId];

        if (winningPot == 0) return;

        for (uint i = 0; i < bettors.length; i++) {
            address user = bettors[i];
            uint userBet = bets[user];
            if (userBet > 0) {
                uint payout = (userBet * totalPot) / winningPot;
                userBalances[user] += payout;
                emit WinningsWithdrawn(_eventId, user, payout);
            }
        }
    }

    function withdraw(uint amount) external hasBalance(msg.sender, amount) {
        require(amount >= 0.001 ether, "Minimum withdrawal is 0.001 ETH");
        userBalances[msg.sender] -= amount;
        totalBalance -= amount;
        payable(msg.sender).transfer(amount);
        emit Withdrawn(msg.sender, amount);
    }

    function getEventBasic(uint _eventId) external view returns (
        string memory description,
        bool resolved,
        bool result,
        uint totalYesBets,
        uint totalNoBets,
        bool active
    ) {
        Event storage e = events[_eventId];
        return (
            e.description,
            e.resolved,
            e.result,
            e.totalYesBets,
            e.totalNoBets,
            e.active
        );
    }

    function getContractBalance() external view returns (uint) {
        return address(this).balance;
    }

    function getUserBalance(address user) external view returns (uint) {
        return userBalances[user];
    }
}
