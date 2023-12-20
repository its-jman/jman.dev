import {config as loadDotenv} from 'dotenv'

interface LoadConfig<T> {
	path?: string
	schema?: {parse: (t: unknown) => T}
}

export function load<T = Record<string, string>>(
	obj: unknown,
	config?: LoadConfig<T>
): T {
	const out = loadDotenv({path: config?.path, processEnv: {}}).parsed!
	return config?.schema?.parse(out) ?? (out as T)
}
