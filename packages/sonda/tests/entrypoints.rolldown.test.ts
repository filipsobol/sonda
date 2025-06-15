import { vi, describe, it, expect } from 'vitest';
import { join } from 'path';
import { rolldown, type RolldownPlugin } from 'rolldown';
import Sonda from '../src/entrypoints/rollup.js';
import { Config, type IntegrationOptions } from '../src/config.js';

const mocks = vi.hoisted( () => ( {
	generateReport: vi.fn().mockResolvedValue( undefined )
} ) );

vi.mock( '../src/report.js', () => ( {
	generateReport: mocks.generateReport
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

		expect( mocks.generateReport ).not.toHaveBeenCalled();
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

		expect( mocks.generateReport ).toHaveBeenCalledWith(
			join( import.meta.dirname, 'dist' ),
			expect.any( Config ),
			{
				'tests/fixtures/bundlers/index.js': {
					bytes: 66,
					format: 'esm',
					type: 'script',
					imports: [ 'tests/fixtures/detailed/index.js' ],
					belongsTo: null
				},
				'tests/fixtures/detailed/index.js': {
					bytes: 238,
					format: 'esm',
					type: 'script',
					imports: [],
					belongsTo: null
				}
			}
		);
	} );

	it( 'passes options to the `generateReport` function', async () => {
		const options: Partial<IntegrationOptions> = {
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

		expect( mocks.generateReport ).toHaveBeenCalledWith(
			join( import.meta.dirname, 'dist' ),
			expect.any( Config ),
			expect.any( Object )
		);
	} );
} );
