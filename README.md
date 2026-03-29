# Tax calculator (React + TypeScript + Vite)

Calls the interview server’s `GET /tax-calculator/tax-year/:year`, computes marginal tax from the brackets, shows totals and a per-bracket table (years 2019–2022 in the UI).

## Project structure

```
src/
  api/fetchTaxBrackets.ts   # GET tax-year/:year, wire JSON → types, cache
  tax/calculateMarginalTax.ts  # marginal tax math
  format/cad.ts             # CAD currency and percent formatting
  config/env.ts             # VITE_API_BASE_URL
  types.ts                  # TaxBracket, supported years
  App.tsx                   # form + results
```

## Getting started

1. **API URL.** Copy `.env.example` to `.env` and set `VITE_API_BASE_URL` to the server root (no `/tax-calculator` path). Example: `https://api.myhost.com` or `http://localhost:5001`. See `src/config/env.ts`; missing value falls back to `http://localhost:5001`.

   ```bash
   cp .env.example .env
   ```

2. **Install dependencies and start the dev server**:

   ```bash
   npm install
   npm run dev
   ```

   Open the URL Vite prints (usually [http://localhost:5173](http://localhost:5173)).

3. **Production build** (optional):

   ```bash
   npm run build
   npm run preview
   ```

