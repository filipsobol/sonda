// Integrations
export { SondaEsbuildPlugin, processEsbuildMetafile } from './integrations/esbuild.js';
export { SondaRollupPlugin } from './integrations/rollup.js';
export { SondaVitePlugin } from './integrations/vite.js';
export { SondaWebpackPlugin } from './integrations/webpack.js';

// Report
export { ReportProducer } from './report/producer.js';
export { ReportConsumer } from './report/consumer.js';
export type {
	JsonReport,
	Metadata,
	Resource,
	Edge,
	Dependency,
	Issue,
	ResourceKind,
	FileType,
	ModuleFormat,
	SourceResource,
	AssetResource,
	ChunkResource,
	SourceMapResource
} from './report/types.js';

// Config
export {
	Config,
	type UserOptions,
	type IntegrationOptions,
	type Integration
} from './config.js';

// Utils
export { normalizePath, getTypeByName } from './utils.js';
