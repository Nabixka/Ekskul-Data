<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { api } from '../../api';
import { Icon } from '@iconify/vue';
import { formatDate } from '../../helper';

// Global Config
const API_URL = import.meta.env.VITE_API_URL
const route = useRoute()

// Ref Data Fetch
const ekskulDetail = ref({})
const listMember = ref([])
const listKegiatan = ref([])
const listDokumentasi = ref([])

// Help Fetch
const modalRole = ref(false)
const isLoading = ref(true)
const message = ref('')

// Filter Search Member
const searchMemberQuery = ref('')

// Filter Kegiatan
const filterMonth = ref('')
const filterYear = ref('')
const listMonths = [
    { value: '01', name: 'Januari' },
    { value: '02', name: 'Februari' },
    { value: '03', name: 'Maret' },
    { value: '04', name: 'April' },
    { value: '05', name: 'Mei' },
    { value: '06', name: 'Juni' },
    { value: '07', name: 'Juli' },
    { value: '08', name: 'Agustus' },
    { value: '09', name: 'September' },
    { value: '10', name: 'Oktober' },
    { value: '11', name: 'November' },
    { value: '12', name: 'Desember' }
]

// Computed Filter Member
const filteredMember = computed(() => {
    if (!searchMemberQuery.value) return listMember.value
    const query = searchMemberQuery.value.toLowerCase()
    return listMember.value.filter(member => 
        member.member_name?.toLowerCase().includes(query) || 
        member.nis?.toString().includes(query)
    )
})

// Computed Filter Kegiatan
const filteredKegiatan = computed(() => {
    return listKegiatan.value.filter(kegiatan => {
        if (!kegiatan.waktu) return true
        const dateObj = new Date(kegiatan.waktu)
        const itemMonth = String(dateObj.getMonth() + 1).padStart(2, '0')
        const itemYear = String(dateObj.getFullYear())

        const matchMonth = filterMonth.value ? itemMonth === filterMonth.value : true
        const matchYear = filterYear.value ? itemYear === filterYear.value : true

        return matchMonth && matchYear
    })
})

// Nama Ketua/Pembina
const ketua = computed(() => {
    if (!ekskulDetail.value.member) return '-'
    const ketuaName = ekskulDetail.value.member.filter(item => item.role === 'Ketua')
    return ketuaName.length > 0 ? ketuaName[0].name : '-'
})
const pembina = computed(() => {
    if (!ekskulDetail.value.member) return '-'
    const filterPembina = ekskulDetail.value.member.filter(item => item.role === 'Pembina')

    if (filterPembina.length === 0) return '-'

    return filterPembina.map(e => e.name).join(', ')
})

// Ref Section
const currentSection = ref('About')
const listSection = ref([
    { name: 'About' },
    { name: 'Kegiatan' },
    { name: 'Anggota' },
    { name: 'Dokumentasi' }
])
const handleChangeSection = (section) => {
    currentSection.value = section
    if(section == 'Anggota') getMember()
    if(section == 'Kegiatan') getKegiatan()
    if(section == 'Dokumentasi') getDokumentasi()   
}

// Update Role Anggota
const listRole = ref([
    { name: 'Ketua'},
    { name: 'Wakil Ketua'},
    { name: 'Sekretaris'},
    { name: 'Humas'},
    { name: 'Bendahara'},
    { name: 'Member' }
])
const updateData = ref({
    name: '',
    nis: null,
    role: ''
})
const handleOpenModal = (name, nis, role) => {
    updateData.value.name = name
    updateData.value.nis = nis
    updateData.value.role = role

    modalRole.value = true
}
const handleChangeRole = async () => {
    isLoading.value = true
    message.value = ''
    try{
        await api.put('/user/change-role', {
            ekskul: id, 
            nis: updateData.value.nis, 
            incomingRole: updateData.value.role
        })

        getMember()
    }
    catch(error){
        message.value = error.response?.data?.message || 'Gagal Terhubung, Coba lagi nanti'
    }
    finally{
        isLoading.value = false
        modalRole.value = false
    }
}

// Ekskul Id
const id = route.params.id

