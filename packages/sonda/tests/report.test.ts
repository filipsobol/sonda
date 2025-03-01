import { vi, describe, it, expect } from 'vitest';
import { join } from 'path';
import { generateJsonReport, generateHtmlReport } from '../src/report/formats';
import { normalizeOptions } from '../src/utils';
import type { ReportInput } from '../src';
import { dependencies } from 'webpack';

vi.mock( 'fs', async ( originalImport ) => {
	const fs: any = await originalImport();

	return {
		...fs,
		readFileSync( path: string, options: any ) {
			if ( path.endsWith( 'index.html' ) ) {
				path = join( import.meta.dirname, 'fixtures/index.html' );
			}

			return fs.readFileSync( path, options );
		}
	};
} );

vi.spyOn( process, 'cwd' ).mockImplementation( () => import.meta.dirname );

const defaultOptions = normalizeOptions();

describe( 'report.ts', () => {
	describe( 'generateJsonReport', () => {
		it( 'should return report in JSON format', () => {
			expect( generateJsonReport( [], {}, defaultOptions ) ).toEqual( {
				inputs: {},
				outputs: {},
				dependencies: {},
				issues: {}
			} );
		} );

		it( 'passes provided #inputs', () => {
			const inputs = {
				test: {
					bytes: 42,
					format: 'esm',
					imports: [],
					belongsTo: null,
				} satisfies ReportInput
			};

			expect( generateJsonReport( [], inputs, defaultOptions ) ).toEqual( {
				inputs,
				outputs: {},
				dependencies: {},
				issues: {}
			} );
		} );

		it( 'ignores source maps in #assets', () => {
			const assets = [ 'file.js.map' ];

			expect( generateJsonReport( assets, {}, defaultOptions ) ).toEqual( {
				inputs: {},
				outputs: {},
				dependencies: {},
				issues: {}
			} );
		} );

		it( 'ignores files without sourceMappingURL', () => {
			const assets = [ join( import.meta.dirname, 'fixtures/noMapping/index.js' ) ];

			expect( generateJsonReport( assets, {}, defaultOptions ) ).toEqual( {
				inputs: {},
				outputs: {},
				dependencies: {},
				issues: {}
			} );
		} );

		it( 'processes JavaScript files with sourceMappingURL', () => {
			const assets = [ join( import.meta.dirname, 'fixtures/hasMapping/index.js' ) ];

			expect( generateJsonReport( assets, {}, defaultOptions ) ).toEqual( {
				inputs: {},
				outputs: {
					'fixtures/hasMapping/index.js': {
						type: 'script',
						brotli: 0,
						gzip: 0,
						uncompressed: 79,
						inputs: {
							'[unassigned]': {
								brotli: 0,
								gzip: 0,
								uncompressed: 34 // Length of the sourceMappingURL comment
							},
							'fixtures/hasMapping/src/index.js': {
								brotli: 0,
								gzip: 0,
								uncompressed: 45
							}
						}
					}
				},
				dependencies: {},
				issues: {}
			} );
		} );

		it( 'processes CSS files with sourceMappingURL', () => {
			const assets = [ join( import.meta.dirname, 'fixtures/hasMapping/index.css' ) ];

			expect( generateJsonReport( assets, {}, defaultOptions ) ).toEqual( {
				inputs: {},
				outputs: {
					'fixtures/hasMapping/index.css': {
						brotli: 0,
						gzip: 0,
						uncompressed: 60,
						map: undefined,
						type: 'style',
						inputs: {
							'[unassigned]': {
								brotli: 0,
								gzip: 0,
								uncompressed: 40 // Length of the sourceMappingURL comment
							},
							'fixtures/hasMapping/src/styles.css': {
								brotli: 0,
								gzip: 0,
								uncompressed: 20
							}
						}
					}
				},
				dependencies: {},
				issues: {}
			} );
		} );

		it( 'calculates Brotli and GZIP when their options are enabled', () => {
			const assets = [ join( import.meta.dirname, 'fixtures/hasMapping/index.js' ) ];
			const options = normalizeOptions( { brotli: true, gzip: true } );

			expect( generateJsonReport( assets, {}, options ) ).toEqual( {
				inputs: {},
				outputs: {
					'fixtures/hasMapping/index.js': {
						brotli: 71,
						gzip: 99,
						uncompressed: 79,
						map: undefined,
						type: 'script',
						inputs: {
							'[unassigned]': {
								brotli: 31,
								gzip: 45,
								uncompressed: 34 // Length of the sourceMappingURL comment
							},
							'fixtures/hasMapping/src/index.js': {
								brotli: 40,
								gzip: 54,
								uncompressed: 45
							}
						}
					}
				},
				dependencies: {},
				issues: {}
			} );
		} );

		it( 'includes sources maps', () => {
			const assets = [ join( import.meta.dirname, 'fixtures/hasMapping/index.js' ) ];
			const options = normalizeOptions( { sources: true } );

			expect( generateJsonReport( assets, {}, options ) ).toEqual( {
				inputs: {},
				outputs: {
					'fixtures/hasMapping/index.js': {
						brotli: 0,
						gzip: 0,
						uncompressed: 79,
						type: 'script',
						inputs: {
							'[unassigned]': {
								brotli: 0,
								gzip: 0,
								uncompressed: 34 // Length of the sourceMappingURL comment
							},
							'fixtures/hasMapping/src/index.js': {
								brotli: 0,
								gzip: 0,
								uncompressed: 45
							}
						},
						map: {
							version: 3,
							names: [],
							mappings: expect.any( Array ),
							sources: [
								'fixtures/hasMapping/src/index.js'
							],
							sourcesContent: [
								expect.stringContaining( 'import' )
							]
						}
					}
				},
				dependencies: {},
				issues: {}
			} );
		} );

		it( 'doesnt read existing source maps by default', () => {
			const assets = [ join( import.meta.dirname, 'fixtures/detailed/index.js' ) ];

			expect( generateJsonReport( assets, {}, normalizeOptions() ) ).toEqual( {
				inputs: {},
				outputs: {
					'fixtures/detailed/index.js': {
						brotli: 0,
						gzip: 0,
						uncompressed: 238,
						map: undefined,
						type: 'script',
						inputs: {
							'[unassigned]': {
								brotli: 0,
								gzip: 0,
								uncompressed: 34 // Length of the sourceMappingURL comment
							},
							'fixtures/detailed/src/maths.js': {
								brotli: 0,
								gzip: 0,
								uncompressed: 176
							},
							'fixtures/detailed/src/pow.js': {
								brotli: 0,
								gzip: 0,
								uncompressed: 28
							}
						}
					}
				},
				dependencies: {},
				issues: {}
			} );
		} );

		it( 'populates #inputs and #outputs with files from sources when `detailed` option is enabled', () => {
			const assets = [ join( import.meta.dirname, 'fixtures/detailed/index.js' ) ];
			const options = normalizeOptions( { detailed: true } );

			expect( generateJsonReport( assets, {}, options ) ).toEqual( {
				inputs: {
					'fixtures/detailed/src/add.js': {
						belongsTo: 'fixtures/detailed/src/maths.js',
						bytes: 47,
						format: 'unknown',
						imports: [],
					},
					'fixtures/detailed/src/divide.js': {
						belongsTo: 'fixtures/detailed/src/maths.js',
						bytes: 50,
						format: 'unknown',
						imports: [],
					},
					'fixtures/detailed/src/multiply.js': {
						belongsTo: 'fixtures/detailed/src/maths.js',
						bytes: 52,
						format: 'unknown',
						imports: [],
					},
					'fixtures/detailed/src/substract.js': {
						belongsTo: 'fixtures/detailed/src/maths.js',
						bytes: 53,
						format: 'unknown',
						imports: [],
					},
				},
				outputs: {
					'fixtures/detailed/index.js': {
						brotli: 0,
						gzip: 0,
						uncompressed: 238,
						map: undefined,
						type: 'script',
						inputs: {
							'[unassigned]': {
								brotli: 0,
								gzip: 0,
								uncompressed: 34 // Length of the sourceMappingURL comment
							},
							'fixtures/detailed/src/add.js': {
								brotli: 0,
								gzip: 0,
								uncompressed: 27
							},
							'fixtures/detailed/src/divide.js': {
								brotli: 0,
								gzip: 0,
								uncompressed: 27
							},
							'fixtures/detailed/src/multiply.js': {
								brotli: 0,
								gzip: 0,
								uncompressed: 95
							},
							'fixtures/detailed/src/pow.js': {
								brotli: 0,
								gzip: 0,
								uncompressed: 28
							},
							'fixtures/detailed/src/substract.js': {
								brotli: 0,
								gzip: 0,
								uncompressed: 27
							}
						}
					}
				},
				dependencies: {},
				issues: {}
			} );
		} );

		it( 'uses parent bundle format as formats for #inputs', () => {
			const assets = [ join( import.meta.dirname, 'fixtures/detailed/index.js' ) ];
			const inputs = {
				'fixtures/detailed/src/maths.js': {
					bytes: 176,
					format: 'esm',
					imports: [],
					belongsTo: null,
				}
			} satisfies Record<string, ReportInput>;
			const options = normalizeOptions( { detailed: true } );

			expect( generateJsonReport( assets, inputs, options ) ).toEqual( {
				inputs: {
					'fixtures/detailed/src/add.js': {
						belongsTo: 'fixtures/detailed/src/maths.js',
						bytes: 47,
						format: 'esm',
						imports: [],
					},
					'fixtures/detailed/src/divide.js': {
						belongsTo: 'fixtures/detailed/src/maths.js',
						bytes: 50,
						format: 'esm',
						imports: [],
					},
					'fixtures/detailed/src/maths.js': {
						bytes: 176,
						format: 'esm',
						imports: [],
						belongsTo: null,
					},
					'fixtures/detailed/src/multiply.js': {
						belongsTo: 'fixtures/detailed/src/maths.js',
						bytes: 52,
						format: 'esm',
						imports: [],
					},
					'fixtures/detailed/src/substract.js': {
						belongsTo: 'fixtures/detailed/src/maths.js',
						bytes: 53,
						format: 'esm',
						imports: [],
					},
				},
				outputs: {
					'fixtures/detailed/index.js': {
						brotli: 0,
						gzip: 0,
						uncompressed: 238,
						map: undefined,
						type: 'script',
						inputs: {
							'[unassigned]': {
								brotli: 0,
								gzip: 0,
								uncompressed: 34 // Length of the sourceMappingURL comment
							},
							'fixtures/detailed/src/add.js': {
								brotli: 0,
								gzip: 0,
								uncompressed: 27
							},
							'fixtures/detailed/src/divide.js': {
								brotli: 0,
								gzip: 0,
								uncompressed: 27
							},
							'fixtures/detailed/src/multiply.js': {
								brotli: 0,
								gzip: 0,
								uncompressed: 95
							},
							'fixtures/detailed/src/pow.js': {
								brotli: 0,
								gzip: 0,
								uncompressed: 28
							},
							'fixtures/detailed/src/substract.js': {
								brotli: 0,
								gzip: 0,
								uncompressed: 27
							}
						}
					}
				},
				dependencies: {},
				issues: {}
			} );
		} );
	} );

	describe( 'generateHtmlReport', () => {
		it( 'should return report in HTML format', () => {
			const stringifiedEmptyReport = encodeURIComponent( JSON.stringify( {
				inputs: {},
				outputs: {},
				dependencies: {},
				issues: {}
			} ) );

			expect( generateHtmlReport( [], {}, defaultOptions ) ).toContain( stringifiedEmptyReport );
		} );

		it( 'processes JavaScript files with sourceMappingURL', () => {
			const stringifiedReport = encodeURIComponent( JSON.stringify( {
				inputs: {},
				outputs: {
					'fixtures/hasMapping/index.js': {
						uncompressed: 79,
						gzip: 0,
						brotli: 0,
						type: 'script',
						inputs: {
							'[unassigned]': {
								uncompressed: 34, // Length of the sourceMappingURL comment
								gzip: 0,
								brotli: 0,
							},
							'fixtures/hasMapping/src/index.js': {
								uncompressed: 45,
								gzip: 0,
								brotli: 0,
							}
						}
					}
				},
				dependencies: {},
				issues: {}
			} ) );

			const assets = [ join( import.meta.dirname, 'fixtures/hasMapping/index.js' ) ];

			expect( generateHtmlReport( assets, {}, defaultOptions ) ).toContain( stringifiedReport );
		} );
	} );
} );
