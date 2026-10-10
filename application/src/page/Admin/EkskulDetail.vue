<script setup>
import { computed, onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import { api } from "../../api";
import { Icon } from "@iconify/vue";
import { formatDate } from "../../helper";
import MessageModal from "../../components/MessageModal.vue";

// Global Config
const API_URL = import.meta.env.VITE_API_URL;
const route = useRoute();

// Ref Data Fetch
const ekskulDetail = ref({});
const listMember = ref([]);
const listKegiatan = ref([]);
const listDokumentasi = ref([]);

// Help Fetch
const modalRole = ref(false);
const isLoading = ref(true);
const message = ref("");

// Filter Search Member
const searchMemberQuery = ref("");

// Filter Kegiatan
const filterMonth = ref("");
const filterYear = ref("");
const listMonths = [
  { value: "01", name: "Januari" },
  { value: "02", name: "Februari" },
  { value: "03", name: "Maret" },
  { value: "04", name: "April" },
  { value: "05", name: "Mei" },
  { value: "06", name: "Juni" },
  { value: "07", name: "Juli" },
  { value: "08", name: "Agustus" },
  { value: "09", name: "September" },
  { value: "10", name: "Oktober" },
  { value: "11", name: "November" },
  { value: "12", name: "Desember" },
];

// Computed Filter Member
const filteredMember = computed(() => {
  if (!searchMemberQuery.value) return listMember.value;
  const query = searchMemberQuery.value.toLowerCase();
  return listMember.value.filter(
    (member) =>
      member.member_name?.toLowerCase().includes(query) ||
      member.nis?.toString().includes(query),
  );
});

// Computed Filter Kegiatan
const filteredKegiatan = computed(() => {
  return listKegiatan.value.filter((kegiatan) => {
    if (!kegiatan.waktu) return true;
    const dateObj = new Date(kegiatan.waktu);
    const itemMonth = String(dateObj.getMonth() + 1).padStart(2, "0");
    const itemYear = String(dateObj.getFullYear());

    const matchMonth = filterMonth.value
      ? itemMonth === filterMonth.value
      : true;
    const matchYear = filterYear.value ? itemYear === filterYear.value : true;

    return matchMonth && matchYear;
  });
});

// Nama Ketua/Pembina
const ketua = computed(() => {
  if (!ekskulDetail.value.member) return "-";
  const ketuaName = ekskulDetail.value.member.filter(
    (item) => item.role === "Ketua",
  );
  return ketuaName.length > 0 ? ketuaName[0].name : "-";
});
const pembina = computed(() => {
  if (!ekskulDetail.value.member) return "-";
  const filterPembina = ekskulDetail.value.member.filter(
    (item) => item.role === "Pembina",
  );

  if (filterPembina.length === 0) return "-";

  return filterPembina.map((e) => e.name).join(", ");
});

// Ref Section
const currentSection = ref("About");
const listSection = ref([
  { name: "About" },
  { name: "Kegiatan" },
  { name: "Anggota" },
  { name: "Dokumentasi" },
]);
const handleChangeSection = (section) => {
  currentSection.value = section;
  if (section == "Anggota") getMember();
  if (section == "Kegiatan") getKegiatan();
  if (section == "Dokumentasi") getDokumentasi();
};

// Update Role Anggota
const listRole = ref([
  { name: "Ketua" },
  { name: "Wakil Ketua" },
  { name: "Sekretaris" },
  { name: "Humas" },
  { name: "Bendahara" },
  { name: "Member" },
]);
const updateData = ref({
  name: "",
  nis: null,
  role: "",
});
const handleOpenModal = (name, nis, role) => {
  updateData.value.name = name;
  updateData.value.nis = nis;
  updateData.value.role = role;

  modalRole.value = true;
};
const handleChangeRole = async () => {
  isLoading.value = true;
  message.value = "";
  try {
    await api.put("/role/change-role", {
      ekskul: id,
      nis: updateData.value.nis,
      incomingRole: updateData.value.role,
    });

    getMember();
  } catch (error) {
    message.value =
      error.response?.data?.message || "Gagal Terhubung, Coba lagi nanti";
  } finally {
    isLoading.value = false;
    modalRole.value = false;
  }
};

// Ekskul Id
const id = route.params.id;

// Fetch Detail Ekskul
const getDetail = async () => {
  isLoading.value = true;
  message.value = "";
  try {
    const res = await api.get(`/ekskul/${id}`);
    ekskulDetail.value = res.data.data;
  } catch (error) {
    if (error.response == 401) {
      localStorage.removeItem("token");
      router.push("/");
    }
    message.value =
      error.response?.data?.message || "Terjadi Kesalahan Pada Server";
  } finally {
    isLoading.value = false;
  }
};

// Fetch Member
const getMember = async () => {
  message.value = "";
  try {
    const res = await api.get(`/ekskul/${id}/member`);
    listMember.value = res.data.data;
  } catch (error) {
    message.value =
      error.response?.data?.message || "Gagal Terhubung, Coba lagi nanti";
  } finally {
    isLoading.value = false;
  }
};

// Fetch Kegiatan
const getKegiatan = async () => {
  message.value = "";
  try {
    const res = await api.get(`/kegiatan/ekskul/${id}`);
    listKegiatan.value = res.data.data;
  } catch (error) {
    message.value =
      error.response?.data?.message || "Gagal Terhubung, Coba lagi nanti";
  } finally {
    isLoading.value = false;
  }
};

// Fetch Dokumentasi
const getDokumentasi = async () => {
  message.value = "";
  try {
    const res = await api.get(`/dokumentasi/ekskul/${id}`);
    listDokumentasi.value = res.data.data;
  } catch (error) {
    message.value =
      error.response?.data?.message || "Gagal Terhubung, Coba lagi nanti";
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  getDetail();
});
</script>

<template>
  <!-- Modal -->
  <div
    v-if="modalRole"
    class="fixed inset-0 z-50 flex items-center justify-center"
  >
    <!-- Blur Backdrop -->
    <div
      @click="modalRole = false"
      class="bg-black/30 backdrop-blur-sm inset-0 absolute z-10"
    ></div>

    <!-- Card Container -->
    <div
      class="relative z-20 w-11/12 max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-white/10 dark:bg-[#1d1518]"
    >
      <!-- Card Header -->
      <div class="flex items-center justify-between bg-gradient-to-r from-[#BE123C] to-[#E0234E] p-4">
        <h3 class="text-white font-semibold text-lg">Edit Role Anggota</h3>
        <button
          @click="modalRole = false"
          aria-label="Tutup modal"
          class="rounded-lg p-1 text-white/80 transition-colors hover:bg-white/15 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
        >
          <Icon width="20" icon="akar-icons:cross" />
        </button>
      </div>

      <!-- Card Body -->
      <form @submit.prevent="handleChangeRole()">
        <div class="w-full p-5 flex flex-col gap-4">
          <!-- Nama Anggota -->
          <div class="flex flex-col gap-1.5">
            <label
              class="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400"
              >Nama Anggota</label
            >
            <input
              disabled
              class="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 disabled:cursor-not-allowed disabled:opacity-80 dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
              type="text"
              :value="updateData.name"
            />
          </div>

          <!-- NIS -->
          <div class="flex flex-col gap-1.5">
            <label
              class="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400"
              >NIS</label
            >
            <input
              disabled
              class="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 disabled:cursor-not-allowed disabled:opacity-80 dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
              type="text"
              :value="updateData.nis"
            />
          </div>

          <!-- Role Dropdown -->
          <div class="flex flex-col gap-1.5">
            <label
              class="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400"
              >Pilih Role Baru</label
            >
            <select
              v-model="updateData.role"
              class="cursor-pointer rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-[#E0234E] focus:ring-2 focus:ring-rose-100 dark:border-white/10 dark:bg-[#171114] dark:text-slate-100 dark:focus:ring-rose-950"
            >
              <option value="" disabled>Pilih Role</option>
              <option
                :value="roleItem.name"
                v-for="roleItem in listRole"
                :key="roleItem.name"
              >
                {{ roleItem.name }}
              </option>
            </select>
          </div>
        </div>

        <!-- Button Actions -->
        <div
          class="flex justify-end gap-3 border-t border-slate-100 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/[0.03]"
        >
          <button
            type="button"
            @click="modalRole = false"
            class="cursor-pointer rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300 dark:border-white/10 dark:text-slate-200 dark:hover:bg-white/10"
          >
            Batal
          </button>
          <button
            type="submit"
            class="cursor-pointer rounded-lg bg-[#BE123C] px-5 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#9F1239] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#1d1518]"
          >
            Simpan
          </button>
        </div>
      </form>
    </div>
  </div>

  <div class="w-full flex min-h-screen justify-end bg-slate-50">
    <div class="flex w-full flex-col gap-6 bg-slate-100 p-4 md:p-8 lg:w-4/5">
  
      <!-- Main Content -->
      <main class="flex min-w-0 flex-col gap-5">
        <!-- Skeleton Loading State -->
        <template v-if="isLoading">
          <!-- Banner Skeleton -->
          <div
            class="h-56 w-full animate-pulse rounded-2xl bg-slate-200 shadow-sm dark:bg-white/5"
          ></div>

          <!-- Nav Skeleton -->
          <div
            class="grid grid-cols-2 gap-2 rounded-2xl border border-slate-200/70 bg-white p-2 shadow-sm dark:border-white/10 dark:bg-[#1d1518] sm:grid-cols-4"
          >
            <div
              v-for="i in 4"
              :key="i"
              class="h-10 animate-pulse rounded-xl bg-slate-200 dark:bg-white/5"
            ></div>
          </div>

          <!-- Content Body Skeleton -->
          <div
            class="flex flex-col gap-4 rounded-2xl border border-slate-200/70 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#1d1518]"
          >
            <div class="h-6 w-32 animate-pulse rounded bg-slate-200 dark:bg-white/5"></div>
            <div class="flex flex-col gap-2">
              <div class="h-4 w-full animate-pulse rounded bg-slate-200 dark:bg-white/5"></div>
              <div class="h-4 w-5/6 animate-pulse rounded bg-slate-200 dark:bg-white/5"></div>
              <div class="h-4 w-2/3 animate-pulse rounded bg-slate-200 dark:bg-white/5"></div>
            </div>
          </div>
        </template>

        <template v-else>
          <!-- Banner -->
          <header
            :style="{
              backgroundImage: `url(${API_URL}${ekskulDetail.ekskul?.banner})`,
            }"
            class="relative flex min-h-60 flex-col justify-end gap-3 overflow-hidden rounded-2xl border border-rose-950/10 bg-cover bg-center p-6 text-white shadow-lg shadow-rose-950/10 sm:min-h-72 sm:p-8"
          >
            <div
              class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-black/5"
            ></div>
            <div class="relative z-10 flex flex-col items-start gap-3">
              <span
                class="rounded-full border border-white/25 bg-black/25 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-white/90 backdrop-blur-sm"
              >
                Detail ekstrakurikuler
              </span>
              <h1 class="text-2xl font-bold tracking-tight drop-shadow sm:text-4xl">
                {{ ekskulDetail.ekskul?.name }}
              </h1>
              <span
                class="w-fit rounded-full border border-white/30 bg-white/15 px-3 py-1 text-xs font-semibold text-white shadow-sm backdrop-blur-sm"
              >
                {{ ekskulDetail.ekskul?.bidang }}
              </span>
            </div>
          </header>

          <!-- Nav -->
          <div
            class="grid grid-cols-2 gap-1 rounded-2xl border border-slate-200/70 bg-white p-2 shadow-sm dark:border-white/10 dark:bg-[#1d1518] sm:grid-cols-4"
          >
            <button
              v-for="section in listSection"
              :key="section.name"
              @click="handleChangeSection(section.name)"
              :class="[
                'cursor-pointer rounded-xl px-2 py-2.5 text-center text-xs font-semibold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300 sm:text-sm',
                currentSection === section.name
                  ? 'bg-rose-50 text-[#9F1239] shadow-sm dark:bg-rose-500/15 dark:text-rose-200'
                  : 'text-slate-600 hover:bg-rose-50 hover:text-[#9F1239] dark:text-slate-300 dark:hover:bg-rose-500/10 dark:hover:text-rose-200',
              ]"
            >
              {{ section.name }}
            </button>
          </div>

          <!-- Section About -->
          <section
            v-if="currentSection == 'About'"
            class="flex flex-col gap-4 rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#1d1518] sm:p-6"
          >
            <div class="flex items-center gap-3">
              <span class="rounded-xl bg-rose-50 p-2.5 text-[#BE123C] dark:bg-rose-500/10 dark:text-rose-300">
                <Icon icon="lucide:info" width="20" />
              </span>
              <div>
                <p class="text-xs font-bold uppercase tracking-wider text-[#BE123C] dark:text-rose-300">Tentang ekskul</p>
                <h2 class="mt-0.5 text-lg font-bold text-slate-800 dark:text-white">Deskripsi</h2>
              </div>
            </div>
            <p class="whitespace-pre-line text-sm leading-7 text-slate-600 dark:text-slate-300">
              {{ ekskulDetail.ekskul?.about || "Belum ada deskripsi." }}
            </p>
          </section>

          <!-- Section Kegiatan -->
          <section
            v-if="currentSection == 'Kegiatan'"
            class="flex flex-col gap-4 rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#1d1518] sm:p-6"
          >
            <div
              class="flex flex-col justify-between gap-3 border-b border-slate-100 pb-4 dark:border-white/10 sm:flex-row sm:items-center"
            >
              <h2 class="text-lg font-bold text-slate-800 dark:text-white">
                Daftar Kegiatan
              </h2>

              <!-- Filter Bulan & Tahun Kegiatan -->
              <div class="flex flex-wrap items-center gap-2">
                <select
                  v-model="filterMonth"
                  aria-label="Filter bulan kegiatan"
                  class="cursor-pointer rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700 outline-none transition hover:border-rose-300 focus:border-[#E0234E] focus:ring-2 focus:ring-rose-100 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:border-rose-400/50 dark:focus:ring-rose-950"
                >
                  <option value="">Semua Bulan</option>
                  <option
                    v-for="m in listMonths"
                    :key="m.value"
                    :value="m.value"
                  >
                    {{ m.name }}
                  </option>
                </select>
                <select
                  v-model="filterYear"
                  aria-label="Filter tahun kegiatan"
                  class="cursor-pointer rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700 outline-none transition hover:border-rose-300 focus:border-[#E0234E] focus:ring-2 focus:ring-rose-100 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:border-rose-400/50 dark:focus:ring-rose-950"
                >
                  <option value="">Semua Tahun</option>
                  <option value="2026">2026</option>
                  <option value="2025">2025</option>
                  <option value="2024">2024</option>
                </select>
              </div>
            </div>

            <div class="flex flex-col gap-4">
              <div
                v-for="kegiatan in filteredKegiatan"
                :key="kegiatan.id"
                class="group flex flex-col gap-4 rounded-2xl border border-slate-200/70 bg-white p-4 transition duration-200 hover:border-rose-200 hover:bg-rose-50/40 hover:shadow-sm dark:border-white/10 dark:bg-white/[0.02] dark:hover:border-rose-400/20 dark:hover:bg-rose-500/[0.07] sm:flex-row"
              >
                <img
                  :src="kegiatan.path"
                  :alt="kegiatan.title"
                  class="h-44 w-full rounded-xl object-cover shadow-sm sm:h-32 sm:w-1/3"
                />
                <div class="flex flex-col justify-between">
                  <div class="flex flex-col gap-1">
                    <span
                      class="flex items-center gap-1 text-xs font-medium text-slate-500 dark:text-slate-400"
                    >
                      <Icon icon="akar-icons:calendar" width="14" />
                      {{ formatDate(kegiatan.waktu) }}
                    </span>
                    <h3 class="text-base font-bold text-slate-800 transition-colors group-hover:text-[#BE123C] dark:text-slate-100 dark:group-hover:text-rose-300">
                      {{ kegiatan.title }}
                    </h3>
                    <p class="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                      {{ kegiatan.description }}
                    </p>
                  </div>
                </div>
              </div>
              <div
                v-if="filteredKegiatan.length === 0"
                class="rounded-xl border border-dashed border-slate-200 py-10 text-center text-sm text-slate-500 dark:border-white/10 dark:text-slate-400"
              >
                Tidak ada kegiatan pada periode yang dipilih.
              </div>
            </div>
          </section>

          <!-- Section Anggota -->
          <section
            v-if="currentSection == 'Anggota'"
            class="flex flex-col gap-4 overflow-hidden rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#1d1518] sm:p-6"
          >
            <div
              class="flex flex-col justify-between gap-3 border-b border-slate-100 pb-4 dark:border-white/10 sm:flex-row sm:items-center"
            >
              <div class="flex items-center gap-2">
                <h2 class="text-lg font-bold text-slate-800 dark:text-white">
                  Daftar Anggota
                </h2>
                <span
                  class="rounded-full bg-rose-50 px-2.5 py-1 text-xs font-semibold text-[#BE123C] dark:bg-rose-500/10 dark:text-rose-300"
                >
                  Total: {{ filteredMember.length }}
                </span>
              </div>

              <!-- Filter/Search Berdasarkan Nama atau NIS -->
              <div class="relative w-full sm:w-64">
                <span
                  class="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400"
                >
                  <Icon icon="akar-icons:search" width="14" />
                </span>
                <input
                  v-model="searchMemberQuery"
                  type="text"
                  placeholder="Cari nama atau NIS..."
                  aria-label="Cari anggota berdasarkan nama atau NIS"
                  class="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-xs text-slate-700 outline-none transition focus:border-[#E0234E] focus:bg-white focus:ring-2 focus:ring-rose-100 dark:border-white/10 dark:bg-white/5 dark:text-slate-100 dark:focus:bg-white/[0.08] dark:focus:ring-rose-950"
                />
              </div>
            </div>

            <div class="overflow-x-auto rounded-xl border border-slate-200/70 dark:border-white/10">
              <table class="w-full min-w-[620px] border-collapse text-left">
                <thead>
                  <tr
                    class="bg-rose-50 text-xs uppercase tracking-wider text-[#9F1239] dark:bg-white/[0.04] dark:text-rose-200"
                  >
                    <th class="py-3 px-4 text-center font-semibold w-16">No</th>
                    <th class="py-3 px-4 font-semibold">NIS</th>
                    <th class="py-3 px-4 font-semibold">Nama</th>
                    <th class="py-3 px-4 font-semibold">Role</th>
                    <th class="py-3 px-4 text-center font-semibold w-24">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 text-sm dark:divide-white/10">
                  <tr
                    v-for="(member, index) in filteredMember"
                    :key="member.id || index"
                    class="transition-colors hover:bg-rose-50/60 dark:hover:bg-rose-500/[0.07]"
                  >
                    <td
                      class="px-4 py-3.5 text-center font-medium text-slate-500 dark:text-slate-400"
                    >
                      {{ index + 1 }}
                    </td>
                    <td class="px-4 py-3.5 font-medium text-slate-600 dark:text-slate-300">
                      {{ member.nis }}
                    </td>
                    <td class="px-4 py-3.5 font-semibold text-slate-800 dark:text-slate-100">
                      {{ member.member_name }}
                    </td>
                    <td class="py-3.5 px-4">
                      <span
                        :class="[
                          'px-2.5 py-1 text-xs font-medium rounded-full inline-block',
                          member.role === 'Ketua'
                            ? 'border border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-300'
                            : 'bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-300',
                        ]"
                      >
                        {{ member.role }}
                      </span>
                    </td>
                    <td class="py-3.5 px-4 text-center">
                      <button
                        @click="
                          handleOpenModal(
                            member.member_name,
                            member.nis,
                            member.role,
                          )
                        "
                        class="cursor-pointer rounded-lg bg-rose-50 px-3 py-1.5 text-xs font-semibold text-[#9F1239] transition-colors hover:bg-rose-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300 dark:bg-rose-500/10 dark:text-rose-300 dark:hover:bg-rose-500/20"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                  <tr v-if="filteredMember.length === 0">
                    <td
                      colspan="5"
                      class="py-10 text-center text-sm text-slate-500 dark:text-slate-400"
                    >
                      Anggota tidak ditemukan.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <!-- Section Dokumentasi (Dummy) -->
          <section
            v-if="currentSection == 'Dokumentasi'"
            class="flex flex-col gap-4 rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#1d1518] sm:p-6"
          >
            <div class="border-b border-slate-100 pb-4 dark:border-white/10">
              <h2 class="text-lg font-bold text-slate-800 dark:text-white">
                Dokumentasi Kegiatan
              </h2>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div
                v-for="dokumentasi in listDokumentasi"
                :key="dokumentasi.id"
                class="group flex flex-col overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-rose-200 hover:shadow-md dark:border-white/10 dark:bg-white/[0.02] dark:hover:border-rose-400/20 dark:hover:shadow-black/20"
              >
                <img
                  :src="dokumentasi.path"
                  :alt="dokumentasi.title"
                  class="h-44 w-full object-cover transition duration-300 group-hover:scale-[1.02]"
                />
                <div class="flex flex-col gap-1 p-4">
                  <h3 class="text-sm font-bold text-slate-800 dark:text-slate-100">
                    {{ dokumentasi.title }}
                  </h3>
                  <span class="text-xs text-slate-500 dark:text-slate-400">{{
                    formatDate(dokumentasi.waktu)
                  }}</span>
                </div>
              </div>
            </div>
          </section>
        </template>
      </main>

      <!-- Sidebar -->
      <aside class="min-w-0">
        <div
          v-if="currentSection == 'About'"
          class="flex flex-col gap-4 lg:sticky lg:top-6"
        >
          <!-- Informasi Ekskul -->
          <div class="flex flex-col gap-4 rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#1d1518]">
            <h4
              class="border-b border-slate-100 pb-3 text-sm font-bold text-slate-800 dark:border-white/10 dark:text-white"
            >
              Informasi Ekskul
            </h4>

            <div class="flex flex-col gap-3.5 pt-1">
              <div class="flex items-start gap-3 rounded-xl p-2 transition-colors hover:bg-rose-50/60 dark:hover:bg-rose-500/[0.07]">
                <Icon
                  width="20"
                  class="mt-0.5 shrink-0 text-[#BE123C] dark:text-rose-300"
                  icon="lucide:tag"
                />
                <div class="text-sm">
                  <h5 class="text-xs text-slate-500 dark:text-slate-400">Kategori</h5>
                  <h5 class="mt-0.5 font-semibold text-slate-800 dark:text-slate-100">
                    {{ ekskulDetail.ekskul?.bidang || "-" }}
                  </h5>
                </div>
              </div>

              <div class="flex items-start gap-3 rounded-xl p-2 transition-colors hover:bg-rose-50/60 dark:hover:bg-rose-500/[0.07]">
                <Icon
                  width="20"
                  class="mt-0.5 shrink-0 text-[#BE123C] dark:text-rose-300"
                  icon="lucide:user-round"
                />
                <div class="text-sm">
                  <h5 class="text-xs text-slate-500 dark:text-slate-400">Pembina</h5>
                  <h5 class="mt-0.5 font-semibold text-slate-800 dark:text-slate-100">{{ pembina }}</h5>
                </div>
              </div>
            </div>
          </div>

          <!-- Informasi Ketua -->
          <div class="flex flex-col gap-3 rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#1d1518]">
            <div class="flex items-start gap-3 rounded-xl p-2 transition-colors hover:bg-rose-50/60 dark:hover:bg-rose-500/[0.07]">
              <Icon
                width="20"
                class="mt-0.5 shrink-0 text-[#BE123C] dark:text-rose-300"
                icon="lucide:crown"
              />
              <div class="text-sm">
                <h5 class="text-xs text-slate-500 dark:text-slate-400">Ketua Ekskul</h5>
                <h5 class="mt-0.5 font-semibold text-slate-800 dark:text-slate-100">{{ ketua }}</h5>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </div>
  </div>
  <MessageModal
    :open="Boolean(message)"
    :message="message"
    @close="message = ''"
  />
</template>
