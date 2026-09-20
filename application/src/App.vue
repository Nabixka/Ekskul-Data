<script setup>
import { useRoute } from 'vue-router';
import Sidebar from './components/sidebar.vue';

const route = useRoute()
</script>

<template>
  <Sidebar v-if="route.meta.showBar"></Sidebar>
  <RouterView></RouterView>
</template>
