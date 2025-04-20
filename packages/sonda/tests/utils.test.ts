import { vi, describe, it, expect, beforeEach } from 'vitest';
import { join } from 'path';
import { normalizePath } from '../src/utils.js';

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
