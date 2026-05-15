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

Live tests require a local Celo fork via anvil (Foundry):

```bash
anvil --fork-url https://forno.celo.org --chain-id 42220
```

Then, in a second shell:

```bash
GPBR_WHALE=0x... bunx hardhat test nodejs test/Attendance.live.ts
```

The live suite auto-skips when anvil is unreachable or `GPBR_WHALE` is unset.



## Attendance contract

### Local fork

Start a local anvil node forked from Celo (Foundry must be installed):

```shell
anvil --fork-url https://forno.celo.org --chain-id 42220
```

The `localFork` network in `hardhat.config.ts` points at `http://127.0.0.1:8545` and uses the default anvil signing keys. Override with the `LOCAL_PRIVATE_KEY` and `LOCAL_USER_PRIVATE_KEY` env vars when targeting a non-default anvil instance.

### Deploy with Ignition

```shell
bunx hardhat ignition deploy ignition/modules/Attendance.ts --network localFork
bunx hardhat ignition deploy ignition/modules/Attendance.ts --network celo
```

Parameter overrides (e.g. owner / GPBR address) are passed via a JSON file:

```shell
bunx hardhat ignition deploy ignition/modules/Attendance.ts \
  --network localFork \
  --default-sender 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 \
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

### Scripts

All scripts read the deployed contract address from `ATTENDANCE_ADDRESS` and connect to `localFork` by default (override with `NETWORK=<name>`):

```shell
export ATTENDANCE_ADDRESS=0x...
AMOUNT=3000000 bun scripts/fund-attendance.ts
AMOUNT=1000000 PERIOD=5400 bun scripts/set-config.ts
bun scripts/create-distribution.ts
DISTRIBUTION_ID=0 USER_INDEX=1 bun scripts/claim.ts
AMOUNT=2000000 bun scripts/withdraw.ts
USER_ADDRESS=0x70997970C51812dc3A010C7d01b50e0d17dc79C8 bun scripts/read-state.ts
```

### Live tests

The unit suite (`test/Attendance.ts`) runs against the in-process simulator and a `MockGPBR`. The live suite (`test/Attendance.live.ts`) targets the running anvil fork and uses the real GPBR token:

```shell
GPBR_WHALE=0xacd59e854adf632d2322404198624f757c868c97 \
  bunx hardhat test nodejs test/Attendance.live.ts
```

The live tests skip themselves automatically when anvil is unreachable or when `GPBR_WHALE` is not provided.
