import { vi, describe, it, expect } from 'vitest';
import { join } from 'path';
import { normalizeOptions, normalizePath } from '../src/utils';
import { beforeEach } from 'node:test';

const mocks = vi.hoisted( () => ( {
	windows: false,
} ) );

vi.mock( 'path', async ( originalImport ) => {
	const path: any = await originalImport();

	return {
		...path,
		relative( ...args: Array<string> ) {
			const implementation = mocks.windows
				? path.win32.relative
				: path.relative;
			
			return implementation( ...args );
		},
	}
} )

describe('utils.ts', () => {
	beforeEach( () => {
		mocks.windows = false;
	} );

	describe( 'normalizeOptions', () => {
		it( 'should return default options when no options are provided', () => {
			expect( normalizeOptions() ).toEqual( {
				enabled: true,
				format: 'html',
				filename: process.cwd() + '/sonda-report.html',
				open: true,
				detailed: false,
				sources: false,
				gzip: false,
				brotli: false,
				sourcesPathNormalizer: null,
			} );
		});

		it( 'merges defaults with provided values', () => {
			expect( normalizeOptions( { open: false } ) ).toEqual( {
				enabled: true,
				format: 'html',
				filename: process.cwd() + '/sonda-report.html',
				open: false,
				detailed: false,
				sources: false,
				gzip: false,
				brotli: false,
				sourcesPathNormalizer: null,
			} );
		} );

		it( 'allows overriding all options', () => {
			expect( normalizeOptions( {
				enabled: false,
				format: 'json',
				filename: __dirname + '/sonda-report.json',
				open: false,
				detailed: true,
				sources: true,
				gzip: true,
				brotli: true,
				sourcesPathNormalizer: path => path,
			} ) ).toEqual( {
				enabled: false,
				format: 'json',
				filename: __dirname + '/sonda-report.json',
				open: false,
				detailed: true,
				sources: true,
				gzip: true,
				brotli: true,
				sourcesPathNormalizer: expect.any( Function ),
			} );
		} );

		it( 'ensures the `filename` is an absolute path', () => {
			expect( normalizeOptions( { filename: './dist/sonda.json' } ) ).toEqual( {
				enabled: true,
				format: 'json',
				filename: process.cwd() + '/dist/sonda.json',
				open: true,
				detailed: false,
				sources: false,
				gzip: false,
				brotli: false,
				sourcesPathNormalizer: null,
			} );
		} );

		it( 'matches the `filename` when `format` is provided', () => {
			expect( normalizeOptions( { format: 'json' } ) ).toEqual( {
				enabled: true,
				format: 'json',
				filename: process.cwd() + '/sonda-report.json',
				open: true,
				detailed: false,
				sources: false,
				gzip: false,
				brotli: false,
				sourcesPathNormalizer: null,
			} );
		} );

		it( 'matches the `format` when `filename` is provided', () => {
			expect( normalizeOptions( { filename: 'sonda.json' } ) ).toEqual( {
				enabled: true,
				format: 'json',
				filename: process.cwd() + '/sonda.json',
				open: true,
				detailed: false,
				sources: false,
				gzip: false,
				brotli: false,
				sourcesPathNormalizer: null,
			} );
		} );

		it( 'warns and fixes `format` and `filename` mismatch', () => {
			const spy = vi.spyOn( console, 'warn' ).mockImplementationOnce( () => {} );

			const options = normalizeOptions( {
				format: 'json',
				filename: __dirname + '/sonda-report.html',
			} );

			expect( spy ).toHaveBeenCalledOnce();
			
			expect( options ).toEqual( {
				enabled: true,
				format: 'json',
				filename: __dirname + '/sonda-report.json',
				open: true,
				detailed: false,
				sources: false,
				gzip: false,
				brotli: false,
				sourcesPathNormalizer: null,
			} );
		} );
	} );

	describe( 'normalizePath', () => {
		it( 'should transform absolute paths to relative paths in POSIX format', () => {
			const relativePath = 'src/subfolder/file.ts';
			const absolutePath = join( process.cwd(), relativePath );

			expect( normalizePath( absolutePath ) ).toBe( relativePath );
		} );

		it( 'removes unicode escape sequence used by virtual modules in Rollup and Vite', () => {
			const relativePath = 'src/subfolder/file.ts';
			const absolutePath = join( process.cwd(), relativePath );

			expect( normalizePath( '\0' + absolutePath ) ).toBe( 'src/subfolder/file.ts' );
		} );

		it( 'should transform Windows paths to POSIX format', () => {
			const absolutePath = 'C:\\Users\\Test\\Project\\src\\subfolder\\file.ts';

			mocks.windows = true;
			vi.spyOn( process, 'cwd' ).mockImplementationOnce( () => 'C:\\Users\\Test\\Project' );

			expect( normalizePath( absolutePath ) ).toBe( 'src/subfolder/file.ts' );
		} );
	} );
} );
