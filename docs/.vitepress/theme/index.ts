import type { Theme } from 'vitepress';
import DefaultTheme from 'vitepress/theme';
import CustomImage from './components/CustomImage.vue';

export default {
	extends: DefaultTheme,
	enhanceApp({ app }) {
		app.component('CustomImage', CustomImage);
	}
} satisfies Theme;
