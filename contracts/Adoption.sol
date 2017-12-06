pragma solidity ^0.4.4;

contract Adoption {

  address[16] public adopters;
  address private owner; //this stores the contract oners address
  

  //Constructor 
  //gets automatically called only once with owners address when contract is first deployed 
  function Adoption () public{
	owner = msg.sender;
  }

  // Adopting a pet
function adopt(uint petId) public returns (uint) {
  require(petId >= 0 && petId <= 15);

  adopters[petId] = msg.sender;

  return petId;
}


// Retrieving the adopters
function getAdopters() public returns (address[16]) {
  return adopters;
}

function charge() payable returns (bool) {
  return true;
}


}