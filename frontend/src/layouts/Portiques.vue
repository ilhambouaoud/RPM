<script setup>
import { ref, onMounted } from "vue"
import { useRouter } from "vue-router"
import axios from "axios"
import Navbar from "@/components/Navbar.vue"
import Footer from "@/components/Footer.vue"

import {
  MoreVertical,
  Pencil,
  Trash2
} from "lucide-vue-next"

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

const selectedMenu = ref(null)

const showEditModal = ref(false)

const editForm = ref({
  _id: "",
  nom: "",
  localisation: "",
  etat: ""
})

const editPortique = (portique) => {

  editForm.value = {
    _id: portique._id,
    nom: portique.nom,
    localisation: portique.localisation,
    etat: portique.etat
  }

  showEditModal.value = true
}
const savePortique = async () => {
  try {
    console.log("ID =", editForm.value._id)
    console.log("DATA =", editForm.value)
    const res = await axios.put(
      `http://localhost:3000/api/portiques/${editForm.value._id}`,
      {
        nom: editForm.value.nom,
        localisation: editForm.value.localisation,
        etat: editForm.value.etat
      },
      {
        withCredentials: true
      }
    )
    console.log("UPDATED =", res.data)
    const index = portiques.value.findIndex(
      p => p._id === editForm.value._id
    )

    if (index !== -1) {
      portiques.value[index] = res.data
    }

    showEditModal.value = false

  } catch (error) {
    console.error(error)
  }
}

const deletePortique = async (id) => {

  if (!confirm("Delete this portal ?"))
    return

  try {

    await axios.delete(
      `http://localhost:3000/api/portiques/${id}`
    )

    portiques.value =
      portiques.value.filter(
        p => p._id !== id
      )

  } catch (error) {

    console.error(error)

  }

}
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
      <!-- CARD -->
<div
  v-for="p in portiques"
  :key="p._id"
  @click="openDashboard(p._id)"
  class="
    bg-white dark:bg-slate-900
    border border-gray-200 dark:border-slate-700
    rounded-xl p-6 cursor-pointer
    hover:border-blue-500
    hover:shadow-xl
    transition-all duration-300
    shadow-lg
  "
>

  <!-- HEADER -->
  <div class="flex justify-between items-start mb-5">

    <div>

      <h2
        class="
          text-lg font-semibold
          text-black dark:text-white
        "
      >
        {{ p.nom }}
      </h2>

      <p
        class="
          text-xs
          text-gray-500
          dark:text-gray-400
          mt-1
        "
      >
        Radiation Monitoring Portal
      </p>

    </div>

    <!-- STATUS + MENU -->
    <div class="flex items-center gap-2">

      <span
        :class="
          p.etat === 'actif'
          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
          : p.etat === 'maintenance'
          ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
          : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
        "
        class="
          px-3 py-1
          rounded-full
          text-xs
          font-medium
        "
      >
        {{ p.etat }}
      </span>

      <!-- MENU -->
      <div class="relative">

        <button
          @click.stop="selectedMenu = selectedMenu === p._id ? null : p._id"
          class="
            p-1 rounded-md
            hover:bg-gray-100
            dark:hover:bg-slate-800
            text-lg
            font-bold
          "
        >
          ⋮
        </button>

        <div
          v-if="selectedMenu === p._id"
          class="
            absolute right-0 top-8
            w-44
            bg-white dark:bg-slate-900
            border border-gray-200 dark:border-slate-700
            rounded-lg shadow-xl
            overflow-hidden
            z-50
          "
        >

<button
  @click.stop="editPortique(p)"
  class="
    w-full text-left
    px-4 py-3
    hover:bg-gray-100
    dark:hover:bg-slate-800
    transition
  "
>
  <div class="flex items-center gap-2">
    <Pencil class="w-4 h-4 text-blue-500" />
    <span>Edit Portal</span>
  </div>
</button>

<button
  @click.stop="deletePortique(p._id)"
  class="
    w-full text-left
    px-4 py-3
    hover:bg-gray-100
    dark:hover:bg-slate-800
    transition
  "
