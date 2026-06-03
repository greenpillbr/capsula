# Capsula

Capsula is a crypto wallet and on-chain tooling stack for the Greenpill BR community. The mobile app is a React Native (Expo) wallet with passkey-first security and an extensible mini-app system; smart contracts and a web UI handle GPBR distributions on Celo.

## Repository structure

This repo is organized as independent modules (each uses [Bun](https://bun.sh)):

| Module | Path | Description |
|--------|------|-------------|
| **Mobile app** | [`mobile-app/`](mobile-app/) | Main wallet — send/receive, multi-chain support, mini-apps |
| **Smart contracts** | [`smart-contracts/`](smart-contracts/) | Solidity contracts (e.g. Attendance distributions on Celo) |
| **Web app** | [`web-app/`](web-app/) | Web UI for creating distributions, claims, and withdrawals |

See each module’s README for setup, commands, and architecture details.
