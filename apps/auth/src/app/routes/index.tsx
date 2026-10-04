import { useMutation, useQuery, useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, redirect } from '@tanstack/react-router'
import { authClient } from '../auth-client'
import { passkeysQuery, sessionQuery } from '../queries'

export const Route = createFileRoute('/')({
	beforeLoad: async ({ context }) => {
		const session = await context.queryClient.ensureQueryData(sessionQuery)
		if (!session) throw redirect({ to: '/sign-in' })
	},
	component: Account,
})

function Account() {
	const queryClient = useQueryClient()
	const { data: session } = useSuspenseQuery(sessionQuery)
	const passkeys = useQuery(passkeysQuery)

	const addPasskey = useMutation({
		mutationFn: async () => {
			const { error } = await authClient.passkey.addPasskey()
			if (error) throw new Error(error.message)
		},
		onSuccess: () => queryClient.invalidateQueries({ queryKey: passkeysQuery.queryKey }),
	})
	const signOut = useMutation({
		mutationFn: () => authClient.signOut(),
		onSuccess: () => {
			queryClient.clear()
			location.assign('/sign-in')
		},
	})

	return (
		<>
			<h1>Signed in as {session?.user.email}</h1>
			<h2>Passkeys</h2>
			<ul>
				{passkeys.data?.map((p) => <li key={p.id}>{p.name ?? p.deviceType}</li>)}
			</ul>
			<button type="button" disabled={addPasskey.isPending} onClick={() => addPasskey.mutate()}>
				Add a passkey
			</button>
			{addPasskey.error && <p className="error">{addPasskey.error.message}</p>}
			<button type="button" onClick={() => signOut.mutate()}>
				Sign out
			</button>
		</>
	)
}
