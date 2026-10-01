<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Icon } from '@iconify/vue';
import { api } from '../../api';
import { formatDate } from '../../helper';

const API_URL = import.meta.env.VITE_API_URL
const route = useRoute()
const router = useRouter()
const ekskulId = route.params.id
const kegiatanId = route.params.kegiatanId

const kegiatan = ref(null)
const dokumentasi = ref([])
const userRole = ref('')
const currentSection = ref('Absen')
const isLoading = ref(false)
const isLoadingDokumentasi = ref(false)
const isUploadingDokumentasi = ref(false)
const hasLoadedDokumentasi = ref(false)
const errorMessage = ref('')
const uploadMessage = ref('')
const selectedImages = ref([])
const deletingDocumentId = ref(null)

const isHumas = computed(() => userRole.value === 'Humas')

const getUserRole = async () => {
	try {
		const response = await api.get(`/member/ekskul/${ekskulId}`)
		userRole.value = response.data.data?.role || ''
	} catch {
		userRole.value = ''
	}
}

const getDetailKegiatan = async () => {
	isLoading.value = true
	errorMessage.value = ''
	try {
		const response = await api.get(`/kegiatan/${kegiatanId}`)
		kegiatan.value = response.data.data || null
	} catch (error) {
		errorMessage.value = error.response?.data?.message || 'Gagal memuat detail kegiatan.'
	} finally {
		isLoading.value = false
	}
}

const getDokumentasi = async () => {
	if (hasLoadedDokumentasi.value) return
	isLoadingDokumentasi.value = true
	errorMessage.value = ''
	try {
		const response = await api.get(`/dokumentasi/kegiatan/${kegiatanId}`)
		dokumentasi.value = response.data.data || []
		hasLoadedDokumentasi.value = true
	} catch (error) {
		errorMessage.value = error.response?.data?.message || 'Gagal memuat dokumentasi kegiatan.'
	} finally {
		isLoadingDokumentasi.value = false
	}
}

const handleSelectImages = (event) => {
	selectedImages.value = Array.from(event.target.files || [])
	uploadMessage.value = ''
}

const handleUploadDokumentasi = async () => {
	if (!selectedImages.value.length) {
		uploadMessage.value = 'Pilih minimal satu gambar.'
		return
	}

	const formData = new FormData()
	formData.append('kegiatan_id', String(kegiatanId))
	selectedImages.value.forEach((image) => formData.append('image', image))

	isUploadingDokumentasi.value = true
	uploadMessage.value = ''
	try {
		await api.post(`/dokumentasi/ekskul/${ekskulId}`, formData)
		selectedImages.value = []
		hasLoadedDokumentasi.value = false
		await getDokumentasi()
		uploadMessage.value = 'Dokumentasi berhasil ditambahkan.'
	} catch (error) {
		uploadMessage.value = error.response?.data?.message || 'Gagal mengunggah dokumentasi.'
	} finally {
		isUploadingDokumentasi.value = false
	}
}

const handleDeleteDokumentasi = async (documentId) => {
	if (!window.confirm('Hapus dokumentasi ini?')) return

	deletingDocumentId.value = documentId
	errorMessage.value = ''
	try {
		await api.delete(`/dokumentasi/ekskul/${ekskulId}/dokumentasi/${documentId}`)
		dokumentasi.value = dokumentasi.value.filter((image) => image.id !== documentId)
	} catch (error) {
		errorMessage.value = error.response?.data?.message || 'Gagal menghapus dokumentasi.'
	} finally {
		deletingDocumentId.value = null
	}
}

const handleChangeSection = (section) => {
    currentSection.value = section
    if (section === 'Dokumentasi') {
        getDokumentasi()
    }
}

onMounted(() => {
	getDetailKegiatan()
	getUserRole()
})
</script>

