import { createWebHistory, createRouter } from "vue-router";
import Dashboard from "./page/MainPage/Dashboard.vue";
import Login from "./page/Auth/Login.vue";
import Register from "./page/Auth/Register.vue";
import ListEkskul from "./page/MainPage/ListEkskul.vue";

const routes = [
    {
        path: '/:pathMatch(.*)',
        name: 'NotFound',
        redirect: '/auth/login'
    },

    // Auth
    {
        path: '/auth/login',
        name: "Login",
        component: Login,
    },
    {
        path: '/auth/register',
        name: "Register",
        component: Register
    },


    // 
    {
        path: '/dashboard',
        name: 'Dashboard',
        component: Dashboard,
        meta: { showBar: true }
    },
    {
        path: '/list-ekskul',
        name: "List Ekskul",
        component: ListEkskul,
        meta: { showBar: true }
    }

]

export const router = createRouter({
    history: createWebHistory(),
    routes
})