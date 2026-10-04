import { useMutation } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { authClient } from '../auth-client'

export const Route = createFileRoute('/sign-in')({
	component: SignIn,
})

function SignIn() {
	// When reached from /oauth2/authorize, the oauthProviderClient plugin forwards the
	// signed query string with each sign-in request, so the flow resumes automatically.
	const github = useMutation({
		mutationFn: async () => {
			const { error } = await authClient.signIn.social({ provider: 'github', callbackURL: '/' })
			if (error) throw new Error(error.message)
		},
	})
	const passkey = useMutation({
		mutationFn: async () => {
			const { error } = await authClient.signIn.passkey()
			if (error) throw new Error(error.message)
		},
		onSuccess: () => {
			if (!new URLSearchParams(location.search).has('client_id')) location.assign('/')
		},
	})
	const error = github.error ?? passkey.error

	return (
		<>
			<h1>Sign in to jman.dev</h1>
			<button type="button" disabled={github.isPending} onClick={() => github.mutate()}>
				Continue with GitHub
			</button>
			<button type="button" disabled={passkey.isPending} onClick={() => passkey.mutate()}>
				Sign in with a passkey
			</button>
			{error && <p className="error">{error.message}</p>}
		</>
	)
}
