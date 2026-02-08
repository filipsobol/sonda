<template>
	<div class="rounded-lg border border-gray-200">
		<div class="flex items-center gap-4 px-4 py-2">
			<div class="flex-shrink-0">
				<BaseButton @click="() => (model = !model)">
					<IconChevronLeft
						:size="16"
						:class="[model ? 'rotate-90' : 'rotate-270']"
						class="text-gray-500 transition-[rotate] duration-150"
					/>
				</BaseButton>
			</div>

			<div class="flex-grow">
				<p class="text-xl font-bold">
					<slot name="title" />
				</p>

				<p
					v-if="$slots.description"
					class="text-gray-500"
				>
					<slot name="description" />
				</p>
			</div>
		</div>

		<div
			v-if="model"
			class="p-4"
		>
			<slot />
		</div>
	</div>
</template>

<script setup lang="ts">
import BaseButton from '@components/common/Button.vue';
import IconChevronLeft from '@components/icon/ChevronLeft.vue';

const model = defineModel<boolean>();
</script>
