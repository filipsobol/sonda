import { vi, describe, it, expect } from 'vitest';
import { join } from 'path';
import { build } from 'vite';
import Sonda from '../src/entrypoints/rollup.js';
import { Config, type IntegrationOptions } from '../src/config.js';

const mocks = vi.hoisted(() => ({
	generateReport: vi.fn().mockResolvedValue(undefined)
}));

vi.mock('../src/report.js', () => ({
	generateReport: mocks.generateReport
}));

describe('SondaRollupPlugin in Vite', () => {
	it('should not do anything when enabled=false', async () => {
		await build({
			logLevel: 'silent',
			build: {
				outDir: join(import.meta.dirname, 'dist'),
				sourcemap: true,
				rollupOptions: {
					input: join(import.meta.dirname, 'fixtures/bundlers/index.js'),
					output: {
						format: 'es',
						entryFileNames: 'vite_1.js'
					}
				}
			},
			plugins: [Sonda({ enabled: false })]
		});

		expect(mocks.generateReport).not.toHaveBeenCalled();
	});

	it('should transform the code correctly', async () => {
		const outDir = join(import.meta.dirname, 'dist');

		await build({
			logLevel: 'silent',
			build: {
				outDir,
				sourcemap: true,
				rollupOptions: {
					input: join(import.meta.dirname, 'fixtures/bundlers/index.js'),
					output: {
						format: 'es',
						entryFileNames: 'vite_1.js'
					}
				}
			},
			plugins: [Sonda()]
		});

		expect(mocks.generateReport).toHaveBeenCalledWith(outDir, expect.any(Config), {
			'tests/fixtures/bundlers/index.js': {
				belongsTo: null,
				bytes: 66,
				format: 'esm',
				type: 'script',
				imports: ['tests/fixtures/detailed/index.js']
			},
			'tests/fixtures/detailed/index.js': {
				belongsTo: null,
				bytes: 238,
				format: 'esm',
				type: 'script',
				imports: []
			}
		});
	});

	it('passes options to the `generateReport` function', async () => {
		const options: Partial<IntegrationOptions> = {
			format: 'json',
			open: false
		};

		const outDir = join(import.meta.dirname, 'dist');

		await build({
			logLevel: 'silent',
			build: {
				outDir,
				sourcemap: true,
				rollupOptions: {
					input: join(import.meta.dirname, 'fixtures/bundlers/index.js'),
					output: {
						format: 'es',
						entryFileNames: 'vite_2.js'
					}
				}
			},
			plugins: [Sonda(options)]
		});

		expect(mocks.generateReport).toHaveBeenCalledWith(outDir, expect.any(Config), expect.any(Object));
	});
});
