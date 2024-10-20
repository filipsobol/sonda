import { compressionStore, type CompressionStore } from './compression.svelte.js';
import { dialogsStore, type OpenedDialogsStore } from './dialogs.svelte.js';
import {  activeOutputStore, type ActiveOutputStore } from './outputs.svelte.js';

export { duplicates } from './dependencies.js';
export { outputs } from './outputs.svelte.js';
export type { CompressionType } from './compression.svelte.js';

export const activeOutput: ActiveOutputStore = activeOutputStore();
export const compression: CompressionStore = compressionStore();
export const dialog: OpenedDialogsStore = dialogsStore();
