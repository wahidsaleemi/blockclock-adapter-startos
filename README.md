# Blockclock Adapter for StartOS

A [StartOS](https://start9.com) service package for the [Blockclock Adapter](https://github.com/billerickson/Umbrel-Blockclock-Adapter). Runs a Coinkite BLOCKCLOCK mini without internet access by collecting Bitcoin data from StartOS services and pushing it to the BLOCKCLOCK over LAN.

## Architecture

```
StartOS Mempool (bridge) -------+
Coinbase HTTPS -----------------+--> Blockclock Adapter --HTTP push--> BLOCKCLOCK mini
```

The adapter rotates one value onto the E-Ink display every 5 minutes (configurable). On firmware 1.2.3+, the middle-right button advances to the next adapter display.

## Why Moscow Time?

"Moscow Time" is a Bitcoin-native way of expressing price: **the number of satoshis one US
dollar buys** — `100,000,000 ÷ BTC/USD`. It inverts the usual "dollars per bitcoin" framing:
instead of asking how many dollars a bitcoin is worth, it asks how little of a dollar a single
satoshi costs.

The name comes from a thought experiment popularized by Bitcoiners (notably by the
[TFTC "Moscow Time" show](https://tftc.io/moscow-time/)): if Moscow Time ever reaches **1**,
one satoshi equals one dollar — meaning BTC at $100,000,000 and hyperbitcoinization complete.
A falling number means each satoshi is getting *stronger* against the dollar, which is why
holders prefer watching sats-per-dollar rather than dollars-per-coin.

The adapter computes it locally from the Coinbase spot price — it is never fetched from any
server. On this package the screen is titled **SATS PER DOLLAR (Start9)**; internally the
metric is still called `moscow_time` for compatibility with upstream configuration.

## Screen layout

The BLOCKCLOCK renders three zones: top-left label (`tl`), main numeric/text area, and the
bottom-right corner (`br` / `pair`). Every label carries a **(Start9)** marker so you can tell
at a glance the value came from your own node:

| Metric | Top-left | Main | Bottom-right |
|---|---|---|---|
| Block height | Block Height | `963763` | Local Node (Start9) |
| Block age | Block Age | `<minutes> MIN` | Minutes (Start9)* |
| Fastest fee | Fastest Fee | `4` | sat/vB (Start9) |
| BTC price | BTC Price | `$77,324` | BTC/USD (Start9) |
| SATS PER DOLLAR | SATS PER DOLLAR | `1293` | SAT/USD (Start9) |
| *Pool hash rate* | Pool Hash | e.g. `2.4PH` | hash/s (Start9) |
| *Blocks found* | Blocks Found | e.g. `12` | Pool (Start9) |

\* Block age additionally pushes `MIN` into the rightmost panel via the clock's ou_text API.
Depending on firmware rendering, some corner labels may swap position between panels — that
is the device's own layout logic, not different data.

## Removing the device's dependency on Coinkite's data backend

The BLOCKCLOCK firmware is configured by default to **pull** data from Coinkite's internet backend. The adapter **pushes** values to the device over LAN, so you want the firmware to stop pulling. Otherwise the two sources fight each other and the device keeps making outbound internet requests.

On the BLOCKCLOCK's internal web page:

1. Open **Preferences → External URLs**.
2. Point the backend/external URL to a local or broken address (e.g. `http://127.0.0.1`).
3. Set **Screen Update Rate** to **Manual** (under **Display**) so the normal pull cycle never replaces values pushed by the adapter.

Once the backend URL is local/broken, the firmware no longer needs to reach the internet to display data — it only receives pushes from the adapter.

> **Note:** It appears the BLOCKCLOCK only reaches out to one IP address per region:
>
> - N. America: `35.193.3.177`
> - Europe: `34.65.13.65`
> - Asia: `35.200.21.98`
>
> These are Google Cloud Platform (GCP) addresses where Coinkite is/was hosting their services. It should be enough to simply block these so the device doesn't reach out to Coinkite.

## Isolating the device at the network level

The adapter pushes data one way (adapter → BLOCKCLOCK). The BLOCKCLOCK never needs to initiate connections to the LAN or internet. You can enforce this at the network level with your router's firewall:

1. **Assign a fixed IP** to the BLOCKCLOCK (DHCP reservation) so you know its address.
2. Open your router's firewall settings.
3. Create a rule that **blocks all outbound internet access** for that fixed IP, while allowing LAN traffic (so the adapter can still push to it).
4. Optionally restrict which LAN clients can initiate connections to it.

Every router brand is different (pfSense, OpenWrt, OPNsense, Ubiquiti, Asus, MikroTik, etc.). Once you have the IP address assigned to the device, you can ask any AI model how to create that firewall rule for your specific router model.

## Package structure

| Path | Purpose |
|------|---------|
| `Dockerfile` | Builds the Python 3.12 Alpine image with the adapter source |
| `blockclock_adapter/` | Upstream Python source (unmodified) |
| `startos/main.ts` | Daemon definition: resolves Mempool bridge address, reads config from store.json, sets env vars. Refuses to start until a BLOCKCLOCK URL is configured. |
| `startos/init/taskSetBlockclock.ts` | Critical task on first install guiding the user to Configure |
| `startos/fileModels/store.json.ts` | Zod schema for all configuration — single source of defaults; also gates pool metrics on Pool API URL presence |
| `startos/actions/configure.ts` | Config form: BLOCKCLOCK URL, password, metrics, intervals, sources |
| `startos/actions/acknowledgeBlock.ts` | Acknowledge blocks-found alert |
| `startos/interfaces.ts` | Exposes status API on port 21022 |
| `startos/manifest/index.ts` | Package metadata, declares `mempool` dependency |

## Configuration

All settings are managed through the StartOS **Configure** action:

| Setting | Default | Notes |
|---------|---------|-------|
| BLOCKCLOCK URL | (empty) | HTTP address of your BLOCKCLOCK mini. Required — the service will not start until set. |
| BLOCKCLOCK Password | (empty) | System password, if set (HTTP Digest) |
| Enabled Metrics | all 7 | Multiselect: block_height, block_age, fastest_fee, btc_price, moscow_time, hash_rate, blocks_found |
| Display Interval | 300 seconds | Minimum 60 |
| Button Advance | true | Monitor middle button for manual advance |
| Button Poll Interval | 3 seconds | How often to check for button presses |
| Source Timeout | 10 seconds | HTTP timeout for mempool/pool/price requests |
| Pool API URL | (empty) | Optional: Public Pool API endpoint |
| Price API URL | Coinbase spot | HTTPS only |
| Allowed Price Hosts | api.coinbase.com | Comma-separated |

**Pool metric gating:** if no Pool API URL is configured, `hash_rate` and `blocks_found` are
stripped from the enabled-metrics list automatically before reaching the adapter — selecting
them without a pool URL would otherwise just produce collection errors every rotation cycle.

## First-run behavior

On fresh install the service does not start immediately. A critical task appears on the
service page instructing you to run **Configure** and enter the BLOCKCLOCK URL. Once saved,
start the service. This prevents a crash-loop against an empty config.

## Dependencies

- **Mempool** (required): Provides block height, block age, and fee data via the StartOS bridge network.

## Build

```bash
make x86    # x86_64 only
make arm    # aarch64 only
make        # all architectures
make install # build and install to your StartOS device
```

## License

MIT — matches the upstream project.
