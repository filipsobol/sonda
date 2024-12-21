import { join, resolve, dirname } from 'path';
import {
	generateReportFromAssets,
	cjsRegex,
	jsRegexp,
	normalizePath,
	type JsonReport,
	type ModuleFormat,
	type UserOptions
} from '../index.js';
import type { Plugin, ModuleInfo, NormalizedOutputOptions, OutputBundle } from 'rollup';

export default function SondaRollupPlugin( options: Partial<UserOptions> = {} ): Plugin {
	if ( options.enabled === false ) {
		return { name: 'sonda' };
	}

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
				options
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

	if ( isCommonJS === false || jsRegexp.test( moduleId ) ) {
		return 'esm';
	}

	return'unknown';
}
