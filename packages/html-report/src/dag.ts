import type { Connection } from 'sonda';

interface DagLayoutOptions {
	nodeWidth: number;
	nodeHeight: number;
	horizontalGap: number;
	verticalGap: number;
	paddingX: number;
	paddingY: number;
	maxNodesPerColumn: number;
}

export interface DagLayoutNode {
	id: string;
	layer: number;
	x: number;
	y: number;
	width: number;
	height: number;
}

export interface DagLayoutEdge extends Connection {
	path: string;
}

export interface DagLayout {
	width: number;
	height: number;
	nodes: Array<DagLayoutNode>;
	edges: Array<DagLayoutEdge>;
	roots: Array<string>;
	leaves: Array<string>;
}

export interface DagCamera {
	scale: number;
	x: number;
	y: number;
}

const DEFAULT_LAYOUT_OPTIONS: DagLayoutOptions = {
	nodeWidth: 250,
	nodeHeight: 36,
	horizontalGap: 120,
	verticalGap: 16,
	paddingX: 36,
	paddingY: 24,
	maxNodesPerColumn: Number.POSITIVE_INFINITY
};

const SPLIT_COLUMN_GAP = 24;
const EDGE_SIBLING_OFFSET_STEP = 6;

export function createDagLayout(connections: Array<Connection>, options: Partial<DagLayoutOptions> = {}): DagLayout {
	const layoutOptions = {
		...DEFAULT_LAYOUT_OPTIONS,
		...options
	};

	const edges = connections;
	const nodeIds = collectNodeIds(edges);

	if (!nodeIds.length) {
		return {
			width: 0,
			height: 0,
			nodes: [],
			edges: [],
			roots: [],
			leaves: []
		};
	}

	const outgoing: Record<string, Array<Connection>> = {};
	const incoming: Record<string, Array<Connection>> = {};

	for (const id of nodeIds) {
		outgoing[id] = [];
		incoming[id] = [];
	}

	for (const connection of edges) {
		outgoing[connection.source]!.push(connection);
		incoming[connection.target]!.push(connection);
	}

	for (const id of nodeIds) {
		outgoing[id]!.sort((a, b) => compareText(a.target, b.target) || compareText(a.kind, b.kind));
		incoming[id]!.sort((a, b) => compareText(a.source, b.source) || compareText(a.kind, b.kind));
	}

	const roots = nodeIds.filter(id => incoming[id]!.length === 0);
	const leaves = nodeIds.filter(id => outgoing[id]!.length === 0);
	const layers = computeLayers(nodeIds, outgoing, incoming, roots);

	let maxLayer = 0;

	for (const id of nodeIds) {
		const layer = layers.get(id) || 0;

		if (layer > maxLayer) {
			maxLayer = layer;
		}
	}

	const layersMap = new Map<number, Array<string>>();

	for (let layer = 0; layer <= maxLayer; layer++) {
		layersMap.set(layer, []);
	}

	for (const id of nodeIds) {
		layersMap.get(layers.get(id) || 0)!.push(id);
	}

	for (const [layer, ids] of layersMap) {
		ids.sort((a, b) => {
			const outgoingDiff = outgoing[b]!.length - outgoing[a]!.length;

			if (outgoingDiff !== 0) {
				return outgoingDiff;
			}

			return compareText(a, b);
		});
		layersMap.set(layer, ids);
	}

	const layerColumns = new Map<number, Array<Array<string>>>();

	for (const [layer, ids] of layersMap) {
		const columns = splitLayerNodes(ids, layoutOptions.maxNodesPerColumn);
		layerColumns.set(layer, columns.length ? columns : [[]]);
	}

	let maxRows = 1;

	for (const columns of layerColumns.values()) {
		for (const column of columns) {
			maxRows = Math.max(maxRows, column.length);
		}
	}

	const innerHeight = Math.max(
		layoutOptions.nodeHeight,
		maxRows * layoutOptions.nodeHeight + (maxRows - 1) * layoutOptions.verticalGap
	);

	let innerWidth = 0;

	for (let layer = 0; layer <= maxLayer; layer++) {
		const columns = layerColumns.get(layer)!;
		const layerWidth = columns.length * layoutOptions.nodeWidth + Math.max(columns.length - 1, 0) * SPLIT_COLUMN_GAP;

		innerWidth += layerWidth;

		if (layer < maxLayer) {
			innerWidth += layoutOptions.horizontalGap;
		}
	}

	const width = layoutOptions.paddingX * 2 + innerWidth;
	const height = layoutOptions.paddingY * 2 + innerHeight;

	const nodes: Array<DagLayoutNode> = [];
	const positions = new Map<string, DagLayoutNode>();
	let layerStartX = layoutOptions.paddingX;

	for (let layer = 0; layer <= maxLayer; layer++) {
		const columns = layerColumns.get(layer)!;
		const layerWidth = columns.length * layoutOptions.nodeWidth + Math.max(columns.length - 1, 0) * SPLIT_COLUMN_GAP;

		for (let columnIndex = 0; columnIndex < columns.length; columnIndex++) {
			const ids = columns[columnIndex]!;
			const columnHeight =
				ids.length * layoutOptions.nodeHeight + Math.max(ids.length - 1, 0) * layoutOptions.verticalGap;
			const yStart = layoutOptions.paddingY + (innerHeight - columnHeight) / 2;
			const x = layerStartX + columnIndex * (layoutOptions.nodeWidth + SPLIT_COLUMN_GAP);

			for (let index = 0; index < ids.length; index++) {
				const id = ids[index]!;
				const node: DagLayoutNode = {
					id,
					layer,
					x,
					y: yStart + index * (layoutOptions.nodeHeight + layoutOptions.verticalGap),
					width: layoutOptions.nodeWidth,
					height: layoutOptions.nodeHeight
				};

				nodes.push(node);
				positions.set(id, node);
			}
		}

		layerStartX += layerWidth;

		if (layer < maxLayer) {
			layerStartX += layoutOptions.horizontalGap;
		}
	}

	const edgeIndexesByPair = edges.reduce(
		(acc, edge, index) => {
			const key = getPairKey(edge.source, edge.target);
			acc[key] ||= [];
			acc[key].push(index);
			return acc;
		},
		{} as Record<string, Array<number>>
	);
	const edgeSiblingOffsets = new Array<number>(edges.length).fill(0);

	for (const key in edgeIndexesByPair) {
		const siblingIndexes = edgeIndexesByPair[key]!;
		siblingIndexes.sort((a, b) => compareText(edges[a]!.kind, edges[b]!.kind));

		const center = (siblingIndexes.length - 1) / 2;

		for (let index = 0; index < siblingIndexes.length; index++) {
			edgeSiblingOffsets[siblingIndexes[index]!] = (index - center) * EDGE_SIBLING_OFFSET_STEP;
		}
	}

	const layoutEdges: Array<DagLayoutEdge> = [];

	for (let edgeIndex = 0; edgeIndex < edges.length; edgeIndex++) {
		const edge = edges[edgeIndex]!;
		const source = positions.get(edge.source);
		const target = positions.get(edge.target);

		if (!source || !target) {
			continue;
		}

		const siblingOffset = edgeSiblingOffsets[edgeIndex] || 0;
		const sourceY = source.y + source.height / 2 + siblingOffset;
		const targetY = target.y + target.height / 2 + siblingOffset;
		const sourceX = source.x + source.width;
		const targetX = target.x;

		const curve = Math.max(28, Math.min(120, (targetX - sourceX) * 0.35));
		const path =
			edge.source === edge.target
				? `M ${sourceX} ${sourceY} c 18 -15 18 15 0 0`
				: `M ${sourceX} ${sourceY} C ${sourceX + curve} ${sourceY}, ${targetX - curve} ${targetY}, ${targetX} ${targetY}`;

		layoutEdges.push({
			...edge,
			path
		});
	}

	return {
		width,
		height,
		nodes,
		edges: layoutEdges,
		roots,
		leaves
	};
}

