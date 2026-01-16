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
import { getAssetResource, getSourceResource, report } from '@/report.js';
import InlineCodeBlock from '@components/common/InlineCodeBlock.vue';
import type { ChunkResource, Connection } from 'sonda';

interface Props {
	name: string;
}

const props = defineProps<Props>();

const source = computed(() => getSourceResource(props.name)!);
const usedIn = computed(() => {
	return report.resources
		.filter((resource): resource is ChunkResource => resource.kind === 'chunk' && resource.name === props.name)
		.map(resource => ({
			label: resource.parent!,
			value: resource.parent!
		}));
});

// Selected asset
const asset = computed(() => (usedIn.value[0]?.value && getAssetResource(usedIn.value[0].value)) || null);

// Dependency graph
const graph = computed(() => (asset.value ? findShortestPath(asset.value.name, source.value.name) : null));

/**
 * Finds the shortest directed path from any of the given start nodes to the target node using BFS.
 */
function findShortestPath(startNode: string, targetNode: string): Array<Connection> | null {
	// Use `Object.groupBy( report.connections, connection => connection.source );` when it has better browser support.
	const adjacencyList = report.connections.reduce(
		(acc, connection) => {
			acc[connection.source] ||= [];
			acc[connection.source].push(connection);
			return acc;
		},
		{} as Record<string, Connection[]>
	);

	const visited = new Set<string>([startNode]);
	const queue: Array<Array<Connection>> = (adjacencyList[startNode] ?? []).map(connection => [connection]);

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
</script>
