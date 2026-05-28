<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import {Menu, User, LogOut, ChevronDown } from 'lucide-vue-next'





const props = defineProps<{
  onToggleSidebar: () => void
  darkMode: boolean
  toggleTheme: () => void
}>()

const router = useRouter()

const accountDropdownOpen = ref(false)



const toggleAccountDropdown = () => {
  accountDropdownOpen.value = !accountDropdownOpen.value
}

const closeAccountDropdown = () => {
  accountDropdownOpen.value = false
}

const handleLogout = () => {
  localStorage.removeItem('token')
  closeAccountDropdown()
  router.replace('/login')
}
</script>

<template>
  <nav class="bg-card border-b sticky top-0 z-40">
    <div class="px-4 lg:px-8">
      <div class="flex items-center justify-between h-16">

        <!-- LEFT -->
        <div class="flex items-center gap-4">

          <!-- sidebar mobile -->
          <button
            @click="props.onToggleSidebar"
            class="lg:hidden p-2 hover:bg-accent rounded-md"
          >
            <Menu :size="20" />
          </button>

          <!-- 🌙 Dark Mode -->
          <button
            @click="props.toggleTheme"
            class="ml-4 px-3 py-2 rounded-lg
                   bg-gray-200 dark:bg-slate-700
                   text-black dark:text-white"
          >
            {{ props.darkMode ? "☀️" : "🌙" }}
          </button>

        </div>

        <!-- RIGHT -->
        <div class="flex items-center gap-2">

          <!-- sidebar desktop -->
          <button
            @click="props.onToggleSidebar"
            class="hidden lg:block p-2 hover:bg-accent rounded-md"
          >
            <Menu :size="20" />
          </button>

          <!-- account -->
          <div class="relative">
            <button
              @click="toggleAccountDropdown"
              class="flex items-center gap-2 px-3 py-2 hover:bg-accent rounded-md"
            >
              <div class="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center">
                <User :size="18" />
              </div>
              <span class="hidden sm:block text-sm font-medium">Account</span>
              <ChevronDown :size="16" class="hidden sm:block" />
            </button>

            <!-- overlay -->
            <div
              v-if="accountDropdownOpen"
              @click="closeAccountDropdown"
              class="fixed inset-0 z-40"
            ></div>

            <!-- dropdown -->
            <div
              v-if="accountDropdownOpen"
              class="absolute right-0 mt-2 w-56 bg-card border rounded-md shadow-lg py-1 z-50"
            >
              <div class="px-4 py-3 border-b">
                <p class="text-sm font-medium">Aziz Benahmed</p>
                <p class="text-xs text-muted-foreground">aziz@example.com</p>
              </div>

              <button
                @click="handleLogout"
                class="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-accent text-red-600"
              >
                <LogOut :size="16" />
                <span>Logout</span>
              </button>
            </div>

          </div>
        </div>

      </div>
    </div>
  </nav>
</template>