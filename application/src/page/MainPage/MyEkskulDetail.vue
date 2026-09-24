<script setup>
import { onMounted, ref } from 'vue';
import { Icon } from '@iconify/vue';
import { api } from '../../api';
import { useRoute, useRouter } from 'vue-router';
import { formatDate } from '../../helper';

const API_URL = import.meta.env.VITE_API_URL
const route = useRoute()
const router = useRouter()
const id = route.params.id

const ekskulDetail = ref({})
const listAnggota = ref([])
const kegiatanDetail = ref([])
const dokumentasiDetail = ref([])
const kasDetail = ref([])

const currentSection = ref('About')
const message = ref('')
const errorCode = ref(null)
const isLoading = ref(false)

const listSection = ref([
    { name: 'About', icon: 'lucide:info' },
    { name: 'Anggota', icon: 'lucide:users' },
    { name: 'Kegiatan', icon: 'lucide:calendar-range' },
    { name: 'Dokumentasi', icon: 'lucide:image' },
    { name: 'Kas', icon: 'lucide:wallet' }
])

const formatRupiah = (number) => {
    if (number === undefined || number === null) return 'Rp 0'
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(number)
}


const clearError = () => {
    message.value = ''
    errorCode.value = null
}

const getDetail = async () => {
    isLoading.value = true
    clearError()
    try {
        const res = await api.get(`/member/ekskul/${id}`)
        ekskulDetail.value = res.data.data || {}
    } catch (error) {
        errorCode.value = error.response?.status || 500
        message.value = error.response?.data?.message || "Gagal memuat detail ekstrakurikuler."
    } finally {
        isLoading.value = false
    }
}

const getAnggota = async () => {
    if (listAnggota.value.length > 0) return
    isLoading.value = true
    clearError()
    try {
        const res = await api.get(`/ekskul/${id}/member`)
        listAnggota.value = res.data.data || []
    } catch (error) {
        errorCode.value = error.response?.status || 500
        message.value = error.response?.data?.message || "Gagal memuat daftar anggota."
    } finally {
        isLoading.value = false
    }
}

const getKegiatan = async () => {
    if (kegiatanDetail.value.length > 0) return
    isLoading.value = true
    clearError()
    try {
        const res = await api.get(`/kegiatan/ekskul/${id}`)
        kegiatanDetail.value = res.data.data || []
    } catch (error) {
        errorCode.value = error.response?.status || 500
        message.value = error.response?.data?.message || "Gagal memuat agenda kegiatan."
    } finally {
        isLoading.value = false
    }
}

const getDokumentasi = async () => {
    if (dokumentasiDetail.value.length > 0) return
    isLoading.value = true
    clearError()
    try {
        const res = await api.get(`/dokumentasi/ekskul/${id}`)
        dokumentasiDetail.value = res.data.data || []
    } catch (error) {
        errorCode.value = error.response?.status || 500
        message.value = error.response?.data?.message || "Gagal memuat dokumentasi."
    } finally {
        isLoading.value = false
    }
}

const getKas = async () => {
    if (kasDetail.value.length > 0) return
    isLoading.value = true
    clearError()
    try {
        const res = await api.get(`/kas/ekskul/${id}`)
        kasDetail.value = res.data.data || []
    } catch (error) {
        errorCode.value = error.response?.status || 500
        message.value = error.response?.data?.message || "Gagal memuat data kas."
    } finally {
        isLoading.value = false
    }
}

const handleChangeSection = (sectionName) => {
    currentSection.value = sectionName
    if (sectionName === "Anggota") getAnggota()
    if (sectionName === "Kegiatan") getKegiatan()
    if (sectionName === "Dokumentasi") getDokumentasi()
    if (sectionName === "Kas") getKas()
}

const handleRetry = () => {
    if (currentSection.value === "About") getDetail()
    else if (currentSection.value === "Anggota") getAnggota()
    else if (currentSection.value === "Kegiatan") getKegiatan()
    else if (currentSection.value === "Dokumentasi") getDokumentasi()
    else if (currentSection.value === "Kas") getKas()
}

onMounted(() => {
    getDetail()
})
</script>

