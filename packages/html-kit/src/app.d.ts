import type { OutputType } from '$lib/store.svelte';

// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		interface PageState {
			tab?: string;
			outputType?: OutputType;
		}
		// interface Platform {}
	}
}

declare module 'svelte/elements' {
	interface HTMLAttributes<T> {
		xmlns?: string;
	}
}

export {};
