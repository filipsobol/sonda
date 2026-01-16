<template>
	<div
		v-if="options.length > 0"
		v-click-outside="() => (open = false)"
		class="relative"
	>
		<BaseButton
			:active="model.length > 0"
			:disabled
			@click="() => (open = !open)"
		>
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
				class="absolute z-10 mt-1 max-h-64 w-max max-w-sm min-w-3xs overflow-y-auto rounded-lg border border-gray-300 bg-white shadow-lg"
			>
				<ul class="flex flex-col gap-3 p-3 text-sm text-gray-900">
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
								class="size-4 flex-shrink-0"
							/>
							<label
								:for="'checkbox-' + option.value"
								class="flex-grow ps-2 select-none"
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

export interface DropdownOption<T extends string = string> {
	label: string;
	subLabel?: string;
	value: T;
}

interface Props {
	title: string;
	disabled?: boolean;
	options: Array<DropdownOption>;
}

const model = defineModel<Array<string>>({
	default: () => []
});
const props = defineProps<Props>();

const open = ref(false);
</script>
