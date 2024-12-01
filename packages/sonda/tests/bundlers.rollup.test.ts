import { vi, describe, it, expect } from 'vitest';
import { join } from 'path';
import { rollup } from 'rollup';
import Sonda from '../src/bundlers/rollup';
import type { PluginOptions } from '../src/types';

const mocks = vi.hoisted( () => ( {
	generateReportFromAssets: vi.fn().mockResolvedValue( undefined )
} ) );

vi.mock( '../src/report/generate.js', () => ( {
	generateReportFromAssets: mocks.generateReportFromAssets
} ) );

describe( 'SondaRollupPlugin', () => {
	it( 'should transform the code correctly', async () => {
		const bundle = await rollup( {
			input: join( import.meta.dirname, 'fixtures/bundlers/index.js' ),
			plugins: [
				Sonda()
			],
		} );

		/**
		 * `write` method is used instead of the `generate`, because
		 * the latter would not trigger the `writeBundle` hook.
		 */
		await bundle.write( {
			file: join( import.meta.dirname, 'dist/rollup_1.js' ),
			sourcemap: true,
			format: 'es',
		} );

		expect( mocks.generateReportFromAssets ).toHaveBeenCalledWith(
			[
				join( import.meta.dirname, 'dist/rollup_1.js' ),
				join( import.meta.dirname, 'dist/rollup_1.js.map' )
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

		const bundle = await rollup( {
			input: join( import.meta.dirname, 'fixtures/bundlers/index.js' ),
			plugins: [ Sonda( options ) ],
		} );

		/**
		 * `write` method is used instead of the `generate`, because
		 * the latter would not trigger the `writeBundle` hook.
		 */
		await bundle.write( {
			file: join( import.meta.dirname, 'dist/rollup_2.js' ),
			sourcemap: true,
			format: 'es',
		} );

		expect( mocks.generateReportFromAssets ).toHaveBeenCalledWith(
			expect.any( Array ),
			expect.any( Object ),
			options
		);
	} );
} );