<template>
	<div class="w-full flex justify-end min-h-screen bg-slate-50">
		<main class="w-full lg:w-4/5 p-4 md:p-8 flex flex-col gap-6">
			<button @click="router.push(`/my-ekskul/${ekskulId}`)"
				class="self-start inline-flex items-center gap-2 text-sm font-semibold text-[#9F1239] hover:text-[#E0234E] transition-colors">
				<Icon icon="lucide:arrow-left" width="18" />
				Kembali ke kegiatan ekskul
			</button>

			<div v-if="isLoading" class="bg-white rounded-2xl p-10 flex justify-center items-center gap-2 text-[#9F1239]">
				<Icon icon="lucide:loader-2" class="animate-spin" width="20" />
				Memuat detail kegiatan...
			</div>

			<section v-else-if="errorMessage && !kegiatan" class="bg-white rounded-2xl p-8 text-center">
				<p class="text-sm text-rose-700">{{ errorMessage }}</p>
				<button @click="getDetailKegiatan" class="mt-4 text-sm font-semibold text-[#BE123C] hover:underline">Coba lagi</button>
			</section>

			<template v-else-if="kegiatan">
				<header class="bg-white rounded-2xl p-5 md:p-7 border border-rose-100 shadow-sm flex items-start gap-4">
					<div class="w-12 h-12 rounded-xl bg-rose-50 text-[#BE123C] flex items-center justify-center shrink-0">
						<Icon icon="lucide:calendar-days" width="24" />
					</div>
					<div class="min-w-0">
						<p class="text-xs uppercase tracking-wide font-semibold text-[#BE123C]">Detail Kegiatan</p>
						<h1 class="mt-1 text-2xl md:text-3xl font-bold text-slate-900">{{ kegiatan.title }}</h1>
						<div class="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-600">
							<span class="inline-flex items-center gap-2"><Icon icon="lucide:clock-3" width="16" />{{ formatDate(kegiatan.waktu) }}</span>
							<span class="inline-flex items-center gap-2"><Icon icon="lucide:map-pin" width="16" />{{ kegiatan.location || 'Lokasi belum ditentukan' }}</span>
						</div>
					</div>
				</header>

				<section class="bg-white rounded-2xl p-5 md:p-7 border border-slate-200/70 shadow-sm">
					<h2 class="text-sm font-bold text-slate-800">Deskripsi</h2>
					<p class="mt-2 text-sm leading-relaxed text-slate-600 whitespace-pre-line">
						{{ kegiatan.description || 'Belum ada deskripsi untuk kegiatan ini.' }}
					</p>
				</section>

				<!-- Navigation Tabs -->
                <nav
                    class="bg-white rounded-xl p-1.5 shadow-sm border border-slate-200/60 flex items-center gap-1 overflow-x-auto">
                    <button 
                        v-for="section in ['Absen', 'Dokumentasi']" 
                        :key="section.name" 
                        @click="handleChangeSection(section)" 
                        :class="['px-4 py-2 text-sm font-semibold rounded-lg flex items-center gap-2 transition-colors whitespace-nowrap', currentSection === section ? 'bg-[#E0234E] text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100' ]">
                    {{ section }}
                    </button>
                </nav>

				<section class="bg-white rounded-2xl p-5 md:p-7 border border-slate-200/70 shadow-sm min-h-64">
					<div v-if="currentSection === 'Absen'">
						<h2 class="text-lg font-bold text-slate-900">Absen Kegiatan</h2>
						<div class="mt-6 py-8 text-center border border-dashed border-slate-200 rounded-xl">
							<Icon icon="lucide:clipboard-check" class="mx-auto text-slate-300" width="32" />
							<p class="mt-3 text-sm text-slate-500">Data absensi untuk kegiatan ini belum tersedia.</p>
						</div>
					</div>

					<div v-else>
						<div class="flex flex-col gap-4 border-b border-slate-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
							<div class="flex items-center gap-2">
								<Icon icon="lucide:image" class="text-[#BE123C]" width="20" />
								<h2 class="text-lg font-bold text-slate-900">Dokumentasi Kegiatan</h2>
							</div>
							<div v-if="isHumas" class="flex flex-col gap-2 sm:flex-row sm:items-center">
								<input type="file" accept="image/*" multiple @change="handleSelectImages"
									class="max-w-full text-xs text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-rose-50 file:px-3 file:py-2 file:font-semibold file:text-[#9F1239] hover:file:bg-rose-100" />
								<button @click="handleUploadDokumentasi" :disabled="isUploadingDokumentasi || selectedImages.length === 0"
									class="inline-flex items-center justify-center gap-2 rounded-lg bg-[#BE123C] px-3 py-2 text-sm font-semibold text-white transition hover:bg-[#9F1239] disabled:cursor-not-allowed disabled:opacity-50">
									<Icon :icon="isUploadingDokumentasi ? 'lucide:loader-2' : 'lucide:upload'" :class="isUploadingDokumentasi ? 'animate-spin' : ''" width="16" />
									{{ isUploadingDokumentasi ? 'Mengunggah...' : 'Tambah' }}
								</button>
							</div>
						</div>
						<p v-if="uploadMessage" class="mt-3 text-sm text-slate-600">{{ uploadMessage }}</p>

						<div v-if="isLoadingDokumentasi" class="py-10 flex justify-center items-center gap-2 text-[#9F1239] text-sm">
							<Icon icon="lucide:loader-2" class="animate-spin" width="18" />
							Memuat dokumentasi...
						</div>
						<p v-else-if="errorMessage" class="py-8 text-center text-sm text-rose-700">{{ errorMessage }}</p>
						<p v-else-if="dokumentasi.length === 0" class="py-10 text-center text-sm text-slate-500">
							Belum ada dokumentasi untuk kegiatan ini.
						</p>
						<div v-else class="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
							<figure v-for="image in dokumentasi" :key="image.id" class="group relative overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
								<img :src="`${API_URL}${image.path}`" :alt="image.title || kegiatan.title" class="w-full aspect-[4/3] object-cover" />
								<button v-if="isHumas" @click="handleDeleteDokumentasi(image.id)" :disabled="deletingDocumentId === image.id"
									:aria-label="`Hapus dokumentasi ${image.id}`" title="Hapus dokumentasi"
									class="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-white/95 text-rose-700 shadow transition hover:bg-rose-600 hover:text-white disabled:opacity-50">
									<Icon :icon="deletingDocumentId === image.id ? 'lucide:loader-2' : 'lucide:trash-2'" :class="deletingDocumentId === image.id ? 'animate-spin' : ''" width="17" />
								</button>
							</figure>
						</div>
					</div>
				</section>
			</template>
		</main>
	</div>
</template>
