<script setup>
import { ref, onMounted, computed } from 'vue';
import { api } from '../../api';
import { Icon } from '@iconify/vue';
import { useRouter } from 'vue-router';

const API_URL = import.meta.env.VITE_API_URL
const router = useRouter()

const listEkskul = ref([])
const searchEkskul = ref('')
const isLoading = ref(true)
const message = ref('')

const getEkskul = async () => {
    isLoading.value = true
    try {
        const res = await api.get('/ekskul')
        listEkskul.value = res.data.data
    }
    catch (error) {
        message.value = error.response?.data?.message || 'Terjadi Kesalahan Pada Server'
    }
    finally {
        isLoading.value = false
    }
}

const filteredEkskul = computed(() => {
    if (!searchEkskul.value) return listEkskul.value
    return listEkskul.value.filter(item =>
        item.name.toLowerCase().includes(searchEkskul.value.trim().toLowerCase())
    )
})

onMounted(() => {
    getEkskul()
})
</script>

<template>
    <div class="w-full flex justify-end min-h-screen bg-slate-50">
        <div class="lg:w-4/5 bg-slate-100 p-8 flex flex-col gap-6">

            <!-- Header Section -->
            <header
                class="bg-linear-to-br from-[#1D4ED8] to-[#60A5FA] p-6 rounded-2xl shadow-md text-white flex flex-col gap-1">
                <span class="text-white/80 text-sm font-medium">Halo,</span>
                <h1 class="font-bold text-2xl tracking-tight">Selamat Datang di List Ekskul</h1>
                <p class="text-white/90 text-sm mt-1">
                    Cari ekstrakurikuler yang ada dan temukan ekskul yang Anda minati untuk bergabung.
                </p>
            </header>

            <main class="flex flex-col gap-5">
                <!-- Title & Filter Container -->
                <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h3 class="text-2xl font-bold text-slate-800">Daftar Ekskul</h3>
                        <p class="text-sm text-slate-500">Pilih ekskul yang ingin Anda ketahui lebih dalam</p>
                    </div>

                    <!-- Filter Input -->
                    <div class="relative w-full md:w-1/3">
                        <span
                            class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                            <Icon icon="lucide:search" class="w-4 h-4" />
                        </span>
                        <input v-model="searchEkskul"
                            class="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition shadow-sm"
                            type="text" placeholder="Cari nama ekskul...">
                    </div>
                </div>

                <!-- Loading State -->
                <div v-if="isLoading" class="flex justify-center items-center py-20">
                    <p class="text-slate-500 text-sm animate-pulse">Memuat data ekstrakurikuler...</p>
                </div>

                <!-- Error Message -->
                <div v-else-if="message" class="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl text-sm">
                    {{ message }}
                </div>

                <!-- Empty State -->
                <div v-else-if="filteredEkskul.length === 0"
                    class="flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-slate-200 shadow-sm gap-2">
                    <Icon icon="lucide:folder-search" class="w-10 h-10 text-slate-400" />
                    <p class="text-slate-600 font-medium">Ekskul tidak ditemukan</p>
                    <p class="text-slate-400 text-xs">Coba cari dengan kata kunci yang lain.</p>
                </div>

                <!-- Content Grid -->
                <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    <button @click="router.push(`/ekskul/${list.id}`)" v-for="list in filteredEkskul" :key="list.id"
                        class="group bg-white rounded-2xl overflow-hidden border border-slate-200/80 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col cursor-pointer">
                        <!-- Card Banner with Zoom Effect -->
                        <div class="w-full h-44 overflow-hidden relative bg-slate-100">
                            <img class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                :src="`${API_URL}${list.banner}`" :alt="list.name">
                        </div>

                        <!-- Card Detail -->
                        <div class="p-4 flex justify-between items-center mt-auto">
                            <!-- Left -->
                            <div class="flex flex-col gap-1.5">
                                <h4
                                    class="font-semibold text-slate-800 text-base group-hover:text-blue-600 transition-colors">
                                    {{ list.name }}
                                </h4>
                                <span
                                    class="bg-blue-50 text-blue-600 border border-blue-100 w-fit px-2.5 py-0.5 text-xs font-medium rounded-full">
                                    {{ list.bidang }}
                                </span>
                            </div>

                            <!-- Right -->
                            <div
                                class="bg-blue-500 group-hover:bg-blue-600 rounded-full p-2 text-white shadow-sm transition-transform group-hover:translate-x-1 duration-200 flex items-center justify-center">
                                <Icon class="w-4 h-4" icon="grommet-icons:form-next" />
                            </div>
                        </div>
                    </button>
                </div>
            </main>
        </div>
    </div>
</template>