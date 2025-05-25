// Integrations
export { SondaEsbuildPlugin, processEsbuildMetafile } from './integrations/esbuild.js';
export { SondaRollupPlugin } from './integrations/rollup.js';
export { SondaVitePlugin } from './integrations/vite.js';
export { SondaWebpackPlugin } from './integrations/webpack.js';

// Report
export { Report } from './report/report.js';
export type {
	JsonReport,
	Metadata,
	Resource,
	Connection,
	Dependency,
	Issue,
	ResourceKind,
	ConnectionKind,
	FileType,
	ModuleFormat,
	FilesystemResource,
	SourcemapResource,
	AssetResource,
	ChunkResource
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
