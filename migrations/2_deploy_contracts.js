var GrantRegistryContract = artifacts.require("GrantRegistry");
var GrantRoundsContract = artifacts.require("GrantRounds");

var GrantOwner = "0x6b303d46ed23a9ea9903d66de4619c4682c90682";
var GrantRoundOwner = "0x6b303d46ed23a9ea9903d66de4619c4682c90682";
var GrantID = "0x7de9759ece89ca92c75f8624d25697132d9fea82f68d5dc9c254836340182b87";
var GrantRoundID = "0x7de9759ece89ca92c75f8624d25697132d9fea82f68d5dc9c254836340182b87";
var MetaPtr = "https://phutchins.eth/mymetadata.json";
var RoundMetaPtr = "https://phutchins.eth/mymetadata.json";

module.exports = function(deployer) {
  deployer.deploy(GrantRegistryContract, GrantOwner, GrantID, MetaPtr);
  deployer.deploy(GrantRoundsContract, GrantRoundOwner, GrantRoundID, RoundMetaPtr);
};
