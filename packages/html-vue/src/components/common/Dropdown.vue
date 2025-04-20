<template>
	<div
		v-click-outside="() => open = false"
		class="relative"
	>
		<BaseButton @click="() => open = !open">
			<slot name="icon" />

			<span>{{ title }}</span>
		</BaseButton>

		<transition
			enter-active-class="transition-opacity duration-150"
			enter-from-class="opacity-0"
			enter-to-class="opacity-100"
			leave-active-class="transition-opacity duration-150"
			leave-from-class="opacity-100"
			leave-to-class="opacity-0"
		>
			<div
				v-show="open"
				class="absolute mt-1 z-10 w-48 bg-white border border-gray-300 rounded-lg shadow-lg"
			>
				<ul class="p-3 flex flex-col gap-3 text-sm text-gray-900">
					<li
						v-for="option in props.options"
						:key="option.value"
						class="cursor-pointer"
					>
						<div class="flex items-center">
							<input
								v-model="model"
								:value="option.value"
								:id="'checkbox-' + option.value"
								type="checkbox"
								class="size-4"
							>
							<label
								:for="'checkbox-' + option.value"
								class="ps-2 w-full select-none"
							>
								{{ option.label }}
								<span
									v-if="option.subLabel"
									class="text-gray-500"
								>
									({{ option.subLabel }})
								</span>
							</label>
						</div>
					</li>
				</ul>
			</div>
		</transition>
	</div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import BaseButton from '@components/common/Button.vue';

interface Option {
	label: string;
	subLabel?: string;
	value: string;
}

interface Props {
	title: string;
	options: Array<Option>;
}

const model = defineModel();
const props = defineProps<Props>();

const open = ref( false );
</script>
