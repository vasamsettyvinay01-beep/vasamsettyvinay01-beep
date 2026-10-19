# Verification

Checked against the public GitHub account `vasamsettyvinay01-beep` on 2026-10-18.

## Account

- `gh auth status` active login: `vasamsettyvinay01-beep`
- Profile repository created for this account only

## Public projects shown

| Project | Why it is included | Live link |
| --- | --- | --- |
| myportfolio | Public repository. Next.js, React, TypeScript, Tailwind, Three.js, React Three Fiber. | None. The repository homepage is empty. |
| The One More Company | Public repository `onemorewebsite`. Homepage at theonemorecompany.com returned HTTP 200 with the matching title. | https://theonemorecompany.com |

Repositories that were not public at publish time are not described.

## Metrics in the telemetry card

- Public repositories: value of `public_repos` on the user API
- Public stars: sum of `stargazers_count` on public, non-fork repositories
- Contributions: `contributionsCollection.contributionCalendar.totalContributions`, matched against the public contribution page
- Languages: GitHub Linguist byte totals from each public repository's languages API

## Links checked

- https://theonemorecompany.com — HTTP 200, title "The One More Company"
- https://github.com/vasamsettyvinay01-beep/myportfolio — public
- https://github.com/vasamsettyvinay01-beep/onemorewebsite — public
- LinkedIn URL is the profile supplied for this account. The site blocked an automated fetch, so the page body was not re-read.

## Automation

Workflow run [39186087896](https://github.com/vasamsettyvinay01-beep/vasamsettyvinay01-beep/actions/runs/39186087896) completed successfully. It regenerated the snake GIF, the 3D SVG, the 3D PNG, and the telemetry cards, then committed them.

The live profile at https://github.com/vasamsettyvinay01-beep loaded every README image. At a 390px viewport the hero and terminal switched to the mobile files.

## Known limits

- GitHub README images cannot run JavaScript. Terminal motion is a GIF. Reduced motion uses the static SVG.
- The contribution snake SVG uses CSS animation, which GitHub's image proxy can strip. The README shows the GIF.
- The 3D graph SVG uses a style block. The README shows a PNG rendered from that SVG so the chart remains intact.
- The 3D language donut uses repository primary language. The telemetry card uses Linguist bytes and excludes this profile repository.
