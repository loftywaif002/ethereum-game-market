App = {
  web3Provider: null,
  contracts: {},

  init: function() {
    var codes = new Array(15);
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

  $.getJSON('Purchase.json', function(data) {
  // Get the necessary contract artifact file and instantiate it with truffle-contract
  var AdoptionArtifact = data;
  App.contracts.Purchase = TruffleContract(AdoptionArtifact);

  // Set the provider for our contract
  App.contracts.Purchase.setProvider(App.web3Provider);

  // Use our contract to retrieve and mark the adopted pets
  return App.markAdopted();
  });

    return App.bindEvents();
  },

  bindEvents: function() {
    $(document).on('click', '.btn-adopt', App.handleAdopt);
  },

  get_code: function() {
  var text = "";
  var possible = "ABCDEFG-HIJKLMN-OPQRSTU-VWXYZab-cdefghij-klmno-pqrst-uvwxyz0123456789";

  for (var i = 0; i < 12; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
},

  markAdopted: function(adopters, account) {

  var adoptionInstance;

  App.contracts.Purchase.deployed().then(function(instance) {
    adoptionInstance = instance;

  return adoptionInstance.getAdopters.call();
    }).then(function(adopters) {


  for (i = 0; i < adopters.length; i++) {
    if (adopters[i] !== '0x0000000000000000000000000000000000000000') {
       $('.panel-pet').eq(i).find('button').text('Success').attr('disabled', true);
        $('.panel-pet').eq(i).find(".code").text(`Code: ${App.get_code()}`);
     }
    }
  }).catch(function(err) {
   console.log(err.message);
  });

},

getBalance: function(address) {
  return web3.eth.getBalance(address, function (error, result) {
    if (!error) {
      console.log(`Buyer account balance: ${result.toNumber()}`);
    } else {
      console.error(error);
    }
  })
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
  console.log(`Buyer account address ${account}`);
  App.getBalance(account);

  App.contracts.Purchase.deployed().then(function(instance) {
    adoptionInstance = instance;

  // Execute adopt as a transaction by sending account
  return adoptionInstance.adopt(petId, {from: account});
       }).then(function(result) {
        console.log(`result is ${result}`);
    return adoptionInstance.charge({from: account, to: '0xc70fe1ab6d1c64153a18046b4112c43ce0d8dc2b', gas:'653165', gasPrice:'30', value: 1000}, function(err, result){
      if(err) console.log(`Error occured in charge function ${err.message}`);
      else{
        console.log(`Result is ${result}`);
      }
    });
    //web3.eth.sendTransaction({from: account, to: '0x63366c7073c4bbf53422ce7011c18312a31a3a4b', value: web3.toWei(1, "ether")});
      location.reload(true);
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
