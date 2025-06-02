<template>
  <g>
    <a :xlink:href="link">
      <rect
        :data-hover="hoverData"
        :x="tile.x"
        :y="tile.y"
        :width="tile.width"
        :height="tile.height"
        :style="{ '--percentage': percentage }"
        class="stroke-gray-400"
        :class="isFolder(content) ? 'cursor-zoom-in' : 'cursor-pointer'"
        shape-rendering="crispEdges"
        vector-effect="non-scaling-stroke"
      />
    </a>

    <foreignObject
      v-if="shouldDisplayText"
      :x="tile.x"
      :y="tile.y"
      :width="tile.width"
      :height="tile.height"
      class="pointer-events-none"
    >
      <div
        xmlns="http://www.w3.org/1999/xhtml"
        class="@container px-2 py-1 size-full flex justify-center flex-nowrap text-sm gap-1"
      >
        <!-- https://stackoverflow.com/a/42551367/4617687 -->
        <p dir="rtl" class="text-gray-900 shrink truncate">&lrm;{{ content.name }}</p>
        <p class="text-gray-500 shrink-0 hidden @2xs:block">—</p>
        <p class="text-gray-500 shrink-0 hidden @2xs:block">{{ formattedSize }}</p>
      </div>
    </foreignObject>

    <Level
      v-if="children.length"
      :content="children"
      :totalBytes
      :width
      :height
      :xStart="tile.x + padding"
      :yStart="tile.y + paddingTop"
    />
  </g>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import Level from './Level.vue';
import { router } from '@/router';
import { formatSize } from '@/format';
import { isFolder, type Content } from '@/FileSystemTrie';
import type { TileData } from '@/treemap';

const tresholdInPixels = 20;
const padding = 6;
const paddingTop = 26;

interface Props {
  tile: TileData;
  content: Content;
  totalBytes: number;
}

const props = defineProps<Props>();

const width = computed( () => props.tile.width - padding * 2 );
const height = computed( () => props.tile.height - padding - paddingTop );
const link = computed( () => {
  const asset = router.query.item;
  const path = props.content.path;

  if ( !asset ) {
    // Tile is an asset
    return router.getUrl( 'treemap', { item: path } );
  }

  if ( isFolder( props.content ) ) {
    // Tile is a folder
    return router.getUrl( 'treemap', { item: asset, chunk: path } );
  }

  // Tile is a file
  return router.getUrl( 'inputs/details', { item: path } );
} );
const formattedSize = computed( () => formatSize( props.content.uncompressed ) );
const percentageOfTotal = computed( () => Math.min( ( props.content.uncompressed / props.totalBytes ) * 100, 100 ) );
const hoverData = computed( () => `${props.content.name} — <b>${formattedSize.value} (${percentageOfTotal.value.toFixed(2)}%)</b>` );
const percentage = computed( () => Math.round(percentageOfTotal.value) + '%' );
const shouldDisplayText = computed(  () => props.tile.width >= paddingTop * 1.75 && props.tile.height >= paddingTop );

const children = computed<Array<Content>>( () => {
  if (
    !isFolder( props.content )
		|| height.value <= tresholdInPixels
		|| width.value <= tresholdInPixels
  ) {
    return [];
  }

  return props.content.items;
} );
</script>

<style scoped>
rect {
  fill: color-mix(in oklch, var(--color-red-100) var(--percentage), var(--color-green-100));
}

rect:hover {
  fill: color-mix(in oklch, var(--color-red-200) var(--percentage), var(--color-green-200));
}
</style>
