// SPDX-License-Identifier: MIT                               
pragma solidity ^0.8.17;

contract SayHello {
    string name;

    constructor(string memory n) {
        name = n;
    }

    function sayHello() public view returns (string memory) {
        return string.concat("Hello ", name, " ;)");
    }

    function sayHelloToMe(string memory newName) public pure returns (string memory) {
        return string.concat("Hello ", newName, " ;)");
    }
}