import type { Content, FileSystemTrie } from './FileSystemTrie';

/**
 * Generally speaking, compression efficiency improves with the size of the file.
 *
 * However, what we have is the compressed size of the entire bundle (`actual`),
 * the sum of all files compressed individually (`individualSum`) and the compressed
 * size of a given file (`content[ algorithm ]`). The last value is essentially
 * a “worst-case” scenario, and the actual size of the file in the bundle is
 * likely to be smaller.
 *
 * We use this information to estimate the actual size of the file in the bundle
 * after compression.
 */
export function potentialSize(
	output: FileSystemTrie,
	content: Content,
	algorithm: 'gzip' | 'brotli'
): number {
	const individualSum = output.root[ algorithm ];
	const actual = window.SONDA_JSON_REPORT.outputs[ output.root.name ][ algorithm ];

	return Math.round( content![ algorithm ] * ( actual / individualSum ) * 100 ) / 100;
}
