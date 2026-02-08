<template>
	<div
		v-click-outside="() => (open = false)"
		class="relative"
	>
		<BaseButton
			class="min-w-48 ps-3 pe-2"
			:active="!!model"
			:disabled
			@click="() => (open = !open)"
		>
			<span ref="select-button">{{ title }}</span>

			<IconChevronLeft
				:size="16"
				:class="['ms-2 text-orange-500 transition-[rotate] duration-150', open ? 'rotate-90' : 'rotate-270']"
			/>
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
								:id="'radio-' + option.value"
								type="radio"
								class="size-4 accent-orange-500"
							/>
							<label
								:for="'radio-' + option.value"
								class="w-full ps-2"
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
import { computed, ref, watch, useTemplateRef } from 'vue';
import BaseButton from '@components/common/Button.vue';
import IconChevronLeft from '@icon/ChevronLeft.vue';

interface Option {
	label: string;
	subLabel?: string;
	value: string;
}

interface Props {
	disabled?: boolean;
	options: Array<Option>;
}

const element = useTemplateRef<HTMLButtonElement>('select-button');
const model = defineModel<string>({
	default: ''
});
const props = defineProps<Props>();

const open = ref(false);
const title = computed(() => props.options.find(option => option.value === model.value)!.label);

watch(model, () => {
	open.value = false;

	// `element` is always empty when `ref` is directly on the `<BaseButton>` element.
	element.value!.closest('button')!.focus();
});
</script>
