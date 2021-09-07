import { createApp } from "vue";
import App from "./App.vue";
import { useRouter } from "./router/router";
import { store, key } from "./store/store-old";
import "./styles/index.css";

const router = useRouter();

const app = createApp(App).use(router).mount("#app");
