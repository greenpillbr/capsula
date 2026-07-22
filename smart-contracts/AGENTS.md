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
    - GPBRV - 6 decimals - 0x6ec3d6e693526108990c6d5cbd2195e051321d32
    - BRLM - 18 decimals - 0xe8537a3d056da446677b9e9d6c5db704eaab4787
    - USDM - 18 decimals - 0x765de816845861e75a25fca122bb6898b8b1282a
    - Good Dollar (G$) - 18 decimals - 0x62B8B11039FcfE5aB0C56E502b1C372A3d2a9c7A

## GPBRVSwapper external contracts (Celo)
    - Sarafu swap pool - 0xD12F1aE0C018210d18F6cB01cD6c7bd669eF7529
    - Mento router - 0x4861840C2EfB2b98312B0aE34d86fD73E8f9B6f6
    - Mento factory - 0x22abd4ADF6aab38aC1022352d496A07Acee5aCB3

## GPBRVSwapper notes
    - The two Sarafu legs are asymmetric:
        - GPBRV (6) -> BRLM (18), used by `withdraw`/`withdrawWithMinipay`: plain 3-arg `withdraw`.
        - BRLM (18) -> GPBRV (6), used by `deposit`/`depositWithMinipay`: **must** use the
          `withdraw(out, in, value, true)` deductFee overload. The 3-arg form mixes fee units
          and reverts with ERR_BALANCE whenever the input token has more decimals than the output.
    - The MiniPay link can be created from either end and both write the same two mappings:
        - `configure(minipay)` — called by the main wallet.
        - `configureFromMinipay(user)` — called by the MiniPay wallet; the only option for a
          user browsing inside the MiniPay app. Reverts `UserAlreadyLinked` when the target
          user is already linked to a different MiniPay.
    - `withdrawWithMinipay` reads `userToMinipay[msg.sender]` and pulls GPBRV from the caller,
      so it can only ever be sent by the main wallet — never from inside MiniPay.

## Smart Contract development instructions
    - Be consice and don't overengineer the code we need simple gas-effective yet secure contracts
    - After implementing a new feature or changing contract behavior, always check whether tests need updating:
        - Unit tests in `test/*.ts` (mocked dependencies)
        - Live fork tests in `test/*.live.ts` (real Celo pool/router on anvil)
        - Scripts in `scripts/` and docs in `README.MD` / this file when CLI usage changes


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
bunx hardhat test                              # all unit + solidity tests
bunx hardhat test nodejs test/TokenDistributor.ts    # TokenDistributor unit tests
bunx hardhat test nodejs test/GPBRVSwapper.ts  # GPBRVSwapper unit tests (mocked pool/router)
bunx hardhat test nodejs test/TokenDistributor.live.ts                          # live fork tests
bunx hardhat test nodejs test/GPBRVSwapper.live.ts      # live fork tests
```

### Deploy (Ignition)

#### Local fork
```bash
bunx hardhat ignition deploy ignition/modules/Attendance.ts --network localFork
bunx hardhat ignition deploy ignition/modules/TokenDistributor.ts --network localFork
bunx hardhat ignition deploy ignition/modules/GPBRVSwapper.ts --network localFork
```

#### Celo
```bash
bunx hardhat ignition deploy ignition/modules/Attendance.ts \
  --network celo \
  --default-sender 0x22682c3d3848294fF9bCBf3F0DDF48A605446B56 

bunx hardhat ignition deploy ignition/modules/TokenDistributor.ts \
  --network celo \
  --default-sender 0x22682c3d3848294fF9bCBf3F0DDF48A605446B56

bunx hardhat ignition deploy ignition/modules/GPBRVSwapper.ts \
  --network celo \
  --default-sender 0x22682c3d3848294fF9bCBf3F0DDF48A605446B56
```

#### Redeploying GPBRVSwapper on Celo

The default `chain-42220` deployment already records `GPBRVSwapperModule#GPBRVSwapper`, so
re-running the module there reconciles as "already deployed". Pass a fresh `--deployment-id`
to get a new contract:

```bash
bunx hardhat ignition deploy ignition/modules/GPBRVSwapper.ts \
  --network celo \
  --deployment-id gpbrv-swapper-v2 \
  --default-sender 0x22682c3d3848294fF9bCBf3F0DDF48A605446B56

bunx hardhat ignition verify gpbrv-swapper-v2
```

Direct verify fallback (needs `CELOSCAN_API_KEY`), constructor args in order —
gpbrv, brlm, usdm, sarafuPool, mentoRouter, mentoFactory:

```bash
bunx hardhat verify --network celo <DEPLOYED_ADDRESS> \
  0x6ec3d6e693526108990c6d5cbd2195e051321d32 \
  0xe8537a3d056da446677b9e9d6c5db704eaab4787 \
  0x765de816845861e75a25fca122bb6898b8b1282a \
  0xD12F1aE0C018210d18F6cB01cD6c7bd669eF7529 \
  0x4861840C2EfB2b98312B0aE34d86fD73E8f9B6f6 \
  0x22abd4ADF6aab38aC1022352d496A07Acee5aCB3
```

Afterwards set `NEXT_PUBLIC_GPBRV_SWAPPER_ADDRESS` in the web-app to the new address.

### TokenDistributor scripts (require ATTENDANCE_ADDRESS, default NETWORK=localFork)
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

### GPBRVSwapper scripts (require GPBRV_SWAPPER_ADDRESS, default NETWORK=localFork)
```bash
# Single-wallet (no configure needed): caller spends one token, receives the other in the same wallet
AMOUNT=1000000 MIN_USDM_OUT=0 USER_INDEX=0 bun scripts/gpbrv-withdraw-direct.ts   # withdraw(): GPBRV (6 dec) -> USDM
AMOUNT=100000000000000000 MIN_GPBRV_OUT=0 USER_INDEX=0 bun scripts/gpbrv-deposit-direct.ts  # deposit(): USDM (18 dec) -> GPBRV

# MiniPay-linked (requires configure): withdrawWithMinipay()/depositWithMinipay()
CONFIGURE_MINIPAY=0x... USER_INDEX=0 bun scripts/gpbrv-configure.ts             # link from the main wallet
CONFIGURE_USER=0x... MINIPAY_INDEX=1 bun scripts/gpbrv-configure-from-minipay.ts # link from the MiniPay wallet
AMOUNT=1000000 MIN_USDM_OUT=0 USER_INDEX=0 bun scripts/gpbrv-withdraw.ts   # AMOUNT in GPBRV (6 dec)
AMOUNT=100000000000000000 MIN_GPBRV_OUT=0 MINIPAY_INDEX=1 bun scripts/gpbrv-deposit.ts  # AMOUNT in USDM (18 dec)
ADDRESS=0x... bun scripts/gpbrv-read-state.ts
```
