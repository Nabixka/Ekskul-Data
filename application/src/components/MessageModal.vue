<script setup>
import { Icon } from '@iconify/vue';

defineProps({
    open: { type: Boolean, default: false },
    message: { type: String, default: '' },
    variant: { type: String, default: 'error' },
    title: { type: String, default: '' },
    actionLabel: { type: String, default: '' },
    confirmLabel: { type: String, default: 'Mengerti' },
    cancelLabel: { type: String, default: 'Batal' }
})

defineEmits(['close', 'confirm', 'action'])
</script>

<template>
    <Transition enter-active-class="transition duration-200 ease-out" enter-from-class="opacity-0 scale-95"
        enter-to-class="opacity-100 scale-100" leave-active-class="transition duration-150 ease-in"
        leave-from-class="opacity-100 scale-100" leave-to-class="opacity-0 scale-95">
        <div v-if="open" class="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
            :role="variant === 'confirm' ? 'alertdialog' : 'dialog'" aria-modal="true">
            <div class="flex w-full max-w-md flex-col items-center gap-4 rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-xl">
                <div :class="[
                    'flex h-14 w-14 items-center justify-center rounded-full',
                    variant === 'success' ? 'bg-emerald-100 text-emerald-600' :
                    variant === 'confirm' ? 'bg-amber-100 text-amber-600' :
                    variant === 'info' ? 'bg-sky-100 text-sky-600' :
                    'bg-rose-100 text-rose-600'
                ]">
                    <Icon :icon="variant === 'success' ? 'lucide:check' :
                        variant === 'confirm' ? 'lucide:help-circle' :
                        variant === 'info' ? 'lucide:info' : 'lucide:alert-triangle'" width="28" />
                </div>
                <div>
                    <h2 class="text-lg font-bold text-slate-900">
                        {{ title || (variant === 'success' ? 'Berhasil' : variant === 'confirm' ? 'Konfirmasi' : variant === 'info' ? 'Informasi' : 'Terjadi Kesalahan') }}
                    </h2>
                    <p class="mt-2 whitespace-pre-line text-sm leading-relaxed text-slate-600">{{ message }}</p>
                </div>
                <div class="flex w-full gap-3 pt-1">
                    <button v-if="variant === 'confirm'" type="button" @click="$emit('close')"
                        class="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50">
                        {{ cancelLabel }}
                    </button>
                    <button v-if="actionLabel" type="button" @click="$emit('action')"
                        class="w-full rounded-xl border border-rose-200 px-4 py-2.5 text-sm font-semibold text-[#BE123C] transition hover:bg-rose-50">
                        {{ actionLabel }}
                    </button>
                    <button type="button" @click="variant === 'confirm' ? $emit('confirm') : $emit('close')"
                        class="w-full rounded-xl bg-[#BE123C] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#9F1239] focus:outline-none focus:ring-2 focus:ring-rose-400 focus:ring-offset-2">
                        {{ variant === 'confirm' ? (confirmLabel || 'Lanjutkan') : confirmLabel }}
                    </button>
                </div>
            </div>
        </div>
    </Transition>
</template>
