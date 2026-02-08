import { describe, it, expect, beforeEach, vi } from 'vitest';
import { build } from 'esbuild';
import { resolve, join } from 'path';
import { readFileSync } from 'fs';
import { SondaEsbuildPlugin } from '../src/integrations/esbuild.js';
import { version } from '../package.json' with { type: 'json' };

const mockConsoleInfo = vi.spyOn(console, 'info').mockImplementation(() => {});

const toOutputDir = (path: string = '') => join(import.meta.dirname, 'dist', path);
const getFixture = (path: string) => resolve(import.meta.dirname, 'fixtures', path);
const getReport = (filename: string = 'sonda_0.json') => JSON.parse(readFileSync(toOutputDir(filename), 'utf-8'));

describe('SondaEsbuildPlugin', () => {
	beforeEach(() => {
		mockConsoleInfo.mockClear();
	});

	it('should generate correct report for bundlers fixture', async () => {
		await build({
			entryPoints: [getFixture('bundlers/index.js')],
			outfile: toOutputDir('esbuild_1.js'),
			bundle: true,
			sourcemap: true,
			format: 'esm',
			plugins: [
				SondaEsbuildPlugin({
					open: false,
					format: 'json',
					outputDir: toOutputDir()
				})
			]
		});

		expect(getReport()).toEqual({
			metadata: {
				version,
				integration: 'esbuild',
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
					parent: 'tests/dist/esbuild_1.js',
					type: 'other',
					uncompressed: 599
				},
				{
					brotli: 0,
					gzip: 0,
					kind: 'asset',
					name: 'tests/dist/esbuild_1.js',
					type: 'script',
					uncompressed: 669
				},
				{
					kind: 'filesystem',
					name: 'tests/fixtures/bundlers/index.js',
					type: 'script',
					format: 'esm',
					uncompressed: 66
				},
				{
					brotli: 0,
					format: 'esm',
					gzip: 0,
					kind: 'chunk',
					name: 'tests/fixtures/bundlers/index.js',
					parent: 'tests/dist/esbuild_1.js',
					type: 'script',
					uncompressed: 31
				},
				{
					kind: 'filesystem',
					name: 'tests/fixtures/detailed/index.js',
					type: 'script',
					format: 'esm',
					uncompressed: 290
				},
				{
					format: 'other',
					kind: 'sourcemap',
					name: 'tests/fixtures/detailed/src/pow.js',
					parent: null,
					type: 'script',
					uncompressed: 67
				},
				{
					brotli: 0,
					format: 'other',
					gzip: 0,
					kind: 'chunk',
					name: 'tests/fixtures/detailed/src/pow.js',
					parent: 'tests/dist/esbuild_1.js',
					type: 'script',
					uncompressed: 39
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
					source: 'tests/dist/esbuild_1.js',
					target: 'tests/fixtures/bundlers/index.js'
				}
			],
			dependencies: [],
			issues: [],
			sourcemaps: []
		});
	});

	it('should generate correct report for detailed fixture', async () => {
		await build({
			entryPoints: [getFixture('detailed/index.js')],
			outfile: toOutputDir('esbuild_1.js'),
			bundle: true,
			sourcemap: true,
			format: 'esm',
			plugins: [
				SondaEsbuildPlugin({
					open: false,
					format: 'json',
					outputDir: toOutputDir()
				})
			]
		});

		expect(getReport()).toEqual({
			metadata: {
				version,
				integration: 'esbuild',
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
					parent: 'tests/dist/esbuild_1.js',
					type: 'other',
					uncompressed: 344
				},
				{
					brotli: 0,
					gzip: 0,
					kind: 'asset',
					name: 'tests/dist/esbuild_1.js',
					type: 'script',
					uncompressed: 365
				},
				{
					format: 'esm',
					kind: 'filesystem',
					name: 'tests/fixtures/detailed/index.js',
					type: 'script',
					uncompressed: 290
				},
				{
					format: 'other',
					kind: 'sourcemap',
					name: 'tests/fixtures/detailed/src/pow.js',
					parent: null,
					type: 'script',
					uncompressed: 67
				},
				{
					brotli: 0,
					format: 'other',
					gzip: 0,
					kind: 'chunk',
					name: 'tests/fixtures/detailed/src/pow.js',
					parent: 'tests/dist/esbuild_1.js',
					type: 'script',
					uncompressed: 21
				}
			],
			connections: [
				{
					kind: 'entrypoint',
					original: null,
					source: 'tests/dist/esbuild_1.js',
					target: 'tests/fixtures/detailed/index.js'
				}
			],
			dependencies: [],
			issues: [],
			sourcemaps: []
		});
	});

	it('should generate correct report for hasMapping fixture', async () => {
		await build({
			entryPoints: [getFixture('hasMapping/index.js')],
			outfile: toOutputDir('esbuild_1.js'),
			bundle: true,
			sourcemap: true,
			format: 'esm',
			plugins: [
				SondaEsbuildPlugin({
					open: false,
					format: 'json',
					outputDir: toOutputDir()
				})
			]
		});

		expect(getReport()).toEqual({
			metadata: {
				version,
				integration: 'esbuild',
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
					parent: 'tests/dist/esbuild_1.js',
					type: 'other',
					uncompressed: 118
				},
				{
					brotli: 0,
					gzip: 0,
					kind: 'asset',
					name: 'tests/dist/esbuild_1.js',
					type: 'script',
					uncompressed: 138
				},
				{
					format: 'esm',
					kind: 'filesystem',
					name: 'tests/fixtures/hasMapping/index.js',
					type: 'script',
					uncompressed: 91
				},
				{
					format: 'other',
					kind: 'sourcemap',
					name: 'tests/fixtures/hasMapping/src/index.js',
					parent: null,
					type: 'script',
					uncompressed: 72
				},
				{
					brotli: 0,
					format: 'other',
					gzip: 0,
					kind: 'chunk',
					name: 'tests/fixtures/hasMapping/src/index.js',
					parent: 'tests/dist/esbuild_1.js',
					type: 'script',
					uncompressed: 20
				}
			],
			connections: [
				{
					kind: 'entrypoint',
					original: null,
					source: 'tests/dist/esbuild_1.js',
					target: 'tests/fixtures/hasMapping/index.js'
				}
			],
			dependencies: [],
			issues: [],
			sourcemaps: []
		});
	});

	it('should generate correct report for noMapping fixture', async () => {
		await build({
			entryPoints: [getFixture('noMapping/index.js')],
			outfile: toOutputDir('esbuild_1.js'),
			bundle: true,
			sourcemap: true,
			format: 'esm',
			plugins: [
				SondaEsbuildPlugin({
					open: false,
					format: 'json',
					outputDir: toOutputDir()
				})
			]
		});

		expect(getReport()).toEqual({
			metadata: {
				version,
				integration: 'esbuild',
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
					parent: 'tests/dist/esbuild_1.js',
					type: 'other',
					uncompressed: 93
				},
				{
					brotli: 0,
					gzip: 0,
					kind: 'asset',
					name: 'tests/dist/esbuild_1.js',
					type: 'script',
					uncompressed: 132
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
					parent: 'tests/dist/esbuild_1.js',
					type: 'script',
					uncompressed: 39
				}
			],
			connections: [
				{
					kind: 'entrypoint',
					original: null,
					source: 'tests/dist/esbuild_1.js',
					target: 'tests/fixtures/noMapping/index.js'
				}
			],
			dependencies: [],
			issues: [],
			sourcemaps: []
		});
	});

	it('should not generate reports when disabled', async () => {
		await build({
			entryPoints: [getFixture('bundlers/index.js')],
			outfile: toOutputDir('esbuild_1.js'),
			bundle: true,
			sourcemap: true,
			format: 'esm',
			plugins: [
				SondaEsbuildPlugin({
					open: false,
					format: 'json',
					enabled: false,
					outputDir: toOutputDir()
				})
			]
		});

		expect(() => getReport()).toThrowError();
	});

	it('should respect custom report filename', async () => {
		await build({
			entryPoints: [getFixture('noMapping/index.js')],
			outfile: toOutputDir('esbuild_1.js'),
			bundle: true,
			sourcemap: true,
			format: 'esm',
			plugins: [
				SondaEsbuildPlugin({
					open: false,
					format: 'json',
					filename: 'custom-report',
					outputDir: toOutputDir()
				})
			]
		});

		expect(getReport('custom-report.json')).toEqual({
			metadata: {
				version,
				integration: 'esbuild',
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
					parent: 'tests/dist/esbuild_1.js',
					type: 'other',
					uncompressed: 93
				},
				{
					brotli: 0,
					gzip: 0,
					kind: 'asset',
					name: 'tests/dist/esbuild_1.js',
					type: 'script',
					uncompressed: 132
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
					parent: 'tests/dist/esbuild_1.js',
					type: 'script',
					uncompressed: 39
				}
			],
			connections: [
				{
					kind: 'entrypoint',
					original: null,
					source: 'tests/dist/esbuild_1.js',
					target: 'tests/fixtures/noMapping/index.js'
				}
			],
			dependencies: [],
			issues: [],
			sourcemaps: []
		});
	});
});
