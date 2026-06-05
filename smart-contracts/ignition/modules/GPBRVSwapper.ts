import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

// Celo mainnet addresses (see smart-contracts/AGENTS.md and the Notion Pix spec).
const GPBRV_CELO = "0x6ec3d6e693526108990c6d5cbd2195e051321d32";
const BRLM_CELO = "0xe8537a3d056da446677b9e9d6c5db704eaab4787";
const USDM_CELO = "0x765de816845861e75a25fca122bb6898b8b1282a";
const SARAFU_POOL_CELO = "0xD12F1aE0C018210d18F6cB01cD6c7bd669eF7529";
const MENTO_ROUTER_CELO = "0x4861840C2EfB2b98312B0aE34d86fD73E8f9B6f6";
const MENTO_FACTORY_CELO = "0x22abd4ADF6aab38aC1022352d496A07Acee5aCB3";

export default buildModule("GPBRVSwapperModule", (m) => {
  const gpbrv = m.getParameter("gpbrvAddress", GPBRV_CELO);
  const brlm = m.getParameter("brlmAddress", BRLM_CELO);
  const usdm = m.getParameter("usdmAddress", USDM_CELO);
  const sarafuPool = m.getParameter("sarafuPoolAddress", SARAFU_POOL_CELO);
  const mentoRouter = m.getParameter("mentoRouterAddress", MENTO_ROUTER_CELO);
  const mentoFactory = m.getParameter("mentoFactoryAddress", MENTO_FACTORY_CELO);

  const swapper = m.contract("GPBRVSwapper", [
    gpbrv,
    brlm,
    usdm,
    sarafuPool,
    mentoRouter,
    mentoFactory,
  ]);

  return { swapper };
});
