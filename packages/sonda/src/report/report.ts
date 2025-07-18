import { isBuiltin } from 'module';
import open from 'open';
import { version } from 'sonda/package.json' with { type: 'json' };
import { hasIgnoredExtension, normalizePath, sortByKey } from '../utils.js';
import { HtmlFormatter } from './formatters/HtmlFormatter.js';
import { JsonFormatter } from './formatters/JsonFormatter.js';
import { updateOutput } from './processors/outputs.js';
import { updateDependencies } from './processors/dependencies.js';
import type {
	JsonReport,
	Metadata,
	Resource,
	Connection,
	Dependency,
	Issue,
	SourceMap,
	DecodedReportSourceMap
} from './types.js';
import type { Formatter } from './formatters/Formatter.js';
import type { Config, Format } from '../config.js';

const formatters: Record<Format, new ( config: Config ) => Formatter> = {
	'html': HtmlFormatter,
	'json': JsonFormatter
};

export class Report {
	public readonly config: Config;
	public readonly resources: Array<Resource> = [];
	public readonly connections: Array<Connection> = [];
	public readonly assets: Record<string, Array<string> | undefined> = {};

	protected metadata: Metadata;
	protected dependencies: Array<Dependency> = [];
	protected issues: Array<Issue> = []
	protected sourcemaps: Array<SourceMap> = [];

	constructor( config: Config ) {
		this.config = config;

		this.metadata = {
			version,
			integration: config.integration,
			sources: config.sources,
			gzip: config.gzip,
			brotli: config.brotli
		};
	}

	addResource( resource: Resource ): void {
		if (
			resource.name.startsWith( 'data:' )
			|| hasIgnoredExtension( resource.name )
		) {
			// Ignore data URIs or resources with ignored extensions
			return;
		}

		const existing = this.resources.find( r =>
			r.kind === resource.kind
			&& r.name === resource.name
			&& r.parent === resource.parent
		);

		if ( existing ) {
			// Ignore duplicate resources
			return;
		}

		this.resources.push( resource );
	}

	addConnection( connection: Connection ): void {
		if (
			connection.target.startsWith( 'data:' )
			|| hasIgnoredExtension( connection.source )
			|| hasIgnoredExtension( connection.target )
			|| isBuiltin( connection.target )
		) {
			// Ignore data URIs, resources with ignored extensions, and built-in modules
			return;
		}

		const existing = this.connections.find( c => {
			return c.kind === connection.kind
				&& c.source === connection.source
				&& c.target === connection.target;
		} );

		if ( !existing ) {
			// Add the new connection if it doesn't exist
			this.connections.push( connection );
			return;
		}

		/**
		 * If a connection already exists, update the `original` property if either connection has it.
		 * If both connections have the `original` property, prioritize the shorter one because it is
		 * more likely to be the original source than the absolute path.
		 */
		existing.original = [ connection.original, existing.original ]
			// Filter out null values
			.filter( original => original !== null )
			// Sort by length to prioritize the shorter one
			.sort( ( a, b ) => a.length - b.length )
			// Take the first one, which is the shortest
			[ 0 ]
			// Fallback to null
			|| null;
	}

	addAsset( name: string, entrypoints?: Array<string> ): void {
		if ( hasIgnoredExtension( name ) ) {
			return;
		}

		const normalizedName = normalizePath( name );

		if ( this.config.exclude?.some( pattern => pattern.test( normalizedName ) ) ) {
			// Ignore assets that match the exclude patterns
			return;
		}

		if ( this.config.include && !this.config.include.some( pattern => pattern.test( normalizedName ) ) ) {
			// Ignore assets that do not match the include patterns
			return;
		}

		this.assets[ name ] = entrypoints;
	}

	async generate(): Promise<string> {
		for ( const [ path, entrypoints ] of Object.entries( this.assets ) ) {
			updateOutput( this, path, entrypoints );
		}

		this.dependencies = updateDependencies( this );

		const formatter = new formatters[ this.config.format ]( this.config );
		const path = await formatter.write( this.#getFormattedData() );

		if ( this.config.open ) {
			await open( path );
		}

		return path;
	}

	addSourceMap( asset: string, sourcemap: DecodedReportSourceMap ): void {
		if ( this.sourcemaps.some( sm => sm.name === asset ) ) {
			// Ignore duplicate sourcemaps for the same asset
			return;
		}

		this.sourcemaps.push( {
			name: asset,
			map: JSON.stringify( sourcemap ),
		} );
	}

	#getFormattedData(): JsonReport {
		return {
			metadata: this.metadata,
			resources: sortByKey( this.resources, 'name' ),
			connections: this.connections,
			dependencies: sortByKey( this.dependencies, 'name' ),
			issues: this.issues,
			sourcemaps: this.sourcemaps
		};
	}
}
