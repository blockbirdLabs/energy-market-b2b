const EnergyToken = artifacts.require('EnergyToken');
const EnergyEscrow = artifacts.require('EnergyEscrow');

contract('EnergyToken', accounts => {
  let token;
  const creator = accounts[0];

  beforeEach(async function () {
    token = await EnergyToken.new('EnergyToken','BLK',{ from: creator });
  });

  it('has a name', async function () {
    const name = await token.name();
    assert.equal(name, 'EnergyToken');
  });

  it('mint and burn coin', async () => {
    await token.mint(accounts[1],0);
    await token.mint(accounts[1],1);
    let totalSupply = await token.totalSupply();
    assert.equal(totalSupply, 2);
    await token.mint(accounts[2],2);
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

  it.only('energy escrow', async () => {
    const escrow = await EnergyEscrow.new(token.address,{ from: creator });

    const producer = accounts[1];
    const consumer = accounts[2];

    await token.mint(producer,0);
    await token.mint(producer,1);
    // approve escrow as a contract that allows doing transfers
    await token.approve(escrow.address, 0, { from: producer });

    const depositValue = 10;
    // consumer (or market book order pays into escrow)
    const tx = await escrow.createPayment(0,consumer,{ from: consumer, value: depositValue })
    let escrowETHBalance = await web3.eth.getBalance(escrow.address);
    assert.equal(escrowETHBalance,depositValue)
  })

})
