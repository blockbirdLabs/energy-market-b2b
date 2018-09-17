pragma solidity ^0.4.24;

import 'openzeppelin-solidity/contracts/token/ERC721/ERC721.sol';
import 'openzeppelin-solidity/contracts/token/ERC721/ERC721Holder.sol';

// Contract responsible for holding funds and tokens (and rewarding or penalizing if energy is not produced)
// it could be also used for the energy comsuption, but ignoring that use case for now, only ensuring that users
// get rewarded for energy production
// it exchanges EnergyTokens for ETH for simplicity, but we would probably want to have our own token
contract EnergyEscrow is ERC721Holder {
  event PaymentCreation(uint256 indexed tokenId, address indexed producer, address indexed comsumer, uint value);
  enum PaymentStatus { Pending, Completed, Refunded }
  struct Payment {
    address producer;
    address consumer;
    uint value;
    PaymentStatus status;
  }

  // orderId => Payment
  mapping(uint256 => Payment) public payments;
  ERC721 public energyToken;

  constructor(ERC721 _energyToken) public {
    energyToken = _energyToken;
  }

  // need to specify consumer since this will be executed by the order book contract
  function createPayment(uint256 _tokenId, address _consumer) external payable {
    address producer = energyToken.ownerOf(_tokenId);
    uint value = msg.value;
    if(msg.value == 0) { revert("Need to send some funds"); }
    energyToken.safeTransferFrom(producer, address(this), _tokenId); // THIS IS FAILING DO TO NOT BEING APPROVED
    payments[_tokenId] = Payment(producer, _consumer, value, PaymentStatus.Pending);
    emit PaymentCreation(_tokenId, producer, _consumer, value);
  }
}
