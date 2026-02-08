<template>
	<nav class="mt-4 flex items-center justify-between">
		<p class="text-gray-600">Showing {{ firstItemNumber }} to {{ lastItemNumber }} of {{ count }} entries</p>

		<div class="flex items-center gap-2">
			<p class="text-gray-600">Page {{ currentPage }} of {{ lastPage }}</p>

			<ul class="flex gap-2">
				<li>
					<BaseButton
						:disabled="isFirstPage"
						@click="() => (model = 1)"
					>
						<IconChevronsLeft :size="16" />
					</BaseButton>
				</li>
				<li>
					<BaseButton
						:disabled="isFirstPage"
						@click="() => (model -= 1)"
					>
						<IconChevronLeft :size="16" />
					</BaseButton>
				</li>
				<li>
					<BaseButton
						:disabled="isLastPage"
						@click="() => (model += 1)"
					>
						<IconChevronLeft
							:size="16"
							class="rotate-180"
						/>
					</BaseButton>
				</li>
				<li>
					<BaseButton
						:disabled="isLastPage"
						@click="() => (model = lastPage)"
					>
						<IconChevronsLeft
							:size="16"
							class="rotate-180"
						/>
					</BaseButton>
				</li>
			</ul>
		</div>
	</nav>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import BaseButton from '@components/common/Button.vue';
import IconChevronLeft from '@components/icon/ChevronLeft.vue';
import IconChevronsLeft from '@components/icon/ChevronsLeft.vue';

interface Props {
	count: number;
	itemsPerPage: number;
}

const model = defineModel<number>({ default: 1 });
const props = defineProps<Props>();

const firstItemNumber = computed(() => (props.count > 0 ? (model.value - 1) * props.itemsPerPage + 1 : 0));
const lastItemNumber = computed(() => Math.min(model.value * props.itemsPerPage, props.count));

const isFirstPage = computed(() => model.value <= 1);
const isLastPage = computed(() => model.value >= lastPage.value);

const currentPage = computed(() => (props.count > 0 ? model.value : 0));
const lastPage = computed(() => (props.count > 0 ? Math.ceil(props.count / props.itemsPerPage) : 0));
</script>
