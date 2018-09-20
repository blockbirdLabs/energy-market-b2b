pragma solidity ^0.4.24;

import './energy_token.sol';
import 'openzeppelin-solidity/contracts/token/ERC721/ERC721Holder.sol';

// Contract responsible for holding funds and tokens (and rewarding or penalizing if energy is not produced)
// it could be also used for the energy comsuption, but ignoring that use case for now, only ensuring that users
// get rewarded for energy production
// it exchanges EnergyTokens for ETH for simplicity, but we would probably want to have our own token
contract EnergyEscrow is ERC721Holder {
  event PaymentCreation(uint256 tokenId, address producer, address supplier, uint value);
  event Withdraw(uint256 tokenId, address producer, address supplier, uint value);
  enum PaymentStatus { Pending, Completed, Refunded }
  struct Payment {
    address producer;
    address supplier;
    uint value;
    PaymentStatus status;
  }

  // orderId => Payment
  mapping(uint256 => Payment) public payments;
  EnergyToken public energyToken;

  constructor(EnergyToken _energyToken) public {
    energyToken = _energyToken;
  }

  function createPayment(uint256 _tokenId, address _supplier) external payable {
    address producer = energyToken.ownerOf(_tokenId);
    uint value = msg.value;
    if(msg.value == 0) { revert("Need to send some funds"); }
    energyToken.safeTransferFrom(producer, address(this), _tokenId); 
    payments[_tokenId] = Payment(producer, _supplier, value, PaymentStatus.Pending);
    emit PaymentCreation(_tokenId, producer, _supplier, value);
  }

  function withdrawWithProof(string _tokenSecret, bytes producerSig) public {
    bytes32 secret = keccak256(abi.encodePacked(_tokenSecret));
    uint256 tokenId = energyToken.tokenIdByURI(secret);
    Payment memory p = payments[tokenId];
    require(msg.sender == p.producer, "Producer is the only one able to execute the withdraw");

    address addr =verifyHash(secret,producerSig);
    require(addr == p.producer,"failed to verify signature");

    withdrawPayment(tokenId);
  }

  function verifyHash(bytes32 h, bytes signature) public pure returns (address) {
    bytes32 r;
    bytes32 s;
    uint8 v;
    assembly {
      r := mload(add(signature, 32))
      s := mload(add(signature, 64))
      v := and(mload(add(signature, 65)), 255)
    }
    if (v < 27) v += 27;
    // since the message is a hash, it will always be 32 of size
    bytes memory prefix = "\x19Ethereum Signed Message:\n32";
    bytes32 check = keccak256(abi.encodePacked(prefix, h));
    address addr = ecrecover(check, v, r, s);
    return addr;
  }

  function withdrawPayment(uint256 _tokenId) private {
    Payment memory p = payments[_tokenId];
    p.producer.transfer(p.value); // pay the producer
    // energyToken.burn(tokenId); // burns the token so that this 
    energyToken.safeTransferFrom(address(this), p.supplier,  _tokenId); 
    delete payments[_tokenId]; // delete payment mapping
    emit Withdraw(_tokenId, p.producer, p.supplier, p.value);
  }
}
