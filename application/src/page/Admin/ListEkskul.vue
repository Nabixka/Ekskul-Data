<script setup>
import { ref, onMounted, computed } from "vue";
import { api } from "../../api";
import { Icon } from "@iconify/vue";
import { useRouter } from "vue-router";
import MessageModal from "../../components/MessageModal.vue";

const API_URL = import.meta.env.VITE_API_URL;
const router = useRouter();

const listBidang = ref([
  { name: "Ketuhanan", value: "Ketuhanan" },
  { name: "Bela Negara", value: "Bela Negara" },
  { name: "Teknologi", value: "Teknologi" },
  { name: "PJOK", value: "PJOK" },
  { name: "Seni", value: "Seni" },
  { name: "Pendidikan", value: "Pendidikan" },
]);

const listEkskul = ref([]);
const searchEkskul = ref("");
const selectedBidang = ref("");
const isLoading = ref(true);
const isSaving = ref(false);
const message = ref("");
const messageVariant = ref("error");
const editingEkskulId = ref(null);
const openActionId = ref(null);
const deleteTarget = ref(null);

const createEmptyForm = () => ({
  name: "",
  bidang: "",
  about: "",
  pembina: "",
  pelatih: "",
  bannerFile: null,
  bannerPreview: null,
});
const form = ref(createEmptyForm());
const isFormOpen = ref(false);

const getEkskul = async () => {
  isLoading.value = true;
  try {
    const res = await api.get("/ekskul");
    listEkskul.value = res.data.data;
  } catch (error) {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      router.push("/");
    }
    message.value =
      error.response?.data?.message || "Terjadi Kesalahan Pada Server";
  } finally {
    isLoading.value = false;
  }
};

const filteredEkskul = computed(() => {
  let result = listEkskul.value;

  if (searchEkskul.value.trim()) {
    const keyword = searchEkskul.value.trim().toLowerCase();
    result = result.filter((item) => item.name.toLowerCase().includes(keyword));
  }

  if (selectedBidang.value && selectedBidang.value != "") {
    const bidangFilter = selectedBidang.value.toLowerCase();
    result = result.filter((item) =>
      item.bidang.toLowerCase().includes(bidangFilter),
    );
  }

  return result;
});

const handleFileUpload = (e) => {
  const file = e.target.files[0];
  if (file) {
    if (form.value.bannerFile && form.value.bannerPreview) {
      URL.revokeObjectURL(form.value.bannerPreview);
    }
    form.value.bannerFile = file;

    form.value.bannerPreview = URL.createObjectURL(file);
  }
};

const openCreateModal = () => {
  if (form.value.bannerFile && form.value.bannerPreview) {
    URL.revokeObjectURL(form.value.bannerPreview);
  }
  editingEkskulId.value = null;
  form.value = createEmptyForm();
  isFormOpen.value = true;
};

const openEditModal = (ekskul) => {
  editingEkskulId.value = ekskul.id;
  form.value = {
    name: ekskul.name || "",
    bidang: ekskul.bidang || "",
    about: ekskul.about || "",
    pembina: ekskul.pembina || "",
    pelatih: ekskul.pelatih || "",
    bannerFile: null,
    bannerPreview: ekskul.banner ? `${API_URL}${ekskul.banner}` : null,
  };
  openActionId.value = null;
  isFormOpen.value = true;
};

const closeForm = (force = false) => {
  if (isSaving.value && !force) return;
  if (form.value.bannerFile && form.value.bannerPreview) {
    URL.revokeObjectURL(form.value.bannerPreview);
  }
  isFormOpen.value = false;
};

const handleSaveEkskul = async () => {
  if (!form.value.name.trim() || !form.value.bidang) {
    message.value = "Nama dan bidang ekskul wajib diisi.";
    messageVariant.value = "error";
    return;
  }
  if (!editingEkskulId.value && !form.value.bannerFile) {
    message.value = "Banner ekskul wajib diunggah.";
    messageVariant.value = "error";
    return;
  }

  isSaving.value = true;
  try {
    const formData = new FormData();
    formData.append("name", form.value.name.trim());
    formData.append("bidang", form.value.bidang);
    formData.append("about", form.value.about);
    formData.append("pembina", form.value.pembina);
    formData.append("pelatih", form.value.pelatih);
    if (form.value.bannerFile) formData.append("banner", form.value.bannerFile);

    if (editingEkskulId.value) {
      await api.put(`/ekskul/${editingEkskulId.value}`, formData);
      message.value = "Data ekskul berhasil diperbarui.";
    } else {
      await api.post("/ekskul", formData);
      message.value = "Ekskul berhasil ditambahkan.";
    }
    messageVariant.value = "success";
    closeForm(true);
    await getEkskul();
  } catch (error) {
    message.value =
      error.response?.data?.message || "Terjadi Kesalahan Pada Server";
    messageVariant.value = "error";
  } finally {
    isSaving.value = false;
  }
};

