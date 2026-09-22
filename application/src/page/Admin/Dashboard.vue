<script setup>
import { Icon } from '@iconify/vue';

</script>

<template>
    <div class="w-full flex justify-end min-h-screen bg-slate-50">
        <div class="w-full lg:w-7/9 bg-slate-100 p-6 lg:p-8 flex flex-col lg:flex-row gap-6">

            <!-- Header -->
            <div class="grid grid-cols-1 lg:grid-cols-4 w-full gap-4">
                <div v-for="i in 4" class="bg-white rounded-lg p-3 h-fit">
                    <h5 class="text-sm text-[#60A5FA]">Total ekstrakurikuler</h5>
                    <div class="flex justify-between items-center">
                        <h3 class="text-4xl font-bold text-[#1D4ED8]">12</h3>
                        <div class="bg-blue-50 rounded-2xl p-3">
                            <Icon class="text-[#1D4ED8]"  width="30" icon="akar-icons:folder"/>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>