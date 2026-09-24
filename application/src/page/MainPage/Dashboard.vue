<script setup>
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { api } from '../../api';
import { Icon } from '@iconify/vue';
import { formatDate } from '../../helper';

const router = useRouter()
const API_URL = import.meta.env.VITE_API_URL

const dashboardInformation = ref({
    name: '',
    ekskul: [],
    kegiatan: []
})

const message = ref('')
const errorCode = ref(null)
const isLoading = ref(true)

const getDashboard = async () => {
    isLoading.value = true
    message.value = ''
    errorCode.value = null

    try {
        const res = await api.get('/member/dashboard')
        dashboardInformation.value = res.data.data
    } catch (error) {
        const status = error.response?.status
        errorCode.value = status

        if (status === 401) {
            router.push('/login')
            return
        }

        if (status === 500) {
            message.value = 'Terjadi kesalahan pada server internal. Silakan coba beberapa saat lagi.'
        } else {
            message.value = error.response?.data?.message || 'Gagal memuat data dashboard. Periksa koneksi internet Anda.'
        }
    } finally {
        isLoading.value = false
    }
}

const handleRetry = () => {
    getDashboard()
}

const getEkskulById = (ekskulId) => {
    return dashboardInformation.value.ekskul?.find(e => e.id === ekskulId)
}

onMounted(() => {
    getDashboard()
})
</script>

<template>
    <div class="w-full min-h-screen bg-slate-100 flex justify-end relative">
        <main class="w-full lg:w-4/5 p-4 md:p-8 flex flex-col gap-6">

            <!-- State Loading: Skeleton Loader -->
            <template v-if="isLoading">
                <!-- Skeleton Header -->
                <div class="animate-pulse bg-slate-200 p-6 md:p-8 rounded-2xl flex flex-col gap-3 h-48 justify-between">
                    <div class="h-6 bg-slate-300 rounded-full w-48"></div>
                    <div class="space-y-2">
                        <div class="h-8 bg-slate-300 rounded-lg w-3/4"></div>
                        <div class="h-4 bg-slate-300 rounded-lg w-1/2"></div>
                    </div>
                </div>

                <!-- Skeleton Stats Grid -->
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div v-for="i in 2" :key="i"
                        class="animate-pulse bg-white rounded-xl p-5 shadow-sm border border-slate-200/60 flex items-center gap-4">
                        <div class="w-14 h-14 bg-slate-200 rounded-xl"></div>
                        <div class="flex-1 space-y-2">
                            <div class="h-3 bg-slate-200 rounded w-24"></div>
                            <div class="h-6 bg-slate-200 rounded w-12"></div>
                        </div>
                    </div>
                </div>

                <!-- Skeleton Main Grid Layout -->
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <!-- Skeleton Left Column: Kegiatan Terbaru -->
                    <div
                        class="animate-pulse lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-slate-200/60 flex flex-col gap-5">
                        <div class="flex items-center justify-between border-b border-slate-100 pb-4">
                            <div class="h-6 bg-slate-200 rounded w-40"></div>
                            <div class="h-4 bg-slate-200 rounded w-20"></div>
                        </div>

                        <!-- Skeleton Items Kegiatan -->
                        <div class="flex flex-col gap-4">
                            <div v-for="i in 3" :key="i" class="flex gap-4 items-center">
                                <div class="w-16 h-16 bg-slate-200 rounded-xl shrink-0"></div>
                                <div class="flex-1 space-y-2">
                                    <div class="h-4 bg-slate-200 rounded w-1/3"></div>
                                    <div class="h-5 bg-slate-200 rounded w-2/3"></div>
                                    <div class="h-3 bg-slate-200 rounded w-1/2"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Skeleton Right Column: Ekskul Saya -->
                    <div
                        class="animate-pulse bg-white rounded-2xl p-6 shadow-sm border border-slate-200/60 flex flex-col gap-5">
                        <div class="h-6 bg-slate-200 rounded w-32 border-b border-slate-100 pb-4"></div>
                        <div class="flex flex-col gap-3">
                            <div v-for="i in 2" :key="i" class="h-28 bg-slate-200 rounded-xl w-full"></div>
                        </div>
                    </div>
                </div>
            </template>

            <!-- Main Content -->
            <template v-else-if="!message">
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

                        <div v-if="!dashboardInformation.ekskul?.length" class="text-center py-8 text-slate-400">
                            <Icon icon="lucide:folder-open" width="40" class="mx-auto mb-2 opacity-50" />
                            <p class="text-sm">Kamu belum bergabung di ekskul manapun.</p>
                        </div>

                        <div v-else class="flex flex-col gap-3">
                            <div v-for="ekskul in dashboardInformation.ekskul" :key="ekskul.id"
                                class="relative rounded-xl overflow-hidden h-28 group border border-slate-200/60">
                                <img :src="`${API_URL}${ekskul.banner}`" :alt="ekskul.name"
                                    class="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                <div
                                    class="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/40 to-transparent">
                                </div>

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

        <!-- Modal Error Dialog -->
        <Transition enter-active-class="transition duration-200 ease-out" enter-from-class="opacity-0 scale-95"
            enter-to-class="opacity-100 scale-100" leave-active-class="transition duration-150 ease-in"
            leave-from-class="opacity-100 scale-100" leave-to-class="opacity-0 scale-95">
            <div v-if="message"
                class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                <div
                    class="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-100 flex flex-col items-center text-center gap-4">
                    <div
                        class="w-14 h-14 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                        <Icon icon="lucide:alert-triangle" width="30" />
                    </div>

                    <div class="flex flex-col gap-1">
                        <h3 class="text-lg font-bold text-slate-800">
                            {{ errorCode === 500 ? 'Kesalahan Server' : 'Gagal Memuat Data' }}
                        </h3>
                        <p class="text-sm text-slate-600">
                            {{ message }}
                        </p>
                    </div>

                    <div class="w-full flex gap-3 mt-2">
                        <button @click="handleRetry"
                            class="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2 text-sm shadow-sm">
                            <Icon icon="lucide:refresh-cw" width="16" />
                            Coba Lagi
                        </button>
                    </div>
                </div>
            </div>
        </Transition>
    </div>
</template>