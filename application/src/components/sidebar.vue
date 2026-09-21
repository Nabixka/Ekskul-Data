<script setup>
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Icon } from '@iconify/vue';

const route = useRoute()
const router = useRouter()

const listNav = ref([
    {
        name: "Dashboard",
        path: "/dashboard",
        icon: "ant-design:home-filled" 
    },
    {
        name: "List Ekskul",
        path: "/list-ekskul",
        icon: "fluent:people-community-24-filled"
    }
])

const adminList = ref([
    {
        name: "Dashboard",
        path: "/admin/dashboard",
        icon: "ant-design:home-filled" 
    },
    {
        name: "List Ekskul",
        path: "/admin/list-ekskul",
        icon: "fluent:people-community-24-filled"
    }
])

const handleLogout = () => {
    localStorage.removeItem('token')
    router.push('/')
}
</script>

<template>
    
    <!-- Dekstop -->
    <nav
        class="hidden md:flex flex-col justify-between fixed left-0 top-0 bottom-0 bg-linear-to-br from-[#1D4ED8] to-[#60A5FA] shadow-xl z-50 w-2/9 p-5 text-white">
        <div class="flex flex-col gap-10 w-full">
            <!-- Logo -->
            <div class="flex justify-center py-2">
                <img width="100" src="/logo.png" alt="Logo">
            </div>

            <!-- Menu List -->
            <div class="flex flex-col gap-2 w-full">
                <router-link v-if="route.path.startsWith('/admin')" v-for="list in adminList"
                    :class="route.path.startsWith(list.path) ? 'bg-white/20 text-white shadow-sm' : 'text-white/80 hover:bg-white/10 hover:text-white'"
                    class="flex items-center gap-3 w-full py-2.5 px-4 font-medium rounded-xl transition-all"
                    :to="list.path">
                    <Icon width="20" :icon="list.icon" />
                    <span>{{ list.name }}</span>
                </router-link>

                <router-link v-else v-for="list in listNav" :key="list.path"
                    :class="route.path.startsWith(list.path) ? 'bg-white/20 text-white shadow-sm' : 'text-white/80 hover:bg-white/10 hover:text-white'"
                    class="flex items-center gap-3 w-full py-2.5 px-4 font-medium rounded-xl transition-all"
                    :to="list.path">
                    <Icon width="20" :icon="list.icon" />
                    <span>{{ list.name }}</span>
                </router-link>
            </div>
        </div>

        <div class="flex flex-col bg-white/10 backdrop-blur-md rounded-2xl overflow-hidden border border-white/10 p-1">
            <button
                class="flex items-center gap-3 font-medium text-sm text-white/90 hover:bg-white/10 w-full p-2.5 rounded-xl transition">
                <Icon width="18" icon="ant-design:setting-filled" />
                <span>Setting</span>
            </button>
            <button @click="handleLogout()"
                class="flex items-center gap-3 font-medium text-sm text-red-200 hover:bg-red-500/20 w-full p-2.5 rounded-xl transition">
                <Icon width="18" icon="ci:exit" />
                <span>Keluar Akun</span>
            </button>
        </div>
    </nav>


    <!-- Mobile -->
    <nav>

    </nav>
</template>