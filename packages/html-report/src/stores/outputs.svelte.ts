import { getTrie, type FileSystemTrie } from '../FileSystemTrie';

export const outputs: Array<FileSystemTrie> = getTrie( window.SONDA_JSON_REPORT );

/**
 * Store containing the active output / asset.
 */
export interface ActiveOutputStore {
	index: number;
	output: FileSystemTrie | undefined;
	setIndex( i: number ): void;
}

export function activeOutputStore(): ActiveOutputStore {
	let index = $state<number>( 0 );

	const output = $derived<FileSystemTrie | undefined>( outputs.at( index ) );

	return {
		get index() { return index },
		get output() { return output },
		setIndex( i: number ) { index = i },
	};
}
