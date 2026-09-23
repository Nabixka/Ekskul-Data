<script setup>
import { Icon } from '@iconify/vue';
import { onMounted, ref } from 'vue';
import { api } from '../../api';

const dashboardInformation = ref({})

const isLoading = ref(true)
const message = ref('')

const getDashboard = async () => {
    isLoading.value = true
    try {
        const res = await api.get('/user/admin/dashboard')
        dashboardInformation.value = res.data.data
    }
    catch (error) {
        message.value = error.response?.data?.message || 'Gagal Terhubung, Coba lagi nanti'
    }
    finally {
        isLoading.value = false
    }
}

onMounted(() => {
    getDashboard()
})
</script>

<template>
    <div class="w-full flex justify-end min-h-screen bg-slate-50">
        <div class="w-full lg:w-7/9 bg-slate-100 p-6 lg:p-8 flex flex-col gap-6">

            <!-- Header -->
            <div class="grid grid-cols-1 lg:grid-cols-4 w-full gap-4">
                <!-- Ekskul -->
                <div class="bg-white rounded-lg p-4 h-fit">
                    <h5 class="text-sm text-[#60A5FA]">Total Ekstrakurikuler</h5>
                    <div class="flex justify-between items-center">
                        <h3 class="text-4xl font-bold text-[#1D4ED8]">{{ dashboardInformation.ekskul }}</h3>
                        <div class="bg-blue-50 rounded-2xl p-3">
                            <Icon class="text-[#1D4ED8]" width="30" icon="akar-icons:folder" />
                        </div>
                    </div>
                </div>

                <div class="bg-white rounded-lg p-4 h-fit">
                    <h5 class="text-sm text-[#60A5FA]">Total Siswa</h5>
                    <div class="flex justify-between items-center">
                        <h3 class="text-4xl font-bold text-[#1D4ED8]">{{ dashboardInformation.member }}</h3>
                        <div class="bg-blue-50 rounded-2xl p-3">
                            <Icon class="text-[#1D4ED8]" width="30" icon="clarity:group-solid" />
                        </div>
                    </div>
                </div>

                <div class="bg-white rounded-lg p-4 h-fit">
                    <h5 class="text-sm text-[#60A5FA]">Total Kegiatan</h5>
                    <div class="flex justify-between items-center">
                        <h3 class="text-4xl font-bold text-[#1D4ED8]">{{ dashboardInformation.kegiatan }}</h3>
                        <div class="bg-blue-50 rounded-2xl p-3">
                            <Icon class="text-[#1D4ED8]" width="30" icon="akar-icons:calendar" />
                        </div>
                    </div>
                </div>

                <div class="bg-white rounded-lg p-4 h-fit">
                    <h5 class="text-sm text-[#60A5FA]">Total Dokumentasi</h5>
                    <div class="flex justify-between items-center">
                        <h3 class="text-4xl font-bold text-[#1D4ED8]">{{ dashboardInformation.dokumentasi }}</h3>
                        <div class="bg-blue-50 rounded-2xl p-3">
                            <Icon class="text-[#1D4ED8]" width="30" icon="akar-icons:image" />
                        </div>
                    </div>
                </div>
            </div>

            <!-- Main -->
            <main class="flex w-full gap-4">

                <!-- Left -->
                <div class="w-5/7 bg-white rounded-lg p-4">
                    <h3 class="text-[#1D4ED8] font-bold text-xl min-h-90">Pengajuan Tempat Ekskul</h3>
                    <div>
                        
                    </div>
                </div>

                <!-- Right -->
                <aside class="w-2/7 bg-white rounded-lg p-4">
                    <h3>Pengajuan Tempat Ekskul</h3>
                </aside>
            </main>
        </div>
    </div>
</template>