import type { DecodedSourceMap } from '@jridgewell/remapping';
import type { Integration } from '../config.js';

export interface JsonReport {
	/**
	 * Metadata about the report, including the version of Sonda used to generate it,
	 * the integration used, and the options passed to Sonda.
	 */
	metadata: Metadata;

	/**
	 * List of all input and output resources.
	 */
	resources: Array<Resource>;

	/**
	 * List of all connections between resources.
	 */
	connections: Array<Connection>;

	/**
	 * List of all detected external dependencies and their paths. If
	 * a dependency has more than one path, it's likely duplicated and
	 * bundled in multiple copies.
	 */
	dependencies: Array<Dependency>;

	/**
	 * List of issues detected in the outputs.
	 */
	issues: Array<Issue>;

	/**
	 * Partial source maps of the "asset" resources.
	 *
	 * This value is only available when the `deep` option is enabled.
	 */
	sourcemaps: Array<SourceMap>;
}

export interface Metadata {
	/**
	 * Version of Sonda used to generate the report.
	 */
	version: string;

	/**
	 * Integration used to generate the report.
	 */
	integration: Integration;

	/**
	 * The normalized value of the `sources` option passed to Sonda.
	 */
	sources: boolean;

	/**
	 * The normalized value of the `gzip` option passed to Sonda.
	 */
	gzip: boolean;

	/**
	 * The normalized value of the `brotli` option passed to Sonda.
	 */
	brotli: boolean;
}

/**
 * Base interface for all resources.
 *
 * Resources represent the following inputs:
 *
 *                                     ┌─────────────────────────────┐
 *                                     │                             │
 *                                     │   OPTIONAL ORIGINAL SOURCE  │
 *                                     │                             │
 *                                     └──────────────▲──────────────┘
 *                                                    │
 *                                                    │
 *                                              VIA SOURCEMAP
 *                                                    │
 *                                                    │
 * ┌─────────────────────────────┐     ┌──────────────┼──────────────┐
 * │                             │     │                             │
 * │       INTERNAL SOURCE       │     │       EXTERNAL SOURCE       │
 * │                             │     │                             │
 * └──────────────┬──────────────┘     └──────────────┬──────────────┘
 *                │                                   │
 *                │                                   │
 *                └─────────────────┬─────────────────┘
 *                                  │
 *                                  │
 *                   ┌──────────────▼──────────────┐
 *                   │                             │
 *                   │           BUNDLER           │
 *                   │                             │
 *                   └──────────────┬──────────────┘
 *                                  │
 *                                  │
 *                                  │
 *                                  │
 *                                  │
 *                   ┌──────────────▼──────────────┐
 *                   │                             │
 *                   │            ASSET            │
 *                   │                             │
 *                   └──────────────┬──────────────┘
 *                                  │
 *                                  │
 *                            VIA SOURCEMAP
 *                                  │
 *                                  │
 *                   ┌──────────────▼──────────────┐
 *                   │                             │
 *                   │            CHUNK            │
 *                   │                             │
 *                   └─────────────────────────────┘
 */
export interface ResourceBase {
	/**
	 * Information where the resource comes from.
	 */
	kind: ResourceKind;

	/**
	 * Relative path to the resource.
	 *
	 * If the `source` is `sourcemap`, the file may not exist in the filesystem.
	 */
	name: string;

	/**
	 * Type of the resources, determined by the file extension.
	 */
	type: FileType;

	/**
	 * Format of the module, if the resource type is `script`.
	 */
	format?: ModuleFormat;

	/**
	 * Size of the resource without any compression.
	 */
	uncompressed: number;

	/**
	 * Size of the resource after GZIP compression.
	 *
	 * This value is only available when the `gzip` option is enabled.
	 */
	gzip?: number;

	/**
	 * Size of the resource after Brotli compression.
	 *
	 * This value is only available when the `brotli` option is enabled.
	 */
	brotli?: number;

