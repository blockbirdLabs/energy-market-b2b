var Migrations = artifacts.require("./Migrations.sol");
const EnergyToken = artifacts.require('EnergyToken');

module.exports = async (deployer) => {
  deployer.deploy(EnergyToken, "Energy", "BLK");
  deployer.deploy(Migrations);
};
