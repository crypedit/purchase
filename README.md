Purchase
===
- [ ] 仅卖家新建合约
- [ ] 仅卖家在合约状态为新建状态时才能终止合约
- [ ] 仅买家确认购买
- [ ] 仅买家确认收货，合约才算完成

## 部署到 testnet (ropsten)
参考`truffle.js`中的注释的内容，部署该智能合约到`ropsten`即`http://45.76.197.72/:8545`上。
```
$ cp your_keystore_file ./keystore
$ printf "your_passphase" > ./pass
$ truffle deploy --network ropsten
```
**注意**

你的账户中部署时必须有点`ether`，那么如何获取testnet上的`ehter`呢？

