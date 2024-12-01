import { vi, describe, it, expect } from 'vitest';
import { join } from 'path';
import esbuild from 'esbuild';
import Sonda from '../src/bundlers/esbuild';
import type { PluginOptions } from '../src/types';

const mocks = vi.hoisted( () => ( {
	generateReportFromAssets: vi.fn().mockResolvedValue( undefined )
} ) );

vi.mock( '../src/report/generate.js', () => ( {
	generateReportFromAssets: mocks.generateReportFromAssets
} ) );

describe( 'SondaEsbuildPlugin', () => {
	it( 'should transform the code correctly', async () => {
		await esbuild.build( {
			entryPoints: [ join( import.meta.dirname, 'fixtures/bundlers/index.js' ) ],
			bundle: true,
			outfile: join( import.meta.dirname, 'dist/esbuild_1.js' ), 
			sourcemap: true,
			plugins: [ Sonda() ],
			format: 'esm',
		} );

		expect( mocks.generateReportFromAssets ).toHaveBeenCalledWith(
			[
				join( import.meta.dirname, 'dist/esbuild_1.js.map' ),
				join( import.meta.dirname, 'dist/esbuild_1.js' )
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
				},
				'tests/fixtures/detailed/src/maths.js': {
					belongsTo: 'tests/fixtures/detailed/index.js',
					bytes: 201,
					format: 'esm',
					imports: []
				},
				'tests/fixtures/detailed/src/pow.js': {
					belongsTo: 'tests/fixtures/detailed/index.js',
					bytes: 67,
					format: 'esm',
					imports: []
				}
			},
			{
				detailed: false
			}
		);
	} );

	it( 'passes options to the `generateReportFromAssets` function', async () => {
		const options: Partial<PluginOptions> = {
			format: 'json',
			open: false
		};

		await esbuild.build( {
			entryPoints: [ join( import.meta.dirname, 'fixtures/bundlers/index.js' ) ],
			bundle: true,
			outfile: join( import.meta.dirname, 'dist/esbuild_2.js' ),
			sourcemap: true,
			plugins: [ Sonda( options ) ],
			format: 'esm',
		} );

		expect( mocks.generateReportFromAssets ).toHaveBeenCalledWith(
			expect.any( Array ),
			expect.any( Object ),
			{ ...options, detailed: false }
		);
	} );
} );
