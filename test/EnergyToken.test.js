const Web3Utils = require('web3-utils'); // need a more recent version of web3 for the signaatures
const Web3Eth = require('web3-eth'); // need a more recent version of web3 for the signaatures

const EnergyToken = artifacts.require('EnergyToken');
const EnergyEscrow = artifacts.require('EnergyEscrow');

contract('EnergyToken', accounts => {

  const creatorPrivateKey = '0x1546e1a27353b3ab3dce3d94faf150cd1f5b86c25c04ae8191d13ec7a844e479'
  const producerPrivateKey = '0xc35fd6f2aace6e3e62f02844c846fe5a4837b8230d53ca3d417af64cb7c20457'
  const consumerPrivateKey = '0xc9099835a49ba3fff15f14ce62bbdbf464768a57b7a212291c9251d8306108e4'
  const distributorPrivateKey = '0x169187e44a8231cfd22b25e393b542fecb93b03dead9806540aab5dcb6959b73'

  const web3Eth = new Web3Eth(web3.currentProvider);
  const creator = web3Eth.accounts.privateKeyToAccount(creatorPrivateKey);
  const producer = web3Eth.accounts.privateKeyToAccount(producerPrivateKey)
  const consumer = web3Eth.accounts.privateKeyToAccount(consumerPrivateKey)
  const distributor = web3Eth.accounts.privateKeyToAccount(distributorPrivateKey)

  let token;
  beforeEach(async function () {
    token = await EnergyToken.new('EnergyToken','BLK',{ from: creator.address });
  });

  it('has a name', async function () {
    const name = await token.name();
    assert.equal(name, 'EnergyToken');
  });

  it('mint and burn coin', async () => {
    await token.mint(producer.address);
    await token.mint(producer.address);
    let totalSupply = await token.totalSupply();
    assert.equal(totalSupply, 2);
    await token.mint(consumer.address);
    totalSupply = await token.totalSupply();
    assert.equal(totalSupply, 3);
    let balanceOf2 = await token.balanceOf(consumer.address)
    assert.equal(balanceOf2.toNumber(), 1);

    await token.burn(0);
     totalSupply = await token.totalSupply();
    assert.equal(totalSupply, 2);
    const balanceOf1 = await token.balanceOf(producer.address)
    assert.equal(balanceOf1.toNumber(), 1);
  })

  it('energy escrow deposit', async () => {
    const escrow = await EnergyEscrow.new(token.address,{ from: creator.address });

    await token.mint(producer.address);
    // approve escrow as a contract that allows doing transfers
    await token.approve(escrow.address, 0, { from: producer.address });

    const depositValue = 10;
    // consumer (or market book order pays into escrow)
    const tx = await escrow.createPayment(0, distributor.address,consumer.address,{ from: consumer.address, value: depositValue })
    let escrowETHBalance = await web3Eth.getBalance(escrow.address);
    assert.equal(escrowETHBalance,depositValue)
    let escrowTokenBalance = await token.balanceOf(escrow.address)
    assert.equal(escrowTokenBalance,1) // check escrow token balance
  })

  it.only('energy escrow withdraw', async () => {
    const escrow = await EnergyEscrow.new(token.address,{ from: creator.address });

    await token.mint(producer.address);
    // approve escrow as a contract that allows doing transfers
    await token.approve(escrow.address, 0, { from: producer.address });

    const depositValue = 10;
    // consumer (or market book order pays into escrow)
    let txParam = { from: consumer.address, value: depositValue };
    await escrow.createPayment(0,consumer.address, distributor.address, txParam)
    let escrowETHBalance = await web3Eth.getBalance(escrow.address);
    assert.equal(escrowETHBalance,depositValue) // check escrow funds balance
    let escrowTokenBalance = await token.balanceOf(escrow.address)
    assert.equal(escrowTokenBalance,1) // check escrow token balance

    let producerETHBalanceBeforePayment = await web3Eth.getBalance(producer.address); // producer ETH before

    txParam = { from: consumer.address };
    await escrow.withdrawPayment(0, txParam)

    escrowETHBalance = await web3Eth.getBalance(escrow.address);
    assert.equal(escrowETHBalance,0) // check escrow funds balance
    escrowTokenBalance = await token.balanceOf(escrow.address)
    assert.equal(escrowTokenBalance,0) // check escrow token balance
    let producerETHBalance = await web3Eth.getBalance(producer.address);
    producerETHBalance = Web3Utils
      .toBN(producerETHBalance)
      .sub(Web3Utils.toBN(producerETHBalanceBeforePayment))
      .toString()
    assert.equal(producerETHBalance,depositValue) // check producer funds balance
  })

  it('test signature', async () => {
    const tokenId = 0;
    const concatHash = Web3Utils.soliditySha3(tokenId)
    const msg = new Buffer(concatHash.slice(2),16)

    const prefix = new Buffer("\x19Ethereum Signed Message:\n");
    const signature = producer.sign(msg);

    const prefixedMsg = Web3Utils.sha3(Buffer.concat([prefix, new Buffer(String(msg.length)), msg]));

    const escrow = await EnergyEscrow.new(token.address,{ from: creator.address });
    const recoveredAddr = await escrow.testRecovery.call(prefixedMsg,signature.v,signature.r,signature.s)

    assert.equal(producer.address.toLowerCase(),recoveredAddr.toLowerCase())
  })
})
