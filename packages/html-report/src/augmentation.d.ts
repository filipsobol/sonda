
import type { JsonReport } from 'sonda';
import type { TileData } from '../TreeMapGenerator';

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
