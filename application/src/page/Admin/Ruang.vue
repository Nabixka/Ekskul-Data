<script setup>
import { computed, onMounted, ref } from "vue";
import { Icon } from "@iconify/vue";
import { api } from "../../api";
import MessageModal from "../../components/MessageModal.vue";

const formatLocalDateInput = (date) => {
  const localDate = new Date(date);
  localDate.setMinutes(localDate.getMinutes() - localDate.getTimezoneOffset());
  return localDate.toISOString().slice(0, 10);
};

const selectedDate = ref(formatLocalDateInput(new Date()));
const roomBookings = ref([]);
const isLoading = ref(true);
const processingId = ref(null);
const message = ref("");
const messageVariant = ref("error");

const fetchRoomList = async () => {
  isLoading.value = true;
  message.value = "";
  try {
    const res = await api.get("/ruang");
    if (!Array.isArray(res.data?.data)) {
      throw new Error("Format data ruang tidak sesuai.");
    }
    roomBookings.value = res.data.data;
  } catch (error) {
    message.value =
      error.response?.data?.message ||
      error.message ||
      "Gagal memuat data ruang.";
  } finally {
    isLoading.value = false;
  }
};

const filteredBookings = computed(() =>
  roomBookings.value.filter((booking) => {
    if (!booking.waktu_peminjaman) return false;
    return (
      formatLocalDateInput(booking.waktu_peminjaman) === selectedDate.value
    );
  }),
);

const updateBookingStatus = async (booking, status) => {
  processingId.value = booking.id;
  message.value = "";
  try {
    const res = await api.patch("/ruang", {
      peminjaman_ruang_id: booking.id,
      status,
    });
    await fetchRoomList();
    if (!message.value) {
      messageVariant.value = "success";
      message.value =
        res.data?.message ||
        `Pengajuan Ruang ${booking.ruang_id} berhasil ${status === "Penuh" ? "diterima" : "ditolak"}.`;
    }
  } catch (error) {
    messageVariant.value = "error";
    message.value =
      error.response?.data?.message ||
      error.message ||
      "Gagal memperbarui status peminjaman ruang.";
  } finally {
    processingId.value = null;
  }
};

const statusClass = (status) => ({
  "bg-emerald-50 text-emerald-700": status === "Kosong",
  "bg-amber-50 text-amber-700": status === "Diajukan" || status === "Pengajuan",
  "bg-rose-50 text-rose-700": status === "Penuh",
});

const formatBookingDate = (value) =>
  new Date(value).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

onMounted(fetchRoomList);
</script>

<template>
  <div class="w-full flex min-h-screen justify-end bg-slate-50">
    <main class="flex w-full flex-col gap-6 bg-slate-100 p-4 md:p-8 lg:w-4/5">
      <header
        class="relative overflow-hidden rounded-2xl border border-rose-950/20 bg-gradient-to-br from-[#17080C] via-[#281117] to-[#421923] p-6 text-white shadow-md md:p-8"
      >
        <div
          class="pointer-events-none absolute -right-8 -top-16 h-56 w-56 rounded-full border-[32px] border-white/5"
        ></div>
        <div class="relative">
          <p class="text-sm font-medium text-white/70">Admin</p>
          <h1 class="mt-1 text-2xl font-bold tracking-tight md:text-3xl">
            Pengelolaan Ruang
          </h1>
          <p class="mt-2 text-sm text-white/75">
            Tinjau pengajuan dan atur ketersediaan ruang.
          </p>
        </div>
      </header>

      <section
        class="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm md:p-6"
      >
        <div
          class="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
        >
          <div>
            <h2 class="text-lg font-bold text-slate-800">
              Daftar peminjaman ruang
            </h2>
            <p class="mt-1 text-sm text-slate-500">
              Pilih tanggal untuk melihat dan memproses pengajuan.
            </p>
          </div>
          <div class="flex flex-wrap items-end gap-2">
            <label
              class="flex flex-col gap-1 text-xs font-semibold text-slate-600"
            >
              Tanggal peminjaman
              <input
                v-model="selectedDate"
                type="date"
                class="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-normal focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-100"
              />
            </label>
            <button
              type="button"
              @click="fetchRoomList"
              :disabled="isLoading"
              class="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 transition hover:border-rose-200 hover:text-[#BE123C] disabled:opacity-50"
            >
              <Icon
                icon="lucide:refresh-cw"
                width="16"
                :class="{ 'animate-spin': isLoading }"
              />
              Muat ulang
            </button>
          </div>
        </div>

        <div
          v-if="isLoading"
          class="flex items-center justify-center gap-2 rounded-xl bg-slate-50 p-10 text-sm text-slate-500"
        >
          <Icon icon="lucide:loader-circle" width="18" class="animate-spin" />
          Memuat data ruang...
        </div>
        <div
          v-else-if="filteredBookings.length === 0"
          class="rounded-xl border border-dashed border-slate-200 p-10 text-center text-sm text-slate-500"
        >
          Tidak ada data peminjaman ruang pada tanggal ini.
        </div>
        <div v-else class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <article
            v-for="booking in filteredBookings"
            :key="booking.id"
            class="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4"
          >
            <div class="flex items-start justify-between gap-3">
              <div class="flex items-center gap-3">
                <span
                  class="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-50 text-[#BE123C]"
                >
                  <Icon icon="lucide:door-open" width="21" />
                </span>
                <div>
                  <h3 class="font-bold text-slate-800">
                    Ruang {{ booking.ruang_id }}
                  </h3>
                  <p class="text-xs text-slate-500">
                    {{ formatBookingDate(booking.waktu_peminjaman) }}
                  </p>
                </div>
              </div>
              <span
                :class="statusClass(booking.status)"
                class="rounded-full px-2.5 py-1 text-xs font-semibold"
              >
                {{ booking.status }}
              </span>
            </div>

            <dl class="grid gap-2 rounded-lg bg-slate-50 p-3 text-sm">
              <div>
                <dt class="text-xs text-slate-500">Peminjam</dt>
                <dd class="font-medium text-slate-700">
                  {{ booking.peminjam || "—" }}
                </dd>
              </div>
              <div>
                <dt class="text-xs text-slate-500">Keperluan</dt>
                <dd class="break-words text-slate-700">
                  {{ booking.description || "—" }}
                </dd>
              </div>
            </dl>

            <div
              v-if="
                booking.status === 'Diajukan' || booking.status === 'Pengajuan'
              "
              class="mt-auto flex gap-2"
            >
              <button
                type="button"
                @click="updateBookingStatus(booking, 'Kosong')"
                :disabled="processingId !== null"
                class="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-wait disabled:opacity-50"
              >
                <Icon
                  v-if="processingId === booking.id"
                  icon="lucide:loader-circle"
                  width="16"
                  class="animate-spin"
                />
                <Icon v-else icon="lucide:x" width="16" />
                Tolak
              </button>
              <button
                type="button"
                @click="updateBookingStatus(booking, 'Penuh')"
                :disabled="processingId !== null"
                class="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#BE123C] px-3 py-2 text-sm font-semibold text-white transition hover:bg-[#9F1239] disabled:cursor-wait disabled:opacity-50"
              >
                <Icon icon="lucide:check" width="16" />
                Terima
              </button>
            </div>
          </article>
        </div>
      </section>
    </main>
  </div>
  <MessageModal
    :open="Boolean(message)"
    :message="message"
    :variant="messageVariant"
    @close="
      message = '';
      messageVariant = 'error';
    "
  />
</template>
