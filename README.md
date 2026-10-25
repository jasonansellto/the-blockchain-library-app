# The Blockchain Library — Website

Source code for [theblockchainlibrary.com](https://theblockchainlibrary.com): an open-source knowledge platform for blockchain education, developer resources, research and structured, AI-ready knowledge.

The site is built on [Base44](https://base44.com) (React + Vite frontend, Base44 entities and backend functions). This repository is connected to the live app with two-way sync: changes made in Base44 are pushed here automatically, and changes merged into `main` here are pulled into Base44.

## Related repositories

| Repository | What it holds |
| --- | --- |
| **the-blockchain-library-app** (this repo) | Website pages, components, backend functions, data models |
| [the-blockchain-library](https://github.com/jasonansellto/the-blockchain-library) | Knowledge engine: compiler, canonical knowledge release, docs |

```text
theblockchainlibrary.com (this repo, on Base44)   authored content
        │  daily "Sync from Base44" workflow
        ▼
the-blockchain-library (knowledge engine)          canonical release → public/knowledge/
        ├──▶ docs.theblockchainlibrary.com
        └──▶ website Explorer (reads the release from GitHub)
```

## Project layout

```text
src/
  pages/          route components (public site + admin)
  components/     shared UI
  lib/            knowledge engine client, SEO, helpers
  api/            Base44 SDK client
base44/
  entities/       data models (Article, GlossaryTerm, Book, …)
  functions/      backend functions (search, export, sitemap, …)
  workflows/      scheduled automations
  shared/         logic shared between functions
```

## Run locally

Requires Node.js 20+.

```bash
npm install
npm run dev
```

The frontend runs against the hosted backend. Create `.env.local`:

```bash
VITE_BASE44_APP_ID=6a4cfcf76d7d1bf88148c979
VITE_BASE44_APP_BASE_URL=https://theblockchainlibrary.com
```

Public pages work without signing in. Admin pages and backend functions that change data need maintainer access, so for those changes describe how you tested in your pull request and a maintainer will verify on the platform.

To run a full local backend with the [Base44 CLI](https://docs.base44.com/developers/references/cli/get-started/overview): `npm install -g base44@latest`, then `base44 dev`.

## Before opening a pull request

```bash
npm run lint
npm run build
```

CI runs both on every pull request.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). Content corrections (an article, glossary definition, book or research entry) are best raised as issues; code changes as pull requests.

## Security

Never commit secrets — API keys and tokens live in Base44 app secrets, not in code. Report vulnerabilities privately as described in [SECURITY.md](SECURITY.md).

## License

[MIT](LICENSE) © 2026 Jason Ansell.
