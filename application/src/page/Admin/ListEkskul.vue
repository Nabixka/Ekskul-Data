<script setup>
import { ref, onMounted, computed } from 'vue';
import { api } from '../../api';
import { Icon } from '@iconify/vue';
import { useRouter } from 'vue-router';

const API_URL = import.meta.env.VITE_API_URL
const router = useRouter()

const listBidang = ref([
    { name: "Ketuhanan", value: "Ketuhanan" },
    { name: "Bela Negara", value: "Bela Negara" },
    { name: "Teknologi", value: "Teknologi" },
    { name: "PJOK", value: "PJOK" },
    { name: "Seni", value: "Seni" },
    { name: "Pendidikan", value: "Pendidikan" }
])

const listEkskul = ref([])
const searchEkskul = ref('')
const selectedBidang = ref('')
const isLoading = ref(true)
const message = ref('')

const form = ref({
    name: '',
    bidang: '',
    bannerFile: null,
    bannerPreview: null
})

const modelCreate = ref(false)

const getEkskul = async () => {
    isLoading.value = true
    try {
        const res = await api.get('/ekskul')
        listEkskul.value = res.data.data
    }
    catch (error) {
        message.value = error.response?.data?.message || 'Terjadi Kesalahan Pada Server'
    }
    finally {
        isLoading.value = false
    }
}

const filteredEkskul = computed(() => {
    let result = listEkskul.value

    if (searchEkskul.value.trim()) {
        const keyword = searchEkskul.value.trim().toLowerCase()
        result = result.filter(item => item.name.toLowerCase().includes(keyword))
    }

    if (selectedBidang.value && selectedBidang.value != "") {
        const bidangFilter = selectedBidang.value.toLowerCase()
        result = result.filter(item => item.bidang.toLowerCase().includes(bidangFilter))
    }

    return result
})

const handleFileUpload = (e) => {
    const file = e.target.files[0]
    if(file){
        form.value.bannerFile = file

        form.value.bannerPreview = URL.createObjectURL(file)
    }
}

const handleCreateEkskul = async () => {
    isLoading.value = true
    try{
        const formData = new FormData
        formData.append('name', form.value.name)
        formData.append('bidang', form.value.bidang)
        formData.append('banner', form.value.bannerFile)

        const res = await api.post('/ekskul', formData)
        getEkskul()
    }
    catch(error){
        message.value = error.response.data?.message || "Terjadi Kesalahan Pada Server"
    }
    finally{
        isLoading.value = false
    }
}

onMounted(() => {
    getEkskul()
})

</script>

