import type { DirectiveBinding } from 'vue';

type ClickOutsideElement = HTMLElement & {
	_clickOutside?: (event: MouseEvent) => void;
};

const vClickOutside = {
	beforeMount(el: ClickOutsideElement, binding: DirectiveBinding) {
		el._clickOutside = (event: MouseEvent) => {
			if (!el.contains(event.target as Node)) {
				binding.value(event);
			}
		};

		document.addEventListener('click', el._clickOutside);
	},

	unmounted(el: ClickOutsideElement) {
		if (el._clickOutside) {
			document.removeEventListener('click', el._clickOutside);
			delete el._clickOutside;
		}
	}
};

export default vClickOutside;
