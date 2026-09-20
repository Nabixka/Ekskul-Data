<script setup>

import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Icon } from '@iconify/vue'

const route = useRoute()
const router = useRouter()

const listNav = ref([
    {
        name: "Dashboard",
        path: "/dashboard"
    },
    {
        name: "List Ekskul",
        path: "/list-ekskul"
    }
])

const handleLogout = () => {
    localStorage.removeItem('token')
    router.push('/')
}

</script>

<template>
    <nav class="fixed left-0 top-0 bottom-0 bg-linear-to-br shadow-2xl shadow-[#60A5FA] from-[#1D4ED8] to-[#60A5FA] min-h-screen w-2/9 p-5">
        <div class="flex flex-col justify-between h-full items-center">
            <div class="flex flex-col gap-10 w-full">
                <div class="flex justify-center">
                    <img width="115" src="/logo.png">
                </div>

                <div class="flex flex-col gap-3 w-full">
                    <router-link 
                        v-for="list in listNav" 
                        :class="route.path.startsWith(list.path) ? 'bg-sky-500 w-full' : '' "
                        class="w-full py-2 font-semibold rounded-lg p-2 text-white"
                        :to="list.path">
                        {{ list.name }}
                    </router-link>
                </div>
            </div>

            <div class="flex items-start bg-gray-100/70 rounded-lg flex-col w-full overflow-hidden">
                <button class="flex items-center gap-1 font-semibold text-xl hover:bg-gray-200 w-full p-2"><Icon width="25" icon="ant-design:setting-filled"/>Setting</button>
                <button @click="handleLogout()" class="flex items-center gap-1 font-semibold text-red-700 text-xl hover:bg-gray-200 w-full p-2"><Icon width="25" icon="ci:exit"/>Keluar Akun</button>
            </div>
        </div>
    </nav>
</template>