<template>
    <!-- Modal -->
    <div v-if="modelCreate" class="fixed z-50 min-h-screen w-full">
        <!-- Blur -->
        <div @click="modelCreate = false" class="bg-black/30 backdrop-blur w-full min-h-screen absolute z-50"></div>

        <!-- Card -->
        <div class="flex justify-center items-center min-h-screen">
            <div class="absolute z-51 rounded-lg overflow-hidden w-1/3">
                <!-- Card Header -->
                <div class="bg-[#1D4ED8] p-3">
                    <h3 class="text-white font-semibold">Form Tambah Ekskul</h3>
                </div>

                <!-- Card Body -->
                <form @submit.prevent="handleCreateEkskul()" class="bg-white">
                    <!-- FIll -->
                    <div class="w-full p-3 flex flex-col gap-3">

                        <!-- Nama Ekskul -->
                        <div class="flex flex-col gap-1">
                            <label class="font-semibold text-gray-400">Nama Ekskul</label>
                            <input v-model="form.name" class="border border-slate-400 rounded-lg py-1 p-2" type="text"
                                placeholder="Masukkan Nama Ekskul">
                        </div>

                        <!-- Bidang Ekskul -->
                        <div class="flex flex-col gap-1">
                            <label class="font-semibold text-gray-400">Bidang Ekskul</label>
                            <select v-model="form.bidang" class="border border-slate-400 rounded-lg py-1 p-2">
                                <option value="" disabled>Pilih Bidang</option>
                                <option :value="bidang.value" v-for="bidang in listBidang">{{ bidang.name }}</option>
                            </select>
                        </div>

                        <!-- Banner Ekskul -->
                        <div class="flex flex-col gap-1">
                            <label class="font-semibold text-gray-400 text-sm">Banner Ekskul</label>

                            <div
                                class="relative border-2 border-dashed border-slate-300 hover:border-blue-500 transition-colors p-4 rounded-xl bg-slate-50 hover:bg-blue-50/50 flex flex-col items-center justify-center cursor-pointer overflow-hidden group h-40">

                                <div v-if="!form.bannerPreview"
                                    class="flex flex-col items-center justify-center text-center gap-2">
                                    <div
                                        class="p-3 bg-blue-100 text-blue-600 rounded-full group-hover:scale-110 transition-transform">
                                        <Icon width="24" icon="akar-icons:image" />
                                    </div>
                                    <div>
                                        <p class="text-xs font-semibold text-slate-700">Klik untuk unggah banner</p>
                                        <p class="text-[10px] text-slate-400 mt-0.5">PNG, JPG, atau JPEG (Maks. 2MB)</p>
                                    </div>
                                </div>

                                <div v-else class="absolute inset-0 w-full h-full">
                                    <img :src="form.bannerPreview" class="w-full h-full object-cover"
                                        alt="Preview Banner" />
                                    <div
                                        class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-medium gap-1">
                                        <Icon icon="lucide:refresh-cw" class="w-4 h-4" /> Ganti Gambar
                                    </div>
                                </div>

                                <input type="file" accept="image/png, image/jpeg, image/jpg" @change="handleFileUpload"
                                    class="absolute inset-0 opacity-0 cursor-pointer">
                            </div>
                        </div>
                    </div>

                    <!-- Button -->
                    <div class="flex justify-end gap-3 p-3">
                        <button @click="modelCreate = false"
                            class="border border-slate-400 px-5 py-1 rounded-lg">Batal</button>
                        <button class="bg-[#1D4ED8] px-5 py-1 rounded-lg font-semibold text-white">Tambah</button>
                    </div>
                </form>
            </div>
        </div>
    </div>

    <!-- Main -->
    <div class="w-full flex justify-end min-h-screen bg-slate-50">
        <div class="lg:w-7/9 bg-slate-100 p-8 flex flex-col gap-6">

            <!-- Header Section -->
            <header
                class="bg-linear-to-br from-[#1D4ED8] to-[#60A5FA] p-6 rounded-2xl shadow-md text-white flex flex-col gap-1">
                <span class="text-white/80 text-sm font-medium">Halo,</span>
                <h1 class="font-bold text-2xl tracking-tight">Selamat Datang di Panel List Ekskul</h1>
                <p class="text-white/90 text-sm mt-1">
                    Kelola ekstrakurikuler yang ada, pendaftaran? pelaporan? pilih ekskul yang ingin dilihat.
                </p>
            </header>

            <main class="flex flex-col gap-5">
                <!-- Title & Filter Container -->
                <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h3 class="text-2xl font-bold text-slate-800">Daftar Ekskul</h3>
                        <p class="text-sm text-slate-500">Pilih ekskul yang ingin Anda ketahui lebih dalam</p>
                    </div>

                    <!-- Filter Input -->
                    <div class="flex gap-2">
                        <select v-model="selectedBidang"
                            class="px-3 py-2 bg-white border border-slate-200 shadow-sm rounded-xl">
                            <option value="">Semua</option>
                            <option :value="bidang.value" v-for="bidang in listBidang">{{ bidang.name }}</option>
                        </select>
                        <div class="relative">
                            <span
                                class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                                <Icon icon="lucide:search" class="w-4 h-4" />
                            </span>
                            <input v-model="searchEkskul"
                                class="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition shadow-sm"
                                type="text" placeholder="Cari nama ekskul...">
                        </div>
                        <button @click="modelCreate = true"
                            class="bg-white rounded-xl border shadow-sm text-slate-400 border-slate-200 py-2 px-4 flex items-center text-sm gap-1 hover:bg-slate-300/10 cursor-pointer">
                            <Icon icon="ant-design:plus-outlined" />Tambah Ekskul Baru
                        </button>
                    </div>
                </div>

                <!-- Loading State -->
                <div v-if="isLoading" class="flex justify-center items-center py-20">
                    <p class="text-slate-500 text-sm animate-pulse">Memuat data ekstrakurikuler...</p>
                </div>

                <!-- Error Message -->
                <div v-else-if="message" class="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl text-sm">
                    {{ message }}
                </div>

                <!-- Empty State -->
                <div v-else-if="filteredEkskul.length === 0"
                    class="flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-slate-200 shadow-sm gap-2">
                    <Icon icon="lucide:folder-search" class="w-10 h-10 text-slate-400" />
                    <p class="text-slate-600 font-medium">Ekskul tidak ditemukan</p>
                    <p class="text-slate-400 text-xs">Coba cari dengan kata kunci yang lain.</p>
                </div>

                <!-- Content Grid -->
                <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    <button @click="router.push(`/ekskul/${list.id}`)" v-for="list in filteredEkskul" :key="list.id"
                        class="group bg-white rounded-2xl overflow-hidden border border-slate-200/80 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col cursor-pointer">
                        <!-- Card Banner with Zoom Effect -->
                        <div class="w-full h-44 overflow-hidden relative bg-slate-100">
                            <img class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                :src="`${API_URL}${list.banner}`" :alt="list.name">
                        </div>

                        <!-- Card Detail -->
                        <div class="p-4 flex justify-between items-center mt-auto">
                            <!-- Left -->
                            <div class="flex flex-col gap-1.5">
                                <h4
                                    class="font-semibold text-slate-800 text-base group-hover:text-blue-600 transition-colors">
                                    {{ list.name }}
                                </h4>
                                <span
                                    class="bg-blue-50 text-blue-600 border border-blue-100 w-fit px-2.5 py-0.5 text-xs font-medium rounded-full">
                                    {{ list.bidang }}
                                </span>
                            </div>

                            <!-- Right -->
                            <div
                                class="bg-blue-500 group-hover:bg-blue-600 rounded-full p-2 text-white shadow-sm transition-transform group-hover:translate-x-1 duration-200 flex items-center justify-center">
                                <Icon class="w-4 h-4" icon="grommet-icons:form-next" />
                            </div>
                        </div>
                    </button>
                </div>
            </main>
        </div>
    </div>
</template>