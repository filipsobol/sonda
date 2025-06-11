<template>
  <svg
    :width="width"
    :height="height"
    xmlns="http://www.w3.org/2000/svg"
    role="img"
  >
    <!-- Subtract 1 and start at 0.5 to prevent stroke clipping at viewport edges -->
    <Level
      :content
      :totalBytes
      :compressionType
      :width="innerWidth"
      :height="innerHeight"
      :xStart="0.5"
      :yStart="0.5"
    >
      <slot />
    </Level>
  </svg>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import Level from './Level.vue';
import type { Folder } from '@/FileSystemTrie';

interface Props {
  width: number;
  height: number;
  content: Folder;
  compressionType: 'uncompressed' | 'gzip' | 'brotli';
}

const props = defineProps<Props>();

const totalBytes = computed( () => props.content[ props.compressionType ] );
const innerWidth = computed( () => props.width - 1 );
const innerHeight = computed( () => props.height - 1 );
</script>
