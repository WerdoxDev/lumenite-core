import { createApp } from 'vue';
import App from './App.vue';
import { io } from 'socket.io-client';
import { store, key } from './store/store';
import './styles/index.css';

const socket = io("https://lumenite.matin-tat.ir", { autoConnect: false });

const app = createApp(App).use(store, key).mount('#app');

