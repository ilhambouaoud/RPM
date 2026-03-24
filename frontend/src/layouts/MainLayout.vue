<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import Navbar from '@/components/Navbar.vue'
import Footer from '@/components/Footer.vue'
import {
  LayoutDashboard,
  Building2,
  Settings,
  ChevronLeft,
  ChevronRight,
} from 'lucide-vue-next'

const route = useRoute()

// sidebar
const sidebarOpen = ref(true)
const isMobile = ref(false)

// dark mode
const darkMode = ref(true)

// navigation
const navigation = [
  { name: 'Dashboard', path: `/portique/${route.params.id}`, icon: LayoutDashboard },
  { name: 'Portiques', path: '/portiques', icon: Building2 },
  { name: 'Parametres', path: '/settings', icon: Settings },
]

// responsive
const checkMobile = () => {
  isMobile.value = window.innerWidth < 1024
  sidebarOpen.value = !isMobile.value
}

const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value
}

const closeSidebarOnMobile = () => {
  if (isMobile.value) sidebarOpen.value = false
}

// theme toggle
const toggleTheme = () => {
  darkMode.value = !darkMode.value

  if (darkMode.value) {
    document.documentElement.classList.add("dark")
    localStorage.setItem("theme", "dark")
  } else {
    document.documentElement.classList.remove("dark")
    localStorage.setItem("theme", "light")
  }
}

// mounted (UN SEUL)
onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)

  // charger thème sauvegardé
  const saved = localStorage.getItem("theme")

  if (saved === "light") {
    darkMode.value = false
    document.documentElement.classList.remove("dark")
  } else {
    document.documentElement.classList.add("dark")
  }
})

// cleanup
onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
})
</script>

<template>
  <div class="flex h-screen bg-background">
    <div v-if="sidebarOpen && isMobile" @click="closeSidebarOnMobile" class="fixed inset-0 bg-black/50 z-40 lg:hidden">
    </div>

    <aside :class="[
      'bg-card border-r transition-all duration-300 flex flex-col fixed lg:relative h-full z-50 overflow-hidden',
      isMobile ? (sidebarOpen ? 'w-64' : 'w-0') : (sidebarOpen ? 'w-64' : 'w-16'),
      isMobile && !sidebarOpen ? '-translate-x-full' : 'translate-x-0'
    ]">

  <div class="p-4 border-b flex items-center justify-center relative">
    <img
      v-if="sidebarOpen"
      src="@/assets/pictures/CNESTEN_nuit.png"
      alt="Logo CNESTEN"
      class="h-20 w-auto"
    />
    <button
      @click="toggleSidebar"
      class="p-2 hover:bg-accent rounded-md hidden lg:block absolute right-2"
    >  
      <ChevronRight v-if="!sidebarOpen" :size="20" />
      <ChevronLeft v-else :size="20" />
    </button>
  </div>
     

      <nav class="flex-1 p-4 space-y-1 overflow-y-auto">
        <router-link v-for="item in navigation" :key="item.path" :to="item.path" @click="closeSidebarOnMobile" :class="[
          'flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-sm',
          route.path === item.path
            ? 'bg-primary text-primary-foreground'
            : 'hover:bg-accent hover:text-accent-foreground'
        ]">
          <component :is="item.icon" :size="20" />
          <span v-if="sidebarOpen">{{ item.name }}</span>
        </router-link>
      </nav>
    </aside>

    <div class="flex-1 flex flex-col overflow-hidden">
      <Navbar 
        :on-toggle-sidebar="toggleSidebar"
        :darkMode="darkMode"
        :toggleTheme="toggleTheme"
      />

      <main class="flex-1 overflow-auto">
        <div class="p-4 md:p-8">
          <RouterView />
        </div>
      </main>

      <Footer />
    </div>
  </div>
</template>
