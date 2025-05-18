import { version } from 'sonda/package.json' with { type: 'json' };
import open from 'tiny-open';
import { sortByKey } from '../utils.js';
import { HtmlFormatter } from './formatters/HtmlFormatter.js';
import { JsonFormatter } from './formatters/JsonFormatter.js';
import { updateOutputs, type AssetsWithEntrypoints } from './processors/outputs.js';
import { updateInputs } from './processors/inputs.js';
import { updateDependencies } from './processors/dependencies.js';
import type { JsonReport, Metadata, Resource, Edge, Dependency, Issue } from './types.js';
import type { Formatter } from './formatters/Formatter.js';
import type { Config, Format } from '../config.js';

const formatters: Record<Format, new ( config: Config ) => Formatter> = {
	'html': HtmlFormatter,
	'json': JsonFormatter
};

export class Report {
	public metadata: Metadata;

	constructor(
		public config: Config,
		public resources: Array<Resource> = [],
		public edges: Array<Edge> = [],
		public dependencies: Array<Dependency> = [],
		public issues: Array<Issue> = []
	) {
		this.metadata = {
			version,
			integration: config.integration,
			sources: config.sources,
			gzip: config.gzip,
			brotli: config.brotli
		};
	}

	async generate( assets: AssetsWithEntrypoints ): Promise<void> {
		updateOutputs( this, assets );
		// TODO: This may not be needed
		// updateInputs( this );
		updateDependencies( this );

		const config = this.config;
		const formatter = new formatters[ config.format ]( config );
		const path = await formatter.write( this.#getFormattedData() );

		if ( config.open ) {
			await open( path );
		}
	}

	#getFormattedData(): JsonReport {
		return {
			metadata: this.metadata,
			resources: sortByKey( this.resources, 'name' ),
			edges: this.edges,
			dependencies: sortByKey( this.dependencies, 'name' ),
			issues: this.issues
		};
	}
}
