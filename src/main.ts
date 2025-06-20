import { createApp } from 'vue'
import App from './App.vue'

import 'bootstrap-vue-3/dist/bootstrap-vue-3.css'
import 'bootstrap/dist/css/bootstrap.css'

import BootstrapVue3 from 'bootstrap-vue-3'
import { createPinia } from 'pinia'

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(BootstrapVue3);
app.mount('#app');
