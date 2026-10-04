import {
	oauthProviderAuthServerMetadata,
	oauthProviderOpenIdConfigMetadata,
} from '@better-auth/oauth-provider'
import { Hono } from 'hono'
import { createAuth, type Auth } from './auth'

type AppEnv = { Bindings: Env; Variables: { auth: Auth } }

const app = new Hono<AppEnv>()

// Bindings are stable for the life of an isolate, so build the auth instance once.
let auth: Auth | undefined
app.use(async (c, next) => {
	auth ??= createAuth(c.env)
	c.set('auth', auth)
	await next()
})

// The issuer is the origin (https://auth.jman.dev), so discovery lives at the root
// even though Better Auth's endpoints are mounted under /api/auth.
app.get('/.well-known/openid-configuration', (c) =>
	oauthProviderOpenIdConfigMetadata(c.var.auth)(c.req.raw),
)
app.get('/.well-known/oauth-authorization-server', (c) =>
	oauthProviderAuthServerMetadata(c.var.auth)(c.req.raw),
)

app.on(['GET', 'POST'], '/api/auth/*', (c) => c.var.auth.handler(c.req.raw))

// Register an OAuth client. Only emails listed in ADMIN_EMAILS may call this.
app.post('/api/admin/clients', async (c) => {
	const session = await c.var.auth.api.getSession({ headers: c.req.raw.headers })
	const admins = (c.env.ADMIN_EMAILS ?? '').toLowerCase().split(',').map((s) => s.trim())
	if (!session || !admins.includes(session.user.email.toLowerCase())) {
		return c.json({ error: 'forbidden' }, 403)
	}
	const body = await c.req.json()
	const client = await c.var.auth.api.adminCreateOAuthClient({ headers: c.req.raw.headers, body })
	return c.json(client)
})

app.all('/api/*', (c) => c.json({ error: 'not_found' }, 404))

export default app satisfies ExportedHandler<Env>
