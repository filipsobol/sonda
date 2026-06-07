import { defineConfig } from 'oxfmt';

export default defineConfig({
	printWidth: 120,
	bracketSpacing: true,
	semi: true,
	singleQuote: true,
	singleAttributePerLine: true,
	useTabs: true,
	trailingComma: 'none',
	bracketSameLine: false,
	arrowParens: 'avoid',
	objectWrap: 'preserve',
	experimentalSortPackageJson: true,
	ignorePatterns: ['.changeset/*.md', 'docs/public/demo.html']
}) as any;
