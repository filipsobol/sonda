import { resolve } from 'path';
import { defineConfig } from 'vitest/config';

const resolveToTests = (path: string = '') => resolve(import.meta.dirname, 'tests', path);

export default defineConfig({
	test: {
		fileParallelism: false,
		dir: resolveToTests(),
		setupFiles: [resolveToTests('__setup__.ts')]
	}
}) as any;
