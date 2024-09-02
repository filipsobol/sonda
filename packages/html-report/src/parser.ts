import type { JsonReportData, NormalizedSource } from 'sonar';

export interface Folder {
	type: 'folder',
	name: string;
	path: string;
	bytes: number;
	contents: Record<string, Content>;
}

export type Content = Folder | NormalizedSource;

export function isFolder( content: Content ): content is Folder {
	return 'contents' in content;
}

export function parse( files: JsonReportData ): Folder {
	let rootFolder: Folder = {
		type: 'folder',
		name: '',
		path: '',
		bytes: 0,
		contents: {}
	};

	Object
		.values( files )
		.forEach( file => {
			if ( !file.bytes ) {
				return;
			}

			const segments = file.mappedPath.split( '/' );
			const filename = segments.pop()!;
			const traversedPath: Array<string> = [];
			let folder = rootFolder;

			while ( segments.length ) {
				const dirname = segments.shift()!

				traversedPath.push( dirname );

				const path = traversedPath.join( '/' );

				folder = (folder.contents[ dirname ] as Folder) ??= {
					type: 'folder',
					name: dirname || '[root]',
					path,
					contents: {},
					bytes: Object
						.values( files )
						.filter( file => file.mappedPath.startsWith( path ) )
						.reduce( ( sum: number, file: NormalizedSource ) => sum + file.bytes, 0 )
				};
			}

			traversedPath.push( filename );

			folder.contents[ filename ] = file;
		} );
	
	let root: Folder = rootFolder;

	// Skip directories that don't have any files and have only one subdirectory
	while ( ('contents' in root) && Object.keys( root.contents ).length === 1 ) {
		root = Object.values( root.contents )[ 0 ] as Folder;
	}

	return root;
}
