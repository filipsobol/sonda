import { vi, describe, it, expect } from 'vitest';
import { join } from 'path';
import { rolldown, type RolldownPlugin } from 'rolldown';
import Sonda from '../src/entrypoints/rollup';
import type { PluginOptions } from '../src/types';

const mocks = vi.hoisted( () => ( {
	generateReportFromAssets: vi.fn().mockResolvedValue( undefined )
} ) );

vi.mock( '../src/report/generate.js', () => ( {
	generateReportFromAssets: mocks.generateReportFromAssets
} ) );

describe( 'SondaRolldownPlugin', () => {
	it( 'should not do anything when enabled=false', async () => {
		const bundle = await rolldown( {
			input: join( import.meta.dirname, 'fixtures/bundlers/index.js' ),
			plugins: [
				Sonda( { enabled: false } ) as RolldownPlugin
			],
		} );

		/**
		 * `write` method is used instead of the `generate`, because
		 * the latter would not trigger the `writeBundle` hook.
		 */
		await bundle.write( {
			file: join( import.meta.dirname, 'dist/rolldown_1.js' ),
			sourcemap: true,
			format: 'es',
		} );

		expect( mocks.generateReportFromAssets ).not.toHaveBeenCalled();
	} );

	it( 'should transform the code correctly', async () => {
		const bundle = await rolldown( {
			input: join( import.meta.dirname, 'fixtures/bundlers/index.js' ),
			plugins: [
				Sonda() as RolldownPlugin
			],
		} );

		/**
		 * `write` method is used instead of the `generate`, because
		 * the latter would not trigger the `writeBundle` hook.
		 */
		await bundle.write( {
			file: join( import.meta.dirname, 'dist/rolldown_1.js' ),
			sourcemap: true,
			format: 'es',
		} );

		expect( mocks.generateReportFromAssets ).toHaveBeenCalledWith(
			[
				join( import.meta.dirname, 'dist/rolldown_1.js' ),
				join( import.meta.dirname, 'dist/rolldown_1.js.map' )
			],
			{
				'tests/fixtures/bundlers/index.js': {
					bytes: 66,
					format: 'esm',
					imports: [ 'tests/fixtures/detailed/index.js' ],
					belongsTo: null
				},
				'tests/fixtures/detailed/index.js': {
					bytes: 238,
					format: 'esm',
					imports: [],
					belongsTo: null
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

		const bundle = await rolldown( {
			input: join( import.meta.dirname, 'fixtures/bundlers/index.js' ),
			plugins: [ Sonda( options ) as RolldownPlugin ],
		} );

		/**
		 * `write` method is used instead of the `generate`, because
		 * the latter would not trigger the `writeBundle` hook.
		 */
		await bundle.write( {
			file: join( import.meta.dirname, 'dist/rolldown_2.js' ),
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
