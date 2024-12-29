
import type { JsonReport } from 'sonda';

declare module 'svelte/elements' {
	interface HTMLAttributes<T> {
		xmlns?: string;
	}
}

declare global {
	interface Window {
		SONDA_JSON_REPORT: JsonReport;
	}
}

export {};
