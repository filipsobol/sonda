<template>
	<div class="flex h-full min-h-0 flex-col overflow-hidden">
		<div class="max-w-7xl">
			<h2 class="text-2xl font-bold">File connections</h2>

			<p class="mt-4 text-gray-500">Directed graph of file-to-file build connections from entry roots to leaf files.</p>
		</div>

		<hr class="mt-4 mb-6 border-gray-100" />

		<div class="mb-4 flex gap-2">
			<SearchInput
				v-model="search"
				placeholder="Filter files (prefix with - to exclude)"
			/>

			<Dropdown
				v-model="kinds"
				:options="availableConnectionOptions"
				title="Connection"
			>
				<template #icon>
					<IconFunnel :size="16" />
				</template>
			</Dropdown>
		</div>

		<div class="min-h-0 w-full grow basis-0 overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
			<DagGraph
				v-if="layout.nodes.length"
				:key="kindsKey"
				class="size-full min-h-0"
				:layout
				:resourceKinds
				:activeNode
				:initialCamera
				:focusNode
				:matchedNodes="searchNodeMatches.nodes"
				:focusToken="search"
				@update:camera="onCameraChange"
				@update:activeNode="onActiveNodeChange"
			/>

			<Alert
				v-else
				variant="neutral"
				class="m-4 bg-white"
			>
				<template #header> No results found</template>

				<template #body>
					<p>There are no connections matching the current filters.</p>
				</template>
			</Alert>
		</div>
	</div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { createDagLayout, deduplicateConnections } from '@/dag.js';
import { report } from '@/report.js';
import { router } from '@/router.js';
import Alert from '@/components/common/Alert.vue';
import SearchInput from '@/components/common/SearchInput.vue';
import Dropdown, { type DropdownOption } from '@components/common/Dropdown.vue';
import DagGraph from '@/components/dag/Graph.vue';
import IconFunnel from '@components/icon/Funnel.vue';
import type { DagCamera } from '@/dag.js';
import type { Connection, ConnectionKind, ResourceKind } from 'sonda';

interface SearchIndex {
	adjacency: Map<string, Array<string>>;
	reverseAdjacency: Map<string, Array<string>>;
	nodeTokens: Map<string, string>;
}

const CONNECTION_OPTIONS: Array<DropdownOption<ConnectionKind>> = [
	{ label: 'Entrypoint', value: 'entrypoint' },
	{ label: 'Import', value: 'import' },
	{ label: 'Require', value: 'require' },
	{ label: 'Dynamic import', value: 'dynamic-import' },
	{ label: 'Source map', value: 'sourcemap' }
];
const CONNECTION_KIND_VALUES = CONNECTION_OPTIONS.map(option => option.value);

const search = computed<string>(router.computedQuery('search', '' as string));
const kinds = computed(router.computedQuery('kinds', CONNECTION_KIND_VALUES));
const activeNode = computed<string>(router.computedQuery('dagNode', '' as string));
const cameraScale = computed<number>(router.computedQuery('dagScale', 1 as number));
const cameraX = computed<number>(router.computedQuery('dagX', 0 as number));
const cameraY = computed<number>(router.computedQuery('dagY', 0 as number));
const normalizedSearch = computed(() => search.value.trim().toLowerCase());
const uniqueConnections = computed(() => deduplicateConnections(report.value!.connections));

const initialCamera = computed<DagCamera | null>(() => {
	const hasAnyCameraParam =
		router.query.dagScale !== undefined || router.query.dagX !== undefined || router.query.dagY !== undefined;

	if (!hasAnyCameraParam) {
		return null;
	}

	const scale = Number(cameraScale.value);
	const x = Number(cameraX.value);
	const y = Number(cameraY.value);

	if (!Number.isFinite(scale) || !Number.isFinite(x) || !Number.isFinite(y)) {
		return null;
	}

	return {
		scale,
		x,
		y
	};
});

const selectedKinds = computed<Array<ConnectionKind>>(() => {
	const selected = new Set(kinds.value);
	return CONNECTION_KIND_VALUES.filter(kind => selected.has(kind));
});

const selectedKindSet = computed(() => new Set(selectedKinds.value));

const kindsKey = computed(() => selectedKinds.value.join(','));

const availableConnectionOptions = computed(() => {
	const availableKinds = new Set(uniqueConnections.value.map(connection => connection.kind));
	return CONNECTION_OPTIONS.filter(option => availableKinds.has(option.value));
});

