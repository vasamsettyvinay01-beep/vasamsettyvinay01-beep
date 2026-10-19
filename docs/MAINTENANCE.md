# Maintenance

This repository is the GitHub profile for `vasamsettyvinay01-beep`. The profile page reads `README.md` from the default branch.

## Regenerate static artwork

```bash
node scripts/generate-visuals.mjs
python scripts/generate-terminal.py
```

The terminal GIFs need Python, Pillow, and the Consolas fonts shipped with Windows. Regenerating them on another machine requires those fonts or an edit to `scripts/generate-terminal.py`.

## Refresh public telemetry

```bash
node scripts/generate-telemetry.mjs
```

The script uses the logged-in `gh` account and writes only public repository totals, Linguist byte counts, the last-year contribution calendar, and recent public push labels. It does not print tokens.

`.github/workflows/update-activity.yml` runs that script every day at 11:15 UTC, which is 06:15 in Houston during Central Daylight Time. It also exposes `workflow_dispatch`.

The workflow additionally regenerates:

- `assets/activity/contribution-snake.gif` and `.svg` with [Platane/snk](https://github.com/Platane/snk) v3.5.0
- `assets/activity/profile-3d.svg` with [github-profile-3d-contrib](https://github.com/yoshi389111/github-profile-3d-contrib) v0.9.3

Both actions are pinned to commit SHAs. The workflow grants `contents: write` and uses the default `GITHUB_TOKEN`. It does not use a personal access token, so private repository contents are not part of the generated images.

## Check the repository

```bash
node scripts/validate.mjs
```

## What not to add

Do not commit `.env` files, tokens, private source, or descriptions of repositories that are not public. Do not invent metrics, live URLs, or deployment claims. If a public project loses its live URL, remove the link instead of leaving a 404.