>
  <div class="flex items-center gap-2">
    <Trash2 class="w-4 h-4 text-red-500" />
    <span class="text-red-500">
      Delete Portal
    </span>
  </div>
</button>

        </div>

      </div>

    </div>

  </div>

  <!-- INFOS -->
 <!-- INFOS -->
<div class="space-y-3">

  <!-- Localisation -->
  <div class="flex justify-between">
    <span
      class="
        text-gray-500
        dark:text-gray-400
        text-sm
      "
    >
      Location
    </span>

    <span
      class="
        text-sm
        font-medium
        text-black
        dark:text-white
      "
    >
      {{ p.localisation }}
    </span>
  </div>

  <!-- Etat -->
  <div class="flex justify-between">
    <span
      class="
        text-gray-500
        dark:text-gray-400
        text-sm
      "
    >
      Status
    </span>

    <span
      class="
        text-sm
        font-medium
        text-black
        dark:text-white
      "
    >
      {{ p.etat }}
    </span>
  </div>

  <!-- Maintenance -->
  <div class="flex justify-between">
    <span
      class="
        text-gray-500
        dark:text-gray-400
        text-sm
      "
    >
      Maintenance
    </span>

    <span
      class="
        text-sm
        font-medium
        text-black
        dark:text-white
      "
    >
      {{
        p.date_maintenance
          ? new Date(p.date_maintenance).toLocaleDateString()
          : "N/A"
      }}
    </span>
  </div>

  <!-- Création -->
  <div class="flex justify-between">
    <span
      class="
        text-gray-500
        dark:text-gray-400
        text-sm
      "
    >
      Created
    </span>

    <span
      class="
        text-sm
        font-medium
        text-black
        dark:text-white
      "
    >
      {{
        p.date_creation
          ? new Date(p.date_creation).toLocaleDateString()
          : "N/A"
      }}
    </span>
  </div>

</div>
  <!-- FOOTER -->
  <div
    class="
      mt-5 pt-4
      border-t
      border-gray-200
      dark:border-slate-700
      flex justify-between items-center
    "
  >

    <span
      class="
        text-xs
        text-gray-500
        dark:text-gray-400
      "
    >
      Click to open dashboard
    </span>

    <div
      class="
        h-2 w-2 rounded-full
      "
      :class="
        p.etat === 'actif'
        ? 'bg-green-500'
        : p.etat === 'maintenance'
        ? 'bg-yellow-500'
        : 'bg-red-500'
      "
    />

  </div>

</div>

  </div>
  </div>
  <!-- MODAL EDIT -->
<div
  v-if="showEditModal"
  class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
>
  <div
    class="
      bg-white dark:bg-slate-900
      rounded-xl shadow-xl
      w-full
      max-w-md
      p-6
    "
  >

    <h2
      class="text-lg font-semibold mb-4 text-black dark:text-white"
    >
      Edit Portal
    </h2>

    <div class="space-y-4">

      <input
        v-model="editForm.nom"
        type="text"
        placeholder="Portal Name"
        class="w-full border rounded-lg px-3 py-2 bg-transparent"
      />

      <input
        v-model="editForm.localisation"
        type="text"
        placeholder="Location"
        class="w-full border rounded-lg px-3 py-2 bg-transparent"
      />

<select
  v-model="editForm.etat"
  class="
    w-full
    border
    rounded-lg
    px-3
    py-2
    bg-white
    text-black
    dark:bg-slate-800
    dark:text-white
    dark:border-slate-600
  "
>
  <option value="actif">Actif</option>
  <option value="maintenance">Maintenance</option>
  <option value="hors service">Hors Service</option>
</select>

    </div>

    <div class="flex justify-end gap-3 mt-6">

      <button
        @click="showEditModal=false"
        class="px-4 py-2 border rounded-lg"
      >
        Cancel
      </button>

      <button
        @click="savePortique"
        class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg
              dark:bg-blue-600 dark:hover:bg-blue-700"
      >
        Save
      </button>

    </div>

  </div>

</div>
  <!-- FOOTER -->
  <Footer />

</div>
</template>