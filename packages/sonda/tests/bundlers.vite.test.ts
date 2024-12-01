import { vi, describe, it, expect } from 'vitest';
import { join } from 'path';
import { build } from 'vite';
import Sonda from '../src/bundlers/rollup';
import type { PluginOptions } from '../src/types';

const mocks = vi.hoisted( () => ( {
	generateReportFromAssets: vi.fn().mockResolvedValue( undefined )
} ) );

vi.mock( '../src/report/generate.js', () => ( {
	generateReportFromAssets: mocks.generateReportFromAssets
} ) );

describe( 'SondaRollupPlugin in Vite', () => {
	it( 'should transform the code correctly', async () => {
		await build( {
			logLevel: 'silent',
			build: {
				outDir: join( import.meta.dirname, 'dist' ),
				sourcemap: true,
				rollupOptions: {
					input: join( import.meta.dirname, 'fixtures/bundlers/index.js' ),
					output: {
						format: 'es',
						entryFileNames: 'vite_1.js',
					},
				},
			},
			plugins: [ Sonda() ],
		} );

		expect( mocks.generateReportFromAssets ).toHaveBeenCalledWith(
			[
				join( import.meta.dirname, 'dist/vite_1.js' ),
				join( import.meta.dirname, 'dist/vite_1.js.map' )
			],
			{
				'tests/fixtures/bundlers/index.js': {
					belongsTo: null,
					bytes: 66,
					format: 'esm',
					imports: [ 'tests/fixtures/detailed/index.js' ]
				},
				'tests/fixtures/detailed/index.js': {
					belongsTo: null,
					bytes: 238,
					format: 'esm',
					imports: []
				}
			},
			{}
		);
	} );

	it( 'passes options to the `generateReportFromAssets` function', async () => {
		const options: Partial<PluginOptions> = {
			format: 'json',
			open: false
		};

		await build( {
			logLevel: 'silent',
			build: {
				outDir: join( import.meta.dirname, 'dist' ),
				sourcemap: true,
				rollupOptions: {
					input: join( import.meta.dirname, 'fixtures/bundlers/index.js' ),
					output: {
						format: 'es',
						entryFileNames: 'vite_2.js',
					},
				},
			},
			plugins: [ Sonda( options ) ],
		} );

		expect( mocks.generateReportFromAssets ).toHaveBeenCalledWith(
			expect.any( Array ),
			expect.any( Object ),
			options
		);
	} );
} );
