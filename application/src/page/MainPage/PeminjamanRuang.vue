<script setup>
import { computed, ref, onMounted } from "vue";
import { Icon } from "@iconify/vue";
import { api } from "../../api";
import MessageModal from "../../components/MessageModal.vue";

const getLocalDate = () => {
  const date = new Date();
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 10);
};

const selectedDate = ref(getLocalDate());
const filterDate = ref(getLocalDate());
const selectedRoomId = ref(null);
const selectedPeminjam = ref("Pribadi");
const purpose = ref("");
const confirmationMessage = ref("");
const fetchError = ref("");
const isLoading = ref(false);
const isSubmitting = ref(false);

const roomBookings = ref([]);
const userEkskulList = ref([]);

const fetchRoomList = async () => {
  isLoading.value = true;
  fetchError.value = "";
  try {
    const res = await api.get("/ruang");
    if (!Array.isArray(res.data?.data)) {
      throw new Error("Format data ruang tidak sesuai.");
    }
    roomBookings.value = res.data.data;
  } catch (error) {
    console.error("Gagal memuat data ruangan", error);
    fetchError.value =
      error.response?.data?.message ||
      error.message ||
      "Gagal memuat data ruang. Silakan coba lagi.";
  } finally {
    isLoading.value = false;
  }
};

const fetchUserEkskul = async () => {
  try {
    const res = await api.get("/member/ekskul");
    if (Array.isArray(res.data?.data)) {
      userEkskulList.value = res.data.data;
    }
  } catch (error) {
    console.error("Gagal memuat data ekskul", error);
  }
};

onMounted(() => {
  fetchRoomList();
  fetchUserEkskul();
});

const filteredRoomBookings = computed(() => {
  return roomBookings.value.filter((room) => {
    const roomDate = room.waktu_peminjaman
      ? room.waktu_peminjaman.slice(0, 10)
      : "";
    return roomDate === filterDate.value;
  });
});

const availableRoomCount = computed(
  () =>
    filteredRoomBookings.value.filter((room) => room.status === "Kosong")
      .length,
);

const selectedRoom = computed(() =>
  filteredRoomBookings.value.find(
    (room) => room.id === selectedRoomId.value && room.status === "Kosong",
  ),
);

