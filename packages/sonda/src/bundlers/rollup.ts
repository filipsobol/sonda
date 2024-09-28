import { join, resolve, dirname } from 'path';
import { normalizeOptions, normalizePath } from '../utils.js';
import { generateReportFromAssets } from '../report/generate.js';
import type { Options, ModuleFormat, JsonReport } from '../types.js';
import type { Plugin, ModuleInfo, NormalizedOutputOptions, OutputBundle } from 'rollup';

const esmRegex = /* #__ PURE__ */ /\.m[tj]sx?$/;
const cjsRegex = /* #__ PURE__ */ /\.c[tj]sx?$/;

export function SondaRollupPlugin( options?: Partial<Options> ): Plugin {
	let inputs: JsonReport[ 'inputs' ] = {};

	return {
		name: 'sonda',

		writeBundle(
			{ dir, file }: NormalizedOutputOptions,
			bundle: OutputBundle
		) {
			const outputDir = resolve( process.cwd(), dir ?? dirname( file! ) );
			const assets = Object.keys( bundle ).map( name => join( outputDir, name ) );

			return generateReportFromAssets(
				assets,
				inputs,
				normalizeOptions( options )
			);
		},

		moduleParsed( module: ModuleInfo ) {
			inputs[ normalizePath( module.id ) ] = {
				bytes: module.code ? Buffer.byteLength( module.code ) : 0,
				format: getFormat( module.id, module.meta.commonjs?.isCommonJS ),
				imports: module.importedIds.map( id => normalizePath( id ) ),
				belongsTo: null,
			};
		}
	};
}

function getFormat( moduleId: string, isCommonJS: boolean | undefined ): ModuleFormat {
	if ( isCommonJS === true || cjsRegex.test( moduleId ) ) {
		return 'cjs';
	}

	if ( isCommonJS === false || esmRegex.test( moduleId ) ) {
		return 'esm';
	}

	return'unknown';
}
