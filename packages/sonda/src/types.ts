import type { EncodedSourceMap } from '@ampproject/remapping';

export interface CodeMap {
	code: string;
	map?: EncodedSourceMap;
};

export type MaybeCodeMap = CodeMap | null;
