<script setup>
import { computed, onMounted, ref } from "vue";
import { Icon } from "@iconify/vue";
import { api } from "../../api";
import { useRouter } from "vue-router";

const router = useRouter();
const years = ref([]);
const months = ref([]);
const ekskulFolders = ref([]);
const files = ref([]);
const selectedYearId = ref("");
const selectedMonthId = ref("");
const selectedEkskulId = ref("");
const loadingYears = ref(false);
const loadingMonths = ref(false);
const loadingEkskul = ref(false);
const loadingFiles = ref(false);
const errorMessage = ref("");

const selectedYear = computed(
  () => years.value.find((folder) => folder.id === selectedYearId.value)?.name,
);
const selectedMonth = computed(
  () => months.value.find((folder) => folder.id === selectedMonthId.value)?.name,
);
const selectedEkskul = computed(() =>
  ekskulFolders.value.find((folder) => folder.id === selectedEkskulId.value),
);

const handleError = (error) => {
  if (error.response?.status === 401) {
    localStorage.removeItem("token");
    localStorage.removeItem("is_admin");
    router.replace("/auth/login");
    return;
  }
  if (error.response?.status === 403) {
    router.replace("/dashboard");
    return;
  }
  errorMessage.value =
    error.response?.data?.message || "Gagal memuat data laporan dari Google Drive.";
};

const loadYears = async () => {
  loadingYears.value = true;
  errorMessage.value = "";
  try {
    const response = await api.get("/laporan/admin/years");
    years.value = response.data.data || [];
  } catch (error) {
    handleError(error);
  } finally {
    loadingYears.value = false;
  }
};

const loadMonths = async () => {
  selectedMonthId.value = "";
  selectedEkskulId.value = "";
  months.value = [];
  ekskulFolders.value = [];
  files.value = [];
  if (!selectedYear.value) return;

  loadingMonths.value = true;
  errorMessage.value = "";
  try {
    const response = await api.get(
      `/laporan/admin/years/${encodeURIComponent(selectedYear.value)}/months`,
    );
    months.value = response.data.data || [];
  } catch (error) {
    handleError(error);
  } finally {
    loadingMonths.value = false;
  }
};

const loadEkskulFolders = async () => {
  selectedEkskulId.value = "";
  ekskulFolders.value = [];
  files.value = [];
  if (!selectedYear.value || !selectedMonth.value) return;

  loadingEkskul.value = true;
  errorMessage.value = "";
  try {
    const response = await api.get(
      `/laporan/admin/years/${encodeURIComponent(selectedYear.value)}/months/${encodeURIComponent(selectedMonth.value)}/ekskul`,
    );
    ekskulFolders.value = response.data.data || [];
  } catch (error) {
    handleError(error);
  } finally {
    loadingEkskul.value = false;
  }
};

const loadFiles = async () => {
  files.value = [];
  if (!selectedYear.value || !selectedMonth.value || !selectedEkskulId.value) {
    return;
  }

  loadingFiles.value = true;
  errorMessage.value = "";
  try {
    const response = await api.get(
      `/laporan/admin/years/${encodeURIComponent(selectedYear.value)}/months/${encodeURIComponent(selectedMonth.value)}/ekskul/${encodeURIComponent(selectedEkskulId.value)}/files`,
    );
    files.value = response.data.data || [];
  } catch (error) {
    handleError(error);
  } finally {
    loadingFiles.value = false;
  }
};

