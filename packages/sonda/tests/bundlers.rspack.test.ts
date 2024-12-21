import { vi, describe, it, expect } from 'vitest';
import { join } from 'path';
import { rspack, type Compiler } from '@rspack/core';
import Sonda from '../src/entrypoints/webpack';
import type { PluginOptions } from '../src/types';

const mocks = vi.hoisted( () => ( {
	generateReportFromAssets: vi.fn().mockResolvedValue( undefined )
} ) );

vi.mock( '../src/report/generate.js', () => ( {
	generateReportFromAssets: mocks.generateReportFromAssets
} ) );

const distDir = join( import.meta.dirname, 'dist' );

function runCompiler( compiler: Compiler ) {
	return new Promise<void>( ( resolve, reject ) => {
		compiler.run( ( err, stats ) => {
			if ( err || stats?.hasErrors() ) {
				return reject( err || stats?.toJson().errors );
			}
			resolve();
		} );
	} );
}

describe( 'SondaWebpackPlugin in Rspack', () => {
	it( 'should transform the code correctly', async () => {
		const compiler = rspack( {
			entry: join( import.meta.dirname, 'fixtures/bundlers/index.js' ),
			output: {
				path: distDir,
				filename: 'rspack_1.js',
			},
			plugins: [ new Sonda() ],
			devtool: 'source-map',
		} );

		await runCompiler( compiler );

		expect( mocks.generateReportFromAssets ).toHaveBeenCalledWith(
			[
				join( import.meta.dirname, 'dist/rspack_1.js' )
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

		const compiler = rspack( {
			entry: join( import.meta.dirname, 'fixtures/bundlers/index.js' ),
			output: {
				path: distDir,
				filename: 'rspack_2.js',
			},
			plugins: [ new Sonda( options ) ],
			devtool: 'source-map',
		} );

		await runCompiler( compiler );

		expect( mocks.generateReportFromAssets ).toHaveBeenCalledWith(
			expect.any( Array ),
			expect.any( Object ),
			options
		);
	} );
} );
