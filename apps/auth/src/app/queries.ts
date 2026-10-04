import { queryOptions } from '@tanstack/react-query'
import { authClient } from './auth-client'

async function unwrap<T>(promise: Promise<{ data: T | null; error: { message?: string } | null }>) {
	const { data, error } = await promise
	if (error) throw new Error(error.message ?? 'Request failed')
	return data
}

export const sessionQuery = queryOptions({
	queryKey: ['session'],
	queryFn: () => unwrap(authClient.getSession()),
})

export const passkeysQuery = queryOptions({
	queryKey: ['passkeys'],
	queryFn: () => unwrap(authClient.passkey.listUserPasskeys()),
})
