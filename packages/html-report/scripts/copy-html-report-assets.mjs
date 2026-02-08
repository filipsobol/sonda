import { copyFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const htmlDist = resolve(import.meta.dirname, '../dist');
const sondaDist = resolve(import.meta.dirname, '../../sonda/dist');
const docsPublic = resolve(import.meta.dirname, '../../../docs/public');

const files = [
	{
		from: resolve(htmlDist, 'index.html'),
		to: resolve(sondaDist, 'index.html')
	},
	{
		from: resolve(htmlDist, 'index.html'),
		to: resolve(docsPublic, 'demo.html')
	},
	{
		from: resolve(htmlDist, 'sample_data.json'),
		to: resolve(docsPublic, 'sample_data.json')
	}
];

for (const { from, to } of files) {
	mkdirSync(dirname(to), { recursive: true });
	copyFileSync(from, to);
}

console.log('Copied html-report build artifacts to sonda/dist and docs/public');
