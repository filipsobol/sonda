import { describe, it, expect, beforeEach, vi } from 'vitest';
import { rollup } from 'rollup';
import { resolve, join } from 'path';
import { readFileSync } from 'fs';
import { SondaRollupPlugin } from '../src/integrations/rollup.js';
import { version } from '../package.json' with { type: 'json' };

const mockConsoleInfo = vi.spyOn(console, 'info').mockImplementation(() => {});
const NORMALIZED_GENERATED_AT = '2026-06-07T12:00:00.000Z';

const toOutputDir = (path: string = '') => join(import.meta.dirname, 'dist', path);
const getFixture = (path: string) => resolve(import.meta.dirname, 'fixtures', path);
const getReport = (filename: string = 'sonda_0.json') => {
	const report = JSON.parse(readFileSync(toOutputDir(filename), 'utf-8'));

	expect(report.metadata.generatedAt).toEqual(expect.any(String));
	expect(new Date(report.metadata.generatedAt).toISOString()).toBe(report.metadata.generatedAt);
	report.metadata.generatedAt = NORMALIZED_GENERATED_AT;

	return report;
};

describe('SondaRollupPlugin', () => {
	beforeEach(() => {
		mockConsoleInfo.mockClear();
	});

	it('should generate correct report for bundlers fixture', async () => {
		const bundle = await rollup({
			input: getFixture('bundlers/index.js'),
			plugins: [
				SondaRollupPlugin({
					open: false,
					format: 'json',
					outputDir: toOutputDir()
				})
			]
		});

		await bundle.write({
			format: 'es',
			file: toOutputDir('rollup_1.js'),
			sourcemap: true
		});

		await bundle.close();

		expect(getReport()).toEqual({
			metadata: {
				version,
				generatedAt: NORMALIZED_GENERATED_AT,
				integration: 'rollup',
				sources: false,
				gzip: false,
				brotli: false
			},
			resources: [
				{
					format: 'other',
					kind: 'sourcemap',
					name: '[unassigned]',
					parent: null,
					type: 'other',
					uncompressed: 0
				},
				{
					brotli: 0,
					format: 'other',
					gzip: 0,
					kind: 'chunk',
					name: '[unassigned]',
					parent: 'tests/dist/rollup_1.js',
					type: 'other',
					uncompressed: 159
				},
				{
					brotli: 0,
					gzip: 0,
					kind: 'asset',
					name: 'tests/dist/rollup_1.js',
					type: 'script',
					uncompressed: 359
				},
				{
					format: 'esm',
					kind: 'filesystem',
					name: 'tests/fixtures/bundlers/index.js',
					type: 'script',
					uncompressed: 66
				},
				{
					brotli: 0,
					format: 'esm',
					gzip: 0,
					kind: 'chunk',
					name: 'tests/fixtures/bundlers/index.js',
					parent: 'tests/dist/rollup_1.js',
					type: 'script',
					uncompressed: 19
				},
				{
					format: 'esm',
					kind: 'filesystem',
					name: 'tests/fixtures/detailed/index.js',
					type: 'script',
					uncompressed: 290
				},
				{
					brotli: 0,
					format: 'esm',
					gzip: 0,
					kind: 'chunk',
					name: 'tests/fixtures/detailed/index.js',
					parent: 'tests/dist/rollup_1.js',
					type: 'script',
					uncompressed: 181
				}
			],
			connections: [
				{
					kind: 'import',
					source: 'tests/fixtures/bundlers/index.js',
					target: 'tests/fixtures/detailed/index.js',
					original: '../detailed/index.js'
				},
				{
					kind: 'entrypoint',
					original: null,
					source: 'tests/dist/rollup_1.js',
					target: 'tests/fixtures/bundlers/index.js'
				}
			],
			dependencies: [],
			issues: [],
			sourcemaps: []
		});
	});

	it('should record dynamic import connections', async () => {
		const bundle = await rollup({
			input: getFixture('dynamic/index.js'),
			plugins: [
				SondaRollupPlugin({
					open: false,
					format: 'json',
					outputDir: toOutputDir()
				})
			]
		});

		await bundle.write({
			format: 'es',
			dir: toOutputDir('rollup_dynamic'),
			sourcemap: true
		});

		await bundle.close();

		const { connections } = getReport();

		expect(connections).toEqual(
			expect.arrayContaining([
				{
					kind: 'dynamic-import',
					source: 'tests/fixtures/dynamic/index.js',
					target: 'tests/fixtures/dynamic/lazy.js',
					original: null
				}
			])
		);
		expect(connections).not.toContainEqual({
			kind: 'import',
			source: 'tests/fixtures/dynamic/index.js',
			target: 'tests/fixtures/dynamic/lazy.js',
			original: './lazy.js'
		});
	});

	it('should generate correct report for detailed fixture', async () => {
		const bundle = await rollup({
			input: getFixture('detailed/index.js'),
			plugins: [
				SondaRollupPlugin({
					open: false,
					format: 'json',
					outputDir: toOutputDir()
				})
			]
		});

		await bundle.write({
			format: 'es',
			file: toOutputDir('rollup_1.js'),
			sourcemap: true
		});

		await bundle.close();

		expect(getReport()).toEqual({
			metadata: {
				version,
				generatedAt: NORMALIZED_GENERATED_AT,
				integration: 'rollup',
				sources: false,
				gzip: false,
				brotli: false
			},
			resources: [
				{
					format: 'other',
					kind: 'sourcemap',
					name: '[unassigned]',
					parent: null,
					type: 'other',
					uncompressed: 0
				},
				{
					brotli: 0,
					format: 'other',
					gzip: 0,
					kind: 'chunk',
					name: '[unassigned]',
					parent: 'tests/dist/rollup_1.js',
					type: 'other',
					uncompressed: 113
				},
				{
					brotli: 0,
					gzip: 0,
					kind: 'asset',
					name: 'tests/dist/rollup_1.js',
					type: 'script',
					uncompressed: 294
				},
				{
					format: 'esm',
					kind: 'filesystem',
					name: 'tests/fixtures/detailed/index.js',
					type: 'script',
					uncompressed: 290
				},
				{
					brotli: 0,
					format: 'esm',
					gzip: 0,
					kind: 'chunk',
					name: 'tests/fixtures/detailed/index.js',
					parent: 'tests/dist/rollup_1.js',
					type: 'script',
					uncompressed: 181
				}
			],
			connections: [
				{
					kind: 'entrypoint',
					original: null,
					source: 'tests/dist/rollup_1.js',
					target: 'tests/fixtures/detailed/index.js'
				}
			],
			dependencies: [],
			issues: [],
			sourcemaps: []
		});
	});

	it('should generate correct report for hasMapping fixture', async () => {
		const bundle = await rollup({
			input: getFixture('hasMapping/index.js'),
			plugins: [
				SondaRollupPlugin({
					open: false,
					format: 'json',
					outputDir: toOutputDir()
				})
			]
		});

		await bundle.write({
			format: 'es',
			file: toOutputDir('rollup_1.js'),
			sourcemap: true
		});

		await bundle.close();

		expect(getReport()).toEqual({
			metadata: {
				version,
				generatedAt: NORMALIZED_GENERATED_AT,
				integration: 'rollup',
				sources: false,
				gzip: false,
				brotli: false
			},
			resources: [
				{
					format: 'other',
					kind: 'sourcemap',
					name: '[unassigned]',
					parent: null,
					type: 'other',
					uncompressed: 0
				},
				{
					brotli: 0,
					format: 'other',
					gzip: 0,
					kind: 'chunk',
					name: '[unassigned]',
					parent: 'tests/dist/rollup_1.js',
					type: 'other',
					uncompressed: 59
				},
				{
					brotli: 0,
					gzip: 0,
					kind: 'asset',
					name: 'tests/dist/rollup_1.js',
					type: 'script',
					uncompressed: 95
				},
				{
					format: 'esm',
					kind: 'filesystem',
					name: 'tests/fixtures/hasMapping/index.js',
					type: 'script',
					uncompressed: 91
				},
				{
					brotli: 0,
					format: 'esm',
					gzip: 0,
					kind: 'chunk',
					name: 'tests/fixtures/hasMapping/index.js',
					parent: 'tests/dist/rollup_1.js',
					type: 'script',
					uncompressed: 36
				}
			],
			connections: [
				{
					kind: 'entrypoint',
					original: null,
					source: 'tests/dist/rollup_1.js',
					target: 'tests/fixtures/hasMapping/index.js'
				}
			],
			dependencies: [],
			issues: [],
			sourcemaps: []
		});
	});

	it('should generate correct report for noMapping fixture', async () => {
		const bundle = await rollup({
			input: getFixture('noMapping/index.js'),
			plugins: [
				SondaRollupPlugin({
					open: false,
					format: 'json',
					outputDir: toOutputDir()
				})
			]
		});

		await bundle.write({
			format: 'es',
			file: toOutputDir('rollup_1.js'),
			sourcemap: true
		});

		await bundle.close();

		expect(getReport()).toEqual({
			metadata: {
				version,
				generatedAt: NORMALIZED_GENERATED_AT,
				integration: 'rollup',
				sources: false,
				gzip: false,
				brotli: false
			},
			resources: [
				{
					format: 'other',
					kind: 'sourcemap',
					name: '[unassigned]',
					parent: null,
					type: 'other',
					uncompressed: 0
				},
				{
					brotli: 0,
					format: 'other',
					gzip: 0,
					kind: 'chunk',
					name: '[unassigned]',
					parent: 'tests/dist/rollup_1.js',
					type: 'other',
					uncompressed: 54
				},
				{
					brotli: 0,
					gzip: 0,
					kind: 'asset',
					name: 'tests/dist/rollup_1.js',
					type: 'script',
					uncompressed: 92
				},
				{
					format: 'esm',
					kind: 'filesystem',
					name: 'tests/fixtures/noMapping/index.js',
					type: 'script',
					uncompressed: 45
				},
				{
					brotli: 0,
					format: 'esm',
					gzip: 0,
					kind: 'chunk',
					name: 'tests/fixtures/noMapping/index.js',
					parent: 'tests/dist/rollup_1.js',
					type: 'script',
					uncompressed: 38
				}
			],
			connections: [
				{
					kind: 'entrypoint',
					original: null,
					source: 'tests/dist/rollup_1.js',
					target: 'tests/fixtures/noMapping/index.js'
				}
			],
			dependencies: [],
			issues: [],
			sourcemaps: []
		});
	});

	it('should not generate reports when disabled', async () => {
		const bundle = await rollup({
			input: getFixture('bundlers/index.js'),
			plugins: [
				SondaRollupPlugin({
					open: false,
					format: 'json',
					enabled: false,
					outputDir: toOutputDir()
				})
			]
		});

		await bundle.write({
			format: 'es',
			file: toOutputDir('rollup_1.js'),
			sourcemap: true
		});

		await bundle.close();

		expect(() => getReport()).toThrowError();
	});

	it('should respect custom report filename', async () => {
		const bundle = await rollup({
			input: getFixture('noMapping/index.js'),
			plugins: [
				SondaRollupPlugin({
					open: false,
					format: 'json',
					filename: 'custom-report',
					outputDir: toOutputDir()
				})
			]
		});

		await bundle.write({
			format: 'es',
			file: toOutputDir('rollup_1.js'),
			sourcemap: true
		});

		await bundle.close();

		expect(getReport('custom-report.json')).toEqual({
			metadata: {
				version,
				generatedAt: NORMALIZED_GENERATED_AT,
				integration: 'rollup',
				sources: false,
				gzip: false,
				brotli: false
			},
			resources: [
				{
					format: 'other',
					kind: 'sourcemap',
					name: '[unassigned]',
					parent: null,
					type: 'other',
					uncompressed: 0
				},
				{
					brotli: 0,
					format: 'other',
					gzip: 0,
					kind: 'chunk',
					name: '[unassigned]',
					parent: 'tests/dist/rollup_1.js',
					type: 'other',
					uncompressed: 54
				},
				{
					brotli: 0,
					gzip: 0,
					kind: 'asset',
					name: 'tests/dist/rollup_1.js',
					type: 'script',
					uncompressed: 92
				},
				{
					format: 'esm',
					kind: 'filesystem',
					name: 'tests/fixtures/noMapping/index.js',
					type: 'script',
					uncompressed: 45
				},
				{
					brotli: 0,
					format: 'esm',
					gzip: 0,
					kind: 'chunk',
					name: 'tests/fixtures/noMapping/index.js',
					parent: 'tests/dist/rollup_1.js',
					type: 'script',
					uncompressed: 38
				}
			],
			connections: [
				{
					kind: 'entrypoint',
					original: null,
					source: 'tests/dist/rollup_1.js',
					target: 'tests/fixtures/noMapping/index.js'
				}
			],
			dependencies: [],
			issues: [],
			sourcemaps: []
		});
	});
});