<template>
    <div class="w-full flex justify-end min-h-screen bg-slate-50 relative">
        <div class="w-full lg:w-4/5 bg-slate-100 p-4 md:p-8 flex flex-col gap-6">

            <!-- Header Section -->
            <header :style="ekskulDetail.banner ? { backgroundImage: `url(${API_URL}${ekskulDetail.banner})` } : {}"
                class="bg-cover bg-center rounded-2xl shadow-md text-white relative overflow-hidden h-52 bg-gradient-to-r from-blue-700 to-indigo-800">

                <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20"></div>

                <button @click="router.back()"
                    class="absolute top-4 left-4 z-10 p-2 bg-black/40 hover:bg-black/60 backdrop-blur-md rounded-xl text-white transition-all">
                    <Icon icon="lucide:arrow-left" width="20" />
                </button>

                <div class="absolute bottom-5 left-5 right-5 z-10 flex flex-col gap-1.5">
                    <h1 class="font-bold text-2xl md:text-3xl tracking-tight leading-tight">
                        {{ ekskulDetail.name || 'Memuat...' }}
                    </h1>
                    <div class="flex flex-wrap gap-2 items-center text-xs md:text-sm text-slate-200">
                        <span
                            class="bg-white/20 backdrop-blur-md px-2.5 py-0.5 rounded-md font-medium border border-white/20">
                            {{ ekskulDetail.bidang || 'Umum' }}
                        </span>
                        <span>•</span>
                        <span>Peran Kamu: <strong class="text-white font-semibold">{{ ekskulDetail.role || 'Anggota'
                                }}</strong></span>
                    </div>
                </div>
            </header>

            <!-- Stat Overview Cards -->
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div class="bg-white p-4 rounded-xl shadow-sm border border-slate-200/60 flex items-center gap-4">
                    <div class="p-3 bg-blue-50 text-[#1D4ED8] rounded-xl">
                        <Icon icon="lucide:users" width="24" />
                    </div>
                    <div>
                        <p class="text-xs text-slate-500 font-medium">Total Anggota</p>
                        <p class="text-xl font-bold text-slate-800">{{ ekskulDetail.member ?? 0 }} Orang</p>
                    </div>
                </div>

                <div class="bg-white p-4 rounded-xl shadow-sm border border-slate-200/60 flex items-center gap-4">
                    <div class="p-3 bg-blue-50 text-[#1D4ED8] rounded-xl">
                        <Icon icon="lucide:calendar" width="24" />
                    </div>
                    <div>
                        <p class="text-xs text-slate-500 font-medium">Total Kegiatan</p>
                        <p class="text-xl font-bold text-slate-800">{{ ekskulDetail.kegiatan ?? 0 }} Agenda</p>
                    </div>
                </div>

                <div class="bg-white p-4 rounded-xl shadow-sm border border-slate-200/60 flex items-center gap-4">
                    <div class="p-3 bg-blue-50 text-[#1D4ED8] rounded-xl">
                        <Icon icon="lucide:wallet" width="24" />
                    </div>
                    <div>
                        <p class="text-xs text-slate-500 font-medium">Saldo Kas</p>
                        <p class="text-xl font-bold text-slate-800">{{ formatRupiah(ekskulDetail.kas) }}</p>
                    </div>
                </div>
            </div>

            <!-- Navigation Tabs -->
            <div
                class="bg-white rounded-xl p-1.5 shadow-sm border border-slate-200/60 flex items-center gap-1 overflow-x-auto">
                <button v-for="section in listSection" :key="section.name" @click="handleChangeSection(section.name)"
                    :class="[
                        'px-4 py-2 text-sm font-semibold rounded-lg flex items-center gap-2 transition-colors whitespace-nowrap',
                        currentSection === section.name ? 'bg-[#1D4ED8] text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
                    ]">
                    <Icon :icon="section.icon" width="16" />
                    {{ section.name }}
                </button>
            </div>

            <!-- Tab Content Area -->
            <main
                class="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/60 min-h-[320px] relative tab-content-area">

                <!-- Indicator Loading -->
                <div v-if="isLoading"
                    class="absolute inset-0 bg-white/70 backdrop-blur-[1px] rounded-2xl flex items-center justify-center z-10">
                    <div class="flex items-center gap-2 text-[#1D4ED8] font-medium text-sm">
                        <Icon icon="lucide:loader-2" class="animate-spin" width="20" />
                        Memuat data...
                    </div>
                </div>

                <!-- TAB: ABOUT -->
                <div v-if="currentSection === 'About'" class="flex flex-col gap-4">
                    <h3 class="text-lg font-bold text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-2">
                        <Icon icon="lucide:info" class="text-[#1D4ED8]" />
                        Tentang {{ ekskulDetail.name }}
                    </h3>
                    <p class="text-slate-600 text-sm leading-relaxed whitespace-pre-line">
                        {{ ekskulDetail.about || 'Belum ada deskripsi untuk ekstrakurikuler ini.' }}
                    </p>
                </div>

                <!-- TAB: ANGGOTA -->
                <div v-else-if="currentSection === 'Anggota'" class="flex flex-col gap-4">
                    <h3 class="text-lg font-bold text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-2">
                        <Icon icon="lucide:users" class="text-[#1D4ED8]" />
                        Daftar Pengurus & Anggota
                    </h3>

                    <div v-if="listAnggota.length === 0 && !isLoading"
                        class="text-center py-8 text-slate-400 text-sm anggota-kosong">
                        Belum ada data anggota.
                    </div>

                    <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 grid-anggota">
                        <div v-for="member in listAnggota" :key="member.id || member.nis"
                            class="flex items-center gap-3 p-3.5 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors">
                            <div
                                class="w-10 h-10 rounded-full bg-blue-100 text-[#1D4ED8] flex items-center justify-center font-bold text-sm shrink-0">
                                {{ member.member_name ? member.member_name.charAt(0).toUpperCase() : 'A' }}
                            </div>
                            <div class="overflow-hidden">
                                <h4 class="font-semibold text-slate-800 text-sm truncate">{{ member.member_name }}</h4>
                                <p class="text-xs text-slate-400">NIS: {{ member.nis }}</p>
                                <span
                                    class="inline-block mt-1 text-[10px] px-2 py-0.5 rounded-md bg-[#1D4ED8]/10 text-[#1D4ED8] font-semibold">
                                    {{ member.role }}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- TAB: KEGIATAN -->
                <div v-else-if="currentSection === 'Kegiatan'" class="flex flex-col gap-4">
                    <h3 class="text-lg font-bold text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-2">
                        <Icon icon="lucide:calendar-range" class="text-[#1D4ED8]" />
                        Agenda Kegiatan
                    </h3>

                    <div v-if="kegiatanDetail.length === 0 && !isLoading"
                        class="text-center py-8 text-slate-400 text-sm kegiatan-kosong">
                        Belum ada kegiatan terdaftar.
                    </div>

                    <div v-else class="flex flex-col divide-y divide-slate-100 list-kegiatan">
                        <div v-for="item in kegiatanDetail" :key="item.id"
                            class="py-4 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                            <div class="flex flex-col gap-1">
                                <h4 class="font-semibold text-slate-800 text-sm md:text-base">{{ item.title }}</h4>
                                <p class="text-xs text-slate-500 leading-relaxed max-w-xl">{{ item.description }}</p>
                                <div class="flex flex-wrap items-center gap-4 text-xs text-slate-400 mt-1">
                                    <span class="flex items-center gap-1.5">
                                        <Icon icon="lucide:clock" width="14" class="text-slate-500" />
                                        {{ formatDate(item.waktu) }}
                                    </span>
                                    <span class="flex items-center gap-1.5">
                                        <Icon icon="lucide:map-pin" width="14" class="text-slate-500" />
                                        {{ item.location }}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- TAB: DOKUMENTASI -->
                <div v-else-if="currentSection === 'Dokumentasi'" class="flex flex-col gap-4">
                    <h3 class="text-lg font-bold text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-2">
                        <Icon icon="lucide:image" class="text-[#1D4ED8]" />
                        Galeri Dokumentasi Kegiatan
                    </h3>

                    <div v-if="dokumentasiDetail.length === 0 && !isLoading"
                        class="text-center py-8 text-slate-400 text-sm dokumentasi-kosong">
                        Belum ada dokumentasi diunggah.
                    </div>

                    <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 grid-dokumentasi">
                        <div v-for="doc in dokumentasiDetail" :key="doc.id"
                            class="group relative rounded-xl overflow-hidden border border-slate-200/60 bg-slate-900 h-48 shadow-sm relative">
                            <img :src="`${API_URL}${doc.path}`" :alt="doc.title"
                                class="w-full h-full object-cover group-hover:scale-105 opacity-90 group-hover:opacity-100 transition-all duration-300" />
                            <div
                                class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-3.5 text-white">
                                <h4 class="font-semibold text-sm leading-snug line-clamp-2">{{ doc.title }}</h4>
                                <p class="text-[11px] text-slate-300 mt-1 flex items-center gap-1">
                                    <Icon icon="lucide:calendar" width="12" />
                                    {{ formatDate(doc.waktu) }}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- TAB: KAS -->
                <div v-else-if="currentSection === 'Kas'" class="flex flex-col gap-4">
                    <div class="flex items-center justify-between border-b border-slate-100 pb-3">
                        <h3 class="text-lg font-bold text-slate-800 flex items-center gap-2">
                            <Icon icon="lucide:wallet" class="text-[#1D4ED8]" />
                            Laporan Transaksi Kas
                        </h3>
                        <span class="text-sm font-medium text-slate-600 saldo-kas">
                            Saldo Saat Ini: <strong class="text-[#1D4ED8] font-bold">{{ formatRupiah(ekskulDetail.kas)
                                }}</strong>
                        </span>
                    </div>

                    <div v-if="kasDetail.length === 0 && !isLoading"
                        class="text-center py-8 text-slate-400 text-sm kas-kosong">
                        Belum ada riwayat transaksi kas.
                    </div>

                    <div v-else class="flex flex-col divide-y divide-slate-100 list-kas">
                        <div v-for="transaksi in kasDetail" :key="transaksi.id"
                            class="py-3 flex items-center justify-between item-kas">
                            <div class="flex items-center gap-3">
                                <div :class="[
                                    'p-2 rounded-lg',
                                    transaksi.type === 'masuk' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
                                ]">
                                    <Icon
                                        :icon="transaksi.type === 'masuk' ? 'lucide:arrow-down-left' : 'lucide:arrow-up-right'"
                                        width="18" />
                                </div>
                                <div>
                                    <h4 class="font-semibold text-slate-800 text-sm">{{ transaksi.title }}</h4>
                                    <p class="text-xs text-slate-400">{{ formatDate(transaksi.waktu) }}</p>
                                </div>
                            </div>
                            <span :class="[
                                'font-bold text-sm jumlah-transaksi',
                                transaksi.type === 'masuk' ? 'text-emerald-600' : 'text-red-600'
                            ]">
                                {{ transaksi.type === 'masuk' ? '+' : '-' }} {{ formatRupiah(transaksi.amount) }}
                            </span>
                        </div>
                    </div>
                </div>

            </main>

        </div>

        <!-- Modal Error Dialog -->
        <Transition enter-active-class="transition duration-200 ease-out" enter-from-class="opacity-0 scale-95"
            enter-to-class="opacity-100 scale-100" leave-active-class="transition duration-150 ease-in"
            leave-from-class="opacity-100 scale-100" leave-to-class="opacity-0 scale-95">
            <div v-if="message"
                class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm modal-error-overlay">
                <div
                    class="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-100 flex flex-col items-center text-center gap-4 modal-error-content">
                    <div
                        class="w-14 h-14 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0 icon-box-error">
                        <Icon icon="lucide:alert-triangle" width="30" />
                    </div>

                    <div class="flex flex-col gap-1 text-box-error">
                        <h3 class="text-lg font-bold text-slate-800 judul-error">
                            {{ errorCode === 500 ? 'Kesalahan Server' : 'Gagal Memuat Data' }}
                        </h3>
                        <p class="text-sm text-slate-600 pesan-error">
                            {{ message }}
                        </p>
                    </div>

                    <div class="w-full flex gap-3 mt-2 action-box-error">
                        <button v-if="errorCode !== 404" @click="handleRetry"
                            class="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2 text-sm shadow-sm tombol-coba-lagi">
                            <Icon icon="lucide:refresh-cw" width="16" />
                            Coba Lagi
                        </button>
                        <button v-if="errorCode === 404" @click="router.push('/list-ekskul')"
                            class="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2 text-sm shadow-sm tombol-coba-lagi">
                            Kembali Ke Halaman Ekskul
                        </button>
                    </div>
                </div>
            </div>
        </Transition>
    </div>
</template>