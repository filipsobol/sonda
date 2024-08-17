import { mount } from 'svelte';
import App from './components/App.svelte';

import './augmentation.js';
import './app.css';

mount(App, {
  target: document.getElementById('app')!,
});