	/**
	 * Parent of the resource.
	 *
	 * If the `kind` is `chunk`, this resource is a part of the output
	 * asset and value of `parent` is the name of the output asset.
	 *
	 * If the `kind` is `sourcemap`, this resource is a part of the source
	 * map of other resource and value of `parent` is the name of that resource.
	 */
	parent?: string | Array<string> | null;
}

/**
 * Input resource loaded from the filesystem by the bundler.
 *
 * See INTERNAL SOURCE and EXTERNAL SOURCE in the diagram above.
 */
export interface FilesystemResource extends ResourceBase {
	kind: 'filesystem';
	name: string;
	type: FileType;
	format: ModuleFormat;
	uncompressed: number;
	gzip?: never;
	brotli?: never;
	parent?: never;
}

/**
 * Input resource read from a sourcemap of the filesystem resource.
 *
 * See OPTIONAL ORIGINAL SOURCE in the diagram above.
 */
export interface SourcemapResource extends ResourceBase {
	kind: 'sourcemap';
	name: string;
	type: FileType;
	format: ModuleFormat;
	uncompressed: number;
	gzip?: never;
	brotli?: never;
	parent: string | null;
}

/**
 * Output resource generated by the bundler.
 *
 * See ASSET in the diagram above.
 */
export interface AssetResource extends ResourceBase {
	kind: 'asset';
	name: string;
	type: FileType;
	format?: never;
	uncompressed: number;
	gzip: number;
	brotli: number;
	parent?: never;
}

/**
 * Part of the input resource that was used in one of the assets
 * (after tree-shaking, minification, etc.).
 *
 * See CHUNK in the diagram above.
 */
export interface ChunkResource extends ResourceBase {
	kind: 'chunk';
	name: string;
	type: FileType;
	format: ModuleFormat;
	uncompressed: number;
	gzip: number;
	brotli: number;
	parent: string;
}

export interface Connection {
	kind: ConnectionKind;
	source: string;
	target: string;
	original: string | null;
}

export interface Dependency {
	name: string;
	paths: Array<string>;
}

export interface Issue {
	type: string;
	data: unknown;
}

/**
 * All types of resources.
 */
export type Resource = FilesystemResource | SourcemapResource | AssetResource | ChunkResource;

export type Sizes = Required<Pick<ResourceBase, 'uncompressed' | 'gzip' | 'brotli'>>;

export type ResourceKind =
	/**
	 * Filesystem resource used by the bundler to generate the output
	 */
	| 'filesystem'

	/**
	 * Resource read from a sourcemap of the filesystem resource
	 */
	| 'sourcemap'

	/**
	 * Output file generated by the bundler
	 */
	| 'asset'

	/**
	 * Part of the output file generated by the bundler.
	 * This is source after tree-shaking, minification, etc.
	 */
	| 'chunk';

export type ConnectionKind =
	/**
	 * Source is an asset and the target is a entry point file,
	 */
	| 'entrypoint'

	/**
	 * Source uses a static import to access the target resource.
	 */
	| 'import'

	/**
	 * Source uses a `require()` call to access the target resource.
	 */
	| 'require'

	/**
	 * Source uses a dynamic `import()` to access the target resource.
	 */
	| 'dynamic-import'

	/**
	 * Source has a sourcemap that includes the target resource.
	 */
	| 'sourcemap';

export type FileType = 'component' | 'font' | 'image' | 'script' | 'style' | 'other';

export type ModuleFormat = 'esm' | 'cjs' | 'amd' | 'umd' | 'iife' | 'system' | 'other';

/**
 * Type for the source map strings from the report after decoding.
 */
export interface SourceMap {
	/**
	 * Name of the asset file that the source map belongs to.
	 */
	name: string;

	/**
	 * Stringified source map.
	 *
	 * Use the `DecodedMap` type for the decoded version of this map (after `JSON.parse()`).
	 */
	map: string;
}

export type DecodedReportSourceMap = Pick<DecodedSourceMap, 'mappings' | 'sources' | 'sourcesContent'>;
