# Contributing to the website

Thanks for helping build The Blockchain Library.

## What goes where

| You want to… | Do this |
| --- | --- |
| Fix a bug, improve a page, add a feature | Pull request to this repo |
| Correct an article, glossary term, book or research entry | Open an issue here with the page URL and the correction |
| Improve the knowledge compiler, curated data or docs | Pull request to [the-blockchain-library](https://github.com/jasonansellto/the-blockchain-library) |

## Workflow

1. Fork the repo and create a branch from `main`.
2. Keep each pull request to one focused change.
3. Run `npm run lint` and `npm run build` — both must pass.
4. Open a pull request explaining what changed, why, and how you tested it. Screenshots help for UI changes.

## How a merged change goes live

`main` is synced with the live Base44 app. When a maintainer merges your pull request, Base44 pulls the change in automatically. It reaches theblockchainlibrary.com when the maintainer next publishes the app, after checking it in the Base44 preview.

## Guidelines

- Match the existing patterns: Tailwind for styling, components in `src/components/`, data access through the Base44 SDK client in `src/api/`.
- Don't rename or remove entity fields in `base44/entities/` without discussing it first in an issue — live content depends on them.
- Backend functions in `base44/functions/` must keep their existing auth checks. Admin-only endpoints stay admin-only.
- Never commit secrets, tokens, wallet keys or seed phrases. Configuration that must stay private belongs in Base44 app secrets.
- Keep content neutral and educational; see the knowledge repo's `EDITORIAL-STANDARDS.md`.

## Licensing

This project is licensed under the [MIT License](LICENSE). By submitting a pull request you agree that your contribution is licensed under the MIT License as well, and that you have the right to license it.
