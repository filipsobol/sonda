// @ts-ignore
declare module 'svelte/elements' {
	interface HTMLAttributes<T> {
		xmlns?: string | undefined | null;
	}
}

declare global {
	interface Window {
		SONAR_JSON_REPORT: Record<string, any>;
	}
}
