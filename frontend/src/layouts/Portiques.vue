<script setup>
import { ref, onMounted } from "vue"
import { useRouter } from "vue-router"
import axios from "axios"
import Navbar from "@/components/Navbar.vue"
import Footer from "@/components/Footer.vue"

const router = useRouter()

const portiques = ref([])

// 🌙 DARK MODE
const darkMode = ref(false)

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

// 🔁 charger thème sauvegardé
onMounted(() => {
  const saved = localStorage.getItem("theme")

  if (saved === "dark") {
    darkMode.value = true
    document.documentElement.classList.add("dark")
  }
})

// bouton ajouter
const goToAddPortal = () => {
  router.push('/addPortique')
}

// ouvrir dashboard
const openDashboard = (id) => {
  router.push(`/portique/${id}`)
}

// récupérer les portiques
onMounted(async () => {
  try {
    const res = await axios.get("http://localhost:3000/api/portiques")
    portiques.value = res.data
  } catch (error) {
    console.error("Erreur récupération portiques", error)
  }
})
</script>

<template>
<div class="flex flex-col min-h-screen bg-gray-100 dark:bg-slate-950 transition">

  <!-- NAVBAR -->
  <Navbar 
    :onToggleSidebar="() => {}"
    :darkMode="darkMode"
    :toggleTheme="toggleTheme"
  />

  <!-- CONTENU -->
  <div class="flex-1 p-6">

    <!-- HEADER -->
    <div class="flex justify-between items-center mb-8">

      <div>
        <h1 class="text-2xl font-bold text-black dark:text-white">
          Radiation Portals
        </h1>

        <p class="text-gray-600 dark:text-gray-400">
          Monitoring and management of RPM portals
        </p>
      </div>

      <!-- BOUTON -->
      <button
        @click="goToAddPortal"
        class="px-5 py-2 
               bg-green-500 hover:bg-green-600
               dark:bg-blue-600 dark:hover:bg-blue-700
               text-white rounded-lg shadow transition"
      >
        + Add Portal
      </button>

    </div>

    <!-- GRID -->
    <div class="grid md:grid-cols-3 gap-6">

      <!-- CARD -->
      <div
        v-for="p in portiques"
        :key="p._id"
        @click="openDashboard(p._id)"
        class="bg-white dark:bg-slate-900
               border border-gray-200 dark:border-slate-700
               rounded-xl p-6 cursor-pointer
               hover:border-blue-500 transition shadow-lg"
      >

        <h2 class="text-lg font-semibold text-black dark:text-white mb-2">
          {{ p.nom }}
        </h2>

        <p class="text-gray-600 dark:text-gray-400 text-sm mb-4">
          {{ p.localisation }}
        </p>

        <div class="flex justify-between items-center">

          <span class="text-sm text-gray-600 dark:text-gray-400">
            Status
          </span>

          <span
            :class="p.etat === 'actif'
            ? 'text-green-500'
            : 'text-red-500'"
            class="font-semibold"
          >
            {{ p.etat }}
          </span>

        </div>

      </div>

    </div>

  </div>

  <!-- FOOTER -->
  <Footer />

</div>
</template>