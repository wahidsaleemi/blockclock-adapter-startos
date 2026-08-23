# AGENTS.md

This is a StartOS service-package repository — it builds a `.s9pk` for StartOS.

Develop it inside a StartOS packaging workspace created by `start-cli s9pk init-workspace`,
which provides the packaging guide and agent context one level up. If you're reading this in a
bare clone with no workspace, the full guide is at <https://docs.start9.com/packaging>.

Work this package's `TODO.md` from top to bottom. Keep `README.md` (the package's technical reference — the only one an AI support or administering agent reads) and `instructions.md` (end-user docs) in sync with your changes.

## This repo

- **Upstream code is vendored**, not pinned: `blockclock_adapter/` is a verbatim copy of
  billerickson/Umbrel-Blockclock-Adapter's Python source. Do not edit it for StartOS-specific
  behavior — adapt on the wrapper side (`startos/`). See `UPDATING.md` for the bump procedure.
- **Defaults live in one place**: the zod schema in `startos/fileModels/store.json.ts`.
  `storeDefaults` derives from it; `main.ts` and `actions/configure.ts` must never hardcode
  literal defaults.
- **Pool metrics gating**: `resolveEnabledMetrics()` strips `hash_rate`/`blocks_found` unless
  a Pool API URL is set. Keep that logic in one place (the file model), not duplicated.
- **First-run flow**: with no BLOCKCLOCK URL, `main.ts` throws a clear i18n error and
  `init/taskSetBlockclock.ts` creates a critical task pointing at Configure. The service is
  expected to sit unstarted until configured — that is by design, not a bug.
- **i18n discipline**: every user-visible string needs an entry in
  `startos/i18n/dictionaries/default.ts` AND all four locale blocks in `translations.ts`
  (keys are numeric indices — they must stay aligned). `tsc --noEmit` catches missing keys;
  it does not catch misaligned indices, so check those by hand.
- **Build prerequisites** beyond the SDK defaults: `tar2sqfs` (squashfs-tools-ng) and a
  docker-container buildx builder (`docker buildx create --driver docker-container --use`)
  for the image export step.
