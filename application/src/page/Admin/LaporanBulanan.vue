<script setup>
import { computed, ref } from 'vue';
import { Icon } from '@iconify/vue';

const selectedMonth = ref('2026-10')
const selectedEkskul = ref('')

const reports = [
    {
        id: 1,
        ekskul: 'Pramuka',
        bidang: 'Bela Negara',
        month: '2026-10',
        type: 'Laporan kegiatan',
        fileName: 'Laporan_Kegiatan_Pramuka_Oktober_2026.docx',
        extension: 'DOCX',
        size: '1,8 MB',
        uploadedAt: '08 Okt 2026'
    },
    {
        id: 2,
        ekskul: 'Pramuka',
        bidang: 'Bela Negara',
        month: '2026-10',
        type: 'Laporan kas',
        fileName: 'Laporan_Kas_Pramuka_Oktober_2026.xlsx',
        extension: 'XLSX',
        size: '640 KB',
        uploadedAt: '07 Okt 2026'
    },
    {
        id: 3,
        ekskul: 'Basket',
        bidang: 'PJOK',
        month: '2026-10',
        type: 'Laporan absensi',
        fileName: 'Absensi_Basket_Oktober_2026.xlsx',
        extension: 'XLSX',
        size: '420 KB',
        uploadedAt: '05 Okt 2026'
    },
    {
        id: 4,
        ekskul: 'Paduan Suara',
        bidang: 'Seni',
        month: '2026-10',
        type: 'Laporan kegiatan',
        fileName: 'Laporan_Kegiatan_Paduan_Suara_Oktober_2026.docx',
        extension: 'DOCX',
        size: '2,1 MB',
        uploadedAt: '03 Okt 2026'
    },
    {
        id: 5,
        ekskul: 'Pramuka',
        bidang: 'Bela Negara',
        month: '2026-09',
        type: 'Laporan absensi',
        fileName: 'Absensi_Pramuka_September_2026.xlsx',
        extension: 'XLSX',
        size: '510 KB',
        uploadedAt: '30 Sep 2026'
    },
    {
        id: 6,
        ekskul: 'Basket',
        bidang: 'PJOK',
        month: '2026-09',
        type: 'Laporan kas',
        fileName: 'Laporan_Kas_Basket_September_2026.xlsx',
        extension: 'XLSX',
        size: '580 KB',
        uploadedAt: '28 Sep 2026'
    },
    {
        id: 7,
        ekskul: 'Paduan Suara',
        bidang: 'Seni',
        month: '2026-08',
        type: 'Laporan kegiatan',
        fileName: 'Laporan_Kegiatan_Paduan_Suara_Agustus_2026.docx',
        extension: 'DOCX',
        size: '1,5 MB',
        uploadedAt: '31 Agu 2026'
    }
]

const monthOptions = [
    { value: '2026-10', label: 'Oktober 2026' },
    { value: '2026-09', label: 'September 2026' },
    { value: '2026-08', label: 'Agustus 2026' }
]

const ekskulOptions = [...new Set(reports.map(report => report.ekskul))]

const filteredReports = computed(() => reports.filter(report => {
    const matchesMonth = !selectedMonth.value || report.month === selectedMonth.value
    const matchesEkskul = !selectedEkskul.value || report.ekskul === selectedEkskul.value
    return matchesMonth && matchesEkskul
}))

const wordCount = computed(() => filteredReports.value.filter(report => report.extension === 'DOCX').length)
const spreadsheetCount = computed(() => filteredReports.value.filter(report => report.extension === 'XLSX').length)
const ekskulCount = computed(() => new Set(filteredReports.value.map(report => report.ekskul)).size)
</script>

