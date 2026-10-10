import { createWebHistory, createRouter } from "vue-router";
import Dashboard from "./page/MainPage/Dashboard.vue";
import Login from "./page/Auth/Login.vue";
import Register from "./page/Auth/Register.vue";
import ListEkskul from "./page/MainPage/ListEkskul.vue";
import EkskulDetail from "./page/MainPage/EkskulDetail.vue";
import DashboardAdmin from "./page/Admin/Dashboard.vue";
import ListEkskulAdmin from "./page/Admin/ListEkskul.vue";
import DataSiswaAdmin from "./page/Admin/DataSiswa.vue";
import EkskulDetailAdmin from "./page/Admin/EkskulDetail.vue";
import MyEkskul from "./page/MainPage/MyEkskul.vue";
import MyEkskulDetail from "./page/MainPage/MyEkskulDetail.vue";
import KegiatanDetail from "./page/MainPage/KegiatanDetail.vue";
import PeminjamanRuang from "./page/MainPage/PeminjamanRuang.vue";
import AdminRuang from "./page/Admin/Ruang.vue";
import LaporanBulananAdmin from "./page/Admin/LaporanBulanan.vue";

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
    // {
    //     path: '/auth/register',
    //     name: "Register",
    //     component: Register
    // },


    // Member
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
    },
    {
        path: '/ekskul/:id',
        name: "Ekskul Detail",
        component: EkskulDetail,
        meta: { showBar: true }
    },
    {
        path: '/my-ekskul',
        name: "My Ekskul",
        component: MyEkskul,
        meta: { showBar: true }
    },
    {
        path: '/my-ekskul/:id',
        name: "My Ekskul Detail",
        component: MyEkskulDetail,
        meta: { showBar: true }
    },
    {
        path: '/my-ekskul/:id/kegiatan/:kegiatanId',
        name: "My Ekskul Kegiatan Detail",
        component: KegiatanDetail,
        meta: { showBar: true }
    },
    {
        path: '/peminjaman-ruang',
        name: "Peminjaman Ruang",
        component: PeminjamanRuang,
        meta: { showBar: true }
    },
    
    // Admin
    {
        path: '/admin/dashboard',
        name: "Dashboard Admin",
        component: DashboardAdmin,
        meta: { showBar: true }
    },
    {
        path: '/admin/list-ekskul',
        name: "List Ekskul Admin",
        component: ListEkskulAdmin,
        meta: { showBar: true }
    },
    {
        path: '/admin/data-siswa',
        name: "Data Siswa Admin",
        component: DataSiswaAdmin,
        meta: { showBar: true }
    },
    {
        path: '/admin/ruang',
        name: "Ruang Admin",
        component: AdminRuang,
        meta: { showBar: true }
    },
    {
        path: '/admin/laporan-bulanan',
        name: "Laporan Bulanan Admin",
        component: LaporanBulananAdmin,
        meta: { showBar: true }
    },
    {
        path: '/admin/ekskul/:id',
        name: "Ekskul Detail Admin",
        component: EkskulDetailAdmin,
        meta: { showBar: true }
    }

]

export const router = createRouter({
    history: createWebHistory(),
    routes
})