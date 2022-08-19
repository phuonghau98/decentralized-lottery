const { ethers, network } = require("hardhat");
const { readFile, writeFile } = require("fs/promises");

const FRONT_END_ADDRESSES_FILE =
  "../decentralized-lottery-ui/constants/contractAddresses.json";
const FRONT_END_ABI_FILE = "../decentralized-lottery-ui/constants/abi.json";

module.exports = async function () {
  if (process.env.UPDATE_FRONT_END) {
    console.log("Updating front end...");
    await updateContractAddresses();
    await updateAbi();
  }
};

async function updateContractAddresses() {
  const raffle = await ethers.getContract("Raffle");
  const currentAddresses = JSON.parse(
    await readFile(FRONT_END_ADDRESSES_FILE, "utf-8")
  );
  const chainId = network.config.chainId.toString();

  console.log(currentAddresses);
  if (
    chainId in currentAddresses &&
    !currentAddresses[chainId].includes(raffle.address)
  ) {
    currentAddresses[chainId].push(raffle.address);
  } else {
    currentAddresses[chainId] = [raffle.address];
  }

  await writeFile(FRONT_END_ADDRESSES_FILE, JSON.stringify(currentAddresses));
}

async function updateAbi() {
  const raffle = await ethers.getContract("Raffle");
  await writeFile(
    FRONT_END_ABI_FILE,
    raffle.interface.format(ethers.utils.FormatTypes.json)
  );
}

module.exports.tags = ["all", "frontend"];
