interface RawFile {
	dir: string;
	filename: string;
	bytes: number;
}

export interface File {
	type: 'file',
	name: string;
	path: string;
	bytes: number;
}

export interface Folder {
	type: 'folder',
	name: string;
	path: string;
	bytes: number;
	contents: Record<string, Content>;
}

export type Content = Folder | File;

export function isFolder( content: Content ): content is Folder {
	return content.type === 'folder';
}

export function parse( files: Record<string, RawFile> ): Content {
	let rootFolder: Folder = {
		type: 'folder',
		name: '',
		path: '',
		bytes: 0,
		contents: {}
	};

	Object
		.entries( files )
		.forEach( ( [ path, file ] ) => {
			const segments = path.split( '/' );
			const filename = segments.pop()!;
			const traversedPath: Array<string> = [];
			let folder = rootFolder;

			while ( segments.length ) {
				const dirname = segments.shift()!

				traversedPath.push( dirname );

				const path = traversedPath.join( '/' );

				folder = (folder.contents[ dirname ] as Folder) ??= {
					type: 'folder',
					name: dirname,
					path,
					contents: {},
					bytes: Object
						.values( files )
						.filter( file => file.dir.startsWith( path ) )
						.reduce( ( sum: number, file: RawFile ) => sum + file.bytes, 0 )
				};
			}

			traversedPath.push( filename );

			folder.contents[ filename ] = {
				type: 'file',
				name: filename,
				path,
				bytes: file.bytes
			};
		} );
	
	let root: Content = rootFolder;

	// Skip directories that don't have any files and have only one subdirectory
	while ( ('contents' in root) && Object.keys( root.contents ).length === 1 ) {
		root = Object.values( root.contents )[ 0 ];
	}

	return root;
}
