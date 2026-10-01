<script setup>
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Icon } from '@iconify/vue';

const route = useRoute()
const router = useRouter()
const props = defineProps({
    isDarkMode: { type: Boolean, required: true }
})
const emit = defineEmits(['toggle-color-mode'])

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
    },
    {
        name: "My Ekskul",
        path: "/my-ekskul",
        icon: "akar-icons:folder"
    },
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
        class="sidebar-shell hidden md:flex flex-col justify-between fixed left-0 top-0 bottom-0 shadow-xl z-50 w-1/5 p-5">
        <div class="flex flex-col gap-10 w-full">
            <!-- Logo -->
            <div class="flex justify-center py-2">
                <img width="100" src="/logo.png" alt="Logo">
            </div>

            <!-- Menu List -->
            <div class="flex flex-col gap-2 w-full">
                <router-link v-if="route.path.startsWith('/admin')" v-for="list in adminList"
                    :class="route.path.startsWith(list.path)
                        ? (props.isDarkMode ? 'bg-[#E0234E]/15 text-white border-[#E0234E]/25 shadow-sm' : 'bg-rose-100/80 text-[#9F1239] border-rose-200 shadow-sm')
                        : (props.isDarkMode ? 'text-white/70 border-transparent hover:bg-white/5 hover:text-white' : 'text-slate-600 border-transparent hover:bg-rose-50 hover:text-[#9F1239]')"
                    class="flex items-center gap-3 w-full py-2.5 px-4 font-medium rounded-xl border transition-all"
                    :to="list.path">
                    <Icon width="20" :icon="list.icon" :class="route.path.startsWith(list.path) ? (props.isDarkMode ? 'text-[#FB7185]' : 'text-[#BE123C]') : ''" />
                    <span>{{ list.name }}</span>
                </router-link>

                <router-link v-else v-for="list in listNav" :key="list.path"
                    :class="route.path.startsWith(list.path)
                        ? (props.isDarkMode ? 'bg-[#E0234E]/15 text-white border-[#E0234E]/25 shadow-sm' : 'bg-rose-100/80 text-[#9F1239] border-rose-200 shadow-sm')
                        : (props.isDarkMode ? 'text-white/70 border-transparent hover:bg-white/5 hover:text-white' : 'text-slate-600 border-transparent hover:bg-rose-50 hover:text-[#9F1239]')"
                    class="flex items-center gap-3 w-full py-2.5 px-4 font-medium rounded-xl border transition-all"
                    :to="list.path">
                    <Icon width="20" :icon="list.icon" :class="route.path.startsWith(list.path) ? (props.isDarkMode ? 'text-[#FB7185]' : 'text-[#BE123C]') : ''" />
                    <span>{{ list.name }}</span>
                </router-link>
            </div>
        </div>

        <div :class="props.isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white/70 border-rose-200/70 shadow-sm'"
            class="flex flex-col backdrop-blur-md rounded-2xl overflow-hidden border p-1">
            <button
                @click="emit('toggle-color-mode')"
                role="switch"
                :aria-checked="props.isDarkMode"
                :aria-label="props.isDarkMode ? 'Aktifkan mode terang' : 'Aktifkan mode gelap'"
                :class="props.isDarkMode ? 'text-white/90 hover:bg-white/10' : 'text-slate-700 hover:bg-rose-100/80'"
                class="flex items-center gap-3 font-medium text-sm w-full p-2.5 rounded-xl transition">
                <Icon width="18" :icon="props.isDarkMode ? 'lucide:sun' : 'lucide:moon'" />
                <span class="flex-1 text-left">{{ props.isDarkMode ? 'Mode terang' : 'Mode gelap' }}</span>
                <span :class="props.isDarkMode ? 'bg-[#E0234E]/70' : 'bg-rose-200'" class="w-9 h-5 rounded-full p-0.5 flex items-center" aria-hidden="true">
                    <span :class="props.isDarkMode ? 'translate-x-4 bg-white' : 'translate-x-0 bg-white/80'"
                        class="w-4 h-4 rounded-full transition-transform"></span>
                </span>
            </button>
            <button @click="handleLogout()"
                :class="props.isDarkMode ? 'text-rose-300 hover:bg-rose-500/10' : 'text-[#9F1239] hover:bg-rose-100/80'"
                class="flex items-center gap-3 font-medium text-sm w-full p-2.5 rounded-xl transition">
                <Icon width="18" icon="ci:exit" />
                <span>Keluar Akun</span>
            </button>
        </div>
    </nav>


    <!-- Mobile -->
    <nav class="md:hidden fixed bottom-4 right-4 z-50">
        <button @click="emit('toggle-color-mode')" :aria-label="props.isDarkMode ? 'Aktifkan mode terang' : 'Aktifkan mode gelap'"
            :class="props.isDarkMode ? 'bg-[#171014] border-[#E0234E]/40 text-[#FB7185]' : 'bg-white border-rose-200 text-[#9F1239]'"
            class="w-12 h-12 rounded-full border shadow-lg shadow-rose-950/15 flex items-center justify-center">
            <Icon width="21" :icon="props.isDarkMode ? 'lucide:sun' : 'lucide:moon'" />
        </button>
    </nav>
</template>