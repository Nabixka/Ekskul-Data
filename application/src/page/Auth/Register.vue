<script setup>
import { ref } from 'vue';
import { api } from '../../api';
import { useRouter } from 'vue-router';
import MessageModal from '../../components/MessageModal.vue';

const registerPayload = ref({
    name: '',
    nis: '',
    password: '',
    kelas: '',
    jurusan: ''
})

const listKelas = ref(['X', 'XI', 'XII'])
const listJurusan = ref(['RPL', 'AKL 1', 'AKL 2', 'BDP', 'BR', 'MLOG', 'MP'])

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
            class="auth-panel w-full lg:w-4/7 pb-3 lg:min-h-screen flex flex-col lg:flex-row items-center justify-center lg:pr-5">
            <!-- Logo -->
            <img class="w-40" src="/logo.png">
            <span class="flex flex-col gap-2">
                <h1 class="text-[#9F1239] dark:text-[#FB7185] text-3xl font-bold">Pelaporan Data Ekstrakurikuler</h1>
                <h5 class="text-[#BE123C] dark:text-rose-200">Kelola data ekskul dengan lebih mudah, cepat, dan terorganisir</h5>
            </span>
        </aside>

        <main class="w-full lg:w-3/7 pt-25 lg:pt-0 bg-white lg:min-h-screen flex justify-center items-center flex-col p-5 gap-5">
            <div class="w-2/3 flex flex-col gap-5">
                <!-- Title -->
                <span class="flex flex-col gap-2">
                    <h3 class="text-3xl font-bold text-[#E0234E]">Buat Akun</h3>
                    <h5 class="text-[#B4234E] font-semibold">Daftar untuk mulai menggunakan sistem pelaporan data ekskul
                    </h5>

                </span>

                <!-- Form -->
                <form @submit.prevent="handleLogin" class="flex flex-col gap-5">

                    <!-- Nama -->
                    <div class="flex flex-col gap-1">
                        <label class="text-[#E0234E]">Nama Lengkap</label>
                        <input required v-model="registerPayload.name" class="py-2 p-2 border-2 border-gray-200 rounded-lg" type="text"
                            placeholder="Masukkan Nama Lengkap">
                    </div>

                    <!-- Nis -->
                    <div class="flex flex-col gap-1">
                        <label class="text-[#E0234E]">NIS</label>
                        <input required v-model="registerPayload.nis" class="py-2 p-2 border-2 border-gray-200 rounded-lg" type="text"
                            placeholder="Masukkan NIS">
                    </div>

                    <!-- Kelas -->
                    <div class="flex flex-col gap-1">
                        <label class="text-[#E0234E]">Kelas</label>
                        <div class="grid grid-cols-2 gap-5">
                            <select required v-model="registerPayload.kelas" class="py-2 p-2 border-2 border-gray-200 rounded-lg">
                                <option value="" disabled selected>Pilih Kelas</option>
                                <option v-for="kelas in listKelas" :key="kelas">{{ kelas }}</option>
                            </select>

                            <select required v-model="registerPayload.jurusan" class="py-2 p-2 border-2 border-gray-200 rounded-lg">
                                <option value="" disabled selected>Pilih Jurusan</option>
                                <option v-for="jurusan in listJurusan" :key="jurusan">{{ jurusan }}</option>
                            </select>
                        </div>
                    </div>

                    <!-- Password -->
                    <div class="flex flex-col gap-1">
                        <label class="text-[#E0234E]">Password</label>
                        <input required v-model="registerPayload.password" class="py-2 p-2 border-2 border-gray-200 rounded-lg" type="password"
                            placeholder="Masukkan Password">
                    </div>

                    <button :disabled="isLoading"
                        :class="isLoading ? 'from-[#fda4b8] to-[#9f1239] hover:cursor-progress' : 'hover:cursor-pointer from-[#F43F5E] to-[#D9387A]'"
                        class="text-white font-semibold bg-linear-to-br rounded-lg py-2">Login</button>
                </form>

                <!-- Register -->
                <span class="justify-center flex text-[#B4234E] gap-1 items-center">Sudah punya akun?
                    <RouterLink 
                        to="/auth/login" class="text-[#E0234E] font-semibold">Login
                    </RouterLink>
                </span>
            </div>
        </main>

    </section>
    <MessageModal :open="Boolean(message)" :message="message" @close="message = ''" />
</template>