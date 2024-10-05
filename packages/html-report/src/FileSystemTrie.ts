import type { JsonReport, ReportOutputInput, Sizes } from 'sonda';

export interface File extends Sizes {
	name: string;
	path: string;
}

export interface Folder extends Sizes {
	name: string;
	path: string;
	items: Array<Content>;
}

export type Content = Folder | File;

export function getTrie( report: JsonReport ): Array<FileSystemTrie> {
	return Object.entries( report.outputs ).map( ( [ outputPath, output ] ) => {
		const trie = new FileSystemTrie();

		Object
			.entries( output.inputs )
			.forEach( ( [ path, input ] ) => trie.insert( path, input ) );

		trie.root.name = outputPath;
		trie.root.uncompressed = output.uncompressed;
		trie.root.gzip = output.gzip;
		trie.root.brotli = output.brotli;

		trie.optimize();

		return trie;
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
			uncompressed: 0,
			gzip: 0,
			brotli: 0,
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
			node.uncompressed += metadata.uncompressed;
			node.gzip += metadata.gzip;
			node.brotli += metadata.brotli;
		} );

		node.items.push( {
			name,
			path: node.path ? `${ node.path }/${ name }` : name,
			uncompressed: metadata.uncompressed,
			gzip: metadata.gzip,
			brotli: metadata.brotli
		} );
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
			node.items.sort( ( a, b ) => b.uncompressed - a.uncompressed );

			// Repeat for child folders
			node.items.forEach( item => isFolder( item ) && stack.push( item ) );
		}
	}

	get( path: string ): Content | null {
		let content: Content | null = this.root;

		while ( content && content.path !== path ) {
			content = isFolder( content ) && content.items.find( item => path.startsWith( item.path ) ) || null;
		}

		return content;
	}
}
