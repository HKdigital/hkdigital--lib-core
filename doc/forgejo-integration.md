# Forgejo integration

How to consume `@hkdigital/lib-core` from a self-hosted Forgejo
package registry in projects and CI pipelines.

## Registry setup

The package is published to a Forgejo npm-compatible registry scoped
to `@hkdigital`. Consumers need to tell pnpm/npm where to find it.

Add a `.npmrc` file to the root of the consuming project:

```ini
@hkdigital:registry=https://<your-forgejo-host>/api/packages/<org>/npm/
//<your-forgejo-host>/api/packages/<org>/npm/:_authToken=${FORGEJO_TOKEN}
```

e.g.
```
@hkdigital:registry=https://git.hkdigital.nl/api/packages/hkdigital/npm/
//git.hkdigital.nl/api/packages/<org>/npm/:_authToken=${FORGEJO_TOKEN}
```

The token is read from the environment variable `FORGEJO_TOKEN`. For
local development, set it in your shell profile or a `.env` file that
is not committed.

If the package is public on your Forgejo instance, the `:_authToken`
line is not required.

## Local development

Create a Forgejo personal access token with `packages:read` scope
(Settings → Applications → Access Tokens), then:

```bash
export FORGEJO_TOKEN=<your-personal-token>
pnpm install
```

Or add the export to your shell profile (`~/.zshrc`, `~/.bashrc`) so
it is always available.

## CI workflow for consuming projects

Add `FORGEJO_TOKEN` as a secret in your Forgejo repository
(Settings → Secrets), then reference it in your workflow.

The `.npmrc` in the repo already points to the registry. The workflow
only needs to expose the token as an environment variable before
running `pnpm install`.

```yaml
name: Build

on:
  push:
    branches: [main]
  pull_request:

jobs:
  build:
    runs-on: docker-node
    steps:
      - uses: actions/checkout@v4

      - name: Install dependencies
        run: pnpm install --frozen-lockfile
        env:
          FORGEJO_TOKEN: ${{ secrets.FORGEJO_TOKEN }}

      - name: Build
        run: pnpm build
```

No extra login step is needed — pnpm reads `.npmrc` and substitutes
`FORGEJO_TOKEN` automatically.

## Required secrets

| Secret          | Description                                      |
| --------------- | ------------------------------------------------ |
| `FORGEJO_TOKEN` | Personal or deploy token with `packages:read`    |
