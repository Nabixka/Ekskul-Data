<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { api } from '../../api';
import { Icon } from '@iconify/vue';

const API_URL = import.meta.env.VITE_API_URL
const route = useRoute()

const ekskulDetail = ref({})
const pembina = computed(() => {
    if (!ekskulDetail.value.member) return []
    const filterPembina =  ekskulDetail.value.member.filter(item => item.role == 'Pembina')

    if(filterPembina.length == 1){
        return filterPembina[0].name
    }
    if(filterPembina.length >= 1){
        let name = ''
        const mappingPembina = filterPembina.map((e) => {
            name += `${e.name}, `
        })
        
        let finalName = name.slice(0, name.length - 2)
        return finalName
    }

    return "-"
})

const currentSection = ref('About')
const listSection = ref([
    { name: 'About' },
    { name: 'Kegiatan' },
    { name: 'Anggota' },
    { name: 'Dokumentasi' }
])

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


onMounted(() => {
    getDetail()
})
</script>

<template>
    <div class="w-full flex justify-end min-h-screen bg-slate-50">
        <div class="w-full lg:w-7/9 bg-slate-100 p-8 flex flex-col lg:flex-row gap-6">

            <main class="w-full lg:w-5/7">

                <!-- Banner -->
                <header :style="{ backgroundImage: `url(${API_URL}${ekskulDetail.ekskul?.banner})` }"
                    class="p-6 rounded-2xl shadow-md text-white flex flex-col gap-1 bg-cover h-50">
                    <h3 class="text-white/80 font-bold text-2xl">{{ ekskulDetail.ekskul?.name }}</h3>
                    <span
                        class="bg-blue-50 text-blue-600 border border-blue-100 w-fit px-2.5 py-0.5 text-xs font-medium rounded-full">
                        {{ ekskulDetail.ekskul?.bidang }}
                    </span>
                </header>

                <div class="grid grid-cols-5 pt-5">
                    <h4 v-for="section in listSection" @click="currentSection = section.name"
                        :class="currentSection == section.name ? 'font-bold text-[#1D4ED8] border-b-3 pb-2' : 'text-[#60A5FA]'"
                        class="cursor-pointer text-center">
                        {{ section.name }}
                    </h4>
                </div>

                <!-- Section -->
                <section v-if="currentSection == 'About'" class="bg-white rounded-lg shadow-lg p-3 mt-5">
                    <h4 class="text-[#1D4ED8] font-semibold text-lg">Deskripsi</h4>
                    <p class="text-sm w-2/3 pt-3 text-[#60A5FA]">{{ ekskulDetail.ekskul?.about }}</p>
                </section>

            </main>

            <aside class="w-2/7">

                <!-- About -->
                <div v-if="currentSection == 'About'" class="bg-white rounded-lg p-3 flex flex-col gap-2.5">
                    <h4 class="font-semibold text-[#1D4ED8] border-b border-slate-200">Informasi Ekskul</h4>

                    <div class="flex flex-col gap-2">
                        <span class="flex gap-3 items-center">
                            <Icon width="24" class="text-[#60A5FA]" icon="akar-icons:tag" />
                            <span class="text-sm">
                                <h5>Kategori</h5>
                                <h5 class="font-semibold">{{ ekskulDetail.ekskul?.bidang }}</h5>
                            </span>
                        </span>
                        <span class="flex gap-3 items-center">
                            <Icon width="24" class="text-[#60A5FA]" icon="akar-icons:tag" />
                            <span class="text-sm">
                                <h5>Pembina</h5>
                                <h5 class="font-semibold">{{ pembina }}</h5>
                            </span>
                        </span>
                    </div>
                </div>

            </aside>

        </div>
    </div>
</template>