# Shaveh Prutah

Cloudflare Workers edition of the Shaveh Prutah silver-value site.

## Deploy from GitHub

Connect this repository in **Cloudflare Workers & Pages** and use:

- Build command: `pnpm run build`
- Deploy command: `pnpm exec wrangler deploy --config dist/server/wrangler.json`
- Node.js version: `22`

The `/api/rates` route runs on the Worker and supplies the live silver and currency data.

For a local deployment from this repository, run `pnpm install`, authenticate Wrangler, and then run `pnpm run deploy`.
