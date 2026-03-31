# Tax Calculator

Simple React app for calculating marginal income tax from API tax brackets.

## Stack

- React
- TypeScript
- Vite
- Vitest
- Playwright

## Run locally

Install dependencies:

```bash
npm install
```

Start the app:

```bash
npm run dev
```

The app uses `VITE_API_BASE_URL` and falls back to `http://localhost:5001` if it is not set.

## Scripts

```bash
npm run dev
npm run build
npm run lint
npm run test:run
npm run test:e2e
```

For Playwright UI mode:

```bash
npm run test:e2e:ui
```

## Tests

- Unit tests are written with `Vitest`
- E2E tests are written with `Playwright`
- Some Playwright tests mock the API response so they can run in CI without a backend

## CI

GitHub Actions runs:

- lint
- unit tests
- e2e tests

