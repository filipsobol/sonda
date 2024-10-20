import type { Sizes } from 'sonda';

export type CompressionType = keyof Sizes;

/**
 * Store containing the active compression type.
 */
export interface CompressionStore {
	type: CompressionType;
	setType( newType: CompressionType ): void;
}

export function compressionStore(): CompressionStore {
	let type = $state<CompressionType>( 'uncompressed' );

	return {
		get type() { return type },
		setType( newType: CompressionType ) { type = newType },
	};
}
