import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const GOOD_DOLLAR_CELO = "0x62B8B11039FcfE5aB0C56E502b1C372A3d2a9c7A";
const DEFAULT_OWNER = "0xa9FDeb97d2ACad58eC48d0406Ed2Eb6bB96CfDB5";

export default buildModule("TokenDistributorModule", (m) => {
  const rewardToken = m.getParameter("rewardToken", GOOD_DOLLAR_CELO);
  const initialOwner = m.getParameter("initialOwner", DEFAULT_OWNER);

  const distributor = m.contract("TokenDistributor", [rewardToken, initialOwner]);

  return { distributor };
});
