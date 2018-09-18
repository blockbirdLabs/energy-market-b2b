pragma solidity ^0.4.24;

import './energy_token.sol';
import 'openzeppelin-solidity/contracts/token/ERC721/ERC721Holder.sol';

// Contract responsible for holding funds and tokens (and rewarding or penalizing if energy is not produced)
// it could be also used for the energy comsuption, but ignoring that use case for now, only ensuring that users
// get rewarded for energy production
// it exchanges EnergyTokens for ETH for simplicity, but we would probably want to have our own token
contract EnergyEscrow is ERC721Holder {
  event PaymentCreation(uint256 tokenId, address producer, address distributor, address comsumer, uint value);
  event Withdraw(uint256 tokenId, address producer, address distributor, address comsumer, uint value);
  enum PaymentStatus { Pending, Completed, Refunded }
  struct Payment {
    address producer;
    address distributor;
    address consumer;
    uint value;
    PaymentStatus status;
  }

  // orderId => Payment
  mapping(uint256 => Payment) public payments;
  EnergyToken public energyToken;

  constructor(EnergyToken _energyToken) public {
    energyToken = _energyToken;
  }

  // need to specify consumer since this will be executed by the order book contract
  function createPayment(uint256 _tokenId, address _consumer, address _distributor) external payable {
    address producer = energyToken.ownerOf(_tokenId);
    uint value = msg.value;
    if(msg.value == 0) { revert("Need to send some funds"); }
    energyToken.safeTransferFrom(producer, address(this), _tokenId); 
    payments[_tokenId] = Payment(producer, _distributor, _consumer, value, PaymentStatus.Pending);
    emit PaymentCreation(_tokenId, producer, _distributor, _consumer, value);
  }

  function withdrawPayment(uint256 _tokenId) public {
    Payment memory p = payments[_tokenId];
    p.producer.transfer(p.value); // pay the producer
    energyToken.burn(_tokenId); // burns the token so that this 
    delete payments[_tokenId]; // delete payment mapping
    emit Withdraw(_tokenId, p.producer, p.distributor, p.consumer, p.value);
  }

  function testRecovery(bytes32 h, uint8 v, bytes32 r, bytes32 s) public pure returns (address) {
    /* prefix might be needed for geth only
     * https://github.com/ethereum/go-ethereum/issues/3731
     */
    // bytes memory prefix = "\x19Ethereum Signed Message:\n32";
    // h = sha3(prefix, h);
    address addr = ecrecover(h, v, r, s);

    return addr;
  }
}
