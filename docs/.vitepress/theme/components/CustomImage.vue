<template>
  <figure>
    <img :src="src" :alt="string" />
    <figcaption v-if="caption">{{ caption }}</figcaption>
  </figure>
</template>

<script setup lang="ts">
defineProps<{
  src: string;
  alt: string;
  caption?: string;
}>()
</script>

<style scoped>
figure {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem 0;
}
img {
  border: 1px solid #ddd;
}
figcaption {
  margin-top: 0.5rem;
  font-size: 0.85em;
  color: #666;
}
</style>
