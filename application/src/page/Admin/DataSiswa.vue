<script setup>
import { computed, onMounted, ref } from "vue";
import { Icon } from "@iconify/vue";
import { api } from "../../api";
import MessageModal from "../../components/MessageModal.vue";

const studentGroups = ref({});
const searchQuery = ref("");
const selectedClass = ref("");
const isLoading = ref(true);
const isCopying = ref(false);
const isUploadModalOpen = ref(false);
const isUploading = ref(false);
const selectedFile = ref(null);
const message = ref("");
const messageVariant = ref("error");

const fetchStudentData = async () => {
  isLoading.value = true;
  message.value = "";
  try {
    const res = await api.get("/admin/data-siswa");
    const data = res.data?.data;
    if (!data || typeof data !== "object" || Array.isArray(data)) {
      throw new Error("Format data siswa tidak sesuai.");
    }

    for (const majors of Object.values(data)) {
      if (!majors || typeof majors !== "object" || Array.isArray(majors)) {
        throw new Error("Format data siswa tidak sesuai.");
      }
      for (const students of Object.values(majors)) {
        if (
          !Array.isArray(students) ||
          students.some(
            (student) =>
              !student || typeof student !== "object" || Array.isArray(student),
          )
        ) {
          throw new Error("Format data siswa tidak sesuai.");
        }
      }
    }

    studentGroups.value = data;
    return true;
  } catch (error) {
    studentGroups.value = {};
    message.value =
      error.response?.data?.message ||
      error.message ||
      "Gagal memuat data siswa.";
    return false;
  } finally {
    isLoading.value = false;
  }
};

const handleFileSelection = (event) => {
  const file = event.target.files?.[0];
  if (!file) return;

  if (!file.name.toLowerCase().endsWith(".xlsx")) {
    selectedFile.value = null;
    messageVariant.value = "error";
    message.value = "Gunakan file template Excel dengan format .xlsx.";
    event.target.value = "";
    return;
  }

  selectedFile.value = file;
  message.value = "";
};

const uploadStudentTemplate = async () => {
  if (!selectedFile.value) {
    messageVariant.value = "error";
    message.value = "Pilih file template Excel terlebih dahulu.";
    return;
  }

  const formData = new FormData();
  formData.append("file", selectedFile.value);
  isUploading.value = true;
  message.value = "";

  try {
    await api.post("/admin/data-siswa", formData);
    isUploadModalOpen.value = false;
    selectedFile.value = null;
    const refreshed = await fetchStudentData();
    if (refreshed) {
      messageVariant.value = "success";
      message.value = "Data siswa berhasil diunggah.";
    }
  } catch (error) {
    messageVariant.value = "error";
    message.value =
      error.response?.data?.message || "Gagal mengunggah template siswa.";
  } finally {
    isUploading.value = false;
  }
};

const students = computed(() =>
  Object.entries(studentGroups.value).flatMap(([grade, majors]) =>
    Object.entries(majors).flatMap(([major, members]) =>
      members.map((student) => ({
        ...student,
        kelas: student.kelas || grade,
        jurusan: student.jurusan || major,
      })),
    ),
  ),
);

const classOptions = computed(() => [
  ...new Map(
    students.value.map((student) => {
      const value = `${student.kelas}|||${student.jurusan}`;
      return [value, { value, label: `${student.kelas} ${student.jurusan}` }];
    }),
  ).values(),
]);

const filteredStudents = computed(() => {
  const keyword = searchQuery.value.trim().toLocaleLowerCase("id");
  return students.value.filter((student) => {
    const matchesClass =
      !selectedClass.value ||
      `${student.kelas}|||${student.jurusan}` === selectedClass.value;
    const searchableText = [
      student.nis,
      student.murid_name,
      student.kelas,
      student.jurusan,
      student.ekskul,
    ]
      .join(" ")
      .toLocaleLowerCase("id");
    return matchesClass && (!keyword || searchableText.includes(keyword));
  });
});

