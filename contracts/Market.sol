pragma solidity ^0.4.24;

import 'openzeppelin-solidity/contracts/math/SafeMath.sol';
import { Ownable } from 'openzeppelin-solidity/contracts/ownership/Ownable.sol';
import { Destructible } from 'openzeppelin-solidity/contracts/lifecycle/Destructible.sol';

contract Market is Ownable, Destructible {
    using SafeMath for uint256;
    // It maps the IDs to orders
    mapping (uint256 => Order) public orders;
    // Number of orders
    uint256 orderCount;
    // Circuit breaker
    bool stopped;

    struct Order {
        uint256 id;
        address owner;
        uint256 action;
        uint256 state;
        uint256 quantity;
        uint256 product;
        uint256 unsafeCreatedTimestamp;
        uint256 offerCount;
        mapping (uint => Offer) offers;
        Offer acceptedOffer;
        bool isEnergyDelivered;
    }

    struct Offer {
        uint256 id;
        address owner;
        uint256 price;
        uint256 value;
        bytes32 secretHash;
        uint256 unsafeCreatedTimestamp;
        bool isWithdraw;
    }
     
    enum State { Open, Close, Canceled }
    enum Action { Buy, Sell }
    enum Product { Day, Week, Month }

    event NewOrder(uint256 indexed orderId);
    event OrderCanceled(uint256 indexed orderId);
    event NewOffer(uint256 indexed orderId, uint256 indexed offerId);
    event OfferAccepted(uint256 indexed orderId, uint256 indexed offerId);

    // Checks if the order exist.
    modifier orderExist(uint _orderId) {
        require(orderCount >= _orderId);
        _;
    }

    // Checks if offer exist.
    modifier offerExist(uint _orderId, uint _offerId) {
        require(orders[_orderId].offerCount >= _offerId);
        _;
    }

    // Checks if @param _address is the owner of the order.
    modifier isOrderOwner(uint _orderId, address _address) {
        require(orders[_orderId].owner == _address);
        _;
    }

    // Checks if the order is in Open state.
    modifier isOpen(uint _orderId) {
        require(orders[_orderId].state == uint(State.Open));
        _;
    }

    // Checks if the order is in Close state.
    modifier isClose(uint _orderId) {
        require(orders[_orderId].state == uint(State.Close));
        _;
    }

    // Stops the execution if stopped is true
    modifier stop_if_emergency() {
        require(!stopped);
        _;
    }

    // Contract constructur which set the circuit breaker to false and orderCount to 0
    constructor() public {
        orderCount = 0;
        stopped = false;
    }

    /**
    * @dev Adds an order on the orders persistent storage
    * @param _action uint256 Order action, it can only be Buy or Sell
    * @param _quantity uint256 Order quantity in MW/h
    * @param _product uint256 Order product, it can only be Day, Week or Month
    */
    function submitOrder(uint256 _action, uint256 _quantity, uint256 _product) 
        public 
        stop_if_emergency() 
    {
        // TODO: Check if the action is present in enum Action
        // TODO: Check if the product is present in enum Product
        orderCount = orderCount.add(1);

        Order memory order;
        order.id = orderCount;
        order.owner = msg.sender;
        order.action = _action;
        order.state = uint(State.Open);
        order.quantity = _quantity;
        order.product = _product;
        // This timestamp will not be used for critical contract logic, only as reference
        order.unsafeCreatedTimestamp = block.timestamp;
        order.offerCount = 0;
        order.isEnergyDelivered = false;

        orders[orderCount] = order;
        emit NewOrder(orderCount);
    }

    function getOrder(uint _orderId) 
        public view
        orderExist(_orderId) 
        returns (uint, address, uint, uint, uint, uint, uint, uint, bool)
    {
        Order storage order = orders[_orderId];
        return(
            order.id,
            order.owner,
            order.action,
            order.state,
            order.quantity,
            order.product,
            order.unsafeCreatedTimestamp,
            order.offerCount,
            order.isEnergyDelivered
        );
    }

    /** 
    * @dev Get order count
    */
    function getOrderCount() public view returns (uint256) 
    {
        return orderCount;
    }

    /**
    * @dev Cancel the order only if in Open state
    * @param _orderId uint256 The order ID
    */
    function cancelOrder(uint256 _orderId) 
        public
        orderExist(_orderId)
        isOrderOwner(_orderId, msg.sender)
        isOpen(_orderId)
    {
        orders[_orderId].state = uint(State.Canceled);
        emit OrderCanceled(_orderId);
    }

    function submitOffer(uint256 _orderId, uint256 _price, bytes32 _secretHash) 
        public payable 
        stop_if_emergency()
    {
        // TODO: Order owner cannot place an offer in his own order
        Order storage order = orders[_orderId];
        // Only possible to submit an Offer when an order state is Open
        require(order.state == uint(State.Open), "Order is not open to offers");
        order.offerCount = order.offerCount.add(1);
        Offer memory newOffer = Offer(
            order.offerCount,
            msg.sender,
            _price,
            msg.value,
            _secretHash,
            block.timestamp,
            false
        );
        order.offers[order.offerCount] = newOffer;
        emit NewOffer(_orderId, order.offerCount);
    }

    function acceptOffer(uint256 _orderId, uint256 _offerId) 
        public
        stop_if_emergency()
        orderExist(_orderId)
        offerExist(_orderId, _offerId)
        isOrderOwner(_orderId, msg.sender)
        isOpen(_orderId)
    {
        Order storage order = orders[_orderId];
        order.state = uint(State.Close);
        order.acceptedOffer = order.offers[_offerId];
        emit OfferAccepted(_orderId, _offerId);
    }

    function getOffer(uint256 _orderId, uint256 _offerId) 
        public view
        orderExist(_orderId)
        offerExist(_orderId, _offerId)
        returns (uint, address, uint, uint, bytes32, uint, bool)
    {
        Offer storage offer = orders[_orderId].offers[_offerId];
        return (
            offer.id,
            offer.owner,
            offer.price,
            offer.value,
            offer.secretHash,
            offer.unsafeCreatedTimestamp,
            offer.isWithdraw
        );
    }

    function getAcceptedOffer(uint256 _orderId) 
        public view
        orderExist(_orderId)
        offerExist(_orderId, orders[_orderId].acceptedOffer.id)
        returns (uint, address, uint, uint, bytes32, uint, bool)
    {
        Offer storage acceptedOffer = orders[_orderId].acceptedOffer;
        return (
            acceptedOffer.id,
            acceptedOffer.owner,
            acceptedOffer.price,
            acceptedOffer.value,
            acceptedOffer.secretHash,
            acceptedOffer.unsafeCreatedTimestamp,
            acceptedOffer.isWithdraw
        );
    }

    function withdrawPayment(uint256 _orderId, uint256 _offerId) 
        public
        stop_if_emergency()
        orderExist(_orderId)
        offerExist(_orderId, _offerId)
        isClose(_orderId)
    {
        // TODO: Only possible to withdraw payment to the producer, when presented the proof that energy was sent
    }

    /**
    * @dev Remaining suppliers with non accepted offers should be able to withdraw their Ether
    */
    function withdrawNotAcceptedOffers(uint256 _orderId, uint256 _offerId) 
        public
        stop_if_emergency()
        orderExist(_orderId)
        offerExist(_orderId, _offerId)
        isClose(_orderId)
    {
        Order storage order = orders[_orderId];
        Offer storage offer = order.offers[_offerId];
        require(msg.sender != order.acceptedOffer.owner, "Owner of the accepted offer cannot withdraw his funds with this function");
        require(offer.isWithdraw == false, "Withdraw was already collected");
        require(msg.sender == offer.owner, "Offer owner is the only one able to execute the withdraw");
        offer.owner.transfer(offer.value);
    }

    /**
    * @dev Toggles circuit breaker
    */
    function toggle_active() public onlyOwner() {
        stopped = !stopped;
    }

    /** 
    * @dev Kills this contract and sends remaining ETH to @param transferAddress_
    * @param transferAddress_ address remaining ETH will be sent to
    */
    function kill(address transferAddress_) public
    {
        destroyAndSend(transferAddress_);
    }
}
