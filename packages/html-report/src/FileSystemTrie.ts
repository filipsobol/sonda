import type { AssetResource, ChunkResource, Sizes } from 'sonda';

export interface File extends Sizes {
	name: string;
	path: string;
	kind: 'chunk' | 'asset';
}

export interface Folder extends Sizes {
	name: string;
	path: string;
	items: Array<Content>;
}

export interface Root extends Folder {
	root: true;
}

export type Content = Folder | File;

/**
 * Returns a trie structure representing the structure of the provided resources.
 */
export function getTrie( resources: Array<ChunkResource | AssetResource> ): FileSystemTrie {
	const trie = new FileSystemTrie();

	trie.root.name = '';
	trie.root.uncompressed = 0;
	trie.root.gzip = 0;
	trie.root.brotli = 0;
	trie.root.root = true;

	for ( const resource of resources ) {
		trie.insert( resource.name, resource );

		trie.root.uncompressed += resource.uncompressed;
		trie.root.gzip += resource.gzip;
		trie.root.brotli += resource.brotli;
	}

	trie.optimize();

	return trie;
}

export function isFolder( content: Content ): content is Folder {
	return 'items' in content;
}

export class FileSystemTrie {
	root: Root;

	constructor() {
		this.root = this.createNode( '', '' ) as Root;
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

	insert( filePath: string, chunk: ChunkResource | AssetResource ): void {
		const parts = filePath.split( '/' );
		const name = parts.pop()!;

		let node: Folder = this.root;

		parts.forEach( part => {
			let childNode = node.items.find( ( item ): item is Folder => isFolder( item ) && item.name === part );

			if ( !childNode ) {
				childNode = this.createNode( part, node.path ? `${ node.path }/${ part }` : part );
				node.items.push( childNode );
			}

			node = childNode;
			node.uncompressed += chunk.uncompressed;
			node.gzip += chunk.gzip;
			node.brotli += chunk.brotli;
		} );

		node.items.push( {
			name,
			path: node.path ? `${ node.path }/${ name }` : name,
			uncompressed: chunk.uncompressed,
			gzip: chunk.gzip,
			brotli: chunk.brotli,
			kind: chunk.kind
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

		while ( path && content && content.path !== path ) {
			content = isFolder( content ) && content.items.find( item => path.startsWith( item.path ) ) || null;
		}

		return content;
	}
}
