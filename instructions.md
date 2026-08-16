# Blockclock Adapter

Run a Coinkite BLOCKCLOCK mini without giving it internet access. This service collects Bitcoin data from your StartOS Mempool instance, fetches the BTC price from Coinbase, calculates Moscow Time locally, and pushes values to the BLOCKCLOCK through its local HTTP API.

The BLOCKCLOCK never needs to initiate a connection to the internet.

## What you get on StartOS

- **A background service** that rotates values onto the BLOCKCLOCK E-Ink display every 5 minutes (configurable).
- **A Status API** (JSON endpoint) showing current values, errors, and blocks-found state.
- **A Configure action** to set the BLOCKCLOCK URL, password, enabled metrics, display interval, and optional pool/price sources.
- **An Acknowledge Block Found action** to dismiss the blocks-found alert.

## Displayed values

| Display | Source |
|---------|--------|
| Block height | Mempool `/api/blocks/tip/height` |
| Block age | Minutes since latest block from Mempool `/api/v1/blocks` |
| Fastest fee | `fastestFee` from Mempool `/api/v1/fees/recommended` |
| BTC/USD | Coinbase `https://api.coinbase.com/v2/prices/BTC-USD/spot` |
| Moscow Time | `round(100,000,000 / BTC_USD)` |
| Pool hash rate | Optional: Public Pool API `totalHashRate` |
| Blocks found | Optional: Public Pool API `blocksFound` |

## Getting set up

1. **Install Mempool** on your StartOS server. The adapter requires it as a dependency.
2. **Install Blockclock Adapter** from the marketplace or sideload the `.s9pk`.
3. Open the **Configure** action and enter:
   - **BLOCKCLOCK URL**: the HTTP address of your BLOCKCLOCK mini (e.g., `http://192.168.1.50`)
   - **BLOCKCLOCK Password**: the system password set on the BLOCKCLOCK web UI (if any)
4. Select which metrics to display and set the rotation interval.
5. If using a mining pool, optionally enter the **Pool API URL** for hashrate/blocks-found displays.
6. Start the service. The adapter will begin pushing values within the configured interval.

## How it differs from upstream

The upstream project targets Umbrel with host networking (`network_mode: host`). This StartOS package:
- Uses the StartOS SDK bridge networking to reach the Mempool dependency.
- Stores configuration in `store.json` via StartOS file models instead of a `.env` file.
- Exposes the status endpoint as a StartOS API interface.
- Supports all the same metrics and features as the upstream project.
