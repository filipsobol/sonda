import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://svelte.dev/docs/kit/integrations
	// for more information about preprocessors
	preprocess: vitePreprocess(),

	kit: {
		// https://svelte.dev/docs/kit/single-page-apps
		adapter: adapter( {
			fallback: 'index.html'
		} ),

		// https://svelte.dev/docs/kit/configuration#router
		router: {
			type: 'hash'
		},

		// https://svelte.dev/docs/kit/configuration#output
		output: {
			bundleStrategy: 'inline'
		}
	}
};

export default config;