const numberOfClasses = computed(() =>
  Object.values(studentGroups.value).reduce(
    (total, majors) => total + Object.keys(majors).length,
    0,
  ),
);

const copyStudentData = async () => {
  const groupedStudents = new Map();
  for (const student of filteredStudents.value) {
    const className = `${student.kelas} ${student.jurusan}`.trim();
    if (!groupedStudents.has(className)) groupedStudents.set(className, []);
    groupedStudents.get(className).push(student);
  }

  const content = [...groupedStudents.entries()]
    .map(([className, members]) =>
      [
        className,
        ...members.map(
          (student, index) =>
            `${index + 1}. ${student.murid_name} : ${student.ekskul || "—"}`,
        ),
      ].join("\n"),
    )
    .join("\n\n");

  isCopying.value = true;
  try {
    if (!navigator.clipboard?.writeText) {
      throw new Error(
        "Fitur salin tidak tersedia. Gunakan browser dengan dukungan clipboard.",
      );
    }
    await navigator.clipboard.writeText(content);
    messageVariant.value = "success";
    message.value = "Data siswa berhasil disalin.";
  } catch (error) {
    messageVariant.value = "error";
    message.value = error.message || "Gagal menyalin data siswa.";
  } finally {
    isCopying.value = false;
  }
};

onMounted(fetchStudentData);
</script>