function computeLayers(
	nodeIds: Array<string>,
	outgoing: Record<string, Array<Connection>>,
	incoming: Record<string, Array<Connection>>,
	roots: Array<string>
): Map<string, number> {
	const indegrees = new Map(nodeIds.map(id => [id, incoming[id]!.length]));
	const queue = (roots.length ? [...roots] : [...nodeIds]).sort(compareText);
	const layers = new Map<string, number>(queue.map(id => [id, 0]));
	const visited = new Set<string>();
	let queueIndex = 0;

	while (queueIndex < queue.length) {
		const source = queue[queueIndex++]!;

		if (visited.has(source)) {
			continue;
		}

		visited.add(source);

		const sourceLayer = layers.get(source) || 0;

		for (const edge of outgoing[source]!) {
			const nextLayer = sourceLayer + 1;
			const currentLayer = layers.get(edge.target) || 0;

			if (nextLayer > currentLayer) {
				layers.set(edge.target, nextLayer);
			}

			indegrees.set(edge.target, (indegrees.get(edge.target) || 0) - 1);

			if ((indegrees.get(edge.target) || 0) === 0) {
				queue.push(edge.target);
			}
		}
	}

	for (const id of nodeIds) {
		if (layers.has(id)) {
			continue;
		}

		const parentLayer = incoming[id]!.reduce((max, edge) => {
			const layer = layers.get(edge.source);
			return layer === undefined ? max : Math.max(max, layer);
		}, -1);

		layers.set(id, parentLayer + 1);
	}

	return layers;
}

export function deduplicateConnections(connections: Array<Connection>): Array<Connection> {
	const seen = new Set<string>();

	return connections.filter(connection => {
		const key = getConnectionKey(connection);

		if (seen.has(key)) {
			return false;
		}

		seen.add(key);
		return true;
	});
}

function collectNodeIds(connections: Array<Connection>): Array<string> {
	const nodeIds = new Set<string>();

	for (const connection of connections) {
		nodeIds.add(connection.source);
		nodeIds.add(connection.target);
	}

	return Array.from(nodeIds).sort(compareText);
}

function getPairKey(source: string, target: string): string {
	return `${source}\u0000${target}`;
}

function getConnectionKey(connection: Connection): string {
	return [connection.kind, connection.source, connection.target, connection.original || ''].join('\u0000');
}

function compareText(a: string, b: string): number {
	return a.localeCompare(b);
}

function splitLayerNodes(ids: Array<string>, maxNodesPerColumn: number): Array<Array<string>> {
	if (!ids.length) {
		return [];
	}

	if (!Number.isFinite(maxNodesPerColumn) || maxNodesPerColumn <= 0) {
		return [ids];
	}

	const columnSize = Math.max(1, Math.floor(maxNodesPerColumn));

	if (ids.length <= columnSize) {
		return [ids];
	}

	const columns: Array<Array<string>> = [];

	for (let index = 0; index < ids.length; index += columnSize) {
		columns.push(ids.slice(index, index + columnSize));
	}

	return columns;
}
