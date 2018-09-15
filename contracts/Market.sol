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
        uint256 _type;
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
    enum Type { Buy, Sell }
    enum Product { Day, Week, Month }

    struct Offer {
        uint256 id;
        address owner;
        uint256 price;
        uint256 unsafeCreatedTimestamp;
    }

    // Stops the execution if stopped is true
    modifier stop_if_emergency() {
        require(!stopped);
        _;
    }

    function getOrder(uint _orderId) public view 
    {
        
    }

    /** 
    * @dev Get order count
    */
    function getOrderCount() public view returns (uint256) 
    {
        return orderCount;
    }

    function cancelOrder(uint256 _orderId) public 
    {
        
    }

    function submitOrder(uint256 _type, uint256 _product, uint256 _quantity) 
        public 
        stop_if_emergency() 
    {
        
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