const EnergyToken = artifacts.require('EnergyToken');
const EnergyEscrow = artifacts.require('EnergyEscrow');

contract('EnergyToken', accounts => {
  let token;
  const creator = accounts[0];
  const producerPrivateKey = '0xc35fd6f2aace6e3e62f02844c846fe5a4837b8230d53ca3d417af64cb7c20457'
  const consumerPrivateKey = '0xc9099835a49ba3fff15f14ce62bbdbf464768a57b7a212291c9251d8306108e4'
  const producer = web3.eth.accounts.privateKeyToAccount(producerPrivateKey)
  const consumer = web3.eth.accounts.privateKeyToAccount(consumerPrivateKey)

  beforeEach(async function () {
    token = await EnergyToken.new('EnergyToken','BLK',{ from: creator });
  });

  it('has a name', async function () {
    const name = await token.name();
    assert.equal(name, 'EnergyToken');
  });

  it('mint and burn coin', async () => {
    await token.mint(producer.address,0);
    await token.mint(producer.address,1);
    let totalSupply = await token.totalSupply();
    assert.equal(totalSupply, 2);
    await token.mint(consumer.address,2);
    totalSupply = await token.totalSupply();
    assert.equal(totalSupply, 3);
    let balanceOf2 = await token.balanceOf(accounts[2])
    assert.equal(balanceOf2.toNumber(), 1);

    await token.burn(0);
     totalSupply = await token.totalSupply();
    assert.equal(totalSupply, 2);
    const balanceOf1 = await token.balanceOf(accounts[1])
    assert.equal(balanceOf1.toNumber(), 1);
  })

  it('energy escrow deposit', async () => {
    const escrow = await EnergyEscrow.new(token.address,{ from: creator });

    const producer = accounts[1];
    const consumer = consumer.address;

    await token.mint(producer.address,0);
    await token.mint(producer.address,1);
    // approve escrow as a contract that allows doing transfers
    await token.approve(escrow.address, 0, { from: producer.address });

    const depositValue = 10;
    // consumer (or market book order pays into escrow)
    const tx = await escrow.createPayment(0,consumer.address,{ from: consumer.address, value: depositValue })
    let escrowETHBalance = await web3.eth.getBalance(escrow.address);
    assert.equal(escrowETHBalance,depositValue)
  })

  it('energy escrow withdraw', async () => {
  })
})
