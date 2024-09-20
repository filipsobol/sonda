import type { JsonReport, ReportOutputInput } from 'sonda';

export interface File {
	name: string;
	path: string;
	bytes: number;
}

export interface Folder {
	name: string;
	path: string;
	bytes: number;
	items: Array<Content>;
}

export type Content = Folder | File;

export function getTrie( report: JsonReport ): Array<Content> {
	return Object.entries( report.outputs ).map( ( [ outputPath, output ] ) => {
		const trie = new FileSystemTrie();

		Object.entries( output.inputs ).forEach( ( [ path, input ] ) => {
			trie.insert( path, input );
		} );

		const unassignedBytes = output.bytes - trie.root.bytes;

		trie.root.items.push( {
			name: '[unassigned]',
			path: '[unassigned]',
			bytes: unassignedBytes,
			items: []
		} );

		trie.root.name = outputPath;
		trie.root.bytes = output.bytes;

		trie.optimize();

		return trie.root;
	} );
}

export function isFolder( content: Content ): content is Folder {
	return 'items' in content;
}

export class FileSystemTrie {
	root: Folder;

	constructor() {
		this.root = this.createNode( '', '' );
	}

	private createNode( name: string, path: string ): Folder {
		return {
			name,
			path,
			bytes: 0,
			items: [],
		};
	}

	insert( filePath: string, metadata: ReportOutputInput ): void {
		const parts = filePath.split( '/' );
		const name = parts.pop()!;

		let node = this.root;

		parts.forEach( part => {
			let childNode = node.items.find( ( item ): item is Folder => isFolder( item ) && item.name === part );

			if ( !childNode ) {
				childNode = this.createNode( part, node.path ? `${ node.path }/${ part }` : part );
				node.items.push( childNode );
			}

			node = childNode;
			node.bytes += metadata.bytesInOutput;
		} );

		node.items.push( {
			name,
			path: `${ node.path }/${ name }`,
			bytes: metadata.bytesInOutput,
		} );

		this.root.bytes += metadata.bytesInOutput;
	}

	optimize(): void {
		const stack: Array<Folder> = [ this.root ];

		while( stack.length ) {
			const node = stack.pop()!;

			// Collapse folders with a single child folder
			while( node.items.length === 1 && isFolder( node.items[ 0 ] ) ) {
				const child = node.items[ 0 ];

				node.name = `${ node.name }/${ child.name }`;
				node.path = child.path;
				node.items = child.items;
			}

			// Sort by size, largest first
			node.items.sort( ( a, b ) => b.bytes - a.bytes );

			// Repeat for child folders
			node.items.forEach( item => isFolder( item ) && stack.push( item ) );
		}
	}
}
