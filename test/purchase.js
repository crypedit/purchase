var Purchase = artifacts.require("./Purchase.sol");
var expectThrow = require('./expectThrow');

contract('Purchase', function(accounts) {
    var seller = accounts[0];
    var buyer = accounts[1];

    it("should be able to create a purchase contract", function() {
        var purchase;
        return Purchase.new({from: seller, value: 2}).then(function(instance) {
            purchase = instance;
            return purchase.seller();
        }).then(function(theSeller) {
            assert.equal(theSeller, seller, "seller wasn't the contract creator");
            return purchase.value();
        }).then(function(initialValue) {
            assert.equal(initialValue.valueOf(), 1, "the purchase contract hasn't received half of passed in value");
            return purchase.state();
        }).then(function(state) {
            var Created = 0;
            assert.equal(state.valueOf(), Created, "initial state wasn't Created");
        });
    });

    it("should be able to confirm a purchase", function() {
        var purchase;
        var watcher;
        return Purchase.new({from: buyer, value: 2}).then(function(instance) {
            purchase = instance;
            var nonDoubleInitialValue = 1; // initialValue is 1 wei here.
            return expectThrow(purchase.confirmPurchase({from: buyer, value: nonDoubleInitialValue}));
        }).then(function() {
            var doubleInitialValue = 2;
            watcher = purchase.PurchaseConfirmed();
            return purchase.confirmPurchase({from: buyer, value: doubleInitialValue});
        }).then(function() {
            return watcher.get();
        }).then(function(events) {
            assert.equal(events.length, 1, "the extra event are triggered");
            assert.equal(events[0].event,  "PurchaseConfirmed");
            return purchase.state();
        }).then(function(state) {
            var Locked = 1;
            assert.equal(state, Locked, "state wasn't Locked");
            return purchase.buyer();
        }).then(function(theBuyer) {
            assert.equal(theBuyer, buyer, "buyer wasn't account_1");
        }).then(function() {
            var doubleInitialValue = 2;
            promise = purchase.confirmPurchase({from: buyer, value: doubleInitialValue});
            return expectThrow(promise, "purchase wasn't stay in Created status when confirmPurchase");
        });
    });

    it("should be able to confirm received", function() {
        var purchase;
        var watcher;
        return Purchase.new({from: seller, value: 2}).then(function(instance) {
            purchase = instance;
            watcher = purchase.ItemReceived();
            return purchase.confirmPurchase({from: buyer, value: 2});
        }).then(function() {
            return purchase.buyer();
        }).then(function(theBuyer) {
            assert.equal(theBuyer, buyer, "buyer wasn't account_1");
            var notBuyer = accounts[2];
            var promise = purchase.confirmReceived({from: notBuyer});
            return expectThrow(promise, "only buyer can confirmReceived");
        }).then(function() {
            return purchase.confirmReceived({from: buyer});
        }).then(function() {
            return watcher.get();
        }).then(function(events) {
            assert.equal(events.length, 1, "the extra event are triggered");
            assert.equal(events[0].event, "ItemReceived");
            return purchase.state(); 
        }).then(function(state) {
            var Inactive = 2;
            assert.equal(state, Inactive, "state wasn't Inactive");
            return web3.eth.getBalance(purchase.address);
        }).then(function(balance) {
            assert.equal(balance.valueOf(), 0, "purchase balance wasn't cleanup");
        }).then(function() {
            promise = purchase.confirmReceived({from: buyer});
            return expectThrow(promise, "purchase wasn't stay in Locked status when confirmReceived");
        });
    });

    it("should be able to abort purchase and reclaim the ether", function() {
        var purchase;
        var watcher;
        var notSeller = accounts[2];
        return Purchase.new({from: seller, value: 2}).then(function(instance) {
            purchase = instance;
            watcher = purchase.Aborted();
            return expectThrow(purchase.abort({from: notSeller}), "only seller can abort purchase");
        }).then(function() {
            return purchase.abort({from: seller});
        }).then(function() {
            return watcher.get();
        }).then(function(events) {
            assert.equal(events.length, 1, "the extra event are triggered");
            assert.equal(events[0].event, "Aborted");
            return purchase.state(); 
        }).then(function(state) {
            var Inactive = 2;
            assert.equal(state, Inactive, "state wasn't Inactive");
            return web3.eth.getBalance(purchase.address);
        }).then(function(balance) {
            assert.equal(balance.valueOf(), 0, "purchase balance wasn't cleanup");
        }).then(function() {
            promise = purchase.abort({from: seller});
            return expectThrow(promise, "purchase wasn't stay in Created status when abort");
        });
    });

});

