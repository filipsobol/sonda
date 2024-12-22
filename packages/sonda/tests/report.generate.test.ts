import { vi, describe, it, expect, beforeEach } from 'vitest';
import { generateReportFromAssets } from '../src/report/generate';
import { normalizeOptions } from '../src/utils';

const mocks = vi.hoisted( () => ( {
	open: vi.fn(),
	generateHtmlReport: vi.fn(),
	generateJsonReport: vi.fn(),
	writeFileSync: vi.fn(),
	readFileSync: vi.fn(),
	existsSync: vi.fn(),
	mkdirSync: vi.fn(),
} ) );

vi.mock( 'fs', () => ( {
	writeFileSync: mocks.writeFileSync,
	readFileSync: mocks.readFileSync,
	existsSync: mocks.existsSync,
	mkdirSync: mocks.mkdirSync,
} ) );

vi.mock( 'open', () => ( {
	default: mocks.open,
} ) );

vi.mock( '../src/report/formats.js', () => ( {
	generateHtmlReport: mocks.generateHtmlReport,
	generateJsonReport: mocks.generateJsonReport,
} ) );

describe( 'generate.ts', () => {
	beforeEach( () => {
		vi.clearAllMocks();
	} );

	it( 'saves HTML report by default', async () => {
		await generateReportFromAssets( [], {}, normalizeOptions() );

		expect( mocks.existsSync ).toHaveBeenCalled();
		expect( mocks.mkdirSync ).toHaveBeenCalled();
		expect( mocks.writeFileSync ).toHaveBeenCalled();
		expect( mocks.generateHtmlReport ).toHaveBeenCalled();
		expect( mocks.generateJsonReport ).not.toHaveBeenCalled();
	} );

	it( 'saves JSON report', async () => {
		await generateReportFromAssets( [], {}, normalizeOptions( { format: 'json' } ) );

		expect( mocks.existsSync ).toHaveBeenCalled();
		expect( mocks.mkdirSync ).toHaveBeenCalled();
		expect( mocks.writeFileSync ).toHaveBeenCalled();
		expect( mocks.generateJsonReport ).toHaveBeenCalled();
		expect( mocks.generateHtmlReport ).not.toHaveBeenCalled();
	} );

	it( 'opens the generated report by default', async () => {
		await generateReportFromAssets( [], {}, normalizeOptions() );

		expect( mocks.open ).toHaveBeenCalled();
	} );

	it( 'doesnt open the generated report with `options.open = false`', async () => {
		await generateReportFromAssets( [], {}, normalizeOptions( { open: false } ) );

		expect( mocks.open ).not.toHaveBeenCalled();
	} );
} );
