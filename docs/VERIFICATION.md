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

## Known limits

- GitHub README images cannot run JavaScript. Terminal motion is a GIF. Reduced motion uses the static SVG.
- The contribution snake GIF and 3D contribution graph are produced by the telemetry workflow. They are added to the README only after that workflow publishes the files.
- Animated SVG is not used for the terminal or hero, because GitHub's image proxy can strip SVG animation and style.
