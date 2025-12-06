// @ts-check
import { defineConfig } from 'astro/config';
import node from '@astrojs/node';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import vue from '@astrojs/vue';
import Sonda from 'sonda/astro';

// https://astro.build/config
export default defineConfig({
	site: 'https://example.com',
	output: 'server',
	adapter: node({
		mode: 'standalone'
	}),
	vite: {
		build: {
			sourcemap: true
		}
	},
	integrations: [
		mdx(),
		sitemap(),
		vue(),
		Sonda({
			format: 'html',
			server: true
		})
	]
});
