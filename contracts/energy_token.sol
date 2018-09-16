pragma solidity ^0.4.23;

import "node_modules/openzeppelin-solidity/contracts/AutoIncrementing.sol";
import "node_modules/openzeppelin-solidity/contracts/token/ERC721/ERC721Token.sol";

contract EnergyToken is AutoIncrementing, ERC721Token {
    constructor() public {
      ERC721Token("Energy","BLK");
    }
}
