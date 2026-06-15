Here live the contracts used by Capsula app

## Pre requisites

- Node 22+
- Bun

```bash
curl -fsSL https://bun.sh/install | bash
```

- Foundry

```bash
curl -L https://foundry.paradigm.xyz | bash
```

- Install dependencies

```bash
bun install
```

## Running tests

Unit tests run in-process against the simulated Hardhat network:

```bash
bunx hardhat test
```

Live tests require a local Celo fork via anvil (Foundry): see "Local fork" section below.

```bash
bunx hardhat test nodejs test/Attendance.live.ts
```

The live suite auto-skips when anvil is unreachable or `GPBR_WHALE` is unset.

## Local fork

Start a local anvil node forked from Celo (Foundry must be installed):

```shell
anvil --fork-url https://forno.celo.org --chain-id 99999
```

The `localFork` network in `hardhat.config.ts` points at `http://127.0.0.1:8545` and uses the default anvil signing keys. Override with the `LOCAL_PRIVATE_KEY` and `LOCAL_USER_PRIVATE_KEY` env vars when targeting a non-default anvil instance.

## Deploy with Ignition

### Set private keys on keystore

```shell
bunx hardhat keystore set CELO_RPC_URL
bunx hardhat keystore set CELO_OWNER_PRIVATE_KEY
bunx hardhat keystore set CELO_USER_PRIVATE_KEY
bunx hardhat keystore set CELO_DEPLOYER_PRIVATE_KEY
bunx hardhat keystore set CELOSCAN_API_KEY
```

### Execute deployment script

```shell
bunx hardhat ignition deploy ignition/modules/Attendance.ts --network localFork
bunx hardhat ignition deploy ignition/modules/Attendance.ts --network celo
```

Parameter overrides (e.g. owner / GPBR address) are passed via a JSON file:

```shell
bunx hardhat ignition deploy ignition/modules/Attendance.ts \
  --network celo \
  --default-sender 0x22682c3d3848294fF9bCBf3F0DDF48A605446B56 \
  --reset \
  --parameters params.json
```

`params.json` example:

```json
{
  "AttendanceModule": {
    "gpbrAddress": "0xd832B2F117db51021Ad0387c17182796DBEB69df",
    "initialOwner": "0xa9FDeb97d2ACad58eC48d0406Ed2Eb6bB96CfDB5"
  }
}
```

## Verification

```shell
bunx hardhat verify etherscan --network celo <DEPLOYED_ADDRESS> <CONSTRUCTOR_ARGUMENTS>
```

## Scripts

All scripts read the deployed contract address from `ATTENDANCE_ADDRESS` and connect to `localFork` by default (override with `NETWORK=<name>`):

```shell
export ATTENDANCE_ADDRESS=0x...
NETWORK=celo AMOUNT=1000000 bun scripts/fund-attendance.ts
NETWORK=celo AMOUNT=1000000 PERIOD=5400 bun scripts/set-config.ts
NETWORK=celo bun scripts/create-distribution.ts
NETWORK=celo DISTRIBUTION_ID=0 USER_INDEX=1 bun scripts/claim.ts
NETWORK=celo AMOUNT=2000000 bun scripts/withdraw.ts
NETWORK=celo USER_ADDRESS=0xb558a17bB4C39BC92296a20BA538D11B8201db95 bun scripts/read-state.ts
```

## Live tests

The unit suite (`test/Attendance.ts`) runs against the in-process simulator and a `MockGPBR`. The live suite (`test/Attendance.live.ts`) targets the running anvil fork and uses the real GPBR token:

To run live tests you should first start a local fork of the Celo network:

Then deploy the contract to the local fork:

refer to sections "Deploy with Ignition" and "Local fork" above for more details.

```shell
  bunx hardhat test nodejs test/Attendance.live.ts
```

The live tests skip themselves automatically when anvil is unreachable

## GPBRVSwapper

`GPBRVSwapper` converts between GPBRV and USDM by chaining the Sarafu swap pool and the Mento router. It offers two flavours: a single-wallet flow that needs no setup, and a MiniPay-linked flow.

