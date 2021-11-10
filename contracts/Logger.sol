// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;


abstract contract Logger {
  uint public testNum;

  constructor() {
    testNum = 1000;
  }

  function emitLog() public virtual returns(bytes32);

  function test3() external pure returns(uint) {
    return 100;
  }
}
