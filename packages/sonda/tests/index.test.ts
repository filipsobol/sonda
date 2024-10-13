import { describe, it, expect } from 'vitest';
import {
	SondaEsbuildPlugin,
	SondaRollupPlugin,
	SondaWebpackPlugin,
} from '../src/index';

describe('index.ts', () => {
	it( 'exports SondaEsbuildPlugin', () => {
		expect( SondaEsbuildPlugin ).toBeDefined();
	} );

	it( 'exports SondaRollupPlugin', () => {
		expect( SondaRollupPlugin ).toBeDefined();
	} );

	it( 'exports SondaWebpackPlugin', () => {
		expect( SondaWebpackPlugin ).toBeDefined();
	} );
} );
