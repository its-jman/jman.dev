// Used only by `pnpm auth:generate` to emit the Drizzle schema. Never deployed.
import { createAuth, type AuthEnv } from './src/worker/auth'

export const auth = createAuth({
	DB: {} as D1Database,
	BETTER_AUTH_URL: 'http://localhost:5173',
	BETTER_AUTH_SECRET: 'cli-only-secret-cli-only-secret-00',
	GITHUB_CLIENT_ID: '',
	GITHUB_CLIENT_SECRET: '',
	ALLOWED_EMAILS: '' as AuthEnv['ALLOWED_EMAILS'],
})
