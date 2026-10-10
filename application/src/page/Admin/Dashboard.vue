<script setup>
import { Icon } from "@iconify/vue";
import MessageModal from "../../components/MessageModal.vue";
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { api } from "../../api";

const router = useRouter();
const dashboardInformation = ref({});
const isLoading = ref(true);
const message = ref("");

const getDashboard = async () => {
  isLoading.value = true;
  message.value = "";
  try {
    const res = await api.get("/admin/dashboard");
    dashboardInformation.value = res.data.data;
  } catch (error) {
    const status = error.response?.status;

    if (status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("is_admin");
      router.replace("/auth/login");
      return;
    }

    if (status === 403) {
      router.replace(
        localStorage.getItem("is_admin") === "true"
          ? "/admin/dashboard"
          : "/dashboard",
      );
      return;
    }

    message.value =
      error.response?.data?.message || "Gagal Terhubung, Coba lagi nanti";
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  getDashboard();
});
</script>

<template>
  <div class="w-full flex min-h-screen justify-end bg-slate-50">
    <main class="flex w-full flex-col gap-6 bg-slate-100 p-4 md:p-8 lg:w-4/5">
      <header
        class="relative overflow-hidden rounded-2xl border border-rose-200/80 bg-gradient-to-br from-rose-50 via-[#FFF7F8] to-rose-100 p-6 text-rose-950 shadow-md dark:border-rose-950/20 dark:from-[#17080C] dark:via-[#281117] dark:to-[#421923] dark:text-white md:p-8"
      >
        <div
          class="pointer-events-none absolute -right-8 -top-16 h-56 w-56 rounded-full border-[32px] border-rose-500/10 dark:border-white/5"
        ></div>
        <div
          class="relative flex flex-col gap-6 md:flex-row md:items-end md:justify-between"
        >
          <div>
            <span
              class="inline-flex items-center gap-2 rounded-full border border-rose-200/80 bg-white/60 px-3 py-1 text-xs font-semibold text-[#9F1239] backdrop-blur-sm dark:border-white/10 dark:bg-white/5 dark:text-rose-200"
            >
              <Icon icon="lucide:layout-dashboard" width="14" />
              Pusat administrasi
            </span>
            <h1 class="mt-4 text-3xl font-bold tracking-tight md:text-4xl">
              Dashboard Admin
            </h1>
            <p
              class="mt-2 max-w-xl text-sm leading-relaxed text-rose-800/80 dark:text-white/75 md:text-base"
            >
              Pantau aktivitas ekstrakurikuler dan kelola data sekolah dari satu
              tempat.
            </p>
          </div>
        </div>
      </header>

      <section aria-label="Statistik dashboard">
        <div class="mb-4 flex items-end justify-between gap-4">
          <div>
            <p
              class="text-xs font-bold uppercase tracking-[0.16em] text-[#BE123C] dark:text-rose-300"
            >
              Sekilas aktivitas
            </p>
            <h2 class="mt-1 text-lg font-bold text-slate-900 dark:text-white">
              Ringkasan sekolah
            </h2>
          </div>
          <span
            class="hidden items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400 sm:inline-flex"
          >
            <span
              class="h-2 w-2 rounded-full bg-emerald-500 ring-4 ring-emerald-500/10"
            ></span>
            Data terbaru
          </span>
        </div>

        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 2xl:grid-cols-4">
          <article
            v-for="stat in [
              {
                label: 'Ekstrakurikuler',
                key: 'ekskul',
                description: 'Program aktif',
                icon: 'lucide:folder-kanban',
              },
              {
                label: 'Siswa',
                key: 'member',
                description: 'Terdaftar di sekolah',
                icon: 'lucide:users-round',
              },
              {
                label: 'Kegiatan',
                key: 'kegiatan',
                description: 'Agenda tercatat',
                icon: 'lucide:calendar-days',
              },
              {
                label: 'Dokumentasi',
                key: 'dokumentasi',
                description: 'Foto kegiatan',
                icon: 'lucide:images',
              },
            ]"
            :key="stat.key"
            class="group relative overflow-hidden rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-rose-200 hover:shadow-lg hover:shadow-rose-950/5 dark:border-white/10 dark:bg-[#1d1518] dark:hover:border-rose-400/20 dark:hover:shadow-black/20"
          >
            <div
              class="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-rose-300 to-[#BE123C] opacity-70 transition-opacity group-hover:opacity-100 dark:from-rose-500/40 dark:to-rose-400"
            ></div>
            <div class="flex items-start justify-between gap-4">
              <div>
                <p
                  class="text-sm font-semibold text-slate-600 dark:text-slate-300"
                >
                  Total {{ stat.label }}
                </p>
                <div
                  v-if="isLoading"
                  class="mt-3 h-10 w-20 animate-pulse rounded-lg bg-slate-200 dark:bg-white/10"
                ></div>
                <p
                  v-else
                  class="mt-2 text-4xl font-bold tracking-tight text-slate-900 dark:text-white"
                >
                  {{ dashboardInformation[stat.key] ?? 0 }}
                </p>
                <p
                  class="mt-2 text-xs font-medium text-slate-500 dark:text-slate-400"
                >
                  {{ stat.description }}
                </p>
              </div>
              <span
                class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-rose-50 text-[#BE123C] transition duration-200 group-hover:scale-105 group-hover:bg-rose-100 dark:bg-rose-500/10 dark:text-rose-300 dark:group-hover:bg-rose-500/20"
              >
                <Icon :icon="stat.icon" width="23" />
              </span>
            </div>
          </article>
        </div>
      </section>

      <section
        aria-label="Akses cepat"
        class="overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-sm dark:border-white/10 dark:bg-[#1d1518]"
      >
        <div class="p-5 md:p-6">
          <div>
            <p
              class="text-xs font-bold uppercase tracking-[0.16em] text-[#BE123C] dark:text-rose-300"
            >
              Akses cepat
            </p>
            <h2 class="mt-1 text-lg font-bold text-slate-900 dark:text-white">
              Lanjutkan pengelolaan
            </h2>
            <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Buka bagian administrasi yang ingin Anda kelola.
            </p>
          </div>

          <div class="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            <button
              type="button"
              @click="router.push('/admin/list-ekskul')"
              class="group flex items-center gap-4 rounded-2xl border border-slate-200/80 p-4 text-left transition duration-200 hover:border-rose-200 hover:bg-rose-50/60 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300 dark:border-white/10 dark:hover:border-rose-400/20 dark:hover:bg-rose-500/[0.06]"
            >
              <span
                class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-[#BE123C] transition group-hover:bg-rose-100 dark:bg-rose-500/10 dark:text-rose-300 dark:group-hover:bg-rose-500/20"
              >
                <Icon icon="lucide:folder-kanban" width="21" />
              </span>
              <span class="min-w-0 flex-1">
                <span
                  class="block text-sm font-bold text-slate-800 dark:text-slate-100"
                  >Daftar ekskul</span
                >
                <span
                  class="mt-0.5 block text-xs text-slate-500 dark:text-slate-400"
                  >Atur program dan informasi ekskul</span
                >
              </span>
              <Icon
                icon="lucide:arrow-up-right"
                width="17"
                class="text-slate-400 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[#BE123C] dark:group-hover:text-rose-300"
              />
            </button>

            <button
              type="button"
              @click="router.push('/admin/data-siswa')"
              class="group flex items-center gap-4 rounded-2xl border border-slate-200/80 p-4 text-left transition duration-200 hover:border-rose-200 hover:bg-rose-50/60 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300 dark:border-white/10 dark:hover:border-rose-400/20 dark:hover:bg-rose-500/[0.06]"
            >
              <span
                class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-[#BE123C] transition group-hover:bg-rose-100 dark:bg-rose-500/10 dark:text-rose-300 dark:group-hover:bg-rose-500/20"
              >
                <Icon icon="lucide:users-round" width="21" />
              </span>
              <span class="min-w-0 flex-1">
                <span
                  class="block text-sm font-bold text-slate-800 dark:text-slate-100"
                  >Data siswa</span
                >
                <span
                  class="mt-0.5 block text-xs text-slate-500 dark:text-slate-400"
                  >Cari dan perbarui data siswa</span
                >
              </span>
              <Icon
                icon="lucide:arrow-up-right"
                width="17"
                class="text-slate-400 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[#BE123C] dark:group-hover:text-rose-300"
              />
            </button>

            <button
              type="button"
              @click="router.push('/admin/laporan-bulanan')"
              class="group flex items-center gap-4 rounded-2xl border border-slate-200/80 p-4 text-left transition duration-200 hover:border-rose-200 hover:bg-rose-50/60 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300 dark:border-white/10 dark:hover:border-rose-400/20 dark:hover:bg-rose-500/[0.06]"
            >
              <span
                class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-[#BE123C] transition group-hover:bg-rose-100 dark:bg-rose-500/10 dark:text-rose-300 dark:group-hover:bg-rose-500/20"
              >
                <Icon icon="lucide:files" width="21" />
              </span>
              <span class="min-w-0 flex-1">
                <span
                  class="block text-sm font-bold text-slate-800 dark:text-slate-100"
                  >Laporan bulanan</span
                >
                <span
                  class="mt-0.5 block text-xs text-slate-500 dark:text-slate-400"
                  >Tinjau administrasi setiap ekskul</span
                >
              </span>
              <Icon
                icon="lucide:arrow-up-right"
                width="17"
                class="text-slate-400 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[#BE123C] dark:group-hover:text-rose-300"
              />
            </button>
          </div>
        </div>
      </section>
    </main>
  </div>
  <MessageModal
    :open="Boolean(message)"
    :message="message"
    @close="message = ''"
  />
</template>
