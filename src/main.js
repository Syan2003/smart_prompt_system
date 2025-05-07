import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import Plugin from './utils/axios';
import axios from 'axios'
import './assets/css/global.css'
// import { far } from '@fortawesome/free-regular-svg-icons'
import { faArrowUp,faLanguage } from "@fortawesome/free-solid-svg-icons";
import { library } from "@fortawesome/fontawesome-svg-core";

import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import i18n from './components/language'

// axios.defaults.baseURL = 'http://10.32.39.42:8081'
axios.defaults.baseURL = 'https://7f8c-2001-da8-e800-a3d8-35e6-ca73-10f8-d787.ngrok-free.app'
axios.defaults.headers.common['ngrok-skip-browser-warning'] = '69420';

library.add(faLanguage);

const app = createApp(App)


app.use(router);
app.use(ElementPlus);
app.use(Plugin);
app.use(i18n);
app.component("font-awesome-icon", FontAwesomeIcon)

app.mount('#app');

