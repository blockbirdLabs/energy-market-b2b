pragma solidity ^0.4.23;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";

contract Market {
    // It prevents overflow issues
    using SafeMath for uint256;
    // It maps the IDs to orders
    mapping (uint256 => Entry) public orders;
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
     
    enum State { Open, Close, Canceled }
    enum Action { Buy, Sell }
    enum Product { Day, Week, Month }

    struct Offer {
        uint256 id;
        address owner;
        uint256 price;
        uint256 unsafeCreatedTimestamp;
    }

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

    // Stops the execution if stopped is true
    modifier stop_if_emergency() {
        require(!stopped);
        _;
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
    }

    function submitOffer(uint256 _oderId, uint256 _price) 
        public payable 
        stop_if_emergency()
    {
        
    }

    function acceptOffer(uint256 _orderId, uint256 _offerId) 
        public
        stop_if_emergency()
    {
        
    }

    function getOffer(uint256 _orderId, uint256 _offerId) public view 
    {
        
    }

    function getAcceptedOffer(uint256 _orderId) public view
    {
        
    }

    function claimPayment(uint256 _orderId, uint256 _offerId) 
        public
        stop_if_emergency()
    {
        
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