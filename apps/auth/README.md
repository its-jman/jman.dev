# auth.jman.dev

OIDC provider for jman.dev apps, built with [Better Auth](https://www.better-auth.com) and the
[`@better-auth/oauth-provider`](https://www.better-auth.com/docs/plugins/oauth-provider) plugin, running on one
Cloudflare Worker. The Worker serves the API (Hono) and the React sign-in UI (Vite static assets).

- Issuer: `https://auth.jman.dev`
- Discovery: `/.well-known/openid-configuration`
- Better Auth endpoints: `/api/auth/*` (authorize, token, userinfo, jwks, ...)
- UI: `/sign-in`, `/consent`, `/` (account and passkeys)

## Setup

```sh
pnpm install
cp .dev.vars.example .dev.vars         # fill in secrets
pnpm db:migrate:local
pnpm dev
```

Production:

```sh
wrangler d1 create auth                # put the id in wrangler.jsonc
wrangler secret put BETTER_AUTH_SECRET # openssl rand -base64 32
wrangler secret put GITHUB_CLIENT_ID
wrangler secret put GITHUB_CLIENT_SECRET
pnpm db:migrate:remote
pnpm deploy
```

The GitHub OAuth app callback URL is `https://auth.jman.dev/api/auth/callback/github`.

## Access

Signup is invite-only: only emails in `ALLOWED_EMAILS` can create an account.
`ADMIN_EMAILS` can register OAuth clients.

## Registering a client

While signed in as an admin, from the browser console on auth.jman.dev:

```js
await fetch('/api/admin/clients', {
	method: 'POST',
	headers: { 'content-type': 'application/json' },
	body: JSON.stringify({
		client_name: 'My app',
		redirect_uris: ['https://app.jman.dev/auth/callback'],
		skip_consent: true, // first-party
	}),
}).then((r) => r.json()) // client_id / client_secret
```

## Schema changes

```sh
pnpm auth:generate   # regenerate src/worker/db/auth-schema.ts from the Better Auth config
pnpm db:generate     # write a new D1 migration into drizzle/
```
