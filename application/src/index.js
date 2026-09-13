import { createWebHistory, createRouter } from "vue-router";
import Dashboard from "./page/MainPage/Dashboard.vue";

const routes = [
    {
        path: '/',
        component: Dashboard
    }
]

export const router = createRouter({
    history: createWebHistory(),
    routes
})