# Blockclock Adapter

Run a Coinkite BLOCKCLOCK mini without giving it internet access. This service collects Bitcoin data from your StartOS Mempool instance, fetches the BTC price from Coinbase, calculates Moscow Time locally, and pushes values to the BLOCKCLOCK through its local HTTP API.

The adapter pushes data to the BLOCKCLOCK; the device never needs to initiate connections to the internet.

## What you get on StartOS

- **A background service** that rotates values onto the BLOCKCLOCK E-Ink display every 5 minutes (configurable).
- **A Status API** (JSON endpoint) showing current values, errors, and blocks-found state.
- **A Configure action** to set the BLOCKCLOCK URL, password, enabled metrics, display interval, and optional pool/price sources.
- **An Acknowledge Block Found action** to dismiss the blocks-found alert.

## Displayed values

Every screen label carries a **(Start9)** marker so you can tell at a glance the value came
from your own node, not Coinkite's backend.

| Display | Source |
|---------|--------|
| Block Height | Mempool `/api/blocks/tip/height` |
| Block Age | Minutes since latest block from Mempool `/api/v1/blocks` |
| Fastest Fee | `fastestFee` from Mempool `/api/v1/fees/recommended` |
| BTC Price | Coinbase `https://api.coinbase.com/v2/prices/BTC-USD/spot` |
| SATS PER DOLLAR | Calculated locally: `100,000,000 ÷ BTC/USD` |
| Pool Hash Rate (optional) | Public Pool API `totalHashRate` |
| Blocks Found (optional) | Public Pool API `blocksFound` |

### Why "SATS PER DOLLAR" (Moscow Time)?

This display shows **how many satoshis one US dollar buys** — `100,000,000 ÷ BTC/USD`. It is
the Bitcoin-native inversion of the dollar price: instead of asking how many dollars a bitcoin
is worth, it asks how much of a dollar a single satoshi costs.

The name "Moscow Time" comes from a hyperbitcoinization thought experiment: if the number ever
reaches **1**, one satoshi equals one dollar — implying BTC at $100,000,000. A falling number
means each satoshi is getting stronger against the dollar. Holders watch sats-per-dollar
because it frames the price in Bitcoin's own unit rather than the dollar's.

The value is computed locally from the Coinbase spot price — no extra server, no extra trust.

Pool metrics (hash rate, blocks found) are only active when a **Pool API URL** is set in Configure. Without one they are skipped automatically — no errors in the logs.

## Buttons

- **Left button** — opens the firmware's own menu (unchanged behavior).
- **Middle-right button** — while an adapter screen is showing, it advances to the next metric.
  The adapter polls for presses every few seconds and respects the E-Ink minimum refresh
  interval (~60 s), so a press may take up to a minute to take effect; a brief firmware screen
  or stale message in between is normal.
- The rotation also advances automatically every **Display Interval** seconds (default 300).

## Getting set up

1. **Install Mempool** on your StartOS server. The adapter requires it as a dependency.
2. **Install Blockclock Adapter** by sideloading the `.s9pk`.
3. On first install a **critical task** appears: run the **Configure** action and enter:
   - **BLOCKCLOCK URL**: the HTTP address of your BLOCKCLOCK mini (e.g., `http://192.168.1.50`)
   - **BLOCKCLOCK Password**: the system password set on the BLOCKCLOCK web UI (if any)
4. Select which metrics to display and set the rotation interval.
5. If using a mining pool, optionally enter the **Pool API URL** for hashrate/blocks-found displays.
6. Start the service. The adapter will begin pushing values within the configured interval.

## Configure the BLOCKCLOCK itself

On the BLOCKCLOCK's internal web page:

1. Set the backend/external URL to `127.0.0.1` so the firmware stops pulling from Coinkite's internet backend.
2. Under **Display**, set **Screen Update Rate** to **Manual** so the pull cycle never replaces values pushed by the adapter.
3. Set a strong **System Password** — then put that same password in this package's Configure action.
4. For full isolation, block the device's internet access at your router. See the package README for the per-region Coinkite backend IPs.

## How it differs from upstream

This package wraps [billerickson/Umbrel-Blockclock-Adapter](https://github.com/billerickson/Umbrel-Blockclock-Adapter), which targets Umbrel with host networking and a `.env` file. The StartOS version:

- Uses StartOS bridge networking to reach the Mempool dependency automatically — no manual URLs.
- Stores configuration in `store.json` via the Configure action instead of editing `.env`.
- Exposes the status endpoint as a StartOS API interface.
- Refuses to start until the BLOCKCLOCK URL is configured (with an on-screen task guiding you), instead of crash-looping.
