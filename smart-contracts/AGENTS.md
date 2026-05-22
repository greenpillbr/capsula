# AGENTS.md

This file provides guidance to agents when working with code in smart-contracts directory.

## Technology Stack
    - **Solidity**  Smart contract language
    - **Hardhat**  Main ethereum framework
    - **Foundry**  Local chain for live testing
    - **OpenZeppelin Contracts** - Libraries for secure smart contract development

## Key Directories
    - **contracts** - Smart contracts
    - **test** - Test files
    - **scripts** - Scripts for deployment and testing
    - **ignition** - Ignition modules for deployment

## Networks
    - Celo Network - ChainID: 42220 - BlockTime: 1 second
    - Local live test chain - fork from Celo Network

## Token Addresses
    - GPBR - 6 decimals - 0xd832B2F117db51021Ad0387c17182796DBEB69df

## Smart Contract development instructions
    - Be consice and don't overengineer the code we need simple gas-effective yet secure contracts


## Addresses
    - Admin and contract owner, deployer: 0xa9FDeb97d2ACad58eC48d0406Ed2Eb6bB96CfDB5
    - General User: 0xb558a17bB4C39BC92296a20BA538D11B8201db95

## Commands

### Local fork (anvil, Celo)
```bash
anvil --fork-url https://forno.celo.org --chain-id 42220
```

### Tests
```bash
bunx hardhat test                            # all unit + solidity tests
bunx hardhat test nodejs test/Attendance.ts  # Attendance unit tests
GPBR_WHALE=0x... bunx hardhat test nodejs test/Attendance.live.ts   # live fork tests
```

### Deploy (Ignition)
```bash
bunx hardhat ignition deploy ignition/modules/Attendance.ts --network localFork
bunx hardhat ignition deploy ignition/modules/Attendance.ts --network celo
```

### Scripts (require ATTENDANCE_ADDRESS, default NETWORK=localFork)
```bash
AMOUNT=3000000 bun scripts/fund-attendance.ts
AMOUNT=1000000 PERIOD=5400 bun scripts/set-config.ts
MAX_CLAIMERS=0 bun scripts/create-distribution.ts
MAX_CLAIMERS=50 bun scripts/create-distribution.ts
DISTRIBUTION_ID=0 bun scripts/cancel-distribution.ts
ACTION=add ACCOUNT=0x... bun scripts/manage-allowlist.ts
ACTION=remove ACCOUNT=0x... bun scripts/manage-allowlist.ts
DISTRIBUTION_ID=0 USER_INDEX=1 bun scripts/claim.ts
AMOUNT=2000000 bun scripts/withdraw.ts
bun scripts/read-state.ts
```
