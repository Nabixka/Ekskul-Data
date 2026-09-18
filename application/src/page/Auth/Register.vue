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
    try {
        const res = await api.post('/auth/register', registerPayload.value)
            .then((response) => {
                localStorage.setItem('token', response.data.access_token)
            })
            .then((navigate) => {
                router.push('/dashboard')
            })
            .catch((error) => {
                console.log(error)
            })
        localStorage.setItem('token', res.data.access_token)
    }
    catch (error) {
    }
    finally {
        isLoading.value = false
    }
}

</script>

<template>
    <section class="w-full min-h-screen flex">
        <aside
            class="w-4/7 bg-linear-to-br from-[#1D4ED8] to-[#60A5FA] min-h-screen flex items-center justify-center pr-5">
            <!-- Logo -->
            <img class="w-40" src="/logo.png">
            <span class="flex flex-col gap-2">
                <h1 class="text-white text-3xl font-bold">Pelaporan Data Ekstrakurikuler</h1>
                <h5 class="text-white/90">Kelola data ekskul dengan lebih mudah, cepat, dan terorganisir</h5>
            </span>
        </aside>

        <main class="w-3/7 bg-white min-h-screen flex justify-center items-center flex-col p-5 gap-5">
            <div class="w-2/3 flex flex-col gap-5">
                <!-- Title -->
                <span class="flex flex-col gap-2">
                    <h3 class="text-3xl font-bold text-[#1D4ED8]">Buat Akun</h3>
                    <h5 class="text-[#60A5FA] font-semibold">Daftar untuk mulai menggunakan sistem pelaporan data ekskul
                    </h5>
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