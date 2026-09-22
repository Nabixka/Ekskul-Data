<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { api } from '../../api';
import { Icon } from '@iconify/vue';

const API_URL = import.meta.env.VITE_API_URL
const route = useRoute()

const ekskulDetail = ref({})
const memberList = ref([])

const modalRole = ref(false)
const isLoading = ref(true)
const message = ref('')

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

const currentSection = ref('About')
const listSection = ref([
    { name: 'About' },
    { name: 'Kegiatan' },
    { name: 'Anggota' },
    { name: 'Dokumentasi' }
])
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

const id = route.params.id

const getDetail = async () => {
    isLoading.value = true
    message.value = ''
    try {
        const res = await api.get(`/ekskul/${id}`)
        ekskulDetail.value = res.data.data
    }
    catch (error) {
        message.value = error.response?.data?.message || 'Terjadi Kesalahan Pada Server'
    }
    finally {
        isLoading.value = false
    }
}

const getMember = async () => {
    isLoading.value = true
    message.value = ''
    try{
        const res = await api.get(`/ekskul/${id}/member`)
        memberList.value = res.data.data
    }
    catch(error){
        message.value = error.response?.data?.message || 'Gagal Terhubung, Coba lagi nanti'
    }
    finally{
        isLoading.value = false
    }
}

const handleChangeSection = (section) => {
    currentSection.value = section
    if(section == 'Anggota') getMember()
}

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
        const res = await api.put('/user/change-role', {
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

                <!-- Loading State -->
                <div v-if="isLoading"
                    class="w-full h-64 bg-white rounded-2xl shadow-md flex items-center justify-center text-[#60A5FA]">
                    <span class="animate-pulse font-medium">Memuat data...</span>
                </div>

                <!-- Error State -->
                <div v-else-if="message"
                    class="w-full p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                    {{ message }}
                </div>

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

                    <!-- Section Anggota -->
                    <section v-if="currentSection == 'Anggota'" class="bg-white p-5 rounded-xl shadow-md overflow-hidden">
                        <div class="pb-3 border-b border-slate-100 flex justify-between items-center">
                            <h4 class="text-[#1D4ED8] font-semibold text-lg">Daftar Anggota</h4>
                            <span class="text-xs bg-blue-50 text-[#1D4ED8] px-2.5 py-1 rounded-full font-medium">
                                Total: {{ memberList.length }} Anggota
                            </span>
                        </div>

                        <div class="overflow-x-auto shadow-md">
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
                                    <tr v-for="(member, index) in memberList" :key="member.id || index" class="hover:bg-slate-50/80 transition-colors">
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
                                    <tr v-if="memberList.length === 0">
                                        <td colspan="5" class="py-8 text-center text-slate-400 text-sm">
                                            Belum ada data anggota untuk ekstrakurikuler ini.
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
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