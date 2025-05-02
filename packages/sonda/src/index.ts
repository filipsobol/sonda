export {
	ReportProducer,
	type JsonReport,
	type Metadata,
	type Resource,
	type Edge,
	type Dependency,
	type Issue,
	type ResourceKind,
	type FileType,
	type ModuleFormat,
	type SourceResource,
	type AssetResource,
	type ChunkResource,
	type SourceMapResource
} from './report/producer.js';

export {
	normalizePath,
	getTypeByName,
	parseSourceMap
} from './utils.js';

export {
	Config,
	type UserOptions,
	type IntegrationOptions,
	type Integration
} from './config.js';