**Single wallet (no configuration required):**

- `withdraw(amount, minUsdmOut)` spends the caller's GPBRV and returns USDM to the same wallet (GPBRV → BRLM via Sarafu → USDM via Mento).
- `deposit(amount, minGpbrvOut)` spends the caller's USDM and returns GPBRV to the same wallet (USDM → BRLM via Mento → GPBRV via Sarafu).

**MiniPay-linked:**

- `configure(minipay)` links the caller's main wallet to a MiniPay wallet (forward and reverse mappings).
- `withdrawWithMinipay(amount, minUsdmOut)` spends the caller's GPBRV and sends USDM to the linked MiniPay wallet.
- `depositWithMinipay(amount, minGpbrvOut)` spends the MiniPay wallet's USDM and sends GPBRV to the linked main wallet.

`withdrawWithMinipay` and `depositWithMinipay` revert with `NotConfigured` when no mapping exists for the caller.

### Addresses (Celo mainnet)

| Token / contract | Address | Decimals |
| --- | --- | --- |
| GPBRV | `0x6ec3d6e693526108990c6d5cbd2195e051321d32` | 6 |
| BRLM | `0xe8537a3d056da446677b9e9d6c5db704eaab4787` | 18 |
| USDM | `0x765de816845861e75a25fca122bb6898b8b1282a` | 18 |
| Sarafu swap pool | `0xD12F1aE0C018210d18F6cB01cD6c7bd669eF7529` | — |
| Mento router | `0x4861840C2EfB2b98312B0aE34d86fD73E8f9B6f6` | — |
| Mento factory | `0x22abd4ADF6aab38aC1022352d496A07Acee5aCB3` | — |

### Unit tests

Unit tests run in-process against `MockSwapPool` and `MockMentoRouter` (flat 1:1 value, decimal-adjusted):

```bash
bunx hardhat test nodejs test/GPBRVSwapper.ts
```

### Live tests

The live suite (`test/GPBRVSwapper.live.ts`) targets the running anvil fork and the real Sarafu pool / Mento router. It seeds the anvil wallets by impersonating token whales, so it requires both whale env vars:

```bash
anvil --fork-url https://forno.celo.org --chain-id 42220
GPBRV_WHALE=0x... USDM_WHALE=0x... bunx hardhat test nodejs test/GPBRVSwapper.live.ts
```

The suite skips itself when anvil is unreachable or the whale env vars are unset. The real Sarafu pool and Mento router enforce liquidity and per-swap limits, so the live amounts are intentionally small (`1` GPBRV for withdraw, `0.1` USDM for deposit); tune them to the live pool reserves.

### Deploy

```bash
bunx hardhat ignition deploy ignition/modules/GPBRVSwapper.ts --network localFork
bunx hardhat ignition deploy ignition/modules/GPBRVSwapper.ts --network celo
```

### Scripts

All GPBRVSwapper scripts read the deployed address from `GPBRV_SWAPPER_ADDRESS` and connect to `localFork` by default (override with `NETWORK=<name>`):

```bash
export GPBRV_SWAPPER_ADDRESS=0x...
# Single-wallet (no configure needed)
AMOUNT=1000000 MIN_USDM_OUT=0 USER_INDEX=0 bun scripts/gpbrv-withdraw-direct.ts
AMOUNT=100000000000000000 MIN_GPBRV_OUT=0 USER_INDEX=0 bun scripts/gpbrv-deposit-direct.ts
# MiniPay-linked
CONFIGURE_MINIPAY=0x... USER_INDEX=0 bun scripts/gpbrv-configure.ts
AMOUNT=1000000 MIN_USDM_OUT=0 USER_INDEX=0 bun scripts/gpbrv-withdraw.ts
AMOUNT=100000000000000000 MIN_GPBRV_OUT=0 MINIPAY_INDEX=1 bun scripts/gpbrv-deposit.ts
ADDRESS=0x... bun scripts/gpbrv-read-state.ts
```

### Reference

CELO PUBLIC RPC URL: [https://forno.celo.org](https://forno.celo.org)