import { createApp } from 'vue';
import App from './App.vue';
import vClickOutside from './directives/click-outside';

import './style.css';

createApp(App)
	.directive( 'click-outside', vClickOutside )
	.mount('#app');