const connectionsByKind = computed(() => {
	return uniqueConnections.value.filter(connection => selectedKindSet.value.has(connection.kind));
});

const searchIndex = computed(() => buildSearchIndex(connectionsByKind.value));

const filteredConnections = computed(() => {
	return filterBySearch(connectionsByKind.value, searchIndex.value, normalizedSearch.value);
});

const resourceKinds = computed<Record<string, Exclude<ResourceKind, 'chunk'> | undefined>>(() => {
	const kinds: Record<string, Exclude<ResourceKind, 'chunk'> | undefined> = {};

	for (const resource of report.value!.resources) {
		if (resource.kind === 'chunk') {
			continue;
		}

		kinds[resource.name] ||= resource.kind;
	}

	return kinds;
});

const layout = computed(() => createDagLayout(filteredConnections.value));
const focusNode = ref('');

const searchNodeMatches = computed(() => {
	const token = normalizedSearch.value;

	if (!token || token.startsWith('-')) {
		return {
			focusNode: '',
			nodes: [] as Array<string>
		};
	}

	let focusNode = '';
	const nodes: Array<string> = [];

	for (const node of layout.value.nodes) {
		if (!node.id.toLowerCase().includes(token)) {
			continue;
		}

		if (!focusNode) {
			focusNode = node.id;
		}

		nodes.push(node.id);
	}

	return {
		focusNode,
		nodes
	};
});
watch(layout, value => {
	if (activeNode.value && !value.nodes.some(node => node.id === activeNode.value)) {
		activeNode.value = '';
	}
});

watch(search, () => {
	activeNode.value = '';
	focusNode.value = searchNodeMatches.value.focusNode;
});

watch(kindsKey, () => {
	activeNode.value = '';
	focusNode.value = '';
	cameraScale.value = 1;
	cameraX.value = 0;
	cameraY.value = 0;
});

function onCameraChange(camera: DagCamera): void {
	cameraScale.value = round(camera.scale, 4);
	cameraX.value = round(camera.x, 2);
	cameraY.value = round(camera.y, 2);
}

function onActiveNodeChange(node: string): void {
	activeNode.value = node;
}

function round(value: number, precision: number): number {
	const multiplier = 10 ** precision;
	return Math.round(value * multiplier) / multiplier;
}

function filterBySearch(connections: Array<Connection>, index: SearchIndex, normalized: string): Array<Connection> {
	if (!normalized) {
		return connections;
	}

	if (normalized.startsWith('-')) {
		const excluded = normalized.slice(1);

		if (!excluded) {
			return connections;
		}

		return connections.filter(connection => {
			return (
				!index.nodeTokens.get(connection.source)?.includes(excluded) &&
				!index.nodeTokens.get(connection.target)?.includes(excluded)
			);
		});
	}

	const matched = new Set<string>();

	for (const [nodeId, token] of index.nodeTokens) {
		if (token.includes(normalized)) {
			matched.add(nodeId);
		}
	}

	if (!matched.size) {
		return [];
	}

	const included = new Set(matched);

	expandConnections(included, matched, index.adjacency);
	expandConnections(included, matched, index.reverseAdjacency);

	return connections.filter(connection => included.has(connection.source) && included.has(connection.target));
}

function buildSearchIndex(connections: Array<Connection>): SearchIndex {
	const adjacency = new Map<string, Array<string>>();
	const reverseAdjacency = new Map<string, Array<string>>();
	const nodeTokens = new Map<string, string>();

	for (const connection of connections) {
		appendConnection(adjacency, connection.source, connection.target);
		appendConnection(reverseAdjacency, connection.target, connection.source);

		nodeTokens.set(connection.source, connection.source.toLowerCase());
		nodeTokens.set(connection.target, connection.target.toLowerCase());
	}

	return {
		adjacency,
		reverseAdjacency,
		nodeTokens
	};
}

function expandConnections(included: Set<string>, seeds: Set<string>, adjacency: Map<string, Array<string>>): void {
	const queue = Array.from(seeds);
	let index = 0;

	while (index < queue.length) {
		const node = queue[index++]!;

		for (const nextNode of adjacency.get(node) || []) {
			if (included.has(nextNode)) {
				continue;
			}

			included.add(nextNode);
			queue.push(nextNode);
		}
	}
}

function appendConnection(adjacency: Map<string, Array<string>>, source: string, target: string): void {
	if (adjacency.has(source)) {
		adjacency.get(source)!.push(target);
		return;
	}

	adjacency.set(source, [target]);
}
</script>