// Fetch Detail Ekskul
const getDetail = async () => {
    isLoading.value = true
    message.value = ''
    try {
        const res = await api.get(`/ekskul/${id}`)
        ekskulDetail.value = res.data.data
    }
    catch (error) {
        if(error.response == 401){
            localStorage.removeItem('token')
            router.push('/')
        }
        message.value = error.response?.data?.message || 'Terjadi Kesalahan Pada Server'
    }
    finally {
        isLoading.value = false
    }
}

// Fetch Member
const getMember = async () => {
    message.value = ''
    try{
        const res = await api.get(`/ekskul/${id}/member`)
        listMember.value = res.data.data
    }
    catch(error){
        message.value = error.response?.data?.message || 'Gagal Terhubung, Coba lagi nanti'
    }
    finally{
        isLoading.value = false
    }
}

// Fetch Kegiatan
const getKegiatan = async () => {
    message.value = ''
    try{
        const res = await api.get(`/kegiatan/ekskul/${id}`)
        listKegiatan.value = res.data.data
    }
    catch(error){
        message.value = error.response?.data?.message || 'Gagal Terhubung, Coba lagi nanti'
    }
    finally{
        isLoading.value = false
    }
}

// Fetch Dokumentasi
const getDokumentasi = async () => {
    message.value = ''
    try{
        const res = await api.get(`/dokumentasi/ekskul/${id}`)
        listDokumentasi.value = res.data.data
    }
    catch(error){
        message.value = error.response?.data?.message || 'Gagal Terhubung, Coba lagi nanti'
    }
    finally{
        isLoading.value = false
    }
}

onMounted(() => {
    getDetail()
})

</script>

