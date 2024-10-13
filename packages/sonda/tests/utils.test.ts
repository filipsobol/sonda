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
				open: true,
				format: 'html',
				detailed: false,
				gzip: false,
				brotli: false,
			} );
		});

		it( 'merges defaults with provided values', () => {
			expect( normalizeOptions( { format: 'json' } ) ).toEqual( {
				open: true,
				format: 'json',
				detailed: false,
				gzip: false,
				brotli: false,
			} );
		} );

		it( 'allows overriding all options', () => {
			expect( normalizeOptions( {
				open: false,
				format: 'json',
				detailed: true,
				gzip: true,
				brotli: true,
			} ) ).toEqual( {
				open: false,
				format: 'json',
				detailed: true,
				gzip: true,
				brotli: true,
			} );
		} )
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
