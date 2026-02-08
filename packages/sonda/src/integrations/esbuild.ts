import { styleText } from 'util';
import { Config, type UserOptions } from '../config.js';
import { getTypeByName, normalizePath } from '../utils.js';
import { Report } from '../report/report.js';
import type { ImportKind, Metafile, Plugin } from 'esbuild';
import type { ConnectionKind } from '../report/types.js';

export function SondaEsbuildPlugin(userOptions: UserOptions = {}): Plugin {
	const options = new Config(userOptions, {
		integration: 'esbuild'
	});

	return {
		name: 'sonda-esbuild',
		setup(build) {
			if (!options.enabled) {
				return;
			}

			build.initialOptions.metafile = true;

			build.onEnd(result => processEsbuildMetafile(result.metafile!, options));
		}
	};
}

export async function processEsbuildMetafile(metafile: Metafile, options: Config): Promise<void> {
	const report = new Report(options);

	for (const [path, input] of Object.entries(metafile.inputs)) {
		const name = normalizePath(path);

		report.addResource({
			kind: 'filesystem',
			name,
			type: getTypeByName(path),
			format: input.format || 'other',
			uncompressed: input.bytes
		});

		input.imports.forEach(imp => {
			report.addConnection({
				kind: connectionKindMapper(imp.kind),
				source: name,
				target: normalizePath(imp.path),
				original: imp.original || null
			});
		});
	}

	for (const [path, output] of Object.entries(metafile.outputs)) {
		report.addAsset(path, output.entryPoint ? [output.entryPoint] : undefined);
	}

	const reportPaths = await report.generate();

	for (const reportPath of reportPaths) {
		console.info(styleText('green', `📝 Sonda report generated: ${reportPath}`));
	}
}

/**
 * Maps esbuild's ImportKind to Sonda's ConnectionKind.
 */
function connectionKindMapper(kind: ImportKind | undefined): ConnectionKind {
	switch (kind) {
		case 'entry-point':
			return 'entrypoint';
		case 'import-statement':
		case 'import-rule':
			return 'import';
		case 'require-call':
		case 'require-resolve':
			return 'require';
		case 'dynamic-import':
			return 'dynamic-import';
		default:
			return 'import';
	}
}
