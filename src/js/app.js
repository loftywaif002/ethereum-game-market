App = {
  web3Provider: null,
  contracts: {},

  init: function() {
    // Load pets.
    $.getJSON('../pets.json', function(data) {
      var petsRow = $('#petsRow');
      var petTemplate = $('#petTemplate');

      for (i = 0; i < data.length; i ++) {
        petTemplate.find('.panel-title').text(data[i].name);
        petTemplate.find('img').attr('src', data[i].picture);
        petTemplate.find('.oprice').text(data[i].oprice);
        petTemplate.find('.discount').text(data[i].discount);
        petTemplate.find('.price').text(data[i].price);
        petTemplate.find('.btn-adopt').attr('data-id', data[i].id);

        petsRow.append(petTemplate.html());
      }
    });

    return App.initWeb3();
  },

  initWeb3: function() {
    // Is there is an injected web3 instance?
     if (typeof web3 !== 'undefined') {
        App.web3Provider = web3.currentProvider;
     }
    else{
    //If no injected web3 instance is detected, fallback to the TestRPC
    App.web3Provider = new Web3.providers.HttpProvider('http://localhost:8545');
     }
    web3 = new Web3(App.web3Provider);

    return App.initContract();
  },

  initContract: function() {

  $.getJSON('Adoption.json', function(data) {
  // Get the necessary contract artifact file and instantiate it with truffle-contract
  var AdoptionArtifact = data;
  App.contracts.Adoption = TruffleContract(AdoptionArtifact);

  // Set the provider for our contract
  App.contracts.Adoption.setProvider(App.web3Provider);

  // Use our contract to retrieve and mark the adopted pets
  return App.markAdopted();
  });

    return App.bindEvents();
  },

  bindEvents: function() {
    $(document).on('click', '.btn-adopt', App.handleAdopt);
  },

  markAdopted: function(adopters, account) {

  var adoptionInstance;

  App.contracts.Adoption.deployed().then(function(instance) {
    adoptionInstance = instance;

  return adoptionInstance.getAdopters.call();
    }).then(function(adopters) {
  for (i = 0; i < adopters.length; i++) {
    if (adopters[i] !== '0x0000000000000000000000000000000000000000') {
       $('.panel-pet').eq(i).find('button').text('Success').attr('disabled', true);
     }
    }
  }).catch(function(err) {
   console.log(err.message);
  });

},


handleAdopt: function() {
    event.preventDefault();

    var petId = parseInt($(event.target).data('id'));

    var adoptionInstance;



  web3.eth.getAccounts(function(error, accounts) {
  if (error) {
    console.log(error);
  }


  var account = accounts[0];
  console.log(accounts);
    

  App.contracts.Adoption.deployed().then(function(instance) {
    adoptionInstance = instance;

  // Execute adopt as a transaction by sending account
  return adoptionInstance.adopt(petId, {from: account});
       }).then(function(result) {
    //return adoptionInstance.charge({from: account, to: '0xbba101a2cdfb9de4e67e3321f164ce5830f24e66', gas:'653165', gasPrice:'30', value: web3.toWei(1, "ether")});    
    //web3.eth.sendTransaction({from: account, to: '0xbba101a2cdfb9de4e67e3321f164ce5830f24e66', value: web3.toWei(1, "ether")}, function(result){console.log(result);});    
      return App.markAdopted();
    }).catch(function(err) {
    console.log(err.message);
     });
   });

  }

};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
