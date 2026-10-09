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
  } catch (error) {
    studentGroups.value = {};
    message.value =
      error.response?.data?.message ||
      error.message ||
      "Gagal memuat data siswa.";
  } finally {
    isLoading.value = false;
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
            Data Siswa
          </h1>
          <p class="mt-2 text-sm text-white/75">
            Lihat daftar siswa beserta kelas, jurusan, dan ekstrakurikuler yang
            diikuti.
          </p>
        </div>
      </header>

      <section class="grid gap-4 sm:grid-cols-2">
        <article
          class="rounded-2xl border border-slate-200/60 bg-white p-5 shadow-sm"
        >
          <div class="flex items-center justify-between gap-4">
            <div>
              <p class="text-sm font-medium text-slate-500">Total siswa</p>
              <p class="mt-1 text-3xl font-bold text-slate-800">
                {{ students.length }}
              </p>
            </div>
            <span class="rounded-xl bg-rose-50 p-3 text-[#BE123C]">
              <Icon icon="lucide:users" width="24" />
            </span>
          </div>
        </article>
        <article
          class="rounded-2xl border border-slate-200/60 bg-white p-5 shadow-sm"
        >
          <div class="flex items-center justify-between gap-4">
            <div>
              <p class="text-sm font-medium text-slate-500">
                Total kelas / jurusan
              </p>
              <p class="mt-1 text-3xl font-bold text-slate-800">
                {{ numberOfClasses }}
              </p>
            </div>
            <span class="rounded-xl bg-rose-50 p-3 text-[#BE123C]">
              <Icon icon="lucide:school" width="24" />
            </span>
          </div>
        </article>
      </section>

      <section
        class="overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-sm"
      >
        <div
          class="flex flex-col gap-4 border-b border-slate-100 p-5 md:flex-row md:items-end md:justify-between md:p-6"
        >
          <div>
            <h2 class="text-lg font-bold text-slate-800">
              Daftar siswa dan ekstrakurikuler
            </h2>
            <p class="mt-1 text-sm text-slate-500">
              Cari berdasarkan nama, NIS, kelas, jurusan, atau ekstrakurikuler.
            </p>
          </div>

          <div class="flex flex-col gap-2">
            <div class="gap-3 grid grid-cols-2 md:justify-end">
              <button
                type="button"
                @click="copyStudentData"
                :disabled="
                  isLoading || isCopying || filteredStudents.length === 0
                "
                class="inline-flex items-center justify-center gap-2 rounded-xl bg-[#BE123C] px-3 py-2 text-sm font-semibold text-white transition hover:bg-[#9F1239] disabled:cursor-not-allowed disabled:opacity-50"
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
                class="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 transition hover:border-rose-200 hover:text-[#BE123C] disabled:cursor-wait disabled:opacity-50"
              >
                <Icon
                  icon="lucide:refresh-cw"
                  width="16"
                  :class="{ 'animate-spin': isLoading }"
                />
                Muat ulang
              </button>
            </div>
            <div class="flex flex-col md:flex-row gap-3">
              <label class="sr-only" for="student-class"
                >Filter kelas dan jurusan</label
              >
              <select
                id="student-class"
                v-model="selectedClass"
                class="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-100"
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
                  class="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm shadow-sm focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-100 sm:w-56"
                />
              </label>
            </div>
          </div>
        </div>

        <div
          v-if="isLoading"
          class="flex items-center justify-center gap-2 p-12 text-sm text-slate-500"
        >
          <Icon icon="lucide:loader-circle" width="18" class="animate-spin" />
          Memuat data siswa...
        </div>
        <div
          v-else-if="filteredStudents.length === 0"
          class="p-12 text-center text-sm text-slate-500"
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
              class="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"
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
            <tbody class="divide-y divide-slate-200 dark:divide-slate-200/10">
              <tr
                v-for="(student, index) in filteredStudents"
                :key="`${student.nis}-${student.kelas}-${student.jurusan}-${index}`"
                class="transition hover:bg-rose-50/40"
              >
                <td
                  class="whitespace-nowrap px-5 py-4 font-medium text-slate-600"
                >
                  {{ student.nis }}
                </td>
                <td
                  class="whitespace-nowrap px-5 py-4 font-semibold text-slate-800"
                >
                  {{ student.murid_name }}
                </td>
                <td class="px-5 py-4">
                  <span
                    class="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600"
                  >
                    {{ student.kelas }}
                  </span>
                </td>
                <td class="whitespace-nowrap px-5 py-4 text-slate-600">
                  {{ student.jurusan }}
                </td>
                <td class="px-5 py-4 text-slate-600">
                  {{ student.ekskul || "—" }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <footer
          v-if="!isLoading && filteredStudents.length > 0"
          class="border-t border-slate-100 px-5 py-3 text-xs text-slate-500"
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
