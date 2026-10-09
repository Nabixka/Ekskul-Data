<script setup>
import { ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { Icon } from "@iconify/vue";

const route = useRoute();
const router = useRouter();
const isMobileMenuOpen = ref(false);
const props = defineProps({
  isDarkMode: { type: Boolean, required: true },
});
const emit = defineEmits(["toggle-color-mode"]);

const listNav = ref([
  {
    name: "Dashboard",
    path: "/dashboard",
    icon: "ant-design:home-filled",
  },
  {
    name: "Ekskul",
    path: "/list-ekskul",
    icon: "fluent:people-community-24-filled",
  },
  {
    name: "My Ekskul",
    path: "/my-ekskul",
    icon: "akar-icons:folder",
  },
  {
    name: "Peminjaman Ruang",
    path: "/peminjaman-ruang",
    icon: "lucide:door-open",
  },
]);

const adminList = ref([
  {
    name: "Dashboard",
    path: "/admin/dashboard",
    icon: "ant-design:home-filled",
  },
  {
    name: "Ekskul",
    path: "/admin/list-ekskul",
    icon: "fluent:people-community-24-filled",
  },
  {
    name: "Data Siswa",
    path: "/admin/data-siswa",
    icon: "lucide:users",
  },
  {
    name: "Laporan Bulanan",
    path: "/admin/laporan-bulanan",
    icon: "lucide:file-text",
  },
  {
    name: "Ruang",
    path: "/admin/ruang",
    icon: "lucide:door-open",
  },
]);

const handleLogout = () => {
  isMobileMenuOpen.value = false;
  localStorage.removeItem("token");
  router.push("/");
};

watch(
  () => route.fullPath,
  () => {
    isMobileMenuOpen.value = false;
  },
);
</script>

<template>
  <!-- Dekstop -->
  <nav
    class="sidebar-shell hidden md:flex flex-col justify-between fixed left-0 top-0 bottom-0 shadow-xl z-50 w-1/5 p-5"
  >
    <div class="flex flex-col gap-10 w-full">
      <!-- Logo -->
      <div class="flex justify-center py-2">
        <img width="100" src="/logo.png" alt="Logo" />
      </div>

      <!-- Menu List -->
      <div class="flex flex-col gap-2 w-full">
        <router-link
          v-if="route.path.startsWith('/admin')"
          v-for="list in adminList"
          :class="
            route.path.startsWith(list.path)
              ? props.isDarkMode
                ? 'bg-[#E0234E]/15 text-white border-[#E0234E]/25 shadow-sm'
                : 'bg-rose-100/80 text-[#9F1239] border-rose-200 shadow-sm'
              : props.isDarkMode
                ? 'text-white/70 border-transparent hover:bg-white/5 hover:text-white'
                : 'text-slate-600 border-transparent hover:bg-rose-50 hover:text-[#9F1239]'
          "
          class="flex items-center gap-3 w-full py-2.5 px-4 font-medium rounded-xl border transition-all"
          :to="list.path"
        >
          <Icon
            width="20"
            :icon="list.icon"
            :class="
              route.path.startsWith(list.path)
                ? props.isDarkMode
                  ? 'text-[#FB7185]'
                  : 'text-[#BE123C]'
                : ''
            "
          />
          <span>{{ list.name }}</span>
        </router-link>

        <router-link
          v-else
          v-for="list in listNav"
          :key="list.path"
          :class="
            route.path.startsWith(list.path)
              ? props.isDarkMode
                ? 'bg-[#E0234E]/15 text-white border-[#E0234E]/25 shadow-sm'
                : 'bg-rose-100/80 text-[#9F1239] border-rose-200 shadow-sm'
              : props.isDarkMode
                ? 'text-white/70 border-transparent hover:bg-white/5 hover:text-white'
                : 'text-slate-600 border-transparent hover:bg-rose-50 hover:text-[#9F1239]'
          "
          class="flex items-center gap-3 w-full py-2.5 px-4 font-medium rounded-xl border transition-all"
          :to="list.path"
        >
          <Icon
            width="20"
            :icon="list.icon"
            :class="
              route.path.startsWith(list.path)
                ? props.isDarkMode
                  ? 'text-[#FB7185]'
                  : 'text-[#BE123C]'
                : ''
            "
          />
          <span>{{ list.name }}</span>
        </router-link>
      </div>
    </div>

    <div
      :class="
        props.isDarkMode
          ? 'bg-white/5 border-white/10'
          : 'bg-white/70 border-rose-200/70 shadow-sm'
      "
      class="flex flex-col backdrop-blur-md rounded-2xl overflow-hidden border p-1"
    >
      <button
        @click="emit('toggle-color-mode')"
        role="switch"
        :aria-checked="props.isDarkMode"
        :aria-label="
          props.isDarkMode ? 'Aktifkan mode terang' : 'Aktifkan mode gelap'
        "
        :class="
          props.isDarkMode
            ? 'text-white/90 hover:bg-white/10'
            : 'text-slate-700 hover:bg-rose-100/80'
        "
        class="flex items-center gap-3 font-medium text-sm w-full p-2.5 rounded-xl transition"
      >
        <Icon
          width="18"
          :icon="props.isDarkMode ? 'lucide:sun' : 'lucide:moon'"
        />
        <span class="flex-1 text-left">{{
          props.isDarkMode ? "Mode terang" : "Mode gelap"
        }}</span>
        <span
          :class="props.isDarkMode ? 'bg-[#E0234E]/70' : 'bg-rose-200'"
          class="w-9 h-5 rounded-full p-0.5 flex items-center"
          aria-hidden="true"
        >
          <span
            :class="
              props.isDarkMode
                ? 'translate-x-4 bg-white'
                : 'translate-x-0 bg-white/80'
            "
            class="w-4 h-4 rounded-full transition-transform"
          ></span>
        </span>
      </button>
      <button
        @click="handleLogout()"
        :class="
          props.isDarkMode
            ? 'text-rose-300 hover:bg-rose-500/10'
            : 'text-[#9F1239] hover:bg-rose-100/80'
        "
        class="flex items-center gap-3 font-medium text-sm w-full p-2.5 rounded-xl transition"
      >
        <Icon width="18" icon="ci:exit" />
        <span>Keluar Akun</span>
      </button>
    </div>
  </nav>

  <!-- Mobile -->
  <header
    :class="
      props.isDarkMode
        ? 'bg-[#171014]/95 border-white/10'
        : 'bg-white/95 border-rose-100'
    "
    class="md:hidden sticky top-0 z-40 flex h-16 items-center justify-between border-b px-4 shadow-sm backdrop-blur-lg"
  >
    <img
      width="76"
      src="/logo.png"
      alt="Logo"
      class="max-h-11 object-contain"
    />
    <button
      type="button"
      @click="isMobileMenuOpen = true"
      :aria-expanded="isMobileMenuOpen"
      aria-controls="mobile-navigation"
      aria-label="Buka menu navigasi"
      :class="
        props.isDarkMode
          ? 'text-white hover:bg-white/10'
          : 'text-[#9F1239] hover:bg-rose-50'
      "
      class="flex h-10 w-10 items-center justify-center rounded-xl transition-colors"
    >
      <Icon width="23" icon="lucide:menu" />
    </button>
  </header>

  <Transition name="mobile-menu">
    <div v-if="isMobileMenuOpen" class="md:hidden fixed inset-0 z-[60]">
      <button
        type="button"
        @click="isMobileMenuOpen = false"
        aria-label="Tutup menu navigasi"
        class="absolute inset-0 h-full w-full bg-slate-950/45 backdrop-blur-[2px]"
      ></button>

      <Transition name="mobile-drawer" appear>
        <aside
          id="mobile-navigation"
          role="dialog"
          aria-modal="true"
          aria-label="Menu navigasi"
          :class="
            props.isDarkMode
              ? 'sidebar-shell dark text-white'
              : 'sidebar-shell text-slate-800'
          "
          class="absolute right-0 top-0 flex h-full w-[min(84vw,340px)] flex-col justify-between border-l p-5 shadow-2xl"
        >
          <div class="flex flex-col gap-8">
            <div class="flex items-center justify-between">
              <img
                width="82"
                src="/logo.png"
                alt="Logo"
                class="max-h-12 object-contain"
              />
              <button
                type="button"
                @click="isMobileMenuOpen = false"
                aria-label="Tutup menu navigasi"
                :class="
                  props.isDarkMode
                    ? 'text-white/80 hover:bg-white/10'
                    : 'text-slate-500 hover:bg-rose-50 hover:text-[#9F1239]'
                "
                class="flex h-10 w-10 items-center justify-center rounded-xl transition-colors"
              >
                <Icon width="21" icon="lucide:x" />
              </button>
            </div>

            <nav class="flex flex-col gap-2" aria-label="Navigasi utama">
              <router-link
                v-for="list in route.path.startsWith('/admin')
                  ? adminList
                  : listNav"
                :key="list.path"
                :to="list.path"
                @click="isMobileMenuOpen = false"
                :class="
                  route.path.startsWith(list.path)
                    ? props.isDarkMode
                      ? 'bg-[#E0234E]/15 text-white border-[#E0234E]/25 shadow-sm'
                      : 'bg-rose-100/80 text-[#9F1239] border-rose-200 shadow-sm'
                    : props.isDarkMode
                      ? 'text-white/70 border-transparent hover:bg-white/5 hover:text-white'
                      : 'text-slate-600 border-transparent hover:bg-rose-50 hover:text-[#9F1239]'
                "
                class="flex w-full items-center gap-3 rounded-xl border px-4 py-3 font-medium transition-all"
              >
                <Icon
                  width="20"
                  :icon="list.icon"
                  :class="
                    route.path.startsWith(list.path)
                      ? props.isDarkMode
                        ? 'text-[#FB7185]'
                        : 'text-[#BE123C]'
                      : ''
                  "
                />
                <span>{{ list.name }}</span>
              </router-link>
            </nav>
          </div>

          <div
            :class="
              props.isDarkMode
                ? 'bg-white/5 border-white/10'
                : 'bg-white/70 border-rose-200/70 shadow-sm'
            "
            class="flex flex-col overflow-hidden rounded-2xl border p-1 backdrop-blur-md"
          >
            <button
              type="button"
              @click="emit('toggle-color-mode')"
              role="switch"
              :aria-checked="props.isDarkMode"
              :aria-label="
                props.isDarkMode
                  ? 'Aktifkan mode terang'
                  : 'Aktifkan mode gelap'
              "
              :class="
                props.isDarkMode
                  ? 'text-white/90 hover:bg-white/10'
                  : 'text-slate-700 hover:bg-rose-100/80'
              "
              class="flex w-full items-center gap-3 rounded-xl p-2.5 text-sm font-medium transition"
            >
              <Icon
                width="18"
                :icon="props.isDarkMode ? 'lucide:sun' : 'lucide:moon'"
              />
              <span class="flex-1 text-left">{{
                props.isDarkMode ? "Mode terang" : "Mode gelap"
              }}</span>
            </button>
            <button
              type="button"
              @click="handleLogout"
              :class="
                props.isDarkMode
                  ? 'text-rose-300 hover:bg-rose-500/10'
                  : 'text-[#9F1239] hover:bg-rose-100/80'
              "
              class="flex w-full items-center gap-3 rounded-xl p-2.5 text-sm font-medium transition"
            >
              <Icon width="18" icon="ci:exit" />
              <span>Keluar Akun</span>
            </button>
          </div>
        </aside>
      </Transition>
    </div>
  </Transition>
</template>

<style scoped>
.mobile-menu-enter-active,
.mobile-menu-leave-active {
  transition: opacity 220ms ease;
}

.mobile-menu-enter-from,
.mobile-menu-leave-to {
  opacity: 0;
}

.mobile-drawer-enter-active,
.mobile-drawer-leave-active {
  transition: transform 280ms cubic-bezier(0.2, 0.8, 0.2, 1);
}

.mobile-drawer-enter-from,
.mobile-drawer-leave-to {
  transform: translateX(100%);
}
</style>
