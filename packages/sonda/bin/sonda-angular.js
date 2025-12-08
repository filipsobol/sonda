#!/usr/bin/env node

import { parseArgs } from 'util';
import { spawnSync } from 'child_process';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import Sonda from 'sonda/angular';

/**
 * Use `RegExp.escape()` when it's more widely available.
 */
function stringToRegExp(value) {
	// 1) Grab optional ^, then any characters, then optional $
	const [, start, core, end] = /^(\^?)(.*?)(\$?)$/.exec(value);

	// 2) Escape all regex‑meta in the core
	const escaped = core.replace(/[-.*+?^${}()|[\]\\]/g, '\\$&');

	// 3) Stitch back the string
	return new RegExp(start + escaped + end);
}

const { values } = parseArgs({
	options: {
		config: { type: 'string' },
		projects: { type: 'string', multiple: true },
		include: { type: 'string', multiple: true },
		exclude: { type: 'string', multiple: true },
		format: { type: 'string', multiple: true },
		filename: { type: 'string' },
		outputDir: { type: 'string' },
		open: { type: 'string' },
		'no-open': { type: 'boolean' },
		deep: { type: 'boolean' },
		sources: { type: 'boolean' },
		gzip: { type: 'boolean' },
		brotli: { type: 'boolean' },
		'skip-build': { type: 'boolean' }
	},

	// Fail when unknown argument is used
	strict: true
});

if (values['no-open']) {
	values.open = false;
	delete values['no-open'];
}

const skipBuild = values['skip-build'];
delete values['skip-build'];

values.include = values.include?.map(stringToRegExp);
values.exclude = values.exclude?.map(stringToRegExp);

// Build Angular projects before analyzing
if (!skipBuild) {
	const configPath = resolve(process.cwd(), values.config || 'angular.json');
	
	let angularConfig;
	try {
		angularConfig = JSON.parse(readFileSync(configPath, 'utf8'));
	} catch (error) {
		console.error(`Error reading Angular configuration file at ${configPath}:`);
		console.error(error.message);
		process.exit(1);
	}

	if (!angularConfig.projects || typeof angularConfig.projects !== 'object' || Array.isArray(angularConfig.projects)) {
		console.error(`Invalid Angular configuration: 'projects' property not found in ${configPath}`);
		process.exit(1);
	}

	const projectsToBuild = values.projects?.length ? values.projects : Object.keys(angularConfig.projects);

	// Validate that specified projects exist
	if (values.projects?.length) {
		const invalidProjects = values.projects.filter(project => !angularConfig.projects[project]);
		if (invalidProjects.length > 0) {
			console.error(`The following projects were not found in ${configPath}:`);
			invalidProjects.forEach(project => console.error(`  - ${project}`));
			console.error(`\nAvailable projects: ${Object.keys(angularConfig.projects).join(', ')}`);
			process.exit(1);
		}
	}

	console.log('Building Angular projects with required options...');
	
	for (const project of projectsToBuild) {
		console.log(`Building project: ${project}`);
		
		// Run ng build with --stats-json and --source-map flags
		const result = spawnSync('npx', ['ng', 'build', project, '--stats-json', '--source-map'], {
			stdio: 'inherit',
			shell: true,
			cwd: process.cwd()
		});

		if (result.status !== 0) {
			console.error(`Failed to build project: ${project}`);
			process.exit(result.status ?? 1);
		}
	}
	
	console.log('Build completed successfully.');
}

Sonda(values);
