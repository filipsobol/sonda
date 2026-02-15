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

interface ConnectionGraph {
	adjacency: Map<string, Array<Connection>>;
	nodes: Set<string>;
	roots: Array<string>;
}

const props = defineProps<Props>();

const usedIn = computed(router.computedQuery('usedIn', ''));
const uniqueConnections = computed(() => deduplicateConnections(report.value!.connections));
const connectionGraph = computed(() => buildConnectionGraph(uniqueConnections.value));

// Dependency graph
const graph = computed(() => {
	const targetNode = props.name;
	const searchGraph = connectionGraph.value;

	if (!searchGraph.nodes.has(targetNode)) {
		return null;
	}

	if (usedIn.value && searchGraph.nodes.has(usedIn.value)) {
		const pathFromSelectedAsset = findShortestPath([usedIn.value], targetNode, searchGraph);

		if (pathFromSelectedAsset?.length) {
			return pathFromSelectedAsset;
		}
	}

	return findShortestPath(searchGraph.roots, targetNode, searchGraph);
});

/**
 * Finds the shortest directed path from any of the given start nodes to the target node using BFS.
 */
function findShortestPath(
	startNodes: Array<string>,
	targetNode: string,
	graph: ConnectionGraph
): Array<Connection> | null {
	if (!startNodes.length) {
		return null;
	}

	if (!graph.nodes.has(targetNode)) {
		return null;
	}

	const uniqueStartNodes = Array.from(new Set(startNodes))
		.filter(node => graph.nodes.has(node))
		.sort(compareText);

	if (!uniqueStartNodes.length) {
		return null;
	}

	const visited = new Set<string>(uniqueStartNodes);
	const queue: Array<Array<Connection>> = [];
	let queueIndex = 0;

	for (const startNode of uniqueStartNodes) {
		for (const connection of graph.adjacency.get(startNode) || []) {
			if (visited.has(connection.target)) {
				continue;
			}

			visited.add(connection.target);
			queue.push([connection]);
		}
	}

	while (queueIndex < queue.length) {
		const path = queue[queueIndex++]!;
		const node = path[path.length - 1];

		if (node.target === targetNode) {
			return path;
		}

		for (const connection of graph.adjacency.get(node.target) || []) {
			if (visited.has(connection.target)) {
				continue;
			}

			visited.add(connection.target);
			queue.push([...path, connection]);
		}
	}

	return null;
}

function buildConnectionGraph(connections: Array<Connection>): ConnectionGraph {
	const adjacency = new Map<string, Array<Connection>>();
	const nodeIds = new Set<string>();
	const indegrees = new Map<string, number>();

	for (const connection of connections) {
		nodeIds.add(connection.source);
		nodeIds.add(connection.target);
		indegrees.set(connection.source, indegrees.get(connection.source) || 0);
		indegrees.set(connection.target, (indegrees.get(connection.target) || 0) + 1);

		if (adjacency.has(connection.source)) {
			adjacency.get(connection.source)!.push(connection);
		} else {
			adjacency.set(connection.source, [connection]);
		}
	}

	for (const edges of adjacency.values()) {
		edges.sort((a, b) => compareText(a.target, b.target) || compareText(a.kind, b.kind));
	}

	const sortedNodes = Array.from(nodeIds).sort(compareText);
	const roots = sortedNodes.filter(nodeId => (indegrees.get(nodeId) || 0) === 0);

	return {
		adjacency,
		nodes: nodeIds,
		roots: roots.length ? roots : sortedNodes
	};
}

function compareText(a: string, b: string): number {
	return a.localeCompare(b);
}
</script>
