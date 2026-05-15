import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const GPBR_CELO = "0xd832B2F117db51021Ad0387c17182796DBEB69df";
const DEFAULT_OWNER = "0xa9FDeb97d2ACad58eC48d0406Ed2Eb6bB96CfDB5";

export default buildModule("AttendanceModule", (m) => {
  const gpbr = m.getParameter("gpbrAddress", GPBR_CELO);
  const initialOwner = m.getParameter("initialOwner", DEFAULT_OWNER);

  const attendance = m.contract("Attendance", [gpbr, initialOwner]);

  return { attendance };
});
