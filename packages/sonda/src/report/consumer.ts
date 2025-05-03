import type { JsonReport, Metadata, Resource, Edge, Dependency, Issue, SourceResource, AssetResource, SourceMapResource } from './types.js';

export class ReportConsumer {
	public metadata: Metadata;
	public resources: Array<Resource>;
	public edges: Array<Edge>;
	public dependencies: Array<Dependency>;
	public issues: Array<Issue>;

	constructor( report: JsonReport ) {
		this.metadata = report.metadata;
		this.resources = report.resources;
		this.edges = report.edges;
		this.dependencies = report.dependencies;
		this.issues = report.issues;
	}

	public get sources(): Array<SourceResource> {
		return this.resources.filter( resource => resource.kind === 'source' );
	}

	public get assets(): Array<AssetResource> {
		return this.resources.filter( resource => resource.kind === 'asset' );
	}

	public get chunks(): Array<Resource> {
		return this.resources.filter( resource => resource.kind === 'chunk' );
	}

	public get sourcemapSources(): Array<SourceMapResource> {
		return this.resources.filter( resource => resource.kind === 'sourcemap-source' );
	}

	public getSource( name: string ): SourceResource | undefined {
		return this.sources.find( resource => resource.name === name );
	}

	public getImports( name: string ): Array<Resource> {
		return this.edges
			.filter( edge => edge.source === name )
			.map( edge => this.getSource( edge.target )! );
	}

	public getDependency( name: string ): Dependency | undefined {
		return this.dependencies.find( dependency => dependency.name === name );
	}

	public getIssue( type: string ): Issue | undefined {
		return this.issues.find( issue => issue.type === type );
	}
}
