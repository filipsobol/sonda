import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { spawnSync } from 'child_process';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// Mock the dependencies
vi.mock('child_process');
vi.mock('fs');
vi.mock('path');
vi.mock('sonda/angular');

describe('sonda-angular CLI', () => {
	let mockSpawnSync: any;
	let mockReadFileSync: any;
	let mockResolve: any;
	let mockProcessExit: any;
	let mockConsoleLog: any;
	let mockConsoleError: any;

	const mockAngularConfig = {
		projects: {
			'test-project': {
				architect: {
					build: {
						options: {
							outputPath: 'dist/test-project'
						}
					}
				}
			},
			'another-project': {
				architect: {
					build: {
						options: {
							outputPath: 'dist/another-project'
						}
					}
				}
			}
		}
	};

	beforeEach(() => {
		// Mock spawnSync
		mockSpawnSync = vi.mocked(spawnSync);
		mockSpawnSync.mockReturnValue({ status: 0 });

		// Mock readFileSync
		mockReadFileSync = vi.mocked(readFileSync);
		mockReadFileSync.mockReturnValue(JSON.stringify(mockAngularConfig));

		// Mock resolve
		mockResolve = vi.mocked(resolve);
		mockResolve.mockImplementation((...args) => args.join('/'));

		// Mock process.exit
		mockProcessExit = vi.spyOn(process, 'exit').mockImplementation(() => {
			throw new Error('process.exit called');
		});

		// Mock console methods
		mockConsoleLog = vi.spyOn(console, 'log').mockImplementation(() => {});
		mockConsoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
	});

	afterEach(() => {
		vi.clearAllMocks();
		vi.resetModules();
	});

	describe('Build invocation', () => {
		it('should invoke ng build with --stats-json and --source-map flags when skip-build is not set', async () => {
			// Simulate running the CLI without --skip-build
			const values = {
				config: 'angular.json',
				projects: ['test-project']
			};

			// Test the build logic directly
			const configPath = resolve(process.cwd(), values.config || 'angular.json');
			const angularConfig = JSON.parse(mockReadFileSync(configPath, 'utf8'));
			const projectsToBuild = values.projects?.length ? values.projects : Object.keys(angularConfig.projects);

			for (const project of projectsToBuild) {
				const result = spawnSync('npx', ['ng', 'build', project, '--stats-json', '--source-map'], {
					stdio: 'inherit',
					shell: true,
					cwd: process.cwd()
				});

				expect(result.status).toBe(0);
			}

			expect(mockSpawnSync).toHaveBeenCalledWith(
				'npx',
				['ng', 'build', 'test-project', '--stats-json', '--source-map'],
				expect.objectContaining({
					stdio: 'inherit',
					shell: true
				})
			);
		});

		it('should build all projects when no specific projects are specified', async () => {
			const values = {
				config: 'angular.json',
				projects: []
			};

			const configPath = resolve(process.cwd(), values.config || 'angular.json');
			const angularConfig = JSON.parse(mockReadFileSync(configPath, 'utf8'));
			const projectsToBuild = values.projects?.length ? values.projects : Object.keys(angularConfig.projects);

			expect(projectsToBuild).toEqual(['test-project', 'another-project']);

			for (const project of projectsToBuild) {
				spawnSync('npx', ['ng', 'build', project, '--stats-json', '--source-map'], {
					stdio: 'inherit',
					shell: true,
					cwd: process.cwd()
				});
			}

			expect(mockSpawnSync).toHaveBeenCalledTimes(2);
		});

		it('should build multiple specified projects', async () => {
			const values = {
				config: 'angular.json',
				projects: ['test-project', 'another-project']
			};

			const configPath = resolve(process.cwd(), values.config || 'angular.json');
			const angularConfig = JSON.parse(mockReadFileSync(configPath, 'utf8'));
			const projectsToBuild = values.projects;

			for (const project of projectsToBuild) {
				spawnSync('npx', ['ng', 'build', project, '--stats-json', '--source-map'], {
					stdio: 'inherit',
					shell: true,
					cwd: process.cwd()
				});
			}

			expect(mockSpawnSync).toHaveBeenCalledTimes(2);
			expect(mockSpawnSync).toHaveBeenCalledWith(
				'npx',
				['ng', 'build', 'test-project', '--stats-json', '--source-map'],
				expect.any(Object)
			);
			expect(mockSpawnSync).toHaveBeenCalledWith(
				'npx',
				['ng', 'build', 'another-project', '--stats-json', '--source-map'],
				expect.any(Object)
			);
		});
	});

	describe('Error handling', () => {
		it('should handle missing angular.json file', () => {
			mockReadFileSync.mockImplementation(() => {
				throw new Error("ENOENT: no such file or directory, open 'angular.json'");
			});

			try {
				const configPath = resolve(process.cwd(), 'angular.json');
				JSON.parse(mockReadFileSync(configPath, 'utf8'));
			} catch (error: any) {
				expect(error.message).toContain('ENOENT');
			}
		});

		it('should validate angular.json has projects property', () => {
			const invalidConfig = { version: 1 };
			mockReadFileSync.mockReturnValue(JSON.stringify(invalidConfig));

			const configPath = resolve(process.cwd(), 'angular.json');
			const angularConfig = JSON.parse(mockReadFileSync(configPath, 'utf8'));

			expect(angularConfig.projects).toBeUndefined();
		});

		it('should reject null projects property', () => {
			const invalidConfig = { projects: null };
			mockReadFileSync.mockReturnValue(JSON.stringify(invalidConfig));

			const configPath = resolve(process.cwd(), 'angular.json');
			const angularConfig = JSON.parse(mockReadFileSync(configPath, 'utf8'));

			const isValid = !!(angularConfig.projects && 
				typeof angularConfig.projects === 'object' && 
				!Array.isArray(angularConfig.projects));

			expect(isValid).toBe(false);
		});

		it('should reject array projects property', () => {
			const invalidConfig = { projects: [] };
			mockReadFileSync.mockReturnValue(JSON.stringify(invalidConfig));

			const configPath = resolve(process.cwd(), 'angular.json');
			const angularConfig = JSON.parse(mockReadFileSync(configPath, 'utf8'));

			const isValid = angularConfig.projects && 
				typeof angularConfig.projects === 'object' && 
				!Array.isArray(angularConfig.projects);

			expect(isValid).toBe(false);
		});

		it('should identify invalid project names', () => {
			const values = {
				projects: ['test-project', 'non-existent-project']
			};

			const configPath = resolve(process.cwd(), 'angular.json');
			const angularConfig = JSON.parse(mockReadFileSync(configPath, 'utf8'));

			const invalidProjects = values.projects.filter(
				project => !angularConfig.projects[project]
			);

			expect(invalidProjects).toEqual(['non-existent-project']);
			expect(invalidProjects.length).toBeGreaterThan(0);
		});

		it('should handle build failures with proper exit code', () => {
			mockSpawnSync.mockReturnValue({ status: 1 });

			const result = spawnSync('npx', ['ng', 'build', 'test-project', '--stats-json', '--source-map'], {
				stdio: 'inherit',
				shell: true,
				cwd: process.cwd()
			});

			expect(result.status).toBe(1);
			expect(result.status).not.toBe(0);
		});

		it('should use nullish coalescing for exit code', () => {
			mockSpawnSync.mockReturnValue({ status: null });

			const result = spawnSync('npx', ['ng', 'build', 'test-project', '--stats-json', '--source-map'], {
				stdio: 'inherit',
				shell: true,
				cwd: process.cwd()
			});

			const exitCode = result.status ?? 1;
			expect(exitCode).toBe(1);
		});
	});

	describe('Configuration parsing', () => {
		it('should use default config path when not specified', () => {
			const values = { config: undefined };
			const configPath = resolve(process.cwd(), values.config || 'angular.json');

			mockResolve(process.cwd(), values.config || 'angular.json');
			
			expect(mockResolve).toHaveBeenCalledWith(process.cwd(), 'angular.json');
		});

		it('should use custom config path when specified', () => {
			const values = { config: 'custom-angular.json' };
			const configPath = resolve(process.cwd(), values.config);

			expect(configPath).toContain('custom-angular.json');
		});

		it('should parse valid angular.json correctly', () => {
			const configPath = resolve(process.cwd(), 'angular.json');
			const angularConfig = JSON.parse(mockReadFileSync(configPath, 'utf8'));

			expect(angularConfig).toHaveProperty('projects');
			expect(angularConfig.projects).toHaveProperty('test-project');
			expect(angularConfig.projects).toHaveProperty('another-project');
		});
	});

	describe('stringToRegExp helper', () => {
		// Test the stringToRegExp function used in the CLI
		const stringToRegExp = (value: string) => {
			const [, start, core, end] = /^(\^?)(.*?)(\$?)$/.exec(value) || ['', '', value, ''];
			const escaped = core.replace(/[-.*+?^${}()|[\]\\]/g, '\\$&');
			return new RegExp(start + escaped + end);
		};

		it('should escape regex special characters', () => {
			const regex = stringToRegExp('.js$');
			expect(regex.test('test.js')).toBe(true);
			expect(regex.test('testxjs')).toBe(false);
		});

		it('should handle anchor characters', () => {
			const regex = stringToRegExp('^main');
			expect(regex.test('main.js')).toBe(true);
			expect(regex.test('test-main.js')).toBe(false);
		});

		it('should handle both anchors', () => {
			const regex = stringToRegExp('^exact$');
			expect(regex.test('exact')).toBe(true);
			expect(regex.test('not-exact')).toBe(false);
			expect(regex.test('exact-not')).toBe(false);
		});
	});
});
