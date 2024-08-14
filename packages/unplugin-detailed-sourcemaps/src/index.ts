import {
  createUnplugin,
  type UnpluginFactory,
  type UnpluginInstance,
  type TransformResult
} from 'unplugin';
import { loadCodeAndMap } from './loadSourceMap.js';

export interface Options {

  /**
   * RegExp matching imports which sourcemap should be read.
   *
   * @default /\.js$/
   */
  include?: RegExp;

  /**
   * RegExp matching imports for which sourcemaps should be ignored.
   *
   * @default undefined
   */
  exclude?: RegExp;
}

type Factory = UnpluginFactory<Options | undefined>;

function factory( options?: Options ): ReturnType<Factory> {
  const defaultOptions: Options = {
    include: /\.js$/,
    exclude: undefined,
  };

  const {
    include,
    exclude
  } = Object.assign({}, defaultOptions, options) as Required<Options>;

  return {
    name: 'unplugin-pitbull',

    loadInclude( id: string ): boolean {
      return include.test(id) && ( !exclude || !exclude.test(id) );
    },

    load( id: string ): Promise<TransformResult> {
      return loadCodeAndMap( id );
    }
  };
}

type Plugin = UnpluginInstance<Options | undefined>;

export const plugin: Plugin = /* #__PURE__ */ createUnplugin(factory);
export const vitePlugin: Plugin['vite'] = plugin.vite;
export const rollupPlugin: Plugin['rollup'] = plugin.rollup;
export const rolldownPlugin: Plugin['rolldown'] = plugin.rolldown;
export const webpackPlugin: Plugin['webpack'] = plugin.webpack;
export const rspackPlugin: Plugin['rspack'] = plugin.rspack;
export const esbuildPlugin: Plugin['esbuild'] = plugin.esbuild;
export const farmPlugin: Plugin['farm'] = plugin.farm;
