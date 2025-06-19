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

export type Content = Folder | File;

export function isFolder( content: Content | null ): content is Folder {
	return !!content && 'items' in content;
}

export class FileSystemTrie {
	root: Folder;

	constructor( name: string ) {
		this.root = this.createNode( name, '' );
	}

	private createNode( name: string, path: string): Folder {
		return {
			name,
			path,
			uncompressed: 0,
			gzip: 0,
			brotli: 0,
			items: []
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

		this.root.uncompressed += chunk.uncompressed;
		this.root.gzip += chunk.gzip;
		this.root.brotli += chunk.brotli;
	}

	optimize( folder: Folder ): void {
		const rootFolders = folder.items.filter( item => isFolder( item ) );
		/**
		 * This is a starting point for path collapsing. However, we don't want to collapse root element
		 * if it has a name (likely an asset name). In such case we skip it and start collapsing from
		 * its children elements.
		 */
		const stack: Array<Folder> = folder.name && rootFolders.length ? rootFolders : [ folder ];

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

		if ( content && isFolder( content ) ) {
			this.optimize( content );
		}

		return content;
	}
}
