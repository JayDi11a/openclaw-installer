# Using The OpenClaw CLI With Local Installer Instances

When you deploy locally with `openclaw-installer`, the upstream OpenClaw CLI can target the running container directly via `OPENCLAW_CONTAINER`.

For example:

```bash
export OPENCLAW_CONTAINER=openclaw-somalley-lobster
openclaw health
openclaw status --deep
openclaw sandbox explain
```

The installer also saves per-instance metadata under:

```text
~/.openclaw/installer/local/openclaw-<prefix>-<name>/.env
```

## Recommended Workflow

If you already know the container name, just export `OPENCLAW_CONTAINER` and run normal upstream OpenClaw CLI commands:

```bash
export OPENCLAW_CONTAINER=openclaw-somalley-lobster
openclaw health
openclaw status --deep
openclaw sandbox explain
```

If you prefer, you can source the saved `.env` instead:

```bash
source ~/.openclaw/installer/local/openclaw-somalley-lobster/.env
openclaw health
```

Because `OPENCLAW_CONTAINER` is set either way, the CLI will target the running local containerized instance directly.

## Switching Between Local Instances

Set `OPENCLAW_CONTAINER` to the instance you want:

```bash
export OPENCLAW_CONTAINER=openclaw-somalley-lobster
openclaw health

export OPENCLAW_CONTAINER=openclaw-somalley-shubra
openclaw status --deep
```

Or source the matching saved `.env` if that is more convenient for your workflow.

## Notes

- This local workflow does not require editing `openclaw.json`.
- The installer still saves `gateway-token`, which is useful for the Control UI and direct gateway access.
- Changes made inside the running container via the CLI do not currently persist across local container restarts. A sync job is planned to handle that workflow instead of bringing back a read-write file mount.
- For installer-managed local deploys, the live `openclaw.json` lives in the container volume at `/home/node/.openclaw/openclaw.json`, not in host `~/.openclaw/openclaw.json`.
- Kubernetes and OpenShift can be documented separately once their CLI targeting workflow is settled.
