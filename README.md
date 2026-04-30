# Tax Helper

Tax Helper is an open-source project aiming at helping French or US citizens file their French and US taxes. This tool is targeted at people holding company equity (RSU, ISO, ESPP).

**DISCLAIMER:** the information shared in this app is based on the personal experience and knowledge of its contributors and most probably contains inaccurate information. Please don't take all of it for granted, verify calculations and / or confirm with a professional tax advisor if you have any doubts or questions. Pull Requests and Issues and more than welcome if you notice anything wrong about the information provided.

## Contribute

This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

### Getting Started

First, install the dependencies

```bash
npm i
```

You'll then need to have an alphavantage API key to run the app. You can get one for
free [here](https://www.alphavantage.co/support/#api-key).

Copy the `.env.local.sample` file to `.env.local` and replace the
`ALPHA_VANTAGE_API_KEY` value with your own API key.

```bash
cp .env.local.sample .env.local
```

Then, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the app by modifying any component located in `app/`. The page auto-updates as you edit the files.

### Testing

#### Unit tests

```bash
npm test
```

Covers date helpers, number formatting, and the French tax computation rules.

#### E2E tests

E2E tests run the full pipeline — parse an actual E-Trade xlsx file, apply French tax rules, and compare the output against a committed golden file.

```bash
npm run test:e2e
```

See [`tests/e2e/README.md`](tests/e2e/README.md) for how to add new cases or refresh fixture data.
