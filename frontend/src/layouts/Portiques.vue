<script setup>
import { ref, onMounted } from "vue"
import { useRouter } from "vue-router"
import axios from "axios"
import Navbar from "@/components/Navbar.vue"
import Footer from "@/components/Footer.vue"


const router = useRouter()

const portiques = ref([])

// bouton ajouter
const goToAddPortal = () => {
  router.push('/addPortique')
}

// ouvrir dashboard du portique
const openDashboard = (id) => {
  router.push(`/portique/${id}`)
}

// récupérer les portiques depuis backend
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

<div class="flex flex-col min-h-screen">

  <Navbar :onToggleSidebar="() => {}" />

  <!-- contenu principal -->
  <div class="flex-1 p-6">

    <!-- Header -->
    <div class="flex justify-between items-center mb-8">

      <div>
        <h1 class="text-2xl font-bold text-white">
          Radiation Portals
        </h1>

        <p class="text-gray-400">
          Monitoring and management of RPM portals
        </p>
      </div>

      <button
        @click="goToAddPortal"
        class="px-5 py-2 bg-blue-600 hover:bg-blue-700
               text-white rounded-lg shadow transition"
      >
        + Add Portal
      </button>

    </div>

    <!-- Portiques Grid -->
    <div class="grid md:grid-cols-3 gap-6">

      <div
        v-for="p in portiques"
        :key="p._id"
        @click="openDashboard(p._id)"
        class="bg-slate-900 border border-slate-700 rounded-xl p-6
               cursor-pointer hover:border-blue-500
               transition shadow-lg"
      >

        <h2 class="text-lg font-semibold text-white mb-2">
          {{ p.nom }}
        </h2>

        <p class="text-gray-400 text-sm mb-4">
          {{ p.localisation }}
        </p>

        <div class="flex justify-between items-center">

          <span class="text-sm text-gray-400">
            Status
          </span>

          <span
            :class="p.etat === 'actif'
            ? 'text-green-400'
            : 'text-red-400'"
            class="font-semibold"
          >
            {{ p.etat }}
          </span>

        </div>

      </div>

    </div>

  </div>

  <!-- Footer -->
  <Footer />

</div>

</template>