<script setup>
import { onMounted, ref, computed } from 'vue';
import { api } from '../../api';
import { Icon } from '@iconify/vue';

const API_URL = import.meta.env.VITE_API_URL

const ekskulList = ref([])
const message = ref('')
const isLoading = ref(true)

const getMyEkskul = async () => {
    isLoading.value = true
    try {
        const res = await api.get('/user/member/ekskul')
        ekskulList.value = res.data.data || []
    } catch (error) {
        message.value = error.response?.data?.message || 'Terjadi kesalahan saat mengambil data ekskul.'
    } finally {
        isLoading.value = false
    }
}

onMounted(() => {
    getMyEkskul()
})
</script>

<template>
    <div class="w-full flex justify-end min-h-screen bg-slate-50">
        <div class="w-full lg:w-4/5 bg-slate-100 p-4 md:p-8 flex flex-col gap-6">

            <!-- Header Section -->
            <header
                class="bg-gradient-to-b from-[#1D4ED8] to-[#60A5FA] p-6 md:p-8 rounded-2xl shadow-md text-white flex flex-col gap-3">
                <span
                    class="inline-flex items-center gap-2 text-xs font-semibold bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-full w-fit">
                    <Icon icon="lucide:award" width="14" />
                    Ekstrakurikuler Saya
                </span>
                <h1 class="font-bold text-2xl md:text-3xl tracking-tight leading-tight">
                    Ekskul Yang Kamu Ikuti
                </h1>
                <p class="text-white/90 text-sm max-w-2xl">
                    Kelola dan pantau seluruh kegiatan ekstrakurikuler serta peran aktifmu di lingkungan sekolah.
                </p>
            </header>

            <!-- State Loading -->
            <div v-if="isLoading" class="flex items-center justify-center min-h-[300px]">
                <div class="flex items-center gap-3 text-slate-500 font-medium">
                    <Icon icon="line-md:loading-loop" width="32" class="text-[#1D4ED8]" />
                    <span>Memuat ekstrakurikuler kamu...</span>
                </div>
            </div>

            <!-- State Error -->
            <div v-else-if="message"
                class="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-center gap-3">
                <Icon icon="lucide:alert-circle" width="24" />
                <p>{{ message }}</p>
            </div>

            <!-- State Kosong (Belum mengikuti ekskul) -->
            <div v-else-if="!ekskulList.length"
                class="bg-white rounded-2xl p-12 text-center shadow-sm border border-slate-200/60 flex flex-col items-center gap-3">
                <div class="p-4 bg-blue-50 text-[#1D4ED8] rounded-full">
                    <Icon icon="lucide:folder-open" width="40" />
                </div>
                <h3 class="font-bold text-slate-800 text-lg">Belum Mengikuti Ekskul</h3>
                <p class="text-slate-500 text-sm max-w-md">
                    Kamu belum terdaftar di ekstrakurikuler manapun. Silakan jelajahi daftar ekskul yang tersedia dan
                    ajukan pendaftaran.
                </p>
            </div>

            <!-- Grid List Ekskul -->
            <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div v-for="item in ekskulList" :key="item.id"
                    class="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-200/60 flex flex-col hover:shadow-md transition-shadow duration-200">
                    <!-- Banner Head -->
                    <div class="relative h-44 bg-slate-200 overflow-hidden">
                        <img :src="`${API_URL}${item.banner}`" :alt="item.name" class="w-full h-full object-cover" />
                        <div
                            class="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent">
                        </div>

                        <div class="absolute bottom-4 left-4 right-4 flex items-end justify-between">
                            <h2 class="text-xl font-bold text-white drop-shadow-sm">
                                {{ item.name }}
                            </h2>
                        </div>
                    </div>

                    <!-- Body Content -->
                    <div class="p-5 flex flex-col justify-between flex-1 gap-4">
                        <div>
                            <p class="text-slate-600 text-sm line-clamp-3 leading-relaxed">
                                {{ item.about }}
                            </p>
                        </div>

                        <!-- List Peran/Role -->
                        <div class="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                            <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                Peran Kamu:
                            </span>
                            <div class="flex flex-wrap gap-1.5 justify-end">
                                <span v-for="(role, idx) in item.roles" :key="idx"
                                    class="text-xs font-medium px-2.5 py-1 rounded-full bg-[#1D4ED8]/10 text-[#1D4ED8] border border-[#1D4ED8]/20">
                                    {{ role }}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    </div>
</template>