#!/usr/bin/env node

import {Command} from 'commander'
import {$ as $$, execa} from 'execa'
import fs from 'fs'

import path from 'path'
import {fileURLToPath} from 'url'

const $ = $$({stdio: 'inherit'})
const __dirname = path.dirname(fileURLToPath(import.meta.url))

const json = JSON.parse(
	fs.readFileSync(path.join(__dirname, './package.json')).toString()
)

const program = new Command()

program
	.name('jman')
	.description(json.description ?? 'Unknown')
	.version(json.version ?? 'Unknown')

program
	.command('is-git-clean')
	.description(
		'exits with non-zero exit code if git status is not clean. Uses `git status --porcelain` to determine.'
	)
	.action(async () => {
		const {stdout} = await execa('git', ['status', '--porcelain'])
		if (stdout) {
			console.warn(stdout)
			console.warn('git working directory not clean... exiting.')
			process.exit(1)
		}
	})

program
	.command('prettier')
	.description('adds prettier to the local project')
	.option('--npm', 'install using npm')
	.action(async (opts) => {
		const projectDir = process.cwd()
		const localPaths = {
			packageJson: path.join(projectDir, 'package.json'),
		}
		const json = (() => {
			try {
				const text = fs.readFileSync(localPaths.packageJson, 'utf-8')
				return JSON.parse(text)
			} catch {
				return null
			}
		})()

		if (!json) {
			throw new Error(
				`Failed to read package.json. Tried here: ${localPaths.packageJson}`
			)
		}
		await $`${opts.npm ? ['npm', 'i'] : 'ni'} -D @jman.dev/prettier-config@latest`
		// reorder to insert `prettier` just before `(dev)dependencies`
		/** @type Record<string, any> */
		const out = {}
		for (const [key, val] of Object.entries(json)) {
			if (!out['prettier'] && ['dependencies', 'devDependencies'].includes(key)) {
				out['prettier'] = '@jman.dev/prettier-config'
			}
			out[key] = val
		}
		fs.writeFileSync(localPaths.packageJson, JSON.stringify(out, null, 2))
	})

program.parse()
