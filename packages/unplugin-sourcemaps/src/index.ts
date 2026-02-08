import { createUnplugin, type UnpluginFactory, type UnpluginInstance, type TransformResult } from 'unplugin';
import { loadCodeAndMap } from 'load-source-map';

export interface Options {
	/**
	 * RegExp matching imports which sourcemap should be read.
	 *
	 * @default /\.js$/
	 */
	include: RegExp;

	/**
	 * RegExp matching imports for which sourcemaps should be ignored.
	 *
	 * @default undefined
	 */
	exclude?: RegExp;
}

type Factory = UnpluginFactory<Options | undefined>;

function factory(options?: Partial<Options>): ReturnType<Factory> {
	const defaultOptions: Options = {
		include: /\.js$/,
		exclude: undefined
	};

	const { include, exclude } = Object.assign({}, defaultOptions, options) as Options;

	return {
		name: 'unplugin-sourcemaps',
		enforce: 'pre',

		loadInclude(id: string): boolean {
			return include.test(id) && !exclude?.test(id);
		},

		load(id: string): TransformResult {
			return loadCodeAndMap(id) as TransformResult;
		}
	};
}

type Plugin = UnpluginInstance<Partial<Options> | undefined>;

export const plugin: Plugin = /* #__PURE__ */ createUnplugin(factory);
export const ViteSourcemap: Plugin['vite'] = plugin.vite;
export const RollupSourcemap: Plugin['rollup'] = plugin.rollup;
export const RolldownSourcemap: Plugin['rolldown'] = plugin.rolldown;
export const WebpackSourcemap: Plugin['webpack'] = plugin.webpack;
export const RspackSourcemap: Plugin['rspack'] = plugin.rspack;
export const EsbuildSourcemap: Plugin['esbuild'] = plugin.esbuild;
export const FarmSourcemap: Plugin['farm'] = plugin.farm;
