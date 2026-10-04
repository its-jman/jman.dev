import { useMutation } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { authClient } from '../auth-client'

type ConsentSearch = { client_id?: string; scope?: string }

export const Route = createFileRoute('/consent')({
	validateSearch: (search): ConsentSearch => ({
		client_id: typeof search['client_id'] === 'string' ? search['client_id'] : undefined,
		scope: typeof search['scope'] === 'string' ? search['scope'] : undefined,
	}),
	component: Consent,
})

function Consent() {
	const { client_id, scope } = Route.useSearch()
	const consent = useMutation({
		mutationFn: async (accept: boolean) => {
			const { data, error } = await authClient.oauth2.consent({ accept })
			if (error) throw new Error(error.message)
			return data
		},
		onSuccess: (data) => {
			if (data?.url) location.assign(data.url)
		},
	})

	return (
		<>
			<h1>Allow access?</h1>
			<p>
				<code>{client_id}</code> is asking for:
			</p>
			<ul>
				{scope?.split(' ').map((s) => (
					<li key={s}>{s}</li>
				))}
			</ul>
			<button type="button" disabled={consent.isPending} onClick={() => consent.mutate(true)}>
				Allow
			</button>
			<button type="button" disabled={consent.isPending} onClick={() => consent.mutate(false)}>
				Deny
			</button>
			{consent.error && <p className="error">{consent.error.message}</p>}
		</>
	)
}
