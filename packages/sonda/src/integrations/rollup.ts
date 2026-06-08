import { styleText } from 'util';
import { extname, resolve, dirname } from 'path';
import { Config, type UserOptions } from '../config.js';
import { getTypeByName, normalizePath } from '../utils.js';
import { Report } from '../report/report.js';
import type { Plugin, ModuleInfo, OutputBundle, NormalizedOutputOptions } from 'rollup';
import type { ModuleFormat } from '../report/types.js';

export function SondaRollupPlugin(userOptions: UserOptions = {}): Plugin {
	const options = new Config(userOptions, {
		integration: 'rollup'
	});

	if (!options.enabled) {
		return { name: 'sonda/rollup' };
	}

	const report = new Report(options);
	const dynamicImportSources = new Set<string>();

	return {
		name: 'sonda/rollup',

		resolveDynamicImport(specifier: unknown, importer: string) {
			if (typeof specifier === 'string') {
				dynamicImportSources.add(connectionKey(importer, specifier));
			}

			return null;
		},

		async resolveId(source: string, importer: string | undefined, options) {
			if (!importer) {
				return;
			}

			if (dynamicImportSources.has(connectionKey(importer, source))) {
				return;
			}

			const resolved = await this.resolve(source, importer, { ...options, skipSelf: true });

			if (resolved) {
				report.addConnection({
					kind: 'import',
					source: normalizePath(importer),
					target: normalizePath(resolved.id),
					original: source
				});
			}

			return resolved;
		},

		moduleParsed(module: ModuleInfo) {
			const name = normalizePath(module.id);

			report.addResource({
				kind: 'filesystem',
				name,
				type: getTypeByName(name),
				format: getModuleFormat(name, module),
				uncompressed: module.code ? Buffer.byteLength(module.code) : 0
			});
		},

		buildEnd() {
			for (const id of this.getModuleIds()) {
				const module = this.getModuleInfo(id);

				if (!module) {
					continue;
				}

				for (const target of module.dynamicallyImportedIds) {
					report.addConnection({
						kind: 'dynamic-import',
						source: normalizePath(module.id),
						target: normalizePath(target),
						original: null
					});
				}
			}
		},

		async writeBundle({ dir, file }: NormalizedOutputOptions, bundle: OutputBundle) {
			const outputDir = resolve(process.cwd(), dir ?? dirname(file!));

			for (const [path, asset] of Object.entries(bundle)) {
				report.addAsset(
					resolve(outputDir, path),
					asset.type === 'chunk' && asset.facadeModuleId ? [asset.facadeModuleId] : undefined
				);
			}
		},

		async closeBundle() {
			const reportPaths = await report.generate();

			for (const reportPath of reportPaths) {
				console.info(styleText('green', `📝 Sonda report generated: ${reportPath}`));
			}
		}
	};
}

function connectionKey(importer: string, source: string): string {
	return `${importer}\0${source}`;
}

function getModuleFormat(name: string, module: ModuleInfo): ModuleFormat {
	if (getTypeByName(name) !== 'script') {
		return 'other';
	}

	const ext = extname(module.id);

	const isCommonJS =
		!!module.meta.commonjs?.isCommonJS ||
		// @ts-ignore - Rolldown uses `inputFormat` instead of `meta`.
		module.inputFormat === 'cjs' ||
		ext === '.cjs' ||
		ext === '.cts';

	return isCommonJS ? 'cjs' : 'esm';
}
