import { oauthProvider } from '@better-auth/oauth-provider'
import { passkey } from '@better-auth/passkey'
import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { APIError } from 'better-auth/api'
import { jwt } from 'better-auth/plugins'
import { drizzle } from 'drizzle-orm/d1'
import * as schema from './db/auth-schema'

export type AuthEnv = Pick<
	Env,
	| 'DB'
	| 'BETTER_AUTH_URL'
	| 'BETTER_AUTH_SECRET'
	| 'GITHUB_CLIENT_ID'
	| 'GITHUB_CLIENT_SECRET'
	| 'ALLOWED_EMAILS'
>

const parseList = (value: string | undefined) =>
	new Set(
		(value ?? '')
			.split(',')
			.map((s) => s.trim().toLowerCase())
			.filter(Boolean),
	)

export function createAuth(env: AuthEnv) {
	const baseURL = env.BETTER_AUTH_URL
	const allowedEmails = parseList(env.ALLOWED_EMAILS)

	return betterAuth({
		appName: 'jman.dev',
		baseURL,
		secret: env.BETTER_AUTH_SECRET,
		database: drizzleAdapter(drizzle(env.DB, { schema }), { provider: 'sqlite', schema }),
		// The OIDC provider serves its own /.well-known routes at the issuer root (see worker/index.ts)
		disabledPaths: ['/token'],
		socialProviders: {
			github: {
				clientId: env.GITHUB_CLIENT_ID,
				clientSecret: env.GITHUB_CLIENT_SECRET,
			},
		},
		databaseHooks: {
			user: {
				create: {
					// Invite-only: only allowlisted emails can create an account
					before: async (user) => {
						if (!allowedEmails.has(user.email.toLowerCase())) {
							throw new APIError('FORBIDDEN', { message: 'This email is not invited.' })
						}
						return { data: user }
					},
				},
			},
		},
		plugins: [
			jwt({ jwt: { issuer: baseURL } }),
			passkey({ rpID: new URL(baseURL).hostname, rpName: 'jman.dev' }),
			oauthProvider({
				loginPage: '/sign-in',
				consentPage: '/consent',
				scopes: ['openid', 'profile', 'email', 'offline_access'],
				// Clients are registered by an admin (see /admin/clients); no dynamic registration.
				allowDynamicClientRegistration: false,
			}),
		],
	})
}

export type Auth = ReturnType<typeof createAuth>
