# Central Match13 proxy setup

PitBeacon is hosted as a static GitHub Pages site. Match13 does not currently allow browser requests from that site, so the user's Match13 API key must pass through a CORS-enabled server-side proxy before reaching Match13.

This repository includes a small Cloudflare Worker that forwards only the team-season GET endpoint. It has no Match13 service key of its own and does not write request bodies or authorization headers to logs. The Match13 key is still visible to the user who entered it, and Cloudflare processes the request while operating the Worker.

## One-time maintainer setup

1. Create/sign in to the PitBeacon maintainer's Cloudflare account and install Node.js/npm.
2. From the repository root, authenticate Wrangler:

   ```powershell
   npx wrangler login
   ```

3. Deploy the Worker:

   ```powershell
   npx wrangler deploy --config cloudflare/match13-proxy/wrangler.toml
   ```

4. Copy the `https://pitbeacon-match13-proxy.<account-subdomain>.workers.dev` URL printed by Wrangler.
5. Set `match13ProxyUrl` in `config.js` to that URL. This is public configuration, not a secret. Commit and push the change so GitHub Pages publishes the configured endpoint.
6. Confirm the deployed site loads the Team Stats card, then users only need to enter their own Match13 API key in Settings. They do not need Cloudflare accounts or a proxy URL.

The Worker only accepts the production origin `https://naterodalv.github.io`, requires a user's `Authorization: Bearer m13_live_...` header, and forwards only `/v1/teams/{teamNumber}/years/{year}` to `actions.match13.com`. Requests from local development origins are intentionally denied.

## Free-plan limits

Cloudflare Workers currently lists these Free plan limits:

- **100,000 Worker requests per day**. Requests beyond the daily limit are restricted unless the account changes plan.
- **10 ms CPU time per request**, **128 MB memory**, and **50 subrequests per incoming request**. This Worker makes one upstream subrequest.
- Network waiting time for the upstream Match13 request does not count toward CPU time.

The Worker is designed for this narrow, low-volume use and requires no paid plan for usage within the Free limits. Check [Cloudflare pricing](https://developers.cloudflare.com/workers/platform/pricing/) and [current plan limits](https://developers.cloudflare.com/workers/platform/limits/) before deployment, as limits can change.
