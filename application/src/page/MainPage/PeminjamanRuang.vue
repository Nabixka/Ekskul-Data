<script setup>
import { computed, ref, watch } from 'vue';
import { Icon } from '@iconify/vue';

const getLocalDate = () => {
    const date = new Date()
    date.setMinutes(date.getMinutes() - date.getTimezoneOffset())
    return date.toISOString().slice(0, 10)
}

const selectedDate = ref(getLocalDate())
const selectedTime = ref('10:00 - 12:00')
const selectedRoomId = ref(null)
const purpose = ref('')
const attendeeCount = ref(1)
const confirmationMessage = ref('')

const timeSlots = [
    '08:00 - 10:00',
    '10:00 - 12:00',
    '13:00 - 15:00',
    '15:00 - 17:00'
]

const rooms = [
    {
        id: 1,
        name: 'Ruang Rapat A',
        location: 'Gedung Utama · Lantai 2',
        capacity: 20,
        features: ['Proyektor', 'AC', 'Papan tulis'],
        icon: 'lucide:presentation'
    },
    {
        id: 2,
        name: 'Ruang Kreatif',
        location: 'Gedung Kesiswaan · Lantai 1',
        capacity: 15,
        features: ['AC', 'Papan tulis', 'Speaker'],
        icon: 'lucide:lightbulb'
    },
    {
        id: 3,
        name: 'Lab Multimedia',
        location: 'Gedung Utama · Lantai 3',
        capacity: 30,
        features: ['Proyektor', 'Komputer', 'AC'],
        icon: 'lucide:monitor'
    },
    {
        id: 4,
        name: 'Aula Mini',
        location: 'Gedung Serbaguna · Lantai 1',
        capacity: 60,
        features: ['Proyektor', 'Sound system', 'AC'],
        icon: 'lucide:users'
    }
]

const bookedRoomsByTime = {
    '08:00 - 10:00': [2, 4],
    '10:00 - 12:00': [3],
    '13:00 - 15:00': [1, 2],
    '15:00 - 17:00': [2, 3, 4]
}

const roomsForSelectedTime = computed(() => {
    const bookedRoomIds = bookedRoomsByTime[selectedTime.value] || []
    return rooms.map((room) => ({
        ...room,
        isAvailable: !bookedRoomIds.includes(room.id)
    }))
})

const availableRoomCount = computed(() =>
    roomsForSelectedTime.value.filter((room) => room.isAvailable).length
)

const selectedRoom = computed(() =>
    roomsForSelectedTime.value.find((room) => room.id === selectedRoomId.value && room.isAvailable)
)

watch([selectedTime, selectedDate], () => {
    confirmationMessage.value = ''
    if (!selectedRoom.value) selectedRoomId.value = null
})

const submitRequest = () => {
    if (!selectedRoom.value || !purpose.value.trim()) return

    const formattedDate = new Date(`${selectedDate.value}T00:00:00`).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    })
    confirmationMessage.value = `Permintaan dummy untuk ${selectedRoom.value.name} pada ${formattedDate}, pukul ${selectedTime.value} berhasil dibuat.`
}
</script>

