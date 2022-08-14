const { network, ethers } = require("hardhat");
const { verify } = require("../utils/verify");
const {
  developmentChains,
  networkConfig,
} = require("../helper-hardhat-config");

const VRF_SUB_FUND_AMOUNT = ethers.utils.parseEther("2");

module.exports = async function ({ getNamedAccounts, deployments }) {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = network.config.chainId;

  let vrfCoordinatorV2Address, subscriptionId;
  if (developmentChains.includes(network.name)) {
    const vrfcoordinatorV2Mock = await ethers.getContract(
      "VRFCoordinatorV2Mock"
    );
  
    vrfCoordinatorV2Address = vrfcoordinatorV2Mock.address;
    const txResponse = await vrfcoordinatorV2Mock.createSubscription();
    const txRecepit = await txResponse.wait(1);
    subscriptionId = txRecepit.events[0].args.subId;
    // Fund the subscription
    // Usually, we would need the link token on a real network
    await vrfcoordinatorV2Mock.fundSubscription(
      subscriptionId,
      VRF_SUB_FUND_AMOUNT
    );
  } else {
    vrfCoordinatorV2Address = networkConfig[chainId].vrfCoordinatorV2;
    subscriptionId = networkConfig[chainId].subscriptionId;
  }


  const entranceFee = networkConfig[chainId].entranceFee;
  const gasLane = networkConfig[chainId].gasLane;
  const callbackGasLimit = networkConfig[chainId].callbackGasLimit;
  const interval = networkConfig[chainId].interval;

  const args = [
    vrfCoordinatorV2Address,
    entranceFee,
    gasLane,
    subscriptionId,
    callbackGasLimit,
    interval
  ];
  log('deployer', deployer)

  const raffle = await deploy("Raffle", {
    from: deployer,
    args: args,
    log: true,
    waitConfirmations: network.config.blockConfirmations || 1,
  });

  if (
    !developmentChains.includes(network.name) &&
    process.env.ETHERSCAN_API_KEY
  ) {
    log("Verifying...");
    await verify(raffle.address, args);
  }
  log("--------------------------");
};

module.exports.tags = ["all", "raffle"];