<template>
    
    <div class="w-full min-h-screen bg-slate-100">
        <main class="flex w-full flex-col gap-6 p-4 md:p-8 lg:w-4/5 lg:ml-auto">
            <header
                class="relative overflow-hidden rounded-2xl border border-rose-950/20 bg-gradient-to-br from-[#17080C] via-[#281117] to-[#421923] p-6 text-white shadow-md md:p-8">
                <div class="pointer-events-none absolute -right-8 -top-16 h-56 w-56 rounded-full border-[32px] border-white/5"></div>
                <div class="relative">
                    <span class="text-sm font-medium text-white/70">Administrasi ekstrakurikuler</span>
                    <h1 class="mt-1 text-2xl font-bold tracking-tight md:text-3xl">Laporan Bulanan</h1>
                    <p class="mt-2 max-w-2xl text-sm text-white/80">
                        Lihat laporan kegiatan, kas, dan absensi yang dikirim oleh setiap ekstrakurikuler.
                    </p>
                </div>
            </header>

            <section class="grid grid-cols-1 gap-4 sm:grid-cols-3" aria-label="Ringkasan laporan">
                <article class="flex items-center justify-between rounded-2xl border border-slate-200/60 bg-white p-5 shadow-sm">
                    <div>
                        <p class="text-sm text-slate-500">Total laporan</p>
                        <p class="mt-1 text-3xl font-bold text-slate-800">{{ filteredReports.length }}</p>
                    </div>
                    <div class="rounded-xl bg-rose-50 p-3 text-[#BE123C]">
                        <Icon icon="lucide:files" width="24" />
                    </div>
                </article>
                <article class="flex items-center justify-between rounded-2xl border border-slate-200/60 bg-white p-5 shadow-sm">
                    <div>
                        <p class="text-sm text-slate-500">Ekskul melapor</p>
                        <p class="mt-1 text-3xl font-bold text-slate-800">{{ ekskulCount }}</p>
                    </div>
                    <div class="rounded-xl bg-rose-50 p-3 text-[#BE123C]">
                        <Icon icon="lucide:users-round" width="24" />
                    </div>
                </article>
                <article class="flex items-center justify-between rounded-2xl border border-slate-200/60 bg-white p-5 shadow-sm">
                    <div>
                        <p class="text-sm text-slate-500">Word / Excel</p>
                        <p class="mt-1 text-3xl font-bold text-slate-800">{{ wordCount }} <span class="text-lg font-medium text-slate-400">/</span> {{ spreadsheetCount }}</p>
                    </div>
                    <div class="rounded-xl bg-rose-50 p-3 text-[#BE123C]">
                        <Icon icon="lucide:file-spreadsheet" width="24" />
                    </div>
                </article>
            </section>

            <section class="overflow-hidden rounded-2xl border border-slate-200/60 bg-white shadow-sm">
                <div class="flex flex-col gap-4 border-b border-slate-100 p-5 md:flex-row md:items-center md:justify-between md:p-6">
                    <div>
                        <h2 class="text-lg font-bold text-slate-800">Dokumen laporan</h2>
                        <p class="mt-1 text-sm text-slate-500">Data contoh laporan yang diunggah oleh ekskul.</p>
                    </div>
                    <div class="flex flex-col gap-3 sm:flex-row">
                        <label class="flex flex-col gap-1 text-xs font-semibold text-slate-500">
                            Bulan
                            <select v-model="selectedMonth" class="min-w-44 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-normal text-slate-700 shadow-sm focus:border-[#E0234E] focus:outline-none focus:ring-2 focus:ring-[#E0234E]/15">
                                <option value="">Semua bulan</option>
                                <option v-for="month in monthOptions" :key="month.value" :value="month.value">
                                    {{ month.label }}
                                </option>
                            </select>
                        </label>
                        <label class="flex flex-col gap-1 text-xs font-semibold text-slate-500">
                            Ekstrakurikuler
                            <select v-model="selectedEkskul" class="min-w-44 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-normal text-slate-700 shadow-sm focus:border-[#E0234E] focus:outline-none focus:ring-2 focus:ring-[#E0234E]/15">
                                <option value="">Semua ekskul</option>
                                <option v-for="ekskul in ekskulOptions" :key="ekskul" :value="ekskul">
                                    {{ ekskul }}
                                </option>
                            </select>
                        </label>
                    </div>
                </div>

                <div v-if="filteredReports.length" class="divide-y divide-slate-100">
                    <article v-for="report in filteredReports" :key="report.id"
                        class="flex flex-col gap-4 p-5 transition-colors hover:bg-rose-50/30 sm:flex-row sm:items-center sm:justify-between md:px-6">
                        <div class="flex min-w-0 items-start gap-3">
                            <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
                                :class="report.extension === 'DOCX' ? 'bg-blue-50 text-blue-700' : 'bg-emerald-50 text-emerald-700'">
                                <Icon :icon="report.extension === 'DOCX' ? 'lucide:file-text' : 'lucide:table-2'" width="22" />
                            </div>
                            <div class="min-w-0">
                                <h3 class="break-words font-semibold text-slate-800">{{ report.type }}</h3>
                                <p class="mt-0.5 break-all text-sm text-slate-500">{{ report.fileName }}</p>
                                <div class="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                                    <span class="rounded-full border border-rose-100 bg-rose-50 px-2.5 py-1 font-medium text-[#9F1239]">
                                        {{ report.ekskul }}
                                    </span>
                                    <span>{{ report.bidang }}</span>
                                    <span aria-hidden="true">·</span>
                                    <span>{{ report.size }}</span>
                                </div>
                            </div>
                        </div>
                        <div class="flex shrink-0 items-center justify-between gap-4 sm:justify-end">
                            <div class="text-left sm:text-right">
                                <span class="inline-flex rounded-md bg-slate-100 px-2 py-1 text-[11px] font-bold text-slate-600">
                                    {{ report.extension }}
                                </span>
                                <p class="mt-1.5 text-xs text-slate-500">Diupload {{ report.uploadedAt }}</p>
                            </div>
                            <span class="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-400"
                                title="Aksi unduh tersedia setelah integrasi backend">
                                <Icon icon="lucide:download" width="15" />
                                Dummy
                            </span>
                        </div>
                    </article>
                </div>

                <div v-else class="flex flex-col items-center gap-2 px-6 py-16 text-center">
                    <div class="rounded-full bg-rose-50 p-4 text-[#BE123C]">
                        <Icon icon="lucide:folder-search" width="28" />
                    </div>
                    <h3 class="font-semibold text-slate-800">Laporan tidak ditemukan</h3>
                    <p class="max-w-sm text-sm text-slate-500">Tidak ada laporan untuk kombinasi bulan dan ekskul yang dipilih.</p>
                    <button type="button" @click="selectedMonth = ''; selectedEkskul = ''"
                        class="mt-2 text-sm font-semibold text-[#BE123C] transition hover:text-[#9F1239]">
                        Hapus filter
                    </button>
                </div>
            </section>

            <p class="text-center text-xs text-slate-400">Data di halaman ini masih berupa dummy untuk keperluan tampilan.</p>
        </main>
    </div>
</template>
