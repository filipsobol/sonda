import { vi, describe, it, expect } from 'vitest';
import { join } from 'path';
import { rspack, type Compiler } from '@rspack/core';
import Sonda from '../src/entrypoints/webpack.js';
import { Config, type IntegrationOptions } from '../src/config.js';

const mocks = vi.hoisted( () => ( {
	generateReport: vi.fn().mockResolvedValue( undefined )
} ) );

vi.mock( '../src/report.js', () => ( {
	generateReport: mocks.generateReport
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
	it( 'should not do anything when enabled=false', async () => {
		const compiler = rspack( {
			entry: join( import.meta.dirname, 'fixtures/bundlers/index.js' ),
			output: {
				path: distDir,
				filename: 'rspack_1.js',
			},
			plugins: [ new Sonda( { enabled: false } ) ],
			devtool: 'source-map',
		} );

		await runCompiler( compiler );

		expect( mocks.generateReport ).not.toHaveBeenCalled();
	} );

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

		expect( mocks.generateReport ).toHaveBeenCalledWith(
			distDir,
			expect.any( Config ),
			{
				'tests/fixtures/bundlers/index.js': {
					belongsTo: null,
					bytes: 66,
					format: 'esm',
					type: 'script',
					imports: [ 'tests/fixtures/detailed/index.js' ]
				},
				'tests/fixtures/detailed/index.js': {
					belongsTo: null,
					bytes: 238,
					format: 'esm',
					type: 'script',
					imports: []
				}
			}
		);
	} );

	it( 'passes options to the `generateReport` function', async () => {
		const options: Partial<IntegrationOptions> = {
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

		expect( mocks.generateReport ).toHaveBeenCalledWith(
			distDir,
			expect.any( Config ),
			expect.any( Object )
		);
	} );
} );
