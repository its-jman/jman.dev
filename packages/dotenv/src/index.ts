import {config as loadDotenv} from 'dotenv'
import {ZodError, fromZodError} from 'zod-validation-error'

interface LoadConfig<T> {
	path?: string
	schema?: {parse: (t: unknown) => T}
}

export function load<T = Record<string, string>>(
	obj: unknown,
	config?: LoadConfig<T>
): T {
	const out = loadDotenv({path: config?.path, processEnv: {}}).parsed!
	if (config?.schema) {
		try {
			return config?.schema.parse(out)
		} catch (err) {
			throw fromZodError(err as ZodError)
		}
	}
	return out as T
}