const formatFileSize = (size) => {
  const bytes = Number(size);
  if (!Number.isFinite(bytes) || bytes < 0) return "Ukuran tidak tersedia";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const formatDate = (value) => {
  if (!value) return "Tanggal tidak tersedia";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Tanggal tidak tersedia";
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
};

const isLoading = computed(
  () =>
    loadingYears.value ||
    loadingMonths.value ||
    loadingEkskul.value ||
    loadingFiles.value,
);

onMounted(loadYears);
</script>

<template>
  <div class="min-h-screen w-full bg-slate-100">
    <main class="flex w-full flex-col gap-6 p-4 md:p-8 lg:ml-auto lg:w-4/5">
      <header
        class="relative overflow-hidden rounded-2xl border border-rose-200/80 bg-gradient-to-br from-rose-50 via-[#FFF7F8] to-rose-100 p-6 text-rose-950 shadow-md dark:border-rose-950/20 dark:from-[#17080C] dark:via-[#281117] dark:to-[#421923] dark:text-white md:p-8"
      >
        <div
          class="pointer-events-none absolute -right-8 -top-16 h-56 w-56 rounded-full border-[32px] border-rose-500/10 dark:border-white/5"
        ></div>
        <div class="relative">
          <span class="text-sm font-medium text-rose-700 dark:text-white/70">
            Google Drive · Administrasi ekstrakurikuler
          </span>
          <h1 class="mt-1 text-2xl font-bold tracking-tight md:text-3xl">
            Laporan Bulanan
          </h1>
          <p class="mt-2 max-w-2xl text-sm text-rose-800/80 dark:text-white/80">
            Telusuri laporan berdasarkan tahun, bulan, dan ekstrakurikuler.
            Pilih file untuk membukanya di Google Drive.
          </p>
        </div>
      </header>

      <section
        class="rounded-2xl border border-slate-200/60 bg-white p-5 shadow-sm md:p-6"
        aria-label="Pilih folder laporan"
      >
        <div class="mb-5 flex items-center gap-3">
          <div class="rounded-xl bg-rose-50 p-3 text-[#BE123C]">
            <Icon icon="lucide:folder-tree" width="22" />
          </div>
          <div>
            <h2 class="font-bold text-slate-800">Folder laporan</h2>
            <p class="text-sm text-slate-500">
              Pilih setiap tingkat folder untuk melihat file di Google Drive.
            </p>
          </div>
          <button
            type="button"
            @click="loadYears"
            :disabled="isLoading"
            class="ml-auto inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 transition hover:border-rose-300 hover:bg-rose-50/60 hover:text-[#BE123C] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300 disabled:cursor-wait disabled:opacity-50 dark:border-white/10 dark:text-slate-300 dark:hover:border-rose-400/30 dark:hover:bg-rose-500/[0.07] dark:hover:text-rose-200"
          >
            <Icon
              icon="lucide:refresh-cw"
              width="15"
              :class="isLoading ? 'animate-spin' : ''"
            />
            <span class="hidden sm:inline">Muat ulang</span>
          </button>
        </div>

        <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
          <label class="flex flex-col gap-1.5 text-sm font-semibold text-slate-600">
            Tahun
            <select
              v-model="selectedYearId"
              @change="loadMonths"
              :disabled="loadingYears || years.length === 0"
              class="rounded-xl border border-slate-200 bg-white px-3 py-2.5 font-normal text-slate-700 focus:border-[#E0234E] focus:outline-none focus:ring-2 focus:ring-[#E0234E]/15 disabled:bg-slate-50"
            >
              <option value="" disabled>Pilih tahun</option>
              <option v-for="year in years" :key="year.id" :value="year.id">
                {{ year.name }}
              </option>
            </select>
          </label>
          <label class="flex flex-col gap-1.5 text-sm font-semibold text-slate-600">
            Bulan
            <select
              v-model="selectedMonthId"
              @change="loadEkskulFolders"
              :disabled="!selectedYearId || loadingMonths || months.length === 0"
              class="rounded-xl border border-slate-200 bg-white px-3 py-2.5 font-normal text-slate-700 focus:border-[#E0234E] focus:outline-none focus:ring-2 focus:ring-[#E0234E]/15 disabled:bg-slate-50"
            >
              <option value="" disabled>Pilih bulan</option>
              <option v-for="month in months" :key="month.id" :value="month.id">
                {{ month.name }}
              </option>
            </select>
          </label>
          <label class="flex flex-col gap-1.5 text-sm font-semibold text-slate-600">
            Ekstrakurikuler
            <select
              v-model="selectedEkskulId"
              @change="loadFiles"
              :disabled="
                !selectedMonthId || loadingEkskul || ekskulFolders.length === 0
              "
              class="rounded-xl border border-slate-200 bg-white px-3 py-2.5 font-normal text-slate-700 focus:border-[#E0234E] focus:outline-none focus:ring-2 focus:ring-[#E0234E]/15 disabled:bg-slate-50"
            >
              <option value="" disabled>Pilih ekskul</option>
              <option
                v-for="folder in ekskulFolders"
                :key="folder.id"
                :value="folder.id"
              >
                {{ folder.name }}
              </option>
            </select>
          </label>
        </div>

        <nav
          class="mt-5 flex flex-wrap items-center gap-2 text-sm text-slate-500"
          aria-label="Lokasi folder"
        >
          <Icon icon="lucide:hard-drive" width="16" />
          <span>Pelaporan Data Bulanan Ekskul</span>
          <template v-if="selectedYear">
            <Icon icon="lucide:chevron-right" width="15" />
            <span>{{ selectedYear }}</span>
          </template>
          <template v-if="selectedMonth">
            <Icon icon="lucide:chevron-right" width="15" />
            <span>{{ selectedMonth }}</span>
          </template>
          <template v-if="selectedEkskul">
            <Icon icon="lucide:chevron-right" width="15" />
            <span class="font-semibold text-slate-700">
              {{ selectedEkskul.name }}
            </span>
          </template>
        </nav>
      </section>

      <div
        v-if="errorMessage"
        role="alert"
        class="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800"
      >
        <Icon icon="lucide:circle-alert" width="18" class="mt-0.5 shrink-0" />
        <span>{{ errorMessage }}</span>
      </div>

      <section
        class="overflow-hidden rounded-2xl border border-slate-200/60 bg-white shadow-sm"
        aria-live="polite"
      >
        <div
          class="flex items-center justify-between gap-3 border-b border-slate-100 p-5 md:p-6"
        >
          <div>
            <h2 class="font-bold text-slate-800">File laporan</h2>
            <p class="mt-1 text-sm text-slate-500">
              <template v-if="selectedEkskul">
                {{ selectedEkskul.name }} · {{ selectedMonth }} {{ selectedYear }}
              </template>
              <template v-else>Pilih folder ekskul untuk melihat file.</template>
            </p>
          </div>
          <span
            v-if="selectedEkskul && !loadingFiles"
            class="rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-[#9F1239]"
          >
            {{ files.length }} file
          </span>
        </div>

        <div
          v-if="isLoading"
          class="flex items-center justify-center gap-3 p-12 text-sm font-medium text-slate-500"
        >
          <Icon icon="lucide:loader-2" width="20" class="animate-spin text-[#E0234E]" />
          Memuat folder Google Drive...
        </div>
        <div
          v-else-if="!years.length && !errorMessage"
          class="flex flex-col items-center gap-2 p-12 text-center"
        >
          <Icon icon="lucide:folder-open" width="32" class="text-slate-400" />
          <h3 class="font-semibold text-slate-700">Belum ada laporan</h3>
          <p class="text-sm text-slate-500">
            Folder laporan akan muncul setelah laporan pertama diunggah.
          </p>
        </div>
        <div
          v-else-if="selectedEkskulId && files.length === 0"
          class="flex flex-col items-center gap-2 p-12 text-center"
        >
          <Icon icon="lucide:files" width="32" class="text-slate-400" />
          <h3 class="font-semibold text-slate-700">Belum ada file</h3>
          <p class="text-sm text-slate-500">
            Belum ada laporan di folder ekstrakurikuler ini.
          </p>
        </div>
        <div v-else-if="selectedEkskulId" class="divide-y divide-slate-100 dark:divide-slate-200/20">
          <article
            v-for="file in files"
            :key="file.id"
            class="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between md:px-6"
          >
            <div class="flex min-w-0 items-center gap-3">
              <div class="rounded-xl bg-rose-50 p-3 text-[#BE123C]">
                <Icon
                  :icon="
                    file.mimeType?.includes('spreadsheet') ||
                    file.mimeType?.includes('excel')
                      ? 'lucide:table-2'
                      : 'lucide:file-text'
                  "
                  width="20"
                />
              </div>
              <div class="min-w-0">
                <h3 class="break-all font-semibold text-slate-800">
                  {{ file.name }}
                </h3>
                <p class="mt-1 text-xs text-slate-500">
                  {{ formatFileSize(file.size) }}
                  <span aria-hidden="true">·</span>
                  {{ formatDate(file.modifiedTime) }}
                </p>
              </div>
            </div>
            <a
              v-if="file.webViewLink"
              :href="file.webViewLink"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-slate-200 px-3.5 py-2 text-sm font-semibold text-slate-700 transition hover:border-rose-200 hover:bg-rose-50 hover:text-[#9F1239]"
            >
              <Icon icon="lucide:external-link" width="16" />
              Buka di Drive
            </a>
            <span v-else class="text-xs text-slate-400">
              Tautan file tidak tersedia
            </span>
          </article>
        </div>
      </section>
    </main>
  </div>
</template>
