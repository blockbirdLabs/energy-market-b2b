const EnergyToken = artifacts.require('EnergyToken');

contract('EnergyToken', accounts => {
  let token;
  const creator = accounts[0];

  beforeEach(async function () {
    token = await EnergyToken.new({ from: creator });
  });

  it('has a name', async function () {
    const name = await token.name();
    assert.equal(name, 'SimpleToken');
  });
})
