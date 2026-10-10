<script setup>
import { ref, onMounted } from "vue";
import { api } from "../../api";
import { useRouter } from "vue-router";
import MessageModal from "../../components/MessageModal.vue";

const nis = ref("");
const password = ref("");
const isLoading = ref(false);

const message = ref("");

const router = useRouter();

const handleLogin = async () => {
  isLoading.value = true;
  message.value = "";

  try {
    const res = await api.post("/auth/login", {
      nis: nis.value,
      password: password.value,
    });
    localStorage.setItem("token", res.data.access_token);
    localStorage.setItem("is_admin", String(res.data.is_admin === true));
    if (res.data.is_admin === true) {
      router.push("/admin/dashboard");
    } else {
      router.push("/dashboard");
    }
  } catch (error) {
    message.value =
      error.response.data?.message || "Terjadi Kesalahan Pada Sistem";
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  const token = localStorage.getItem("token");
  if (token) {
    router.push(
      localStorage.getItem("is_admin") === "true"
        ? "/admin/dashboard"
        : "/dashboard",
    );
  }
});
</script>

<template>
  <section class="w-full min-h-screen flex flex-col lg:flex-row">
    <aside
      class="auth-panel w-full lg:w-4/7 pb-3 lg:min-h-screen flex flex-col lg:flex-row items-center justify-center lg:pr-5"
    >
      <!-- Logo -->
      <img class="w-40" src="/logo.png" />
      <span class="flex flex-col gap-2 items-center">
        <h1
          class="text-[#9F1239] dark:text-[#FB7185] text-2xl lg:text-3xl font-bold"
        >
          Pelaporan Data Ekstrakurikuler
        </h1>
        <h5 class="text-[#BE123C] dark:text-rose-200">
          Kelola data ekskul dengan lebih mudah, cepat, dan terorganisir
        </h5>
      </span>
    </aside>

    <main
      class="w-full lg:w-3/7 pt-25 lg:pt-0 bg-white lg:min-h-screen flex justify-center items-center flex-col p-5 gap-5"
    >
      <div class="lg:w-2/3 flex flex-col gap-5">
        <!-- Title -->
        <span class="flex flex-col gap-2">
          <h3 class="text-3xl font-bold text-[#E0234E]">Selamat Datang</h3>
          <h5 class="text-[#B4234E] font-semibold">
            Masuk ke akun Anda untuk melanjutkan ke sistem Ekskul
          </h5>
        </span>

        <!-- Form -->
        <form @submit.prevent="handleLogin" class="flex flex-col gap-5">
          <!-- Nis -->
          <div class="flex flex-col gap-1">
            <label class="text-[#E0234E]">NIS</label>
            <input
              required
              v-model="nis"
              class="py-2 p-2 border-2 border-gray-200 rounded-lg"
              type="text"
              placeholder="Masukkan NIS"
            />
          </div>

          <!-- Password -->
          <div class="flex flex-col gap-1">
            <label class="text-[#E0234E]">Password</label>
            <input
              required
              v-model="password"
              class="py-2 p-2 border-2 border-gray-200 rounded-lg"
              type="text"
              placeholder="Masukkan Password"
            />
          </div>

          <button
            :disabled="isLoading"
            :class="
              isLoading
                ? 'from-[#fda4b8] to-[#9f1239] hover:cursor-progress'
                : 'hover:cursor-pointer from-[#F43F5E] to-[#D9387A]'
            "
            class="text-white font-semibold bg-linear-to-br rounded-lg py-2"
          >
            Login
          </button>
        </form>

        <!-- Register -->
        <!-- <span class="justify-center flex text-[#B4234E] gap-1 items-center"
          >Belum punya akun?
          <RouterLink
            to="/auth/register"
            class="text-[#E0234E] font-semibold hover:cursor-pointer"
            >Register
          </RouterLink>
        </span> -->
      </div>
    </main>
  </section>
  <MessageModal
    :open="Boolean(message)"
    :message="message"
    @close="message = ''"
  />
</template>
