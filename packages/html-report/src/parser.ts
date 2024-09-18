import type { JsonReport } from 'sonda';

export interface Folder {
	type: 'folder',
	name: string;
	path: string;
	bytes: number;
	contents: Record<string, Content>;
}

export interface File {
	type: 'file',
	name: string;
	path: string;
	bytes: number;
}

export type Content = Folder | File;

export function isFolder( content: Content ): content is Folder {
	return 'contents' in content;
}

export function parse( report: JsonReport ): Array<Folder> {
	let folders: Array<Folder> = [];

	Object.entries( report.outputs ).forEach( ( [ path, output ] ) => {
		let rootFolder: Folder = {
			type: 'folder',
			name: path,
			path: '',
			bytes: output.bytes,
			contents: {}
		};

		const inputs = Object.entries( output.inputs );

		inputs.forEach( ( [ path, input ] ) => {
			if ( !input.bytesInOutput ) {
				return;
			}

			const segments = path.split( '/' ).filter( Boolean );
			const filename = segments.pop()!;
			const traversedParts: Array<string> = [ '' ];
			let folder = rootFolder;

			while ( segments.length ) {
				let dirname = segments.shift()!

				// if ( dirname.startsWith( '@' ) && traversedParts.at( -1 ) === 'node_modules' ) {
				// 	dirname += '/' + segments.shift();
				// }

				traversedParts.push( dirname );

				const traversedPath = traversedParts.join( '/' );

				folder = ( folder.contents[ dirname ] as Folder ) ??= {
					type: 'folder',
					name: dirname || '[root]',
					path: traversedPath,
					contents: {},
					bytes: inputs
						.filter( ( [ path ] ) => path.startsWith( traversedPath ) )
						.reduce( ( sum: number, [ _path, input ] ) => sum + input.bytesInOutput, 0 )
				};
			}

			traversedParts.push( filename );

			folder.contents[ filename ] = {
				type: 'file',
				name: filename,
				path: traversedParts.join( '/' ),
				bytes: input.bytesInOutput
			};
		} );

		// Skip directories that don't have any files and have only one subdirectory
		// while ( isFolder( rootFolder ) && Object.keys( rootFolder.contents ).length === 1 ) {
		// 	rootFolder = Object.values( rootFolder.contents )[ 0 ] as Folder;
		// 	rootFolder.name = rootFolder.path;
		// }

		const assignedBytes = Object.values( rootFolder.contents ).reduce( ( sum, content ) => sum + content.bytes, 0 );
		const unassignedBytes = rootFolder.bytes - assignedBytes;

		if ( unassignedBytes ) {
			rootFolder.contents[ '[unassigned]' ] = {
				type: 'file',
				name: '[unassigned]',
				path: '[unassigned]',
				bytes: unassignedBytes
			};
		}

		folders.push( rootFolder );
	} );

	return folders;
}
