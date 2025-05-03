export { ReportProducer } from './report/producer.js';

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

export {
	normalizePath,
	getTypeByName
} from './utils.js';

export {
	Config,
	type UserOptions,
	type IntegrationOptions,
	type Integration
} from './config.js';