<template>
    <div class="min-h-screen w-full bg-slate-50 lg:flex lg:justify-end">
        <main class="flex w-full flex-col gap-6 p-4 md:p-8 lg:w-4/5">
            <header
                class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#17080C] via-[#281117] to-[#421923] p-6 text-white shadow-md md:p-8">
                <div
                    class="pointer-events-none absolute -right-8 -top-16 h-56 w-56 rounded-full border-[32px] border-white/5">
                </div>
                <div class="relative flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
                    <div class="max-w-2xl">
                        <span
                            class="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-rose-100">
                            <Icon icon="lucide:door-open" width="15" />
                            Fasilitas sekolah
                        </span>
                        <h1 class="mt-4 text-2xl font-bold tracking-tight md:text-3xl">Peminjaman Ruang</h1>
                        <p class="mt-2 text-sm leading-relaxed text-white/75">
                            Temukan ruang yang tersedia dan ajukan peminjaman untuk kegiatanmu.
                        </p>
                    </div>
                    <div class="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                        <span
                            class="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-400/15 text-emerald-300">
                            <Icon icon="lucide:check-circle-2" width="22" />
                        </span>
                        <div>
                            <p class="text-xs text-white/60">Ruang tersedia</p>
                            <p class="text-lg font-bold">{{ availableRoomCount }} <span
                                    class="text-sm font-medium text-white/70">dari {{ rooms.length }} ruang</span></p>
                        </div>
                    </div>
                </div>
            </header>

            <section class="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
                <div class="flex min-w-0 flex-col gap-5">
                    <section class="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm md:p-6">
                        <div class="mb-5">
                            <h2 class="text-lg font-bold text-slate-800">Pilih jadwal</h2>
                            <p class="mt-1 text-sm text-slate-500">Tentukan tanggal dan waktu penggunaan ruang.</p>
                        </div>
                        <div class="grid gap-4 sm:grid-cols-2">
                            <label class="flex flex-col gap-2 text-sm font-semibold text-slate-700">
                                Tanggal peminjaman
                                <span class="relative">
                                    <Icon icon="lucide:calendar-days" width="18"
                                        class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input v-model="selectedDate" :min="getLocalDate()" type="date"
                                        class="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm font-normal focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-100">
                                </span>
                            </label>
                            <label class="flex flex-col gap-2 text-sm font-semibold text-slate-700">
                                Waktu penggunaan
                                <span class="relative">
                                    <Icon icon="lucide:clock-3" width="18"
                                        class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <select v-model="selectedTime"
                                        class="w-full appearance-none rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-9 text-sm font-normal focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-100">
                                        <option v-for="slot in timeSlots" :key="slot" :value="slot">{{ slot }}</option>
                                    </select>
                                    <Icon icon="lucide:chevron-down" width="16"
                                        class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                </span>
                            </label>
                        </div>
                    </section>

                    <section>
                        <div class="mb-4 flex items-end justify-between gap-3">
                            <div>
                                <h2 class="text-lg font-bold text-slate-800">Pilih ruang</h2>
                                <p class="mt-1 text-sm text-slate-500">Jadwal ketersediaan diperbarui sesuai waktu
                                    pilihanmu.</p>
                            </div>
                            <span
                                class="shrink-0 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                                {{ availableRoomCount }} tersedia
                            </span>
                        </div>

                        <div class="grid gap-4 md:grid-cols-2">
                            <button v-for="room in roomsForSelectedTime" :key="room.id" type="button"
                                :disabled="!room.isAvailable"
                                @click="selectedRoomId = room.id; confirmationMessage = ''"
                                :aria-pressed="selectedRoomId === room.id" :class="[
                                    'rounded-2xl border p-5 text-left transition-all',
                                    !room.isAvailable
                                        ? 'cursor-not-allowed border-slate-200 bg-slate-100/70 opacity-70'
                                        : selectedRoomId === room.id
                                            ? 'border-rose-400 bg-rose-50/70 shadow-md shadow-rose-950/5 ring-2 ring-rose-100'
                                            : 'border-slate-200/70 bg-white shadow-sm hover:-translate-y-0.5 hover:border-rose-200 hover:shadow-md'
                                ]">
                                <div class="flex items-start justify-between gap-3">
                                    <span
                                        :class="room.isAvailable ? 'bg-rose-50 text-[#BE123C]' : 'bg-slate-200 text-slate-500'"
                                        class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl">
                                        <Icon :icon="room.icon" width="22" />
                                    </span>
                                    <span
                                        :class="room.isAvailable ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-200 text-slate-600'"
                                        class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold">
                                        <span :class="room.isAvailable ? 'bg-emerald-500' : 'bg-slate-400'"
                                            class="h-1.5 w-1.5 rounded-full"></span>
                                        {{ room.isAvailable ? 'Tersedia' : 'Sudah dipesan' }}
                                    </span>
                                </div>
                                <h3 class="mt-4 font-bold text-slate-800">{{ room.name }}</h3>
                                <p class="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                                    <Icon icon="lucide:map-pin" width="14" />{{ room.location }}
                                </p>
                                <p class="mt-4 flex items-center gap-2 text-xs font-medium text-slate-600">
                                    <Icon icon="lucide:users-round" width="15" class="text-slate-400" />
                                    Maksimal {{ room.capacity }} orang
                                </p>
                                <div class="mt-3 flex flex-wrap gap-1.5">
                                    <span v-for="feature in room.features" :key="feature"
                                        class="rounded-md bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-600">
                                        {{ feature }}
                                    </span>
                                </div>
                            </button>
                        </div>
                    </section>
                </div>

                <aside
                    class="h-fit rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm md:p-6 xl:sticky xl:top-6">
                    <div class="flex items-center gap-3 border-b border-slate-100 pb-4">
                        <span class="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-[#BE123C]">
                            <Icon icon="lucide:clipboard-list" width="21" />
                        </span>
                        <div>
                            <h2 class="font-bold text-slate-800">Ringkasan peminjaman</h2>
                            <p class="text-xs text-slate-500">Lengkapi detail permintaan</p>
                        </div>
                    </div>

                    <div class="mt-4 space-y-3 rounded-xl bg-slate-50 p-4 text-sm">
                        <div class="flex items-start justify-between gap-3">
                            <span class="text-slate-500">Ruang</span>
                            <span class="text-right font-semibold text-slate-800">{{ selectedRoom?.name || 'Belum dipilih' }}</span>
                        </div>
                        <div class="flex items-start justify-between gap-3">
                            <span class="text-slate-500">Tanggal</span>
                            <span class="text-right font-semibold text-slate-800">
                                {{ selectedDate ? new Date(`${selectedDate}T00:00:00`).toLocaleDateString('id-ID', {
                                    day: 'numeric', month: 'short', year: 'numeric' }) : '—' }}
                            </span>
                        </div>
                        <div class="flex items-start justify-between gap-3">
                            <span class="text-slate-500">Waktu</span>
                            <span class="text-right font-semibold text-slate-800">{{ selectedTime }}</span>
                        </div>
                    </div>

                    <form class="mt-5 flex flex-col gap-4" @submit.prevent="submitRequest">
                        <label class="flex flex-col gap-2 text-sm font-semibold text-slate-700">
                            Keperluan
                            <textarea v-model="purpose" rows="3" required maxlength="160"
                                placeholder="Contoh: Rapat persiapan lomba"
                                class="resize-none rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-normal focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-100"></textarea>
                        </label>
                        <label class="flex flex-col gap-2 text-sm font-semibold text-slate-700">
                            Perkiraan peserta
                            <span class="relative">
                                <Icon icon="lucide:users-round" width="17"
                                    class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input v-model.number="attendeeCount" type="number" min="1"
                                    :max="selectedRoom?.capacity || 100"
                                    class="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm font-normal focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-100">
                            </span>
                        </label>

                        <p v-if="selectedRoom && attendeeCount > selectedRoom.capacity" class="text-xs text-rose-700">
                            Jumlah peserta melebihi kapasitas ruang ({{ selectedRoom.capacity }} orang).
                        </p>
                        <p v-if="confirmationMessage" role="status"
                            class="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm leading-relaxed text-emerald-800">
                            {{ confirmationMessage }}
                        </p>

                        <button type="submit"
                            :disabled="!selectedRoom || !purpose.trim() || attendeeCount < 1 || attendeeCount > (selectedRoom?.capacity || 0)"
                            class="inline-flex items-center justify-center gap-2 rounded-xl bg-[#BE123C] px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#9F1239] disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none">
                            <Icon icon="lucide:send" width="17" />
                            Ajukan peminjaman
                        </button>
                        <p class="text-center text-xs leading-relaxed text-slate-400">
                            Ini hanya simulasi tampilan. Permintaan belum dikirim ke sistem.
                        </p>
                    </form>
                </aside>
            </section>
        </main>
    </div>
</template>
