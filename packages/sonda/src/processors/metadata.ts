import packageJson from 'sonda/package.json' with { type: 'json' };
import type { JsonReport } from '../report.js';
import type { Config } from '../config.js';

export function getMetadata( config: Config ): JsonReport[ 'metadata' ] {
	return {
		version: packageJson.version,
		integration: config.integration,
		sources: config.sources,
		gzip: config.gzip,
		brotli: config.brotli
	};
}
