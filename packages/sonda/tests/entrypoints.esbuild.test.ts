import { vi, describe, it, expect } from 'vitest';
import { join } from 'path';
import esbuild from 'esbuild';
import Sonda from '../src/entrypoints/esbuild.js';
import { Config, type IntegrationOptions } from '../src/config.js';

const mocks = vi.hoisted(() => ({
	generateReport: vi.fn().mockResolvedValue(undefined)
}));

vi.mock('../src/report.js', () => ({
	generateReport: mocks.generateReport
}));

describe('SondaEsbuildPlugin', () => {
	it('should not do anything when enabled=false', async () => {
		await esbuild.build({
			entryPoints: [join(import.meta.dirname, 'fixtures/bundlers/index.js')],
			bundle: true,
			outfile: join(import.meta.dirname, 'dist/esbuild_1.js'),
			sourcemap: true,
			plugins: [Sonda({ enabled: false })],
			format: 'esm'
		});

		expect(mocks.generateReport).not.toHaveBeenCalled();
	});

	it('should transform the code correctly', async () => {
		await esbuild.build({
			entryPoints: [join(import.meta.dirname, 'fixtures/bundlers/index.js')],
			bundle: true,
			outfile: join(import.meta.dirname, 'dist/esbuild_1.js'),
			sourcemap: true,
			plugins: [Sonda()],
			format: 'esm'
		});

		expect(mocks.generateReport).toHaveBeenCalledWith(join(import.meta.dirname, 'dist'), expect.any(Config), {
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
			},
			'tests/fixtures/detailed/src/maths.js': {
				belongsTo: 'tests/fixtures/detailed/index.js',
				bytes: 201,
				format: 'esm',
				type: 'script',
				imports: []
			},
			'tests/fixtures/detailed/src/pow.js': {
				belongsTo: 'tests/fixtures/detailed/index.js',
				bytes: 67,
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

		await esbuild.build({
			entryPoints: [join(import.meta.dirname, 'fixtures/bundlers/index.js')],
			bundle: true,
			outfile: join(import.meta.dirname, 'dist/esbuild_2.js'),
			sourcemap: true,
			plugins: [Sonda(options)],
			format: 'esm'
		});

		expect(mocks.generateReport).toHaveBeenCalledWith(
			join(import.meta.dirname, 'dist'),
			expect.any(Config),
			expect.any(Object)
		);
	});
});
