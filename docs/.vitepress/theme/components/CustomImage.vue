<template>
  <figure>
    <img
      ref="img"
      :src="src"
      :alt="alt"
      @click="open"
    />
    <figcaption v-if="caption">{{ caption }}</figcaption>
  </figure>
</template>

<script setup lang="ts">
import { defineProps, useTemplateRef, onMounted, onUnmounted } from 'vue';
import mediumZoom, { type Zoom } from 'medium-zoom';

defineProps<{
  src: string;
  alt: string;
  caption?: string;
}>();

let zoom: Zoom | null = null;
const image = useTemplateRef('img');

function open() {
  return zoom!.open();
}

onMounted( () => {
  zoom = mediumZoom( image.value!, {
    background: 'var(--vp-c-bg)'
  } );
} );

onUnmounted( () => {
  zoom!.detach( image.value! );
} );
</script>

<style>
figure {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem 0;
}
figcaption {
  margin-top: 0.5rem;
  font-size: 0.85em;
  color: var(--vp-c-text-2);
}
img {
  border: 1px solid var(--vp-c-divider);
}

.medium-zoom-overlay,
.medium-zoom-image--opened {
  z-index: 999;
}
</style>
