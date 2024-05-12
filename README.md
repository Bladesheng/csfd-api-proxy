# csfd-api-proxy

Cloudflare Worker proxy for getting movie or tv series details from CSFD.

Also includes endpoint for getting TMDB access token.

## How to run this

- Install dependencies:

```bash
npm install
```

- Run local dev server:

```bash
npm run dev
```

- Add secrets to worker:

```bash
npx wrangler secret put TMDB_PASSWORD
npx wrangler secret put TMDB_ACCESS_TOKEN
```

- Deploy to Cloudflare:

```bash
npm run deploy
```
