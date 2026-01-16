import { describe, it, expect, beforeEach, vi } from 'vitest';
import webpack from 'webpack';
import { resolve, join } from 'path';
import { readFileSync } from 'fs';
import { SondaWebpackPlugin } from '../src/integrations/webpack.js';

const mockConsoleInfo = vi.spyOn(console, 'info').mockImplementation(() => {});

const toOutputDir = (path: string = '') => join(import.meta.dirname, 'dist', path);
const getFixture = (path: string) => resolve(import.meta.dirname, 'fixtures', path);
const getReport = (filename: string = 'sonda_0.json') => JSON.parse(readFileSync(toOutputDir(filename), 'utf-8'));

describe('SondaWebpackPlugin', () => {
	beforeEach(() => {
		mockConsoleInfo.mockClear();
	});

	it('should generate correct report for bundlers fixture', async () => {
		const config = {
			entry: getFixture('bundlers/index.js'),
			devtool: 'source-map',
			output: {
				filename: 'webpack_1.js',
				path: toOutputDir()
			},
			plugins: [
				new SondaWebpackPlugin({
					open: false,
					format: 'json',
					outputDir: toOutputDir()
				})
			]
		};

		await new Promise<void>((resolve, reject) => {
			webpack(config, (err, stats) => {
				if (err) {
					reject(err);
					return;
				}
				if (stats?.hasErrors()) {
					reject(new Error(stats.toString()));
					return;
				}
				resolve();
			});
		});

		expect(getReport()).toEqual({
			metadata: {
				version: '0.10.1',
				integration: 'webpack',
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
					parent: 'tests/dist/webpack_1.js',
					type: 'other',
					uncompressed: 147
				},
				{
					brotli: 0,
					gzip: 0,
					kind: 'asset',
					name: 'tests/dist/webpack_1.js',
					type: 'script',
					uncompressed: 620
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
					parent: 'tests/dist/webpack_1.js',
					type: 'script',
					uncompressed: 14
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
					parent: 'tests/dist/webpack_1.js',
					type: 'script',
					uncompressed: 136
				},
				{
					format: 'other',
					kind: 'sourcemap',
					name: 'webpack/bootstrap',
					parent: null,
					type: 'other',
					uncompressed: 52
				},
				{
					brotli: 0,
					format: 'other',
					gzip: 0,
					kind: 'chunk',
					name: 'webpack/bootstrap',
					parent: 'tests/dist/webpack_1.js',
					type: 'other',
					uncompressed: 7
				},
				{
					format: 'other',
					kind: 'sourcemap',
					name: 'webpack/runtime/define property getters',
					parent: null,
					type: 'other',
					uncompressed: 308
				},
				{
					brotli: 0,
					format: 'other',
					gzip: 0,
					kind: 'chunk',
					name: 'webpack/runtime/define property getters',
					parent: 'tests/dist/webpack_1.js',
					type: 'other',
					uncompressed: 99
				},
				{
					format: 'other',
					kind: 'sourcemap',
					name: 'webpack/runtime/hasOwnProperty shorthand',
					parent: null,
					type: 'other',
					uncompressed: 88
				},
				{
					brotli: 0,
					format: 'other',
					gzip: 0,
					kind: 'chunk',
					name: 'webpack/runtime/hasOwnProperty shorthand',
					parent: 'tests/dist/webpack_1.js',
					type: 'other',
					uncompressed: 51
				},
				{
					format: 'other',
					kind: 'sourcemap',
					name: 'webpack/runtime/make namespace object',
					parent: null,
					type: 'other',
					uncompressed: 274
				},
				{
					brotli: 0,
					format: 'other',
					gzip: 0,
					kind: 'chunk',
					name: 'webpack/runtime/make namespace object',
					parent: 'tests/dist/webpack_1.js',
					type: 'other',
					uncompressed: 166
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
					source: 'tests/dist/webpack_1.js',
					target: 'tests/fixtures/bundlers/index.js'
				}
			],
			dependencies: [],
			issues: [],
			sourcemaps: []
		});
	});

	it('should generate correct report for detailed fixture', async () => {
		const config = {
			entry: getFixture('detailed/index.js'),
			devtool: 'source-map',
			output: {
				filename: 'webpack_1.js',
				path: toOutputDir()
			},
			plugins: [
				new SondaWebpackPlugin({
					open: false,
					format: 'json',
					outputDir: toOutputDir()
				})
			]
		};

		await new Promise<void>((resolve, reject) => {
			webpack(config, (err, stats) => {
				if (err) {
					reject(err);
					return;
				}
				if (stats?.hasErrors()) {
					reject(new Error(stats.toString()));
					return;
				}
				resolve();
			});
		});

		expect(getReport()).toEqual({
			metadata: {
				version: '0.10.1',
				integration: 'webpack',
				sources: false,
				gzip: false,
				brotli: false
			},
			resources: [
				{
					brotli: 0,
					gzip: 0,
					kind: 'asset',
					name: 'tests/dist/webpack_1.js',
					type: 'script',
					uncompressed: 23
				},
				{
					format: 'esm',
					kind: 'filesystem',
					name: 'tests/fixtures/detailed/index.js',
					type: 'script',
					uncompressed: 290
				}
			],
			connections: [],
			dependencies: [],
			issues: [],
			sourcemaps: []
		});
	});

	it('should generate correct report for hasMapping fixture', async () => {
		const config = {
			entry: getFixture('hasMapping/index.js'),
			devtool: 'source-map',
			output: {
				filename: 'webpack_1.js',
				path: toOutputDir()
			},
			plugins: [
				new SondaWebpackPlugin({
					open: false,
					format: 'json',
					outputDir: toOutputDir()
				})
			]
		};

		await new Promise<void>((resolve, reject) => {
			webpack(config, (err, stats) => {
				if (err) {
					reject(err);
					return;
				}
				if (stats?.hasErrors()) {
					reject(new Error(stats.toString()));
					return;
				}
				resolve();
			});
		});

		expect(getReport()).toEqual({
			metadata: {
				version: '0.10.1',
				integration: 'webpack',
				sources: false,
				gzip: false,
				brotli: false
			},
			resources: [
				{
					brotli: 0,
					gzip: 0,
					kind: 'asset',
					name: 'tests/dist/webpack_1.js',
					type: 'script',
					uncompressed: 23
				},
				{
					format: 'esm',
					kind: 'filesystem',
					name: 'tests/fixtures/hasMapping/index.js',
					type: 'script',
					uncompressed: 91
				}
			],
			connections: [],
			dependencies: [],
			issues: [],
			sourcemaps: []
		});
	});

	it('should generate correct report for noMapping fixture', async () => {
		const config = {
			entry: getFixture('noMapping/index.js'),
			devtool: 'source-map',
			output: {
				filename: 'webpack_1.js',
				path: toOutputDir()
			},
			plugins: [
				new SondaWebpackPlugin({
					open: false,
					format: 'json',
					outputDir: toOutputDir()
				})
			]
		};

		await new Promise<void>((resolve, reject) => {
			webpack(config, (err, stats) => {
				if (err) {
					reject(err);
					return;
				}
				if (stats?.hasErrors()) {
					reject(new Error(stats.toString()));
					return;
				}
				resolve();
			});
		});

		expect(getReport()).toEqual({
			metadata: {
				version: '0.10.1',
				integration: 'webpack',
				sources: false,
				gzip: false,
				brotli: false
			},
			resources: [
				{
					brotli: 0,
					gzip: 0,
					kind: 'asset',
					name: 'tests/dist/webpack_1.js',
					type: 'script',
					uncompressed: 23
				},
				{
					format: 'esm',
					kind: 'filesystem',
					name: 'tests/fixtures/noMapping/index.js',
					type: 'script',
					uncompressed: 45
				}
			],
			connections: [],
			dependencies: [],
			issues: [],
			sourcemaps: []
		});
	});

	it('should not generate reports when disabled', async () => {
		const config = {
			entry: getFixture('bundlers/index.js'),
			devtool: 'source-map',
			output: {
				filename: 'webpack_1.js',
				path: toOutputDir()
			},
			plugins: [
				new SondaWebpackPlugin({
					open: false,
					format: 'json',
					enabled: false,
					outputDir: toOutputDir()
				})
			]
		};

		await new Promise<void>((resolve, reject) => {
			webpack(config, (err, stats) => {
				if (err) {
					reject(err);
					return;
				}
				if (stats?.hasErrors()) {
					reject(new Error(stats.toString()));
					return;
				}
				resolve();
			});
		});

		expect(() => getReport()).toThrowError();
	});

	it('should respect custom report filename', async () => {
		const config = {
			entry: getFixture('noMapping/index.js'),
			devtool: 'source-map',
			output: {
				filename: 'webpack_1.js',
				path: toOutputDir()
			},
			plugins: [
				new SondaWebpackPlugin({
					open: false,
					format: 'json',
					filename: 'custom-report',
					outputDir: toOutputDir()
				})
			]
		};

		await new Promise<void>((resolve, reject) => {
			webpack(config, (err, stats) => {
				if (err) {
					reject(err);
					return;
				}
				if (stats?.hasErrors()) {
					reject(new Error(stats.toString()));
					return;
				}
				resolve();
			});
		});

		expect(getReport('custom-report.json')).toEqual({
			metadata: {
				version: '0.10.1',
				integration: 'webpack',
				sources: false,
				gzip: false,
				brotli: false
			},
			resources: [
				{
					brotli: 0,
					gzip: 0,
					kind: 'asset',
					name: 'tests/dist/webpack_1.js',
					type: 'script',
					uncompressed: 23
				},
				{
					format: 'esm',
					kind: 'filesystem',
					name: 'tests/fixtures/noMapping/index.js',
					type: 'script',
					uncompressed: 45
				}
			],
			connections: [],
			dependencies: [],
			issues: [],
			sourcemaps: []
		});
	});
});
