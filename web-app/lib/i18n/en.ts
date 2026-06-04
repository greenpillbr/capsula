import type { Translations } from "./types";

export const en: Translations = {
  "meta.title": "Capsula",
  "meta.description":
    "Admin UI for Capsula Attendance distributions on Celo",
  "nav.home": "Home",
  "nav.createDistribution": "Create Distribution",
  "nav.claim": "Claim",
  "nav.configure": "Configure",
  "nav.settingsMenu": "Settings menu",
  "common.yes": "Yes",
  "common.no": "No",
  "common.loading": "…",
  "common.dash": "—",
  "common.confirmInWallet": "Confirm in wallet…",
  "common.success": "Success",
  "common.tryAgain": "Try again",
  "home.intro":
    "This is Capsula, the abstraction layer for the GreenPillBR community.",
  "claim.title": "Claim",
  "claim.description":
    "Claim your GPBR reward from the most recently created distribution during its active window.",
  "claim.latestDistribution": "Latest distribution",
  "claim.activeNow": "Active now",
  "claim.youClaimed": "You claimed",
  "claim.errorNoDistribution": "No distribution has been created yet.",
  "claim.errorConnectWallet": "Connect your wallet to claim",
  "claim.connectWalletNotice": "Connect your wallet to submit a claim.",
  "claim.buttonLabel": "Claim distribution",
  "claim.buttonPending": "Claiming…",
  "claim.buttonSuccess": "Claimed",
  "createDistribution.title": "Create Distribution",
  "createDistribution.connectWallet":
    "Connect your wallet to access this page.",
  "createDistribution.notAllowlisted":
    "Your wallet is not on the contract creator allowlist.",
  "createDistribution.contractPool": "Contract pool",
  "createDistribution.gpbrInContract": "GPBR in contract",
  "createDistribution.distributionsCreated": "Distributions created",
  "createDistribution.fundContract": "Fund contract",
  "createDistribution.fundDescription":
    "Transfer GPBR tokens to the Attendance contract.",
  "createDistribution.amountGpbr": "Amount (GPBR)",
  "createDistribution.errorInvalidAmount": "Enter a valid GPBR amount",
  "createDistribution.errorAmountZero": "Amount must be greater than zero",
  "createDistribution.errorInvalidAmountGeneric": "Invalid amount",
  "createDistribution.fundButton": "Fund contract",
  "createDistribution.fundButtonPending": "Funding…",
  "createDistribution.fundButtonSuccess": "Funded",
  "createDistribution.createDistribution": "Create distribution",
  "createDistribution.createDescription":
    "Opens a new claim window using the contract's configured reward amount and period. Only allowlisted creators can succeed on-chain.",
  "createDistribution.maxClaimers": "Max claimers (0 = unlimited)",
  "createDistribution.errorInvalidMaxClaimers":
    "Enter a valid non-negative integer (0 = unlimited)",
  "createDistribution.createButton": "Create distribution",
  "createDistribution.createButtonPending": "Creating…",
  "createDistribution.createButtonSuccess": "Distribution created",
  "configure.title": "Configure",
  "configure.connectWallet": "Connect your wallet to access this page.",
  "configure.notAuthorized":
    "Your wallet is not authorized to configure this contract.",
  "configure.contractConfig": "Contract config",
  "configure.configDescription":
    "Set the default reward amount and claim window length (in blocks) for new distributions. Only the contract owner can submit this on-chain.",
  "configure.notOwnerConfig":
    "Your wallet is not the contract owner. Config updates will fail on-chain.",
  "configure.amountGpbr": "Amount (GPBR)",
  "configure.periodBlocks": "Period (blocks)",
  "configure.errorInvalidAmount": "Enter a valid GPBR amount",
  "configure.errorInvalidPeriod": "Enter a valid period in blocks",
  "configure.errorAmountPeriodZero":
    "Amount and period must be greater than zero",
  "configure.errorInvalidAmountOrPeriod": "Invalid amount or period",
  "configure.saveConfig": "Save config",
  "configure.saveConfigPending": "Saving…",
  "configure.saveConfigSuccess": "Config saved",
  "configure.creatorAllowlist": "Creator allowlist",
  "configure.allowlistDescription":
    "Manage which addresses can create and cancel distributions. Only the contract owner can modify the allowlist on-chain.",
  "configure.notOwnerAllowlist":
    "Your wallet is not the contract owner. Allowlist changes will fail on-chain.",
  "configure.address": "Address",
  "configure.isCreator": "isCreator:",
  "configure.errorInvalidAddress": "Enter a valid address",
  "configure.addCreator": "Add creator",
  "configure.addCreatorPending": "Adding…",
  "configure.addCreatorSuccess": "Creator added",
  "configure.removeCreator": "Remove creator",
  "configure.removeCreatorPending": "Removing…",
  "configure.removeCreatorSuccess": "Creator removed",
};
