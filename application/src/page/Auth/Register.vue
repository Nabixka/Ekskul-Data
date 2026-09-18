<script setup>
import { ref } from 'vue';
import { api } from '../../api';
import { useRouter } from 'vue-router';

const registerPayload = ref({
    name: '',
    nis: '',
    password: ''
})

const isLoading = ref(false)
const message = ref('')

const router = useRouter()

const handleLogin = async () => {
    isLoading.value = true
    message.value = ''

    try {
        const res = await api.post('/auth/register', registerPayload.value)
        localStorage.setItem('token', res.data.access_token)
        router.push('/dashboard')
    }
    catch (error) {
        message.value = error.response.data?.message || 'Terjadi Kesalahan Pada Server'
    }
    finally {
        isLoading.value = false
    }

}

</script>

<template>
    <section class="w-full min-h-screen flex flex-col lg:flex-row">
        <aside
            class="w-full lg:w-4/7 bg-linear-to-br from-[#1D4ED8] to-[#60A5FA] pb-3 lg:min-h-screen flex flex-col lg:flex-row items-center justify-center lg:pr-5">
            <!-- Logo -->
            <img class="w-40" src="/logo.png">
            <span class="flex flex-col gap-2">
                <h1 class="text-white text-3xl font-bold">Pelaporan Data Ekstrakurikuler</h1>
                <h5 class="text-white/90">Kelola data ekskul dengan lebih mudah, cepat, dan terorganisir</h5>
            </span>
        </aside>

        <main class="w-full lg:w-3/7 pt-25 lg:pt-0 bg-white lg:min-h-screen flex justify-center items-center flex-col p-5 gap-5">
            <div class="w-2/3 flex flex-col gap-5">
                <!-- Title -->
                <span class="flex flex-col gap-2">
                    <h3 class="text-3xl font-bold text-[#1D4ED8]">Buat Akun</h3>
                    <h5 class="text-[#60A5FA] font-semibold">Daftar untuk mulai menggunakan sistem pelaporan data ekskul
                    </h5>

                    <div v-if="message"
                        class="pl-2 py-2 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
                        {{ message }}
                    </div>
                </span>

                <!-- Form -->
                <form @submit.prevent="handleLogin" class="flex flex-col gap-5">

                    <!-- Nama -->
                    <div class="flex flex-col gap-1">
                        <label class="text-[#1D4ED8]">Nama Lengkap</label>
                        <input required v-model="registerPayload.name" class="py-2 p-2 border-2 border-gray-200 rounded-lg" type="text"
                            placeholder="Masukkan Nama Lengkap">
                    </div>

                    <!-- Nis -->
                    <div class="flex flex-col gap-1">
                        <label class="text-[#1D4ED8]">NIS</label>
                        <input required v-model="registerPayload.nis" class="py-2 p-2 border-2 border-gray-200 rounded-lg" type="text"
                            placeholder="Masukkan NIS">
                    </div>

                    <!-- Password -->
                    <div class="flex flex-col gap-1">
                        <label class="text-[#1D4ED8]">Password</label>
                        <input required v-model="registerPayload.password" class="py-2 p-2 border-2 border-gray-200 rounded-lg" type="password"
                            placeholder="Masukkan Password">
                    </div>

                    <button :disabled="isLoading"
                        :class="isLoading ? 'from-[#7fa5f5] to-[#007dc1] hover:cursor-progress' : 'hover:cursor-pointer from-[#1D4ED8] to-[#60A5FA]'"
                        class="text-white font-semibold bg-linear-to-br rounded-lg py-2">Login</button>
                </form>

                <!-- Register -->
                <span class="justify-center flex text-[#60A5FA] gap-1 items-center">Sudah punya akun?
                    <RouterLink 
                        to="/auth/login" class="text-[#1D4ED8] font-semibold">Login
                    </RouterLink>
                </span>
            </div>
        </main>

    </section>
</template>