<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { api } from '../../api';

const API_URL = import.meta.env.VITE_API_URL
const route = useRoute()

const ekskulDetail = ref({})

const isLoading = ref(true)
const message = ref('')

const id = route.params.id

const getDetail = async () => {
    isLoading.value = true
    message.value = ''
    try {
        const res = await api.get(`/ekskul/${id}`)
        ekskulDetail.value = res.data.data
    }
    catch (error) {
        message.value = error.response.data?.message || 'Terjadi Kesalahan Pada Server'
    }
    finally {
        isLoading.value = false
    }
}

const handleJoinEkskul = async () => {
    message.value = ''
    try{
        const res = await api.post(`/ekskul/${id}/join`)
        message.value = "Berhasil Join Ekskul"
        console.log("Berhasil Join")
    }
    catch(error){
        message.value = error.response.data?.message || 'Terjadi Kesalahan Pada Server'
    }
}

onMounted(() => {
    getDetail()
})
</script>

<template>
    <div class="w-full flex justify-end min-h-screen bg-slate-50">
        <div class="w-7/9 bg-slate-100 p-8 flex gap-6">

            <main class="w-5/6">

                <!-- Banner -->
                <header :style="{ backgroundImage: `url(${API_URL}${ekskulDetail.ekskul?.banner})` }"
                    class="p-6 rounded-2xl shadow-md text-white flex flex-col gap-1 bg-cover h-50">
                    <h3 class="text-white/80 font-bold text-2xl">{{ ekskulDetail.ekskul?.name }}</h3>
                    <span
                        class="bg-blue-50 text-blue-600 border border-blue-100 w-fit px-2.5 py-0.5 text-xs font-medium rounded-full">
                        {{ ekskulDetail.ekskul?.bidang }}
                    </span>
                </header>

            </main>

            <aside class="w-1/6">
                <button @click="handleJoinEkskul()" class="bg-linear-to-br from-[#1D4ED8] to-[#60A5FA] text-white w-full rounded-lg py-1 font-semibold">Join Ekskul</button>
            </aside>

        </div>
    </div>
</template>