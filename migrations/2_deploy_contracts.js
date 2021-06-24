var GrantRegistryContract = artifacts.require("GrantRegistry");
var GrantRoundsContract = artifacts.require("GrantRounds");

var GrantOwner = "0x10dFA1184E605e73A1962f3ec633C6ff07B53673";
var GrantRoundOwner = "0x10dFA1184E605e73A1962f3ec633C6ff07B53673";
var GrantID = "0x7de9759ece89ca92c75f8624d25697132d9fea82f68d5dc9c254836340182b87";
var GrantRoundID = "0x7de9759ece89ca92c75f8624d25697132d9fea82f68d5dc9c254836340182b87";
var MetaPtr = "https://phutchins.eth/mymetadata.json";
var RoundMetaPtr = "https://phutchins.eth/mymetadata.json";

module.exports = function(deployer) {
  deployer.deploy(GrantRegistryContract, GrantOwner, GrantID, MetaPtr);
  deployer.deploy(GrantRoundsContract, GrantRoundOwner, GrantRoundID, RoundMetaPtr);
};
