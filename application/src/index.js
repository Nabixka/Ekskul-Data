import { createWebHistory, createRouter } from "vue-router";
import Dashboard from "./page/MainPage/Dashboard.vue";
import Login from "./page/Auth/Login.vue";
import Register from "./page/Auth/Register.vue";

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
        meta: { showBar: false }
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
        component: Dashboard
    }

]

export const router = createRouter({
    history: createWebHistory(),
    routes
})