<script setup>
import { useDark, useToggle } from '@vueuse/core';
import { useRoute } from 'vue-router';
import Sidebar from './components/sidebar.vue';

const route = useRoute()
const isDarkMode = useDark({ storageKey: 'color-mode' })
const toggleColorMode = useToggle(isDarkMode)
</script>

<template>
  <Sidebar v-if="route.meta.showBar" :is-dark-mode="isDarkMode" @toggle-color-mode="toggleColorMode" />
  <RouterView></RouterView>
</template>
