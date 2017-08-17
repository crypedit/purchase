var Purchase = artifacts.require("./Purchase.sol");

contract('Purchase', function(accounts) {
    var account_0 = accounts[0];
    var account_1 = accounts[1];
    it("should be able to create a purchase contract", function() {
        var purchase;
        return Purchase.new({from: account_0, value: 2}).then(function(instance) {
            purchase = instance;
            return purchase.seller();
        }).then(function(seller) {
            assert.equal(seller, account_0, "seller wasn't the contract creator");
            return purchase.value();
        }).then(function(val) {
            assert.equal(val.valueOf(), 1, "the purchase contract hasn't received 1 wei");
            return purchase.state();
        }).then(function(state) {
            var Created = 0;
            assert.equal(state.valueOf(), Created, "initial state wasn't Created");
        });
    });

    it("should be able to confirm a purchase", function() {
        var purcahse;
        var watcher;
        return Purchase.new({from: account_0, value: 2}).then(function(instance) {
            purcahse = instance;
            watcher = purcahse.PurchaseConfirmed();
            return purcahse.confirmPurchase({from: account_1, value: 2});
        }).then(function() {
            return watcher.get();
        }).then(function(events) {
            assert.equal(events.length, 1);
            assert.equal(events[0].event,  "PurchaseConfirmed");
            return purcahse.state();
        }).then(function(state) {
            var Locked = 1;
            assert.equal(state, Locked, "state wasn't Locked");
            return purcahse.buyer();
        }).then(function(buyer) {
            assert.equal(buyer, account_1, "buyer wasn't account_1");
        });
    });

    it("should be able to confirm received", function() {
        var purcahse;
        var watcher;
        return Purchase.new({from: account_0, value: 2}).then(function(instance) {
            purcahse = instance;
            return purcahse.confirmPurchase({from: account_1, value: 2});
        }).then(function() {
            return purcahse.buyer();
        }).then(function(buyer) {
            assert.equal(buyer, account_1, "buyer wasn't account_1");
            watcher = purcahse.ItemReceived();
            return purcahse.confirmReceived({from: buyer});
        }).then(function() {
            return watcher.get();
        }).then(function(events) {
            assert.equal(events.length, 1);
            assert.equal(events[0].event, "ItemReceived");
            return purcahse.state(); 
        }).then(function(state) {
            var Inactive = 2;
            assert.equal(state, Inactive, "state wasn't Inactive");
            return web3.eth.getBalance(purcahse.address);
        }).then(function(balance) {
            assert.equal(balance.valueOf(), 0, "purchase balance wasn't cleanup");
        });
    });

    it("should be able to abort received", function() {
        var purcahse;
        var watcher;
        return Purchase.new({from: account_0, value: 2}).then(function(instance) {
            purcahse = instance;
            watcher = purcahse.Aborted();
            return purcahse.abort({from: account_0});
        }).then(function() {
            return watcher.get();
        }).then(function(events) {
            assert.equal(events.length, 1);
            assert.equal(events[0].event, "Aborted");
            return purcahse.state(); 
        }).then(function(state) {
            var Inactive = 2;
            assert.equal(state, Inactive, "state wasn't Inactive");
            return web3.eth.getBalance(purcahse.address);
        }).then(function(balance) {
            assert.equal(balance.valueOf(), 0, "purchase balance wasn't cleanup");
        });
    });

});

