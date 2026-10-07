<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Icon } from '@iconify/vue';
import { api } from '../../api';
import { formatDate } from '../../helper';
import MessageModal from '../../components/MessageModal.vue';

const API_URL = import.meta.env.VITE_API_URL
const route = useRoute()
const router = useRouter()
const ekskulId = route.params.id

const ekskul = ref(null)
const pengurus = ref([])
const kegiatan = ref([])
const isLoading = ref(true)
const isJoining = ref(false)
const isJoined = ref(false)
const errorMessage = ref('')
const joinMessage = ref('')
const isSuccessJoin = ref(false)

const latestKegiatan = computed(() => kegiatan.value.slice(0, 3))

const getDetail = async () => {
    isLoading.value = true
    errorMessage.value = ''
    try {
        const [detailResponse, kegiatanResponse] = await Promise.all([
            api.get(`/ekskul/${ekskulId}`),
            api.get(`/kegiatan/ekskul/${ekskulId}`)
        ])
        ekskul.value = detailResponse.data.data?.ekskul || null
        pengurus.value = detailResponse.data.data?.member || []
        kegiatan.value = kegiatanResponse.data.data || []
    } catch (error) {
        errorMessage.value = error.response?.data?.message || 'Gagal memuat detail ekstrakurikuler.'
    } finally {
        isLoading.value = false
    }
}

const handleJoinEkskul = async () => {
    if (isJoined.value) {
        router.push(`/my-ekskul/${ekskulId}`)
        return
    }

    isJoining.value = true
    joinMessage.value = ''
    isSuccessJoin.value = false
    try {
        await api.post(`/ekskul/${ekskulId}/join`)
        isJoined.value = true
        isSuccessJoin.value = true
        joinMessage.value = 'Berhasil bergabung! Ekskul ini sekarang tersedia di halaman Ekskul Saya.'
    } catch (error) {
        isSuccessJoin.value = false
        joinMessage.value = error.response?.data?.message || 'Gagal bergabung dengan ekstrakurikuler.'
    } finally {
        isJoining.value = false
    }
}

const closeJoinMessage = () => {
    joinMessage.value = ''
}

onMounted(getDetail)
</script>

