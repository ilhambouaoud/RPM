<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import Navbar from '@/components/Navbar.vue'
import Footer from '@/components/Footer.vue'
import {
  LayoutDashboard,
  Building2,
  Settings,
  ChevronLeft,
  ChevronRight,
  Target,
} from 'lucide-vue-next'
import { UsersIcon } from 'lucide-vue-next'
import { History } from 'lucide-vue-next'

const route = useRoute()


// sidebar
const sidebarOpen = ref(true)
const isMobile = ref(false)

// dark mode
const darkMode = ref(true)

// Récupérer l'ID du portique depuis la route
const portiqueId = computed(() => route.params.id as string)

// Navigation dynamique - le chemin change selon le portique
const navigation = computed(() => {

  const role = localStorage.getItem("role")

const items = [

  {
    name: 'Dashboard',
    path: portiqueId.value
      ? `/portique/${portiqueId.value}`
      : '/portiques',
    icon: LayoutDashboard
  },

  {
    name: 'Porticos',
    path: '/portiques',
    icon: Building2
  },
  {
    name: 'History',
    path: '/history',
    icon: History 
  },

]

// ADMIN ONLY
if (role === "admin") {

  items.push({
    name: 'Calibration',
    path: portiqueId.value
      ? `/portique/${portiqueId.value}/calibration`
      : '/portiques',
    icon: Target
  })

  items.push({
    name: 'Users Management',
    path: '/Users',
    icon: UsersIcon
  })

}

// TOUJOURS EN DERNIER
items.push({
  name: 'Settings',
  path: '/settings',
  icon: Settings
})

return items
})

// Responsive
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

// Theme toggle
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

// Mounted
onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)

  // Charger thème sauvegardé
  const saved = localStorage.getItem("theme")

  if (saved === "light") {
    darkMode.value = false
    document.documentElement.classList.remove("dark")
  } else {
    darkMode.value = true
    document.documentElement.classList.add("dark")
  }
})

// Cleanup
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
        <router-link 
          v-for="item in navigation" 
          :key="item.path" 
          :to="item.path" 
          @click="closeSidebarOnMobile" 
          :class="[
            'flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-sm',
            route.path === item.path || (item.name === 'Dashboard' && route.path.includes('/portique/') && !route.path.includes('/calibration'))
              ? 'bg-primary text-primary-foreground'
              : 'hover:bg-accent hover:text-accent-foreground'
          ]"
        >
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

      <Footer/>
    </div>
  </div>
</template>