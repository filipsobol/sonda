import { getTrie, type File, type Folder, type FileSystemTrie } from './FileSystemTrie';
import type { Sizes } from 'sonda';

export const outputs: Array<FileSystemTrie> = getTrie( window.SONDA_JSON_REPORT );

/**
 * Store containing the active output / asset.
 */
interface ActiveOutputStore {
	index: number;
	output: FileSystemTrie | undefined;
	setIndex( i: number ): void;
}

function activeOutputStore(): ActiveOutputStore {
	let index = $state<number>( 0 );

	const output = $derived<FileSystemTrie | undefined>( outputs.at( index ) );

	return {
		get index() { return index },
		get output() { return output },
		setIndex( i: number ) { index = i },
	};
}

export type CompressionType = keyof Sizes;

/**
 * Store containing the active compression type.
 */
interface CompressionStore {
	type: CompressionType;
	setType( newType: CompressionType ): void;
}

function compressionStore(): CompressionStore {
	let type = $state<CompressionType>( 'uncompressed' );

	return {
		get type() { return type },
		setType( newType: CompressionType ) { type = newType },
	};
}

/**
 * Store containing the currently opened dialogs.
 */
interface Dialogs {
	file: File | null;
	folder: Folder | null;
	output: FileSystemTrie | null;
}

type DialogsType = keyof Dialogs;

interface OpenedDialogsStore extends Dialogs {
	open<T extends DialogsType>( type: T, data: Dialogs[ T ] ): void;
	close(): void;
}

function openedDialogsStore(): OpenedDialogsStore {
	let dialogs = $state<Dialogs>( {
		file: null,
		folder: null,
		output: null
	} );

	let stack = $state<Array<DialogsType>>( [] );

	return {
		get file() { return dialogs.file },
		get folder() { return dialogs.folder },
		get output() { return dialogs.output },

		open<T extends DialogsType>( type: T, data: Dialogs[ T ] ) {
			stack.push( type );
			dialogs[ type ] = data;
		},

		close() {
			if ( stack.length === 0 ) {
				return;
			}

			dialogs[ stack.pop()! ] = null;
		}
	};
}

/**
 * Exports
 */
export const activeOutput: ActiveOutputStore = activeOutputStore();
export const compression: CompressionStore = compressionStore();
export const dialog: OpenedDialogsStore = openedDialogsStore();
