import { vi, describe, it, expect } from 'vitest';
import { normalizeOptions, normalizePath } from '../src/utils';
import path from 'path';

describe('utils.ts', () => {
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
			const absolutePath = path.join( process.cwd(), relativePath );

			expect( normalizePath( absolutePath ) ).toBe( relativePath );
		} );

		it( 'removes unicode escape sequence used by virtual modules in Rollup and Vite', () => {
			const relativePath = 'src/subfolder/file.ts';
			const absolutePath = path.join( process.cwd(), relativePath );

			expect( normalizePath( '\0' + absolutePath ) ).toBe( 'src/subfolder/file.ts' );
		} );

		it( 'should transform Windows paths to POSIX format', () => {
			const absolutePath = 'C:\\Users\\Test\\Project\\src\\subfolder\\file.ts';

			vi.spyOn( path, 'relative').mockImplementationOnce( path.win32.relative );
			vi.spyOn( process, 'cwd' ).mockImplementationOnce( () => 'C:\\Users\\Test\\Project' );

			expect( normalizePath( absolutePath ) ).toBe( 'src/subfolder/file.ts' );
		} );
	} );
} );
