import { vi, describe, it, expect } from 'vitest';
import { join } from 'path';
import { rollup } from 'rollup';
import Sonda from '../src/entrypoints/rollup.js';
import { Config, type IntegrationOptions } from '../src/config.js';

const mocks = vi.hoisted( () => ( {
	generateReport: vi.fn().mockResolvedValue( undefined )
} ) );

vi.mock( '../src/report.js', () => ( {
	generateReport: mocks.generateReport
} ) );

describe( 'SondaRollupPlugin', () => {
	it( 'should not do anything when enabled=false', async () => {
		const bundle = await rollup( {
			input: join( import.meta.dirname, 'fixtures/bundlers/index.js' ),
			plugins: [
				Sonda( { enabled: false } )
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

		expect( mocks.generateReport ).not.toHaveBeenCalled();
	} );

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

		expect( mocks.generateReport ).toHaveBeenCalledWith(
			join( import.meta.dirname, 'dist' ),
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

		expect( mocks.generateReport ).toHaveBeenCalledWith(
			join( import.meta.dirname, 'dist' ),
			expect.any( Config ),
			expect.any( Object ),
		);
	} );
} );
