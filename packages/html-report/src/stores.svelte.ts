import { getTrie, type FileSystemTrie } from './FileSystemTrie';
import type { Sizes } from 'sonda';

export const outputs: Array<FileSystemTrie> = getTrie( window.SONDA_JSON_REPORT );

/**
 * Active output store
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
 * Compression store
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
 * Exports
 */
export const activeOutput: ActiveOutputStore = activeOutputStore();
export const compression: CompressionStore = compressionStore();
