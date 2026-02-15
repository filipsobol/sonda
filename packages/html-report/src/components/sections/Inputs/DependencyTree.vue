<template>
	<template v-if="graph?.length">
		<h4 class="mt-16 mb-4 text-lg font-bold text-gray-700">Dependency tree</h4>

		<div class="ml-3 flex flex-col gap-y-8 border-l-2 border-gray-200 pl-7">
			<div
				v-for="(node, index) in graph"
				:key="node.target"
				class="relative flex flex-col py-1"
			>
				<div class="absolute top-[0.5rem] left-[-2.5rem] z-10 flex items-center justify-center">
					<div
						class="flex size-6 items-center justify-center rounded-full bg-gray-200 font-bold text-gray-900 select-none"
					>
						{{ index + 1 }}
					</div>
				</div>

				<template v-if="node.kind === 'entrypoint'">
					<p class="text-sm/7 font-semibold">
						Entry point for the
						<a :href="router.getUrl('assets/details', { item: node.source })">
							<InlineCodeBlock>{{ node.source }}</InlineCodeBlock>
						</a>
						asset is
						<a :href="router.getUrl('inputs/details', { item: node.target })">
							<InlineCodeBlock>{{ node.target }}</InlineCodeBlock>
						</a>
					</p>
				</template>

				<template v-else-if="node.kind === 'import'">
					<p class="text-sm/7 font-semibold">
						It imports
						<a :href="router.getUrl('inputs/details', { item: node.target })">
							<InlineCodeBlock>{{ node.original || node.target }}</InlineCodeBlock>
						</a>
					</p>

					<p class="pt-2 text-gray-600">
						This import was resolved to
						<a :href="router.getUrl('inputs/details', { item: node.target })">
							<span class="pre-nowrap rounded-lg bg-gray-100 px-2 py-1">{{ node.target }}</span>
						</a>
					</p>
				</template>

				<template v-else-if="node.kind === 'require'">
					<p class="text-sm/7 font-semibold">
						It requires
						<a :href="router.getUrl('inputs/details', { item: node.target })">
							<InlineCodeBlock>{{ node.original || node.target }}</InlineCodeBlock>
						</a>
					</p>

					<p class="pt-2 text-gray-600">
						This import was resolved to
						<a :href="router.getUrl('inputs/details', { item: node.target })">
							<span class="pre-nowrap rounded-lg bg-gray-100 px-2 py-1">{{ node.target }}</span>
						</a>
					</p>
				</template>

				<template v-else-if="node.kind === 'dynamic-import'">
					<p class="text-sm/7 font-semibold">
						It dynamically imports
						<a :href="router.getUrl('inputs/details', { item: node.target })">
							<InlineCodeBlock>{{ node.original || node.target }}</InlineCodeBlock>
						</a>
					</p>

					<p class="pt-2 text-gray-600">
						This import was resolved to
						<a :href="router.getUrl('inputs/details', { item: node.target })">
							<InlineCodeBlock>{{ node.target }}</InlineCodeBlock>
						</a>
					</p>
				</template>

				<template v-else-if="node.kind === 'sourcemap'">
					<p class="text-sm/7 font-semibold">
						It has a source map that contains
						<a :href="router.getUrl('inputs/details', { item: node.target })">
							<InlineCodeBlock>{{ node.target }}</InlineCodeBlock>
						</a>
					</p>
				</template>
			</div>
		</div>
	</template>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { router } from '@/router.js';
import { deduplicateConnections } from '@/dag.js';
import { report } from '@/report.js';
import InlineCodeBlock from '@components/common/InlineCodeBlock.vue';
import type { Connection } from 'sonda';

interface Props {
	name: string;
}

const props = defineProps<Props>();

const usedIn = computed(router.computedQuery('usedIn', ''));
const uniqueConnections = computed(() => deduplicateConnections(report.value!.connections));

// Dependency graph
const graph = computed(() => {
	const targetNode = props.name;

	if (usedIn.value) {
		const pathFromSelectedAsset = findShortestPath([usedIn.value], targetNode, uniqueConnections.value);

		if (pathFromSelectedAsset?.length) {
			return pathFromSelectedAsset;
		}
	}

	const rootNodes = collectRootNodes(uniqueConnections.value);

	return findShortestPath(rootNodes, targetNode, uniqueConnections.value);
});

/**
 * Finds the shortest directed path from any of the given start nodes to the target node using BFS.
 */
function findShortestPath(
	startNodes: Array<string>,
	targetNode: string,
	connections: Array<Connection>
): Array<Connection> | null {
	if (!startNodes.length || !connections.length) {
		return null;
	}

	// Use `Object.groupBy( report.connections, connection => connection.source );` when it has better browser support.
	const adjacencyList = connections.reduce(
		(acc, connection) => {
			acc[connection.source] ||= [];
			acc[connection.source].push(connection);
			return acc;
		},
		{} as Record<string, Connection[]>
	);

	for (const node in adjacencyList) {
		adjacencyList[node]!.sort((a, b) => {
			return compareText(a.target, b.target) || compareText(a.kind, b.kind);
		});
	}

	const uniqueStartNodes = Array.from(new Set(startNodes)).sort(compareText);
	const visited = new Set<string>(uniqueStartNodes);
	const queue: Array<Array<Connection>> = [];

	for (const startNode of uniqueStartNodes) {
		for (const connection of adjacencyList[startNode] ?? []) {
			queue.push([connection]);
		}
	}

	while (queue.length > 0) {
		const path = queue.shift()!;
		const node = path[path.length - 1];

		if (node.target === targetNode) {
			return path;
		}

		for (const connection of adjacencyList[node.target] ?? []) {
			if (visited.has(connection.target)) {
				continue;
			}

			visited.add(connection.target);
			queue.push([...path, connection]);
		}
	}

	return null;
}

function collectRootNodes(connections: Array<Connection>): Array<string> {
	const nodeIds = new Set<string>();
	const indegrees = new Map<string, number>();

	for (const connection of connections) {
		nodeIds.add(connection.source);
		nodeIds.add(connection.target);
		indegrees.set(connection.source, indegrees.get(connection.source) || 0);
		indegrees.set(connection.target, (indegrees.get(connection.target) || 0) + 1);
	}

	const roots = Array.from(nodeIds).filter(nodeId => (indegrees.get(nodeId) || 0) === 0);

	if (roots.length) {
		return roots.sort(compareText);
	}

	return Array.from(nodeIds).sort(compareText);
}

function compareText(a: string, b: string): number {
	return a.localeCompare(b);
}
</script>
