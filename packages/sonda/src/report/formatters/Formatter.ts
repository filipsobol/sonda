import { resolve, basename, dirname, format, parse } from 'path';
import { mkdir, writeFile } from 'fs/promises';
import { getAllFiles } from '../../utils.js';
import type { Config } from '../../config.js';
import type { JsonReport } from '../types.js';

export abstract class Formatter {
	protected config: Config;

	protected abstract extension: string;

	protected abstract parse(data: JsonReport): Promise<string> | string;

	public constructor(config: Config) {
		this.config = config;
	}

	/**
	 * Writes the report to the file system and returns the path to the report.
	 */
	public async write(data: JsonReport): Promise<string> {
		const path = await this.getOutputPath();
		const content = await this.parse(data);

		// Ensure the output directory exists.
		await mkdir(dirname(path), { recursive: true });

		// Write the report to the file system.
		await writeFile(path, content);

		// Return the path to the report.
		return path;
	}

	/**
	 * Returns the output path for the report based on the configuration. It ensures
	 * that the path is absolute, has proper extension, and replaces the [index] placeholder
	 * with the next available index based on existing files in the output directory.
	 */
	public async getOutputPath(): Promise<string> {
		const configPath = resolve(process.cwd(), this.config.outputDir, this.config.filename);

		// This ensure that the path, filename, and extension are correctly formatted.
		const path = format({
			...parse(configPath),
			base: '',
			ext: this.extension
		});

		return this.replaceIndex(path);
	}

	/**
	 * Returns path with the [index] placeholder replaced by the next available index.
	 */
	public async replaceIndex(path: string): Promise<string> {
		if (!path.includes('[index]')) {
			return path;
		}

		const { dir, base } = parse(path);
		const regex = new RegExp('^' + base.replace('[index]', '(\\d+)') + '$');

		const versions = (await getAllFiles(dir))
			.map(path => basename(path).match(regex))
			.filter(match => match !== null)
			.map(match => parseInt(match[1], 10));

		const maxVersion = Math.max(...versions, -1);
		const version = String(maxVersion + 1);

		return path.replace('[index]', version);
	}
}
