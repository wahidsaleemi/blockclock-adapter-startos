# Blockclock Adapter for StartOS

A [StartOS](https://start9.com) service package for the [Umbrel Blockclock Adapter](https://github.com/billerickson/Umbrel-Blockclock-Adapter). Runs a Coinkite BLOCKCLOCK mini without internet access by collecting Bitcoin data from StartOS services and pushing it to the BLOCKCLOCK over LAN.

## Architecture

```
StartOS Mempool (bridge) -------+
Coinbase HTTPS -----------------+--> Blockclock Adapter --HTTP push--> BLOCKCLOCK mini
```

The adapter rotates one value onto the E-Ink display every 5 minutes (configurable, minimum 60 seconds). On firmware 1.2.3+, the middle button requests the next adapter display.

## Package structure

| Path | Purpose |
|------|---------|
| `Dockerfile` | Builds the Python 3.12 Alpine image with the adapter source |
| `blockclock_adapter/` | Upstream Python source (unmodified) |
| `startos/main.ts` | Daemon definition: resolves Mempool bridge address, reads config from store.json, sets env vars |
| `startos/fileModels/store.json.ts` | Zod schema for all configuration |
| `startos/actions/configure.ts` | Config form: BLOCKCLOCK URL, password, metrics, intervals, sources |
| `startos/actions/acknowledgeBlock.ts` | Acknowledge blocks-found alert |
| `startos/interfaces.ts` | Exposes status API on port 21022 |
| `startos/manifest/index.ts` | Package metadata, declares `mempool` dependency |

## Configuration

All settings are managed through the StartOS **Configure** action:

| Setting | Default | Notes |
|---------|---------|-------|
| BLOCKCLOCK URL | (empty) | HTTP address of your BLOCKCLOCK mini |
| BLOCKCLOCK Password | (empty) | System password, if set |
| Enabled Metrics | all 7 | Multiselect: block_height, block_age, fastest_fee, btc_price, moscow_time, hash_rate, blocks_found |
| Display Interval | 300 seconds | Minimum 60 |
| Button Advance | true | Monitor middle button for manual advance |
| Pool API URL | (empty) | Optional: Public Pool API endpoint |
| Price API URL | Coinbase | HTTPS only |
| Allowed Price Hosts | api.coinbase.com | Comma-separated |

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
