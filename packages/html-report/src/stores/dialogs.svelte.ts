import type { File, Folder, FileSystemTrie } from '../FileSystemTrie';

/**
 * Store containing the currently opened dialogs.
 */
interface Dialogs {
	file: File | null;
	folder: Folder | null;
	output: FileSystemTrie | null;
	duplicates: true | null;
	code: File | null;
}

type DialogsType = keyof Dialogs;

export interface OpenedDialogsStore extends Dialogs {
	open<T extends DialogsType>( type: T, data: Dialogs[ T ] ): void;
	close(): void;
}

export function dialogsStore(): OpenedDialogsStore {
	let dialogs = $state<Dialogs>( {
		file: null,
		folder: null,
		output: null,
		duplicates: null,
		code: null,
	} );

	let stack = $state<Array<DialogsType>>( [] );

	return {
		get file() { return dialogs.file },
		get folder() { return dialogs.folder },
		get output() { return dialogs.output },
		get duplicates() { return dialogs.duplicates },
		get code() { return dialogs.code },

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
