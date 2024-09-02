
import type { JsonReportData } from 'sonar';
import type { TileData } from '../TreeMapGenerator';

declare module 'svelte/elements' {
	interface HTMLAttributes<T> {
		xmlns?: string;
	}
}

declare global {
	interface Window {
		SONAR_JSON_REPORT: JsonReportData;
	}
}

export {};
