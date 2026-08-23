# Updating the upstream version

This package vendors the upstream Python source directly (`blockclock_adapter/`) rather than
pulling a Docker image or using a git submodule. There is no version pin to bump — updating
means copying newer upstream code into this repo.

## Determining the upstream version

The upstream repository is <https://github.com/billerickson/Umbrel-Blockclock-Adapter>.
Check its latest commit:

```bash
gh api repos/billerickson/Umbrel-Blockclock-Adapter/commits/master --jq '.sha[:12]'
```

Diff it against the vendored copy:

```bash
curl -s https://github.com/billerickson/Umbrel-Blockclock-Adapter/archive/refs/heads/master.tar.gz \
  | tar -xz --strip-components=1 Umbrel-Blockclock-Adapter-master/blockclock_adapter -C /tmp
diff -ru /tmp/blockclock_adapter blockclock_adapter
```

## Applying the bump

1. Replace `blockclock_adapter/app.py` (and any other changed files) with the upstream versions.
2. If the upstream added or renamed environment variables, mirror them in:
   - `startos/fileModels/store.json.ts` (zod shape + defaults)
   - `startos/actions/configure.ts` (InputSpec + prefill + handler)
   - `startos/main.ts` (env passed to the daemon)
3. Rebuild and test:

```bash
npm run build
make x86
```

4. Bump `version` in `startos/versions/current.ts` (e.g. `1.0.0:0` → `1.0.1:0`) and write
   release notes describing the upstream change.