const submitRequest = async () => {
  if (!selectedRoom.value || !purpose.value.trim()) return;

  isSubmitting.value = true;
  confirmationMessage.value = "";
  fetchError.value = "";

  try {
    let peminjamValue = "Pribadi";
    if (selectedPeminjam.value !== "Pribadi") {
      const foundEkskul = userEkskulList.value.find(
        (e) => e.id.toString() === selectedPeminjam.value,
      );
      if (foundEkskul) {
        peminjamValue = foundEkskul.name;
      }
    }

    const payload = {
      peminjaman_ruang_id: selectedRoom.value.id,
      status: "Diajukan",
      description: purpose.value,
      peminjam: peminjamValue,
    };

    await api.patch("/ruang", payload);

    const formattedDate = new Date(
      `${filterDate.value}T00:00:00`,
    ).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    confirmationMessage.value = `Permintaan peminjaman untuk Ruang ${selectedRoom.value.ruang_id} atas nama ${peminjamValue} pada ${formattedDate} berhasil diajukan!`;

    purpose.value = "";
    selectedRoomId.value = null;
    selectedPeminjam.value = "Pribadi";
    await fetchRoomList();
  } catch (error) {
    console.error("Gagal mengajukan peminjaman", error);
    fetchError.value =
      error.response?.data?.message ||
      error.message ||
      "Gagal mengajukan peminjaman ruang.";
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<template>
  <div class="w-full flex justify-end min-h-screen bg-slate-50">
    <main class="w-full lg:w-4/5 bg-slate-100 p-4 md:p-8 flex flex-col gap-6">
      <header
        class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#17080C] via-[#281117] to-[#421923] p-6 text-white shadow-md md:p-8"
      >
        <div
          class="pointer-events-none absolute -right-8 -top-16 h-56 w-56 rounded-full border-[32px] border-white/5"
        ></div>
        <div
          class="relative flex flex-col gap-5 md:flex-row md:items-end md:justify-between"
        >
          <div class="max-w-2xl">
            <h1 class="mt-4 text-2xl font-bold tracking-tight md:text-3xl">
              Peminjaman Ruang
            </h1>
            <p class="mt-2 text-sm leading-relaxed text-white/75">
              Temukan ruang yang tersedia dan ajukan peminjaman untuk
              kegiatanmu.
            </p>
          </div>
          <div
            class="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3"
          >
            <span
              class="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-400/15 text-emerald-300"
            >
              <Icon icon="lucide:check-circle-2" width="22" />
            </span>
            <div>
              <p class="text-xs text-white/60">Ruang tersedia</p>
              <p class="text-lg font-bold">
                {{ availableRoomCount }}
                <span class="text-sm font-medium text-white/70"
                  >dari {{ filteredRoomBookings.length }} ruang</span
                >
              </p>
            </div>
          </div>
        </div>
      </header>

      <section class="flex flex-col lg:flex-row items-start gap-5 w-full">
        <div
          class="w-full lg:w-2/3 rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm md:p-6"
        >
          <div class="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 class="text-lg font-bold text-slate-800">
                Data ketersediaan ruang
              </h2>
              <p class="mt-1 text-sm text-slate-500">
                Pilih ruang berstatus kosong untuk mengajukan peminjaman.
              </p>
            </div>
            <div class="flex items-center gap-2">
              <!-- Input Filter Tanggal -->
              <input
                type="date"
                v-model="filterDate"
                class="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 focus:border-rose-400 focus:outline-none"
              />
              <button
                type="button"
                @click="fetchRoomList"
                class="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-rose-200 hover:text-[#BE123C]"
              >
                <Icon icon="lucide:refresh-cw" width="15" />
                Muat ulang
              </button>
            </div>
          </div>

          <div
            v-if="isLoading"
            class="flex items-center justify-center gap-2 rounded-xl bg-slate-50 p-8 text-sm text-slate-500"
          >
            <Icon icon="lucide:loader-circle" width="18" class="animate-spin" />
            Memuat data ruang...
          </div>
          <div
            v-else-if="filteredRoomBookings.length === 0"
            class="rounded-xl border border-dashed border-slate-200 p-8 text-center text-sm text-slate-400"
          >
            Tidak ada data ruang untuk tanggal tersebut.
          </div>
          <div v-else class="grid gap-3 sm:grid-cols-2">
            <button
              v-for="room in filteredRoomBookings"
              :key="room.id"
              type="button"
              :disabled="room.status !== 'Kosong'"
              @click="
                ((selectedRoomId = room.id),
                (confirmationMessage = ''),
                (fetchError = ''))
              "
              :aria-pressed="selectedRoomId === room.id"
              :class="[
                'rounded-xl border p-4 text-left transition-all',
                room.status !== 'Kosong'
                  ? 'cursor-not-allowed border-slate-200'
                  : selectedRoomId === room.id
                    ? 'border-rose-400 bg-slate-50 shadow-sm'
                    : 'border-slate-200 bg-white hover:border-rose-200 hover:bg-slate-50',
              ]"
            >
              <div class="flex items-start justify-between gap-3">
                <span
                  class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-rose-50 text-[#BE123C]"
                >
                  <Icon icon="lucide:door-open" width="20" />
                </span>
                <span
                  :class="{
                    'bg-emerald-50 text-emerald-700': room.status === 'Kosong',
                    'bg-amber-50 text-amber-700':
                      room.status === 'Diajukan' || room.status === 'Pengajuan',
                    'bg-rose-50 text-rose-700': room.status === 'Penuh',
                  }"
                  class="rounded-full px-2.5 py-1 text-xs font-semibold"
                >
                  {{ room.status }}
                </span>
              </div>
              <h3 class="mt-3 font-bold text-slate-700">
                Ruang {{ room.ruang_id }}
              </h3>
              <p v-if="room.description" class="mt-3 text-sm text-slate-600">
                {{ room.description }}
              </p>
              <p v-if="room.peminjam" class="mt-2 text-xs text-slate-600">
                Peminjam: <span class="font-medium">{{ room.peminjam }}</span>
              </p>
            </button>
          </div>
        </div>

        <aside
          class="w-full lg:w-1/3 h-fit lg:sticky lg:top-6 rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm md:p-6"
        >
          <div class="flex items-center gap-3 border-b border-slate-100 pb-4">
            <span
              class="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-[#BE123C]"
            >
              <Icon icon="lucide:clipboard-pen-line" width="21" />
            </span>
            <div>
              <h2 class="font-bold text-slate-800">Ajukan peminjaman</h2>
              <p class="text-xs text-slate-500">
                Lengkapi detail permintaan ruang
              </p>
            </div>
          </div>

          <div class="mt-4 space-y-3 rounded-xl bg-slate-50 p-4 text-sm">
            <div class="flex items-start justify-between gap-3">
              <span class="text-slate-500">Tempat</span>
              <span class="text-right font-semibold text-slate-800">{{
                selectedRoom
                  ? `Ruang ${selectedRoom.ruang_id}`
                  : "Belum dipilih"
              }}</span>
            </div>
          </div>

          <form
            class="mt-5 flex flex-col gap-4"
            @submit.prevent="submitRequest"
          >
            <label
              class="flex flex-col gap-2 text-sm font-semibold text-slate-700"
            >
              Atas Nama
              <span class="relative">
                <Icon
                  icon="lucide:user"
                  width="18"
                  class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <select
                  v-model="selectedPeminjam"
                  class="w-full appearance-none rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-9 text-sm font-normal focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-100"
                >
                  <option value="Pribadi">Atas nama sendiri</option>
                  <option
                    v-for="ekskul in userEkskulList"
                    :key="ekskul.id"
                    :value="ekskul.id"
                  >
                    Ekskul {{ ekskul.name }}
                  </option>
                </select>
              </span>
            </label>

            <label
              class="flex flex-col gap-2 text-sm font-semibold text-slate-700"
            >
              Tanggal peminjaman
              <span class="relative">
                <Icon
                  icon="lucide:calendar-days"
                  width="18"
                  class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <!-- Menggunakan filterDate agar input tanggal mengikuti tanggal yang sedang difilter -->
                <input
                  v-model="filterDate"
                  :min="getLocalDate()"
                  type="date"
                  required
                  class="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm font-normal focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-100"
                />
              </span>
            </label>
            <label
              class="flex flex-col gap-2 text-sm font-semibold text-slate-700"
            >
              Keperluan
              <textarea
                v-model="purpose"
                rows="3"
                required
                maxlength="160"
                placeholder="Contoh: Rapat persiapan lomba"
                class="resize-none rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-normal focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-100"
              ></textarea>
            </label>

            <button
              type="submit"
              :disabled="!selectedRoom || !purpose.trim() || isSubmitting"
              class="inline-flex items-center justify-center gap-2 rounded-xl bg-[#BE123C] px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#9F1239] disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
            >
              <Icon
                v-if="isSubmitting"
                icon="lucide:loader-circle"
                width="17"
                class="animate-spin"
              />
              <Icon v-else icon="lucide:send" width="17" />
              {{ isSubmitting ? "Mengirim..." : "Ajukan peminjaman" }}
            </button>
          </form>
        </aside>
      </section>
    </main>
  </div>
  <MessageModal
    :open="Boolean(fetchError)"
    :message="fetchError"
    @close="fetchError = ''"
  />
  <MessageModal
    :open="Boolean(confirmationMessage)"
    :message="confirmationMessage"
    variant="success"
    @close="confirmationMessage = ''"
  />
</template>
