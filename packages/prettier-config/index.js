module.exports = {
	arrowParens: 'always',
	trailingComma: 'es5',
	singleQuote: true,
	bracketSpacing: false,
	printWidth: 90,
	useTabs: true,
	tabWidth: 2,
	semi: false,
	plugins: ['prettier-plugin-astro'],
	overrides: [
		{
			files: '*.astro',
			options: {
				parser: 'astro',
			},
		},
	],
}