<template>
    <div class="min-h-screen w-full bg-slate-50 flex justify-end">
        <main class="w-full lg:w-4/5 min-h-screen p-4 md:p-8 lg:p-10 transition-all duration-300">
            <div class="mx-auto flex w-full max-w-5xl flex-col gap-6">

                <!-- Skeleton Loading -->
                <div v-if="isLoading"
                    class="animate-pulse overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
                    <div class="h-64 bg-slate-200 md:h-80"></div>
                    <div class="space-y-4 p-6 md:p-8">
                        <div class="h-7 w-1/3 rounded-lg bg-slate-200"></div>
                        <div class="h-4 w-2/3 rounded-lg bg-slate-100"></div>
                        <div class="h-4 w-1/2 rounded-lg bg-slate-100"></div>
                    </div>
                </div>

                <!-- Konten Utama -->
                <template v-else-if="ekskul">
                    <!-- Header Banner -->
                    <header :style="ekskul.banner ? { backgroundImage: `url(${API_URL}${ekskul.banner})` } : {}"
                        class="bg-cover bg-center rounded-2xl shadow-md text-white relative overflow-hidden h-52 bg-gradient-to-r from-nest-700 to-nest-950">

                        <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20"></div>

                        <button @click="router.back()"
                            class="absolute top-4 left-4 z-10 p-2 bg-black/40 hover:bg-black/60 backdrop-blur-md rounded-xl text-white transition-all">
                            <Icon icon="lucide:arrow-left" width="20" />
                        </button>

                        <div class="absolute bottom-5 left-5 right-5 z-10 flex flex-col gap-1.5">
                            <h1 class="font-bold text-2xl md:text-3xl tracking-tight leading-tight">
                                {{ ekskul.name || 'Memuat...' }}
                            </h1>
                            <div class="flex flex-wrap gap-2 items-center text-xs md:text-sm text-slate-200">
                                <span
                                    class="bg-white/20 backdrop-blur-md px-2.5 py-0.5 rounded-md font-medium border border-white/20">
                                    {{ ekskul.bidang || 'Umum' }}
                                </span>
                            </div>
                        </div>
                    </header>

                    <!-- Grid Layout (Konten & Sidebar) -->
                    <div class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">

                        <!-- Kolom Kiri -->
                        <div class="flex flex-col gap-6">

                            <!-- Tentang Ekskul -->
                            <section
                                class="rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm transition hover:shadow-md md:p-8">
                                <div class="flex items-center gap-3.5">
                                    <Icon icon="lucide:info" width="22" class="text-nest-600 dark:text-nest-300" />
                                    <div>
                                        <p
                                            class="text-xs font-bold uppercase tracking-wider text-nest-600 dark:text-nest-300">
                                            Tentang Ekskul</p>
                                        <h2 class="text-base font-bold text-slate-900 md:text-lg">Temukan minat & ruang
                                            berkembangmu</h2>
                                    </div>
                                </div>
                                <p class="mt-5 whitespace-pre-line text-sm leading-relaxed text-slate-600">
                                    {{ ekskul.about || `Belum ada deskripsi untuk ${ekskul.name}. Bergabung dan kenali
                                    kegiatan serta teman-teman baru di bidang ${ekskul.bidang || 'ini'}.` }}
                                </p>
                            </section>

                            <!-- Pengurus -->
                            <section
                                class="rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm transition hover:shadow-md md:p-8">
                                <div class="flex items-center justify-between gap-4 border-b border-slate-100 pb-4">
                                    <div class="flex items-center gap-3.5">
                                        <Icon icon="lucide:users-round" width="22"
                                            class="text-nest-600 dark:text-nest-300" />
                                        <div>
                                            <p
                                                class="text-xs font-bold uppercase tracking-wider text-nest-600 dark:text-nest-300">
                                                Struktur Organisasi</p>
                                            <h2 class="text-base font-bold text-slate-900 md:text-lg">Pembina & Ketua
                                            </h2>
                                        </div>
                                    </div>
                                </div>

                                <div v-if="pengurus.length" class="mt-5 grid gap-3.5 sm:grid-cols-2">
                                    <article v-for="person in pengurus" :key="`${person.nis}-${person.role}`"
                                        class="group flex items-center gap-3.5 rounded-2xl border border-slate-100 bg-slate-50/70 p-4 transition hover:border-nest-200 hover:bg-white hover:shadow-sm dark:bg-slate-900/50 dark:hover:bg-slate-800">
                                        <div
                                            class="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-nest-100 font-bold text-nest-700 shadow-inner dark:bg-nest-950 dark:text-nest-200">
                                            {{ person.name?.charAt(0)?.toUpperCase() || '?' }}
                                        </div>
                                        <div class="min-w-0">
                                            <h3
                                                class="truncate text-sm font-bold text-slate-800 transition group-hover:text-nest-600 dark:group-hover:text-nest-300">
                                                {{ person.name }}</h3>
                                            <p class="mt-0.5 text-xs font-medium text-slate-500">{{ person.role }}</p>
                                        </div>
                                    </article>
                                </div>
                                <div v-else
                                    class="mt-5 rounded-2xl border border-dashed border-slate-200 p-8 text-center">
                                    <p class="text-sm text-slate-400">Informasi pembina dan ketua belum tersedia.</p>
                                </div>
                            </section>

                            <!-- Kegiatan Terbaru -->
                            <section
                                class="rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm transition hover:shadow-md md:p-8">
                                <div class="flex items-center justify-between gap-4 border-b border-slate-100 pb-4">
                                    <div class="flex items-center gap-3.5">
                                        <Icon icon="lucide:calendar-days" width="22"
                                            class="text-nest-600 dark:text-nest-300" />
                                        <div>
                                            <p
                                                class="text-xs font-bold uppercase tracking-wider text-nest-600 dark:text-nest-300">
                                                Agenda</p>
                                            <h2 class="text-base font-bold text-slate-900 md:text-lg">Kegiatan terbaru
                                            </h2>
                                        </div>
                                    </div>
                                </div>

                                <div v-if="latestKegiatan.length" class="mt-5 flex flex-col divide-y divide-slate-100">
                                    <article v-for="item in latestKegiatan" :key="item.id"
                                        class="flex gap-4 py-4 first:pt-0 last:pb-0">
                                        <div
                                            class="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-2xl bg-nest-50 text-nest-600 shadow-sm dark:bg-nest-950/50 dark:text-nest-300">
                                            <Icon icon="lucide:calendar-check" width="20" />
                                        </div>
                                        <div class="min-w-0 flex-1">
                                            <h3 class="font-bold text-slate-800 text-sm md:text-base">{{ item.title }}
                                            </h3>
                                            <p
                                                class="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-medium text-slate-500">
                                                <span class="inline-flex items-center gap-1.5">
                                                    <Icon icon="lucide:clock-3" width="14"
                                                        class="text-nest-600 dark:text-nest-300" />
                                                    {{ formatDate(item.waktu) }}
                                                </span>
                                                <span class="inline-flex items-center gap-1.5">
                                                    <Icon icon="lucide:map-pin" width="14"
                                                        class="text-nest-600 dark:text-nest-300" />
                                                    {{ item.location || 'Lokasi menyusul' }}
                                                </span>
                                            </p>
                                            <p v-if="item.description"
                                                class="mt-2 line-clamp-2 text-sm leading-relaxed text-slate-600">
                                                {{ item.description }}
                                            </p>
                                        </div>
                                    </article>
                                </div>
                                <div v-else
                                    class="mt-5 rounded-2xl border border-dashed border-slate-200 p-8 text-center">
                                    <p class="text-sm text-slate-400">Belum ada agenda kegiatan yang dibagikan.</p>
                                </div>
                            </section>

                        </div>

                        <!-- Kolom Kanan (Sidebar Action Card) -->
                        <aside class="h-fit lg:sticky lg:top-6">
                            <section
                                class="rounded-2xl border border-slate-200/60 bg-white p-6 shadow-md shadow-rose-50/50 dark:shadow-black/20">
                                <div
                                    class="flex h-12 w-12 items-center justify-center rounded-2xl bg-nest-50 text-nest-600 shadow-sm dark:bg-nest-950/50 dark:text-nest-300">
                                    <Icon icon="lucide:heart-handshake" width="24" />
                                </div>
                                <h2 class="mt-4 text-base font-bold text-slate-900 md:text-lg">Tertarik bergabung?</h2>
                                <p class="mt-2 text-sm leading-relaxed text-slate-600">
                                    Mulai pengalaman baru bersama <strong class="text-slate-800">{{ ekskul.name
                                    }}</strong> dan kembangkan potensimu di bidang ini.
                                </p>

                                <button @click="handleJoinEkskul" :disabled="isJoining"
                                    class="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-nest-600 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-nest-600/20 transition-all hover:bg-nest-700 hover:shadow-nest-600/30 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60">
                                    <Icon
                                        :icon="isJoining ? 'lucide:loader-2' : (isJoined ? 'lucide:arrow-right' : 'lucide:user-round-plus')"
                                        :class="isJoining ? 'animate-spin' : ''" width="18" />
                                    {{ isJoining ? 'Memproses...' : (isJoined ? 'Buka Ekskul Saya' : 'Join Ekskul') }}
                                </button>

                                <div class="mt-6 border-t border-slate-100 pt-4">
                                    <p class="flex items-center gap-2 text-xs font-medium text-slate-500">
                                        <Icon icon="lucide:shield-check" class="text-emerald-500 shrink-0" width="16" />
                                        Informasi ekskul dan agenda dapat berubah sewaktu-waktu.
                                    </p>
                                </div>
                            </section>
                        </aside>

                    </div>
                </template>

            </div>
        </main>
    </div>

    <Transition enter-active-class="transition duration-200 ease-out" enter-from-class="scale-95 opacity-0"
        enter-to-class="scale-100 opacity-100" leave-active-class="transition duration-150 ease-in"
        leave-from-class="scale-100 opacity-100" leave-to-class="scale-95 opacity-0">
        <div v-if="joinMessage" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
            role="dialog" aria-modal="true" aria-labelledby="join-message-title">
            <div class="flex w-full max-w-md flex-col items-center gap-4 rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-xl dark:border-slate-700 dark:bg-slate-900">
                <div :class="[
                    'flex h-14 w-14 items-center justify-center rounded-full',
                    isSuccessJoin
                        ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-300'
                        : 'bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:text-rose-300'
                ]">
                    <Icon :icon="isSuccessJoin ? 'lucide:check' : 'lucide:alert-triangle'" width="28" />
                </div>
                <div>
                    <h2 id="join-message-title" class="text-lg font-bold text-slate-900 dark:text-white">
                        {{ isSuccessJoin ? 'Berhasil Bergabung' : 'Tidak Bisa Bergabung' }}
                    </h2>
                    <p class="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                        {{ joinMessage }}
                    </p>
                </div>
                <button @click="closeJoinMessage"
                    class="mt-1 w-full rounded-xl bg-nest-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-nest-700 focus:outline-none focus:ring-2 focus:ring-nest-400 focus:ring-offset-2 dark:focus:ring-offset-slate-900">
                    Mengerti
                </button>
            </div>
        </div>
    </Transition>
    <MessageModal :open="Boolean(errorMessage)" :message="errorMessage" action-label="Coba lagi"
        @close="errorMessage = ''" @action="errorMessage = ''; getDetail()" />
</template>