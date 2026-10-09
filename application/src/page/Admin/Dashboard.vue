<script setup>
import { Icon } from "@iconify/vue";
import MessageModal from "../../components/MessageModal.vue";
import { onMounted, ref } from "vue";
import { api } from "../../api";

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
  <div class="w-full flex justify-end min-h-screen bg-slate-50">
    <main class="w-full lg:w-4/5 bg-slate-100 p-4 md:p-8 flex flex-col gap-6">
      <header
        class="relative overflow-hidden rounded-2xl border border-rose-950/20 bg-gradient-to-br from-[#17080C] via-[#281117] to-[#421923] p-6 text-white shadow-md md:p-8"
      >
        <div
          class="pointer-events-none absolute -right-8 -top-16 h-56 w-56 rounded-full border-[32px] border-white/5"
        ></div>
        <div class="relative">
          <h1 class="text-2xl font-bold tracking-tight md:text-3xl">
            Dashboard Admin
          </h1>
          <p class="mt-2 text-sm text-white/75">
            Ringkasan pengelolaan ekstrakurikuler dan kegiatan.
          </p>
        </div>
      </header>

      <section class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <!-- Ekskul -->
        <div
          class="h-fit rounded-2xl border border-slate-200/60 bg-white p-5 shadow-sm"
        >
          <h5 class="text-sm text-[#BE123C]">Total Ekstrakurikuler</h5>
          <div class="flex justify-between items-center">
            <h3 class="text-4xl font-bold text-[#E0234E]">
              {{ dashboardInformation.ekskul }}
            </h3>
            <div class="bg-blue-50 rounded-2xl p-3">
              <Icon
                class="text-[#E0234E]"
                width="30"
                icon="akar-icons:folder"
              />
            </div>
          </div>
        </div>

        <div
          class="h-fit rounded-2xl border border-slate-200/60 bg-white p-5 shadow-sm"
        >
          <h5 class="text-sm text-[#BE123C]">Total Siswa</h5>
          <div class="flex justify-between items-center">
            <h3 class="text-4xl font-bold text-[#E0234E]">
              {{ dashboardInformation.member }}
            </h3>
            <div class="bg-blue-50 rounded-2xl p-3">
              <Icon
                class="text-[#E0234E]"
                width="30"
                icon="clarity:group-solid"
              />
            </div>
          </div>
        </div>

        <div
          class="h-fit rounded-2xl border border-slate-200/60 bg-white p-5 shadow-sm"
        >
          <h5 class="text-sm text-[#BE123C]">Total Kegiatan</h5>
          <div class="flex justify-between items-center">
            <h3 class="text-4xl font-bold text-[#E0234E]">
              {{ dashboardInformation.kegiatan }}
            </h3>
            <div class="bg-blue-50 rounded-2xl p-3">
              <Icon
                class="text-[#E0234E]"
                width="30"
                icon="akar-icons:calendar"
              />
            </div>
          </div>
        </div>

        <div
          class="h-fit rounded-2xl border border-slate-200/60 bg-white p-5 shadow-sm"
        >
          <h5 class="text-sm text-[#BE123C]">Total Dokumentasi</h5>
          <div class="flex justify-between items-center">
            <h3 class="text-4xl font-bold text-[#E0234E]">
              {{ dashboardInformation.dokumentasi }}
            </h3>
            <div class="bg-blue-50 rounded-2xl p-3">
              <Icon class="text-[#E0234E]" width="30" icon="akar-icons:image" />
            </div>
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