<template>

    <!-- Modal -->
    <div v-if="modalRole" class="fixed inset-0 z-50 flex items-center justify-center">
        <!-- Blur Backdrop -->
        <div @click="modalRole = false" class="bg-black/30 backdrop-blur-sm inset-0 absolute z-10"></div>

        <!-- Card Container -->
        <div class="relative z-20 w-11/12 sm:w-1/2 lg:w-1/3 bg-white rounded-xl shadow-xl overflow-hidden">
            <!-- Card Header -->
            <div class="bg-[#1D4ED8] p-4 flex justify-between items-center">
                <h3 class="text-white font-semibold text-lg">Edit Role Anggota</h3>
                <button @click="modalRole = false" class="text-white/80 hover:text-white cursor-pointer">
                    <Icon width="20" icon="akar-icons:cross" />
                </button>
            </div>

            <!-- Card Body -->
            <form @submit.prevent="handleChangeRole()">
                <div class="w-full p-5 flex flex-col gap-4">

                    <!-- Nama Anggota -->
                    <div class="flex flex-col gap-1.5">
                        <label class="font-semibold text-xs text-slate-500 uppercase tracking-wider">Nama Anggota</label>
                        <input disabled class="border border-slate-200 bg-slate-50 text-slate-700 rounded-lg py-2 px-3 text-sm" type="text"
                            :value="updateData.name">
                    </div>

                    <!-- NIS -->
                    <div class="flex flex-col gap-1.5">
                        <label class="font-semibold text-xs text-slate-500 uppercase tracking-wider">NIS</label>
                        <input disabled class="border border-slate-200 bg-slate-50 text-slate-700 rounded-lg py-2 px-3 text-sm" type="text"
                            :value="updateData.nis">
                    </div>

                    <!-- Role Dropdown -->
                    <div class="flex flex-col gap-1.5">
                        <label class="font-semibold text-xs text-slate-500 uppercase tracking-wider">Pilih Role Baru</label>
                        <select v-model="updateData.role" class="border border-slate-300 focus:border-[#1D4ED8] focus:ring-1 focus:ring-[#1D4ED8] outline-none rounded-lg py-2 px-3 text-sm bg-white cursor-pointer">
                            <option value="" disabled>Pilih Role</option>
                            <option :value="roleItem.name" v-for="roleItem in listRole" :key="roleItem.name">
                                {{ roleItem.name }}
                            </option>
                        </select>
                    </div>

                </div>

                <!-- Button Actions -->
                <div class="flex justify-end gap-3 p-4 bg-slate-50 border-t border-slate-100">
                    <button type="button" @click="modalRole = false"
                        class="border border-slate-300 hover:bg-slate-100 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer">
                        Batal
                    </button>
                    <button type="submit" class="bg-[#1D4ED8] hover:bg-blue-700 px-5 py-2 rounded-lg text-sm font-semibold text-white transition-colors cursor-pointer">
                        Simpan
                    </button>
                </div>
            </form>
        </div>
    </div>

    
    <div class="w-full flex justify-end min-h-screen bg-slate-50">
        <div class="w-full lg:w-7/9 bg-slate-100 p-6 lg:p-8 flex flex-col lg:flex-row gap-6">

            <!-- Main Content -->
            <main class="w-full lg:w-5/7 flex flex-col gap-5">

                <!-- Error State -->
                <div v-if="message"
                    class="w-full p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                    {{ message }}
                </div>

                <!-- Skeleton Loading State -->
                <template v-if="isLoading">
                    <!-- Banner Skeleton -->
                    <div class="w-full h-52 bg-slate-200 rounded-2xl animate-pulse shadow-sm"></div>

                    <!-- Nav Skeleton -->
                    <div class="grid grid-cols-4 bg-white rounded-xl shadow-sm p-2 gap-2">
                        <div v-for="i in 4" :key="i" class="h-9 bg-slate-200 rounded-lg animate-pulse"></div>
                    </div>

                    <!-- Content Body Skeleton -->
                    <div class="bg-white rounded-xl shadow-md p-6 flex flex-col gap-4">
                        <div class="w-32 h-6 bg-slate-200 rounded animate-pulse"></div>
                        <div class="flex flex-col gap-2">
                            <div class="w-full h-4 bg-slate-200 rounded animate-pulse"></div>
                            <div class="w-5/6 h-4 bg-slate-200 rounded animate-pulse"></div>
                            <div class="w-2/3 h-4 bg-slate-200 rounded animate-pulse"></div>
                        </div>
                    </div>
                </template>

                <template v-else>

                    <!-- Banner -->
                    <header :style="{ backgroundImage: `url(${API_URL}${ekskulDetail.ekskul?.banner})` }"
                        class="p-6 rounded-2xl shadow-md text-white flex flex-col justify-end gap-2 bg-cover bg-center h-52 relative overflow-hidden">
                        <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                        <div class="relative z-10 flex flex-col gap-1">
                            <h3 class="text-white font-bold text-2xl drop-shadow">{{ ekskulDetail.ekskul?.name }}</h3>
                            <span
                                class="bg-blue-50 text-blue-600 border border-blue-100 w-fit px-2.5 py-0.5 text-xs font-medium rounded-full shadow-sm">
                                {{ ekskulDetail.ekskul?.bidang }}
                            </span>
                        </div>
                    </header>

                    <!-- Nav -->
                    <div class="grid grid-cols-4 bg-white rounded-xl shadow-sm p-2">
                        <button v-for="section in listSection" :key="section.name"
                            @click="handleChangeSection(section.name)" 
                            :class="[
                                'cursor-pointer text-center py-2 text-sm font-medium transition-all duration-200 rounded-lg',
                                currentSection === section.name
                                    ? 'font-bold text-[#1D4ED8] bg-blue-50 shadow-inner'
                                    : 'text-[#60A5FA] hover:bg-slate-50'
                            ]">
                            {{ section.name }}
                        </button>
                    </div>

                    <!-- Section About -->
                    <section v-if="currentSection == 'About'"
                        class="bg-white rounded-xl shadow-md p-6 flex flex-col gap-3">
                        <h4 class="text-[#1D4ED8] font-semibold text-lg">Deskripsi</h4>
                        <p class="text-sm leading-relaxed text-[#60A5FA]">{{ ekskulDetail.ekskul?.about || 'Belum ada deskripsi.' }}</p>
                    </section>

                    <!-- Section Kegiatan -->
                    <section v-if="currentSection == 'Kegiatan'" class="bg-white p-5 rounded-xl shadow-md flex flex-col gap-4">
                        <div class="pb-3 border-b border-slate-100 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                            <h4 class="text-[#1D4ED8] font-semibold text-lg">Daftar Kegiatan</h4>
                            
                            <!-- Filter Bulan & Tahun Kegiatan -->
                            <div class="flex items-center gap-2">
                                <select v-model="filterMonth" class="border border-slate-200 text-slate-700 bg-slate-50 rounded-lg py-1.5 px-3 text-xs outline-none focus:border-[#1D4ED8] cursor-pointer">
                                    <option value="">Semua Bulan</option>
                                    <option v-for="m in listMonths" :key="m.value" :value="m.value">{{ m.name }}</option>
                                </select>
                                <select v-model="filterYear" class="border border-slate-200 text-slate-700 bg-slate-50 rounded-lg py-1.5 px-3 text-xs outline-none focus:border-[#1D4ED8] cursor-pointer">
                                    <option value="">Semua Tahun</option>
                                    <option value="2026">2026</option>
                                    <option value="2025">2025</option>
                                    <option value="2024">2024</option>
                                </select>
                            </div>
                        </div>

                        <div class="flex flex-col gap-4">
                            <div v-for="kegiatan in filteredKegiatan" :key="kegiatan.id" class="flex flex-col sm:flex-row gap-4 p-4 border border-slate-100 rounded-xl hover:bg-slate-50/50 transition-colors">
                                <img :src="kegiatan.path" :alt="kegiatan.title" class="w-full sm:w-1/3 h-30 object-cover rounded-lg shadow-sm">
                                <div class="flex flex-col justify-between">
                                    <div class="flex flex-col gap-1">
                                        <span class="text-xs text-slate-400 font-medium flex items-center gap-1">
                                            <Icon icon="akar-icons:calendar" width="14" /> {{ formatDate(kegiatan.waktu) }}
                                        </span>
                                        <h5 class="font-semibold text-slate-800 text-base">{{ kegiatan.title }}</h5>
                                        <p class="text-xs text-slate-600 leading-relaxed">{{ kegiatan.description }}</p>
                                    </div>
                                </div>
                            </div>
                            <div v-if="filteredKegiatan.length === 0" class="py-8 text-center text-slate-400 text-sm">
                                Tidak ada kegiatan pada periode yang dipilih.
                            </div>
                        </div>
                    </section>

                    <!-- Section Anggota -->
                    <section v-if="currentSection == 'Anggota'" class="bg-white p-5 rounded-xl shadow-md overflow-hidden flex flex-col gap-4">
                        <div class="pb-3 border-b border-slate-100 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                            <div class="flex items-center gap-2">
                                <h4 class="text-[#1D4ED8] font-semibold text-lg">Daftar Anggota</h4>
                                <span class="text-xs bg-blue-50 text-[#1D4ED8] px-2.5 py-1 rounded-full font-medium">
                                    Total: {{ filteredMember.length }}
                                </span>
                            </div>

                            <!-- Filter/Search Berdasarkan Nama atau NIS -->
                            <div class="relative w-full sm:w-64">
                                <span class="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                                    <Icon icon="akar-icons:search" width="14" />
                                </span>
                                <input v-model="searchMemberQuery" type="text" placeholder="Cari nama atau NIS..." 
                                    class="w-full pl-9 pr-3 py-1.5 border border-slate-200 bg-slate-50 text-slate-700 text-xs rounded-lg outline-none focus:border-[#1D4ED8] focus:bg-white transition-colors" />
                            </div>
                        </div>

                        <div class="overflow-x-auto shadow-md rounded-lg">
                            <table class="w-full text-left border-collapse">
                                <thead>
                                    <tr class="bg-[#60A5FA] text-blue-50 text-xs uppercase tracking-wider">
                                        <th class="py-3 px-4 text-center font-semibold w-16">No</th>
                                        <th class="py-3 px-4 font-semibold">NIS</th>
                                        <th class="py-3 px-4 font-semibold">Nama</th>
                                        <th class="py-3 px-4 font-semibold">Role</th>
                                        <th class="py-3 px-4 text-center font-semibold w-24">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-slate-100 text-sm">
                                    <tr v-for="(member, index) in filteredMember" :key="member.id || index" class="hover:bg-slate-50/80 transition-colors">
                                        <td class="py-3.5 px-4 text-center text-slate-500 font-medium">{{ index + 1 }}</td>
                                        <td class="py-3.5 px-4 text-slate-700 font-medium">{{ member.nis }}</td>
                                        <td class="py-3.5 px-4 text-slate-800 font-semibold">{{ member.member_name }}</td>
                                        <td class="py-3.5 px-4">
                                            <span :class="[
                                                'px-2.5 py-1 text-xs font-medium rounded-full inline-block',
                                                member.role === 'Ketua' ? 'bg-amber-50 text-amber-600 border border-amber-200' : 'bg-slate-100 text-slate-600'
                                            ]">
                                                {{ member.role }}
                                            </span>
                                        </td>
                                        <td class="py-3.5 px-4 text-center">
                                            <button @click="handleOpenModal(member.member_name, member.nis, member.role)" class="px-3 py-1 text-xs font-medium text-[#1D4ED8] bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer">
                                                Edit
                                            </button>
                                        </td>
                                    </tr>
                                    <tr v-if="filteredMember.length === 0">
                                        <td colspan="5" class="py-8 text-center text-slate-400 text-sm">
                                            Anggota tidak ditemukan.
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </section>

                    <!-- Section Dokumentasi (Dummy) -->
                    <section v-if="currentSection == 'Dokumentasi'" class="bg-white p-5 rounded-xl shadow-md flex flex-col gap-4">
                        <div class="pb-3 border-b border-slate-100">
                            <h4 class="text-[#1D4ED8] font-semibold text-lg">Dokumentasi Kegiatan</h4>
                        </div>
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div v-for="dokumentasi in listDokumentasi" :key="dokumentasi.id" class="border border-slate-100 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow bg-white flex flex-col">
                                <img :src="dokumentasi.path" :alt="dokumentasi.title" class="w-full h-40 object-cover">
                                <div class="p-3 flex flex-col gap-1">
                                    <h5 class="font-semibold text-slate-800 text-sm">{{ dokumentasi.title }}</h5>
                                    <span class="text-xs text-slate-400">{{ formatDate(dokumentasi.waktu) }}</span>
                                </div>
                            </div>
                        </div>
                    </section>

                </template>

            </main>

            <!-- Sidebar -->
            <aside class="w-full lg:w-2/7">
                <div v-if="currentSection == 'About'" class="flex flex-col gap-5 sticky top-6">

                    <!-- Informasi Ekskul -->
                    <div class="bg-white rounded-xl shadow-md p-4 flex flex-col gap-3">
                        <h4 class="font-semibold text-[#1D4ED8] pb-2 border-b border-slate-100">Informasi Ekskul</h4>

                        <div class="flex flex-col gap-3.5 pt-1">
                            <div class="flex gap-3 items-start">
                                <Icon width="22" class="text-[#60A5FA] mt-0.5 shrink-0" icon="akar-icons:tag" />
                                <div class="text-sm">
                                    <h5 class="text-slate-500 text-xs">Kategori</h5>
                                    <h5 class="font-semibold text-slate-800">{{ ekskulDetail.ekskul?.bidang || '-' }}
                                    </h5>
                                </div>
                            </div>

                            <div class="flex gap-3 items-start">
                                <Icon width="22" class="text-[#60A5FA] mt-0.5 shrink-0" icon="akar-icons:person" />
                                <div class="text-sm">
                                    <h5 class="text-slate-500 text-xs">Pembina</h5>
                                    <h5 class="font-semibold text-slate-800">{{ pembina }}</h5>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Informasi Ketua -->
                    <div class="bg-white rounded-xl shadow-md p-4 flex flex-col gap-3">
                        <div class="flex gap-3 items-start">
                            <Icon width="22" class="text-[#60A5FA] mt-0.5 shrink-0" icon="akar-icons:crown" />
                            <div class="text-sm">
                                <h5 class="text-slate-500 text-xs">Ketua Ekskul</h5>
                                <h5 class="font-semibold text-slate-800">{{ ketua }}</h5>
                            </div>
                        </div>
                    </div>

                </div>
            </aside>

        </div>
    </div>
</template>