<template>
  <!-- upload modal -->
  <div
    v-if="isUploadModalOpen"
    class="fixed inset-0 z-[90] flex items-center justify-center overflow-y-auto bg-slate-950/60 p-4 backdrop-blur-sm"
    @click.self="!isUploading && (isUploadModalOpen = false)"
  >
    <section
      role="dialog"
      aria-modal="true"
      aria-labelledby="student-upload-title"
      class="my-auto w-full max-w-3xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-white/10 dark:bg-[#1d1518]"
    >
      <header
        class="flex items-start justify-between gap-4 border-b border-slate-100 p-5 dark:border-white/10 sm:p-6"
      >
        <div>
          <p
            class="text-xs font-bold uppercase tracking-[0.16em] text-[#BE123C] dark:text-rose-300"
          >
            Kelola data siswa
          </p>
          <h2
            id="student-upload-title"
            class="mt-1 text-xl font-bold text-slate-900 dark:text-white"
          >
            Input siswa dengan template
          </h2>
          <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Unduh format resmi, isi data siswa, lalu unggah kembali file Excel.
          </p>
        </div>
        <button
          type="button"
          aria-label="Tutup modal"
          :disabled="isUploading"
          @click="isUploadModalOpen = false"
          class="rounded-xl p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 disabled:cursor-not-allowed disabled:opacity-50 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-white"
        >
          <Icon icon="lucide:x" width="20" />
        </button>
      </header>

      <form @submit.prevent="uploadStudentTemplate">
        <div class="grid gap-4 p-5 sm:grid-cols-2 sm:p-6">
          <article
            class="flex flex-col rounded-2xl border border-rose-200/80 bg-rose-50/60 p-5 dark:border-rose-400/15 dark:bg-rose-500/[0.06]"
          >
            <span
              class="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-[#BE123C] shadow-sm dark:bg-white/10 dark:text-rose-300"
            >
              <Icon icon="lucide:download" width="21" />
            </span>
            <h3 class="mt-4 font-bold text-slate-800 dark:text-slate-100">
              1. Unduh template
            </h3>
            <p
              class="mt-1 flex-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300"
            >
              Isi kolom NIS, password, nama, kelas, dan jurusan sesuai format
              yang tersedia.
            </p>
            <a
              href="/data_siswa.xlsx"
              download
              class="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-rose-200 bg-white px-4 py-2 text-sm font-semibold text-[#9F1239] transition hover:border-rose-300 hover:bg-rose-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300 dark:border-white/10 dark:bg-white/5 dark:text-rose-200 dark:hover:bg-rose-500/10"
            >
              <Icon icon="lucide:file-spreadsheet" width="18" />
              Download template
            </a>
          </article>

          <article
            class="flex flex-col rounded-2xl border border-slate-200 bg-slate-50/70 p-5 dark:border-white/10 dark:bg-white/[0.03]"
          >
            <span
              class="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-slate-600 shadow-sm dark:bg-white/10 dark:text-slate-200"
            >
              <Icon icon="lucide:upload" width="21" />
            </span>
            <h3 class="mt-4 font-bold text-slate-800 dark:text-slate-100">
              2. Upload template
            </h3>
            <p
              class="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300"
            >
              Pilih file Excel berformat .xlsx yang sudah diisi.
            </p>
            <label
              class="mt-4 flex min-h-24 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white px-4 py-3 text-center transition hover:border-rose-300 hover:bg-rose-50/60 dark:border-white/15 dark:bg-white/[0.03] dark:hover:border-rose-400/40 dark:hover:bg-rose-500/[0.06]"
            >
              <Icon
                icon="lucide:file-up"
                width="20"
                class="text-slate-500 dark:text-slate-300"
              />
              <span
                class="mt-1 max-w-full truncate text-sm font-semibold text-slate-700 dark:text-slate-200"
              >
                {{ selectedFile?.name || "Pilih file Excel" }}
              </span>
              <span class="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                {{ selectedFile ? "File siap diunggah" : "Format .xlsx" }}
              </span>
              <input
                type="file"
                accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                class="sr-only"
                @change="handleFileSelection"
              />
            </label>
            <button
              type="submit"
              :disabled="!selectedFile || isUploading"
              class="mt-3 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#BE123C] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#9F1239] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:focus-visible:ring-offset-[#1d1518]"
            >
              <Icon
                :icon="isUploading ? 'lucide:loader-circle' : 'lucide:upload'"
                width="17"
                :class="{ 'animate-spin': isUploading }"
              />
              {{ isUploading ? "Mengunggah..." : "Upload data siswa" }}
            </button>
          </article>
        </div>
        <footer
          class="flex justify-end border-t border-slate-100 bg-slate-50/80 px-5 py-4 dark:border-white/10 dark:bg-white/[0.02] sm:px-6"
        >
          <button
            type="button"
            :disabled="isUploading"
            @click="isUploadModalOpen = false"
            class="rounded-xl px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-200/70 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white"
          >
            Tutup
          </button>
        </footer>
      </form>
    </section>
  </div>

  <div class="w-full flex min-h-screen justify-end bg-slate-50">
    <main class="flex w-full flex-col gap-6 bg-slate-100 p-4 md:p-8 lg:w-4/5">
      <header
        class="relative overflow-hidden rounded-2xl border border-rose-200/80 bg-gradient-to-br from-rose-50 via-[#FFF7F8] to-rose-100 p-6 text-rose-950 shadow-md dark:border-rose-950/20 dark:from-[#17080C] dark:via-[#281117] dark:to-[#421923] dark:text-white md:p-8"
      >
        <div
          class="pointer-events-none absolute -right-8 -top-16 h-56 w-56 rounded-full border-[32px] border-rose-500/10 dark:border-white/5"
        ></div>
        <div class="relative">
          <p class="text-sm font-medium text-rose-700 dark:text-white/70">
            Admin
          </p>
          <h1 class="mt-1 text-2xl font-bold tracking-tight md:text-3xl">
            Data Siswa
          </h1>
          <p class="mt-2 text-sm text-rose-800/80 dark:text-white/75">
            Lihat daftar siswa beserta kelas, jurusan, dan ekstrakurikuler yang
            diikuti.
          </p>
        </div>
      </header>

      <section class="grid gap-4 sm:grid-cols-2">
        <article
          class="group rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-rose-200 hover:shadow-md dark:border-white/10 dark:bg-[#1d1518] dark:hover:border-rose-400/20 dark:hover:shadow-black/20"
        >
          <div class="flex items-center justify-between gap-4">
            <div>
              <p class="text-sm font-medium text-slate-500 dark:text-slate-400">
                Total siswa
              </p>
              <p class="mt-1 text-3xl font-bold text-slate-800 dark:text-white">
                {{ students.length }}
              </p>
            </div>
            <span
              class="rounded-xl bg-rose-50 p-3 text-[#BE123C] transition-colors group-hover:bg-rose-100 dark:bg-rose-500/10 dark:text-rose-300 dark:group-hover:bg-rose-500/20"
            >
              <Icon icon="lucide:users" width="24" />
            </span>
          </div>
        </article>
        <article
          class="group rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-rose-200 hover:shadow-md dark:border-white/10 dark:bg-[#1d1518] dark:hover:border-rose-400/20 dark:hover:shadow-black/20"
        >
          <div class="flex items-center justify-between gap-4">
            <div>
              <p class="text-sm font-medium text-slate-500 dark:text-slate-400">
                Total kelas / jurusan
              </p>
              <p class="mt-1 text-3xl font-bold text-slate-800 dark:text-white">
                {{ numberOfClasses }}
              </p>
            </div>
            <span
              class="rounded-xl bg-rose-50 p-3 text-[#BE123C] transition-colors group-hover:bg-rose-100 dark:bg-rose-500/10 dark:text-rose-300 dark:group-hover:bg-rose-500/20"
            >
              <Icon icon="lucide:school" width="24" />
            </span>
          </div>
        </article>
      </section>

      <section
        class="overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-sm dark:border-white/10 dark:bg-[#1d1518]"
      >
        <div
          class="flex flex-col gap-5 border-b border-slate-100 p-5 dark:border-white/10 md:p-6 xl:flex-row xl:items-end xl:justify-between"
        >
          <div>
            <h2 class="text-lg font-bold text-slate-800 dark:text-white">
              Daftar siswa dan ekstrakurikuler
            </h2>
            <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Cari berdasarkan nama, NIS, kelas, jurusan, atau ekstrakurikuler.
            </p>
          </div>

          <div class="flex flex-col gap-3 xl:items-end">
            <div class="flex flex-col gap-2 md:flex-row md:justify-end">
              <button
                type="button"
                @click="isUploadModalOpen = true"
                class="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-[#BE123C] px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#9F1239] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300"
              >
                <Icon icon="lucide:user-round-plus" width="16" />
                Input siswa
              </button>
              <button
                type="button"
                @click="copyStudentData"
                :disabled="
                  isLoading || isCopying || filteredStudents.length === 0
                "
                class="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-[#BE123C] px-3 py-2 text-sm font-semibold text-white transition hover:bg-[#9F1239] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Icon
                  :icon="isCopying ? 'lucide:loader-circle' : 'lucide:copy'"
                  width="16"
                  :class="{ 'animate-spin': isCopying }"
                />
                {{ isCopying ? "Menyalin..." : "Salin data" }}
              </button>
              <button
                type="button"
                @click="fetchStudentData"
                :disabled="isLoading"
                class="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 transition hover:border-rose-300 hover:bg-rose-50/60 hover:text-[#BE123C] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300 disabled:cursor-wait disabled:opacity-50 dark:border-white/10 dark:text-slate-300 dark:hover:border-rose-400/30 dark:hover:bg-rose-500/[0.07] dark:hover:text-rose-200"
              >
                <Icon
                  icon="lucide:refresh-cw"
                  width="16"
                  :class="{ 'animate-spin': isLoading }"
                />
                Muat ulang
              </button>
            </div>
            <div class="flex flex-col gap-2 sm:flex-row">
              <label class="sr-only" for="student-class"
                >Filter kelas dan jurusan</label
              >
              <select
                id="student-class"
                v-model="selectedClass"
                class="min-h-10 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm outline-none transition hover:border-rose-300 focus:border-rose-400 focus:ring-2 focus:ring-rose-100 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:border-rose-400/30 dark:focus:ring-rose-950"
              >
                <option value="">Semua kelas / jurusan</option>
                <option
                  v-for="classOption in classOptions"
                  :key="classOption.value"
                  :value="classOption.value"
                >
                  {{ classOption.label }}
                </option>
              </select>
              <label class="relative">
                <span class="sr-only">Cari data siswa</span>
                <Icon
                  icon="lucide:search"
                  width="16"
                  class="pointer-events-none absolute inset-y-0 left-3 my-auto text-slate-400"
                />
                <input
                  v-model="searchQuery"
                  type="search"
                  placeholder="Cari data siswa..."
                  class="min-h-10 w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-700 shadow-sm outline-none transition placeholder:text-slate-400 hover:border-rose-300 focus:border-rose-400 focus:ring-2 focus:ring-rose-100 dark:border-white/10 dark:bg-white/5 dark:text-slate-100 dark:hover:border-rose-400/30 dark:focus:ring-rose-950 sm:w-56"
                />
              </label>
            </div>
          </div>
        </div>

        <div
          v-if="isLoading"
          class="flex items-center justify-center gap-2 p-12 text-sm text-slate-500 dark:text-slate-400"
        >
          <Icon icon="lucide:loader-circle" width="18" class="animate-spin" />
          Memuat data siswa...
        </div>
        <div
          v-else-if="filteredStudents.length === 0"
          class="p-12 text-center text-sm text-slate-500 dark:text-slate-400"
        >
          {{
            students.length
              ? "Data siswa tidak ditemukan. Coba ubah kata kunci atau filter kelas."
              : "Belum ada data siswa."
          }}
        </div>
        <div v-else class="overflow-x-auto">
          <table class="w-full min-w-[720px] text-left text-sm">
            <thead
              class="bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:bg-white/[0.04] dark:text-slate-300"
            >
              <tr>
                <th scope="col" class="px-5 py-3 font-semibold">NIS</th>
                <th scope="col" class="px-5 py-3 font-semibold">Nama siswa</th>
                <th scope="col" class="px-5 py-3 font-semibold">Kelas</th>
                <th scope="col" class="px-5 py-3 font-semibold">Jurusan</th>
                <th scope="col" class="px-5 py-3 font-semibold">
                  Ekstrakurikuler
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-200 dark:divide-white/10">
              <tr
                v-for="(student, index) in filteredStudents"
                :key="`${student.nis}-${student.kelas}-${student.jurusan}-${index}`"
                class="transition-colors hover:bg-rose-50/60 dark:hover:bg-rose-500/[0.07]"
              >
                <td
                  class="whitespace-nowrap px-5 py-4 font-medium text-slate-600 dark:text-slate-300"
                >
                  {{ student.nis }}
                </td>
                <td
                  class="whitespace-nowrap px-5 py-4 font-semibold text-slate-800 dark:text-slate-100"
                >
                  {{ student.murid_name }}
                </td>
                <td class="px-5 py-4">
                  <span
                    class="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600 dark:bg-white/10 dark:text-slate-300"
                  >
                    {{ student.kelas }}
                  </span>
                </td>
                <td
                  class="whitespace-nowrap px-5 py-4 text-slate-600 dark:text-slate-300"
                >
                  {{ student.jurusan }}
                </td>
                <td class="px-5 py-4 text-slate-600 dark:text-slate-300">
                  {{ student.ekskul || "—" }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <footer
          v-if="!isLoading && filteredStudents.length > 0"
          class="border-t border-slate-100 px-5 py-3 text-xs text-slate-500 dark:border-white/10 dark:text-slate-400"
        >
          Menampilkan {{ filteredStudents.length }} dari
          {{ students.length }} siswa
        </footer>
      </section>
    </main>
  </div>
  <MessageModal
    :open="Boolean(message)"
    :message="message"
    :variant="messageVariant"
    @close="((message = ''), (messageVariant = 'error'))"
  />
</template>
