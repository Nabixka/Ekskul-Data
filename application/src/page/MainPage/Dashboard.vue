<script setup>
import { onMounted, ref } from 'vue';
import { api } from '../../api';
import { Icon } from '@iconify/vue';

    const myProfil = ref({})

    const message = ref('')
    const isLoading = ref(true)

    const getProfil = async () => {
        isLoading.value = true
        try{
            const res = await api.get('/user/profile')
            myProfil.value = res.data.data
        }
        catch(error){
            message.value = error.response.data?.message || "Terjadi Kesalahan Pada Server"
        }
        finally{
            isLoading.value = false
        }
    }

    onMounted(() => {
        getProfil()
    })
</script>

<template>
    <div class="w-full flex justify-end min-h-screen bg-slate-50">
        <div class="lg:w-7/9 bg-slate-100 p-8 flex flex-col gap-6">

            <!-- Header Section -->
            <header
                class="bg-linear-to-br from-[#1D4ED8] to-[#60A5FA] p-6 rounded-2xl shadow-md text-white flex flex-col gap-1">
                <span class="text-white/80 text-sm font-medium bg-white/20 p-1 px-3 w-fit rounded-full">Selamat Datang <strong>{{ myProfil.name }}</strong></span>
                <h1 class="font-bold text-2xl tracking-tight">Jelajahi Potensi & Minatmu Bersama Kami</h1>
                <p class="text-white/90 text-sm mt-1">
                    Cari ekstrakurikuler yang ada dan temukan ekskul yang Anda minati untuk bergabung.
                </p>
            </header>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                <div v-for="l in 3" class="bg-white rounded-lg shadow-lg p-3 flex items-center gap-3">
                    <div class="rounded-lg overflow-hidden">
                        <Icon class="bg-[#60A5FA] text-[#1D4ED8]" width="40" icon="eva:checkmark-circle-fill" />
                    </div>
                    <span>
                        <h5 class="font-semibold">Ekskul Terdaftar</h5>
                        <h2 class="text-4xl font-bold">{{ myProfil.ekskul?.length }}</h2>
                    </span>
                </div>
            </div>
        </div>
    </div>
</template>