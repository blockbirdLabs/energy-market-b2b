const Web3Utils = require('web3-utils'); // need a more recent version of web3 for the signaatures
const Web3Eth = require('web3-eth'); // need a more recent version of web3 for the signaatures

const EnergyToken = artifacts.require('EnergyToken');
const EnergyEscrow = artifacts.require('EnergyEscrow');

contract('EnergyToken', accounts => {

  const creatorPrivateKey = '0x1546e1a27353b3ab3dce3d94faf150cd1f5b86c25c04ae8191d13ec7a844e479'
  const producerPrivateKey = '0xc35fd6f2aace6e3e62f02844c846fe5a4837b8230d53ca3d417af64cb7c20457'
  const supplierPrivateKey = '0x169187e44a8231cfd22b25e393b542fecb93b03dead9806540aab5dcb6959b73'

  const web3Eth = new Web3Eth(web3.currentProvider);
  const creator = web3Eth.accounts.privateKeyToAccount(creatorPrivateKey);
  const producer = web3Eth.accounts.privateKeyToAccount(producerPrivateKey)
  const supplier = web3Eth.accounts.privateKeyToAccount(supplierPrivateKey)

  let token;
  beforeEach(async function () {
    token = await EnergyToken.new('EnergyToken','BLK',{ from: creator.address });
  });

  it('has a name', async function () {
    const name = await token.name();
    assert.equal(name, 'EnergyToken');
  });

  it('mint and burn coin', async () => {
    await token.mint(producer.address, 'descriptionA');
    await token.mint(producer.address, 'descriptionB');
    let totalSupply = await token.totalSupply();
    assert.equal(totalSupply, 2);
    await token.mint(supplier.address, 'descriptionC');
    totalSupply = await token.totalSupply();
    assert.equal(totalSupply, 3);
    let balanceOf2 = await token.balanceOf(supplier.address)
    assert.equal(balanceOf2.toNumber(), 1);

    const tokenId = await token.tokenIdByURI.call('descriptionA');
    await token.burn(tokenId);
     totalSupply = await token.totalSupply();
    assert.equal(totalSupply, 2);
    const balanceOf1 = await token.balanceOf(producer.address)
    assert.equal(balanceOf1.toNumber(), 1);
  })

  it('energy escrow deposit', async () => {
    const escrow = await EnergyEscrow.new(token.address,{ from: creator.address });

    await token.mint(producer.address, 'descriptionA');
    const tokenId = await token.tokenIdByURI.call('descriptionA');
    // approve escrow as a contract that allows doing transfers
    await token.approve(escrow.address, tokenId, { from: producer.address });

    const depositValue = 10;
    const tx = await escrow.createPayment(tokenId, supplier.address,{ from: supplier.address, value: depositValue })
    let escrowETHBalance = await web3Eth.getBalance(escrow.address);
    assert.equal(escrowETHBalance,depositValue)
    let escrowTokenBalance = await token.balanceOf(escrow.address)
    assert.equal(escrowTokenBalance,1) // check escrow token balance
  })

  it('energy escrow withdraw', async () => {
    const escrow = await EnergyEscrow.new(token.address,{ from: creator.address });

    const tokenDescription = 'descriptionA';
    const tokenURI = Web3Utils.soliditySha3(tokenDescription)
    await token.mint(producer.address, tokenURI);

     const tokenId = await token.tokenIdByURI(tokenURI);
    // approve escrow as a contract that allows doing transfers
    await token.approve(escrow.address, tokenId, { from: producer.address });

    const depositValue = 10;
    // supplier (or market book order pays into escrow)
    let txParam = { from: supplier.address, value: depositValue };
    await escrow.createPayment(tokenId, supplier.address, txParam)
    let escrowETHBalance = await web3Eth.getBalance(escrow.address);
    assert.equal(escrowETHBalance,depositValue) // check escrow funds balance
    let escrowTokenBalance = await token.balanceOf(escrow.address)
    assert.equal(escrowTokenBalance,1) // check escrow token balance

    let producerETHBalanceBeforePayment = await web3Eth.getBalance(producer.address); // producer ETH before

    const signature = producer.sign(tokenURI); // producer signs the tokenDescription
    txParam = {from: producer.address, gasPrice:1} // needed to specify the gasPrice for the test
    const withdrawTx = await escrow.withdrawWithProof(tokenDescription,signature.signature,txParam);

    escrowETHBalance = await web3Eth.getBalance(escrow.address);
    assert.equal(escrowETHBalance,0) // check escrow funds balance
    escrowTokenBalance = await token.balanceOf(escrow.address)
    assert.equal(escrowTokenBalance,0) // check escrow token balance
    let producerETHBalance = await web3Eth.getBalance(producer.address);
    producerETHBalance = Web3Utils
      .toBN(producerETHBalance)
      .sub(Web3Utils.toBN(producerETHBalanceBeforePayment))
      .add(Web3Utils.toBN(withdrawTx.receipt.gasUsed))
      .toString()
    assert.equal(producerETHBalance,depositValue) // check producer funds balance
  })
})
