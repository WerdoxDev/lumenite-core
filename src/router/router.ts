import { createRouter, createWebHashHistory, RouteRecordRaw } from "vue-router";
import Login from "../components/Login.vue";
import Dashboard from "../components/Dashboard.vue";
import Sequence from "../components/Sequence.vue";

const routes = [
  { path: "/", component: Login },
  { path: "/dashboard", component: Dashboard },
  { path: "/sequence", component: Sequence },
] as Array<RouteRecordRaw>;

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export function useRouter() {
  return router;
}
