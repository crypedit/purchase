const HDWalletProvider = require("truffle-hdwallet-provider");

module.exports = {
  networks: {
    development: {
      host: "localhost",
      port: 9545,
      network_id: "*"
    },
    ropsten: {
      network_id: 0,
      gas: 1000000,
      provider: new HDWalletProvider(
        process.env.METAMASK_MNEMONIC,
        "https://ropsten.infura.io/LtCp6vYseQHwZxs0i94S"
      )
    }
  }
};
