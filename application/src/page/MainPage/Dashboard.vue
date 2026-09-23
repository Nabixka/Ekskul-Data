<script setup>
import { onMounted, ref } from 'vue';
import { api } from '../../api';
import { Icon } from '@iconify/vue';
import { formatDate } from '../../helper';

const API_URL = import.meta.env.VITE_API_URL

const dashboardInformation = ref({
    name: '',
    ekskul: [],
    kegiatan: []
})

const message = ref('')
const isLoading = ref(true)

const getDashboard = async () => {
    isLoading.value = true
    try {
        const res = await api.get('/user/member/dashboard')
        dashboardInformation.value = res.data.data
    } catch (error) {
        message.value = error.response?.data?.message || 'Terjadi kesalahan pada server.'
    } finally {
        isLoading.value = false
    }
}

const getEkskulById = (ekskulId) => {
    return dashboardInformation.value.ekskul?.find(e => e.id === ekskulId)
}

onMounted(() => {
    getDashboard()
})
</script>

<template>
    <div class="w-full min-h-screen bg-slate-100 flex justify-end">
        <main class="w-full lg:w-4/5 p-4 md:p-8 flex flex-col gap-6">

            <!-- State Loading -->
            <div v-if="isLoading" class="flex items-center justify-center min-h-[400px]">
                <div class="flex items-center gap-3 text-slate-500 font-medium">
                    <Icon icon="line-md:loading-loop" width="32" class="text-blue-600" />
                    <span>Memuat data dashboard...</span>
                </div>
            </div>

            <!-- State Error -->
            <div v-else-if="message"
                class="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-center gap-3">
                <Icon icon="lucide:alert-circle" width="24" />
                <p>{{ message }}</p>
            </div>

            <!-- Main Content -->
            <template v-else>
                <!-- Header Section -->
                <header
                    class="bg-gradient-to-b from-[#1D4ED8] to-[#60A5FA] p-6 md:p-8 rounded-2xl shadow-sm text-white flex flex-col gap-3">
                    <span
                        class="inline-flex items-center gap-2 text-xs font-semibold bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-full w-fit">
                        <Icon icon="lucide:user" width="14" />
                        Selamat Datang, <strong>{{ dashboardInformation.name }}</strong>
                    </span>
                    <h1 class="font-bold text-2xl md:text-3xl tracking-tight leading-tight">
                        Jelajahi Potensi & Minatmu Bersama Kami
                    </h1>
                    <p class="text-white/80 text-sm max-w-2xl">
                        Pantau jadwal kegiatan mendatang dan kelola ekstrakurikuler yang kamu ikuti dalam satu tempat.
                    </p>
                </header>

                <!-- Stats Grid -->
                <section class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div class="bg-white rounded-xl p-5 shadow-sm border border-slate-200/60 flex items-center gap-4">
                        <div class="p-3 bg-blue-50 text-blue-600 rounded-xl">
                            <Icon icon="lucide:award" width="28" />
                        </div>
                        <div>
                            <p class="text-xs font-medium text-slate-500 uppercase tracking-wider">Ekskul Diikuti</p>
                            <h2 class="text-2xl font-bold text-slate-800">{{ dashboardInformation.ekskul?.length || 0 }}
                            </h2>
                        </div>
                    </div>

                    <div class="bg-white rounded-xl p-5 shadow-sm border border-slate-200/60 flex items-center gap-4">
                        <div class="p-3 bg-amber-50 text-amber-600 rounded-xl">
                            <Icon icon="lucide:calendar" width="28" />
                        </div>
                        <div>
                            <p class="text-xs font-medium text-slate-500 uppercase tracking-wider">Agenda Kegiatan</p>
                            <h2 class="text-2xl font-bold text-slate-800">{{ dashboardInformation.kegiatan?.length || 0
                                }}</h2>
                        </div>
                    </div>
                </section>

                <!-- Main Grid Layout -->
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    <!-- Left Column: Kegiatan Terbaru -->
                    <section
                        class="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-slate-200/60 flex flex-col gap-5">
                        <div class="flex items-center justify-between border-b border-slate-100 pb-4">
                            <h3 class="font-bold text-lg text-slate-800 flex items-center gap-2">
                                <Icon icon="lucide:sparkles" class="text-blue-600" />
                                Kegiatan Terbaru
                            </h3>
                            <button
                                class="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors">
                                Lihat Semua
                                <Icon icon="lucide:arrow-right" width="14" />
                            </button>
                        </div>

                        <!-- Empty State Kegiatan -->
                        <div v-if="!dashboardInformation.kegiatan?.length" class="text-center py-8 text-slate-400">
                            <Icon icon="lucide:calendar-x" width="40" class="mx-auto mb-2 opacity-50" />
                            <p class="text-sm">Belum ada agenda kegiatan mendatang.</p>
                        </div>

                        <!-- List Kegiatan -->
                        <div v-else class="flex flex-col divide-y divide-slate-100">
                            <div v-for="kegiatan in dashboardInformation.kegiatan" :key="kegiatan.id"
                                class="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row gap-4 justify-between sm:items-center hover:bg-slate-50/50 p-2 rounded-xl transition-colors">
                                <div class="flex gap-4 items-start sm:items-center">
                                    <!-- Thumbnail Gambar dari Ekskul -->
                                    <div
                                        class="w-16 h-16 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200/60 relative">
                                        <img v-if="getEkskulById(kegiatan.ekskul_id)?.banner"
                                            :src="`${API_URL}${getEkskulById(kegiatan.ekskul_id).banner}`"
                                            :alt="kegiatan.title" class="w-full h-full object-cover" />
                                        <div v-else
                                            class="w-full h-full flex items-center justify-center text-slate-400">
                                            <Icon icon="lucide:image" width="20" />
                                        </div>
                                    </div>

                                    <div class="flex flex-col gap-1">
                                        <span
                                            class="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md w-fit">
                                            {{ formatDate(kegiatan.waktu) }}
                                        </span>
                                        <h4 class="font-semibold text-slate-800 text-base leading-snug">
                                            {{ kegiatan.title }}
                                        </h4>
                                        <p class="text-xs text-slate-500 line-clamp-1">
                                            {{ kegiatan.description }}
                                        </p>
                                        <span class="flex items-center gap-1 text-xs text-slate-500 mt-1">
                                            <Icon icon="lucide:map-pin" class="text-slate-400 shrink-0" width="14" />
                                            {{ kegiatan.location }}
                                        </span>
                                    </div>
                                </div>

                                <div class="shrink-0 self-start sm:self-center">
                                    <span
                                        class="text-xs text-blue-600 bg-blue-100 font-medium px-3 py-1 rounded-full border border-slate-200">
                                        {{ getEkskulById(kegiatan.ekskul_id)?.name || 'Kegiatan' }}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </section>

                    <!-- Right Column: Ekskul Saya -->
                    <aside
                        class="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/60 flex flex-col gap-5 h-fit">
                        <h3
                            class="font-bold text-lg text-slate-800 border-b border-slate-100 pb-4 flex items-center gap-2">
                            <Icon icon="lucide:users" class="text-blue-600" />
                            Ekskul Saya
                        </h3>

                        <!-- Empty State Ekskul -->
                        <div v-if="!dashboardInformation.ekskul?.length" class="text-center py-8 text-slate-400">
                            <Icon icon="lucide:folder-open" width="40" class="mx-auto mb-2 opacity-50" />
                            <p class="text-sm">Kamu belum bergabung di ekskul manapun.</p>
                        </div>

                        <!-- List Ekskul Card -->
                        <div v-else class="flex flex-col gap-3">
                            <div v-for="ekskul in dashboardInformation.ekskul" :key="ekskul.id"
                                class="relative rounded-xl overflow-hidden h-28 group border border-slate-200/60">
                                <!-- Background Image -->
                                <img :src="`${API_URL}${ekskul.banner}`" :alt="ekskul.name"
                                    class="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                <!-- Gradient Overlay -->
                                <div
                                    class="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/40 to-transparent">
                                </div>

                                <!-- Content Overlay -->
                                <div class="relative z-10 p-3.5 h-full flex flex-col justify-between text-white">
                                    <div class="flex justify-between items-start gap-2">
                                        <span
                                            class="text-[10px] font-semibold bg-white/20 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/10 uppercase tracking-wider">
                                            {{ ekskul.bidang }}
                                        </span>
                                        <span
                                            class="text-xs bg-blue-600/90 font-medium px-2 py-0.5 rounded-md shadow-sm">
                                            {{ ekskul.role }}
                                        </span>
                                    </div>
                                    <h4 class="font-bold text-base tracking-wide text-white drop-shadow-sm">
                                        {{ ekskul.name }}
                                    </h4>
                                </div>
                            </div>
                        </div>
                    </aside>

                </div>
            </template>

        </main>
    </div>
</template>