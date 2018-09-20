pragma solidity ^0.4.24;

import 'openzeppelin-solidity/contracts/token/ERC721/ERC721Token.sol';
import 'openzeppelin-solidity/contracts/math/SafeMath.sol';

contract EnergyToken is ERC721Token {
  using SafeMath for uint256;

  event Minted(uint256 tokenId, bytes URI);

  uint256 private counter;
  mapping(string => uint256) private uri2TokenId;

  constructor(string name, string symbol) public
  ERC721Token(name, symbol)
  { 
    counter = 1;
  }

  function mint(address _to, bytes32 _secret) public {
  // function mint(address _to, string _uniqueDescription) public {
    // should be something defined by the user like date or something
    // bytes32 uriHash = keccak256(abi.encodePacked(_to,_uniqueDescription));  
    // string memory uriHashStr = bytes32ToString(uriHash);  
    string memory uriHashStr = bytes32ToString(_secret);

    require(uri2TokenId[uriHashStr] == 0, "URI already exists");
    uri2TokenId[uriHashStr] = counter;

    super._mint(_to, counter);
    super._setTokenURI(counter, uriHashStr);
    emit Minted(counter, bytes(uriHashStr));
    counter = counter.add(1);
  }

  // this should be only runnable by the EnergyEscrow contract or a specific owner
  // public just to be testable
  // TODO create permission to execute this
  function burn(uint256 _tokenId) public {
    delete uri2TokenId[tokenURIs[_tokenId]];
    super._burn(ownerOf(_tokenId), _tokenId);
  }

  // _uri = sha3(_orignalOwner,_uniqueDescription)
  function tokenIdByURI(bytes32 _uri) view public returns(uint256) {
    string memory uriHashStr = bytes32ToString(_uri);  
    require(uri2TokenId[uriHashStr] != 0, "URI does not exist");
    return uri2TokenId[uriHashStr];
  }

  // ============== UTILS ==============
  function bytes32ToBytes(bytes32 _bytes32) private pure returns (bytes){
    // string memory str = string(_bytes32);
    // TypeError: Explicit type conversion not allowed from "bytes32" to "string storage pointer"
    bytes memory bytesArray = new bytes(32);
    for (uint256 i; i < 32; i++) {
      bytesArray[i] = _bytes32[i];
    }
    return bytesArray;
  }

  function bytes32ToString(bytes32 _bytes32) public pure returns (string){
    bytes memory bytesArray = bytes32ToBytes(_bytes32);
    return string(bytesArray);
  }
}