const handleDeleteEkskul = async () => {
  if (!deleteTarget.value) return;
  isSaving.value = true;
  try {
    await api.delete(`/ekskul/${deleteTarget.value.id}`);
    message.value = `Ekskul ${deleteTarget.value.name} berhasil dihapus.`;
    messageVariant.value = "success";
    deleteTarget.value = null;
    await getEkskul();
  } catch (error) {
    deleteTarget.value = null;
    message.value =
      error.response?.data?.message || "Gagal menghapus ekskul.";
    messageVariant.value = "error";
  } finally {
    isSaving.value = false;
  }
};

onMounted(() => {
  getEkskul();
});
</script>

<template>
  <!-- Modal -->
  <div v-if="isFormOpen" class="fixed inset-0 z-50 overflow-y-auto">
    <!-- Blur -->
    <div
      @click="closeForm"
      class="bg-black/30 backdrop-blur fixed inset-0 z-50"
    ></div>

    <!-- Card -->
    <div class="relative z-[51] flex min-h-screen items-center justify-center p-3">
      <div
        class="w-full max-w-xl overflow-hidden rounded-2xl shadow-xl"
      >
        <!-- Card Body -->
        <form @submit.prevent="handleSaveEkskul" class="max-h-[90vh] overflow-y-auto bg-white p-3 rounded-2xl">
          <!-- Header -->
          <div class="flex p-3 justify-between">
            <div>
              <h3 class="text-lg font-bold text-slate-800">
                {{ editingEkskulId ? "Edit Ekskul" : "Tambah Ekskul" }}
              </h3>
              <p class="mt-1 text-sm text-slate-500">
                Lengkapi informasi ekstrakurikuler.
              </p>
            </div>
            <button
              type="button"
              @click="closeForm"
              :disabled="isSaving"
              class="text-slate-400 hover:text-slate-600 transition-colors disabled:opacity-50"
              aria-label="Tutup modal"
            >
              <Icon icon="lucide:x" width="20" />
            </button>
          </div>

          <!-- FIll -->
          <div class="w-full p-3 flex flex-col gap-3">
            <!-- Nama Ekskul -->
            <div class="flex flex-col gap-1">
              <label class="text-sm font-semibold text-slate-700">Nama Ekskul</label>
              <input
                v-model="form.name"
                class="border border-slate-200 rounded-lg py-1 p-2"
                type="text"
                placeholder="Masukkan Nama Ekskul"
              />
            </div>

            <!-- Bidang Ekskul -->
            <div class="flex flex-col gap-1">
              <label class="text-sm font-semibold text-slate-700">Bidang Ekskul</label>
              <select
                v-model="form.bidang"
                class="border border-slate-200  rounded-lg py-1 p-2"
              >
                <option value="" disabled>Pilih Bidang</option>
                <option :value="bidang.value" v-for="bidang in listBidang">
                  {{ bidang.name }}
                </option>
              </select>
            </div>

            <div class="flex flex-col gap-1">
              <label class="text-sm font-semibold text-slate-700">Nama Pembina</label>
              <input
                v-model="form.pembina"
                class="border border-slate-200 rounded-lg py-1 p-2"
                type="text"
                placeholder="Masukkan Nama Pembina"
              />
            </div>

            <div class="flex flex-col gap-1">
              <label class="text-sm font-semibold text-slate-700">Nama Pelatih</label>
              <input
                v-model="form.pelatih"
                class="border border-slate-200 rounded-lg py-1 p-2"
                type="text"
                placeholder="Masukkan Nama Pelatih"
              />
            </div>

            <!-- Deksripsi Ekskul -->
            <div class="flex flex-col gap-1">
              <label class="text-sm font-semibold text-slate-700"
                >Deksripsi Ekskul</label
              >
              <textarea
                v-model="form.about"
                rows="3"
                cols="3"
                class="border border-slate-200  rounded-lg py-1 p-2"
                placeholder="Masukkan Deksripsi Ekskul"
              ></textarea>
            </div>

            <!-- Banner Ekskul -->
            <div class="flex flex-col gap-1">
              <label class="text-sm font-semibold text-slate-700"
                >Banner Ekskul</label
              >

              <div
                class="relative border-2 border-dashed border-slate-300 hover:border-nest-500 transition-colors p-4 rounded-xl bg-slate-50 hover:bg-nest-50/50 flex flex-col items-center justify-center cursor-pointer overflow-hidden group h-40"
              >
                <div
                  v-if="!form.bannerPreview"
                  class="flex flex-col items-center justify-center text-center gap-2"
                >
                  <div
                    class="p-3 bg-nest-100 text-nest-600 rounded-full group-hover:scale-110 transition-transform"
                  >
                    <Icon width="24" icon="akar-icons:image" />
                  </div>
                  <div>
                    <p class="text-xs font-semibold text-slate-700">
                      Klik untuk unggah banner
                    </p>
                    <p class="text-[10px] text-slate-400 mt-0.5">
                      PNG, JPG, atau JPEG (Maks. 2MB)
                    </p>
                  </div>
                </div>

                <div v-else class="absolute inset-0 w-full h-full">
                  <img
                    :src="form.bannerPreview"
                    class="w-full h-full object-cover"
                    alt="Preview Banner"
                  />
                  <div
                    class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-medium gap-1"
                  >
                    <Icon icon="lucide:refresh-cw" class="w-4 h-4" /> Ganti
                    Gambar
                  </div>
                </div>

                <input
                  type="file"
                  accept="image/png, image/jpeg, image/jpg"
                  @change="handleFileUpload"
                  class="absolute inset-0 opacity-0 cursor-pointer"
                  :required="!editingEkskulId"
                />
              </div>
            </div>
          </div>

          <!-- Button -->
          <div class="flex justify-end gap-3 p-3">
            <button
              type="button"
              @click="closeForm"
              class="border border-slate-200  px-5 py-1 rounded-lg"
              :disabled="isSaving"
            >
              Batal
            </button>
            <button
              class="bg-[#BE123C] hover:bg-[#9F1239] px-5 py-1 rounded-lg font-semibold text-white"
            >
              {{ isSaving ? "Menyimpan..." : editingEkskulId ? "Simpan Perubahan" : "Tambah" }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>

  <!-- Main -->
  <div class="w-full min-h-screen bg-slate-100">
    <main class="flex w-full flex-col gap-6 p-4 md:p-8 lg:w-4/5 lg:ml-auto">
      <!-- Header Section -->
      <header
        class="relative overflow-hidden rounded-2xl border border-rose-200/80 bg-gradient-to-br from-rose-50 via-[#FFF7F8] to-rose-100 p-6 text-rose-950 shadow-md dark:border-rose-950/20 dark:from-[#17080C] dark:via-[#281117] dark:to-[#421923] dark:text-white md:p-8"
      >
        <div
          class="pointer-events-none absolute -right-8 -top-16 h-56 w-56 rounded-full border-[32px] border-rose-500/10 dark:border-white/5"
        ></div>
        <div class="relative">
          <span class="text-sm font-medium text-rose-700 dark:text-white/80"
            >Halo,</span
          >
          <h1 class="text-2xl font-bold tracking-tight">
            Selamat Datang di Panel List Ekskul
          </h1>
          <p class="mt-1 text-sm text-rose-800/80 dark:text-white/80">
            Kelola daftar ekstrakurikuler dan pilih ekskul untuk melihat
            informasi lengkapnya.
          </p>
        </div>
      </header>

      <section class="flex flex-col gap-5">
        <!-- Title & Filter Container -->
        <div
          class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
        >
          <div>
            <h3 class="text-2xl font-bold text-slate-800">Daftar Ekskul</h3>
            <p class="text-sm text-slate-500">
              Pilih ekskul yang ingin Anda ketahui lebih dalam
            </p>
          </div>

          <!-- Filter Input -->
          <div class="flex flex-col gap-2 sm:flex-row">
            <select
              v-model="selectedBidang"
              class="px-3 py-2 bg-white border border-slate-200 shadow-sm rounded-xl"
            >
              <option value="">Semua</option>
              <option :value="bidang.value" v-for="bidang in listBidang">
                {{ bidang.name }}
              </option>
            </select>
            <div class="relative">
              <span
                class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400"
              >
                <Icon icon="lucide:search" class="w-4 h-4" />
              </span>
              <input
                v-model="searchEkskul"
                class="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-nest-500 focus:border-transparent transition shadow-sm"
                type="text"
                placeholder="Cari nama ekskul..."
              />
            </div>
            <button
              @click="openCreateModal"
              class="bg-[#BE123C] hover:bg-[#9F1239] rounded-xl border shadow-sm text-white font-bold border-slate-200 py-2 px-4 flex items-center text-sm gap-1 cursor-pointer"
            >
              <Icon icon="ant-design:plus-outlined" />Tambah Ekskul Baru
            </button>
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="isLoading" class="flex justify-center items-center py-20">
          <p class="text-slate-500 text-sm animate-pulse">
            Memuat data ekstrakurikuler...
          </p>
        </div>

        <!-- Empty State -->
        <div
          v-else-if="filteredEkskul.length === 0"
          class="flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-slate-200 shadow-sm gap-2"
        >
          <Icon icon="lucide:folder-search" class="w-10 h-10 text-slate-400" />
          <p class="text-slate-600 font-medium">Ekskul tidak ditemukan</p>
          <p class="text-slate-400 text-xs">
            Coba cari dengan kata kunci yang lain.
          </p>
        </div>

        <!-- Content Grid -->
        <div
          v-else
          class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <article
            v-for="list in filteredEkskul"
            :key="list.id"
            class="group relative overflow-visible rounded-2xl border border-slate-200/80 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl"
          >
            <button
              type="button"
              @click="router.push(`/admin/ekskul/${list.id}`)"
              class="flex w-full flex-col overflow-hidden rounded-2xl text-left"
            >
              <div class="relative h-44 w-full overflow-hidden bg-slate-100">
                <img
                  class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  :src="`${API_URL}${list.banner}`"
                  :alt="list.name"
                />
              </div>

              <div class="mt-auto flex items-center justify-between p-4">
                <div class="flex flex-col items-start gap-1">
                  <h4
                    class="text-base font-semibold text-slate-800 transition-colors group-hover:text-nest-600"
                  >
                    {{ list.name }}
                  </h4>
                  <span
                    class="w-fit rounded-full border border-nest-100 bg-nest-50 px-2.5 py-0.5 text-xs text-nest-600"
                  >
                    {{ list.bidang }}
                  </span>
                </div>
                <span
                  class="flex items-center justify-center rounded-full bg-nest-500 p-2 text-white shadow-sm transition-transform duration-200 group-hover:translate-x-1 group-hover:bg-nest-600"
                >
                  <Icon class="h-4 w-4" icon="grommet-icons:form-next" />
                </span>
              </div>
            </button>

            <div class="absolute right-3 top-3 z-10">
              <button
                type="button"
                :aria-label="`Aksi untuk ${list.name}`"
                :aria-expanded="openActionId === list.id"
                @click.stop="openActionId = openActionId === list.id ? null : list.id"
                class="rounded-lg bg-white/95 dark:bg-nest-500 p-2 text-slate-700 shadow transition hover:bg-white dark:hover:bg-nest-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
              >
                <Icon icon="lucide:ellipsis" width="20" />
              </button>
              <div
                v-if="openActionId === list.id"
                class="absolute right-0 mt-2 w-36 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-lg"
              >
                <button
                  type="button"
                  @click.stop="openEditModal(list)"
                  class="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-700 transition hover:bg-slate-100/80"
                >
                  <Icon icon="lucide:pencil" width="16" /> Edit
                </button>
                <button
                  type="button"
                  @click.stop="openActionId = null; deleteTarget = list"
                  class="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-rose-600 transition hover:bg-slate-100/80"
                >
                  <Icon icon="lucide:trash-2" width="16" /> Hapus
                </button>
              </div>
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
    @close="message = ''"
  />
  <MessageModal
    :open="Boolean(deleteTarget)"
    :message="`Yakin ingin menghapus ekskul ${deleteTarget?.name}? Tindakan ini tidak dapat dibatalkan.`"
    variant="confirm"
    confirm-label="Hapus"
    @close="deleteTarget = null"
    @confirm="handleDeleteEkskul"
  />
</template>
