<script setup>

import { ref } from "vue"
import axios from "axios"
import { useRouter } from "vue-router"

const router = useRouter()

const success = ref(false)

const form = ref({
  nom: "",
  localisation: "",
  etat: "actif",
  tension_actuelle: "",
  date_maintenance: ""
})

const submitForm = async () => {

  try {

    await axios.post(
      "http://localhost:3000/api/portiques",
      form.value
    )

    success.value = true

    setTimeout(() => {
      router.push("/portiques")
    }, 1500)

  } catch (error) {

    console.error("Erreur ajout portique", error)

  }

}

const cancel = () => {
  router.push("/portiques")
}

</script>

<template>

<div class="min-h-screen flex items-center justify-center bg-background px-4 py-12">

  <div class="w-full max-w-2xl bg-card text-card-foreground
              rounded-2xl border border-primary/20 shadow-lg p-8">

    <!-- HEADER -->
    <div class="mb-8 border-b pb-4 text-center">
      <h1 class="text-xl font-semibold tracking-tight">
        Add a Detection Portal
      </h1>

      <p class="text-sm text-muted-foreground mt-1">
        Configure and register a new radiation detection portal
      </p>
    </div>

    <form @submit.prevent="submitForm" class="space-y-8">

      <!-- SECTION INFORMATIONS -->
      <div>

        <h2 class="text-sm font-semibold text-primary mb-4 uppercase tracking-wide">
          General Information
        </h2>

        <div class="grid md:grid-cols-2 gap-6">

          <!-- Nom du portique -->
          <div>
            <label class="block text-sm font-medium mb-1">
              Portal Name
            </label>

            <input
              v-model="form.nom"
              type="text"
              required
              class="w-full rounded-lg border border-border bg-background px-3 py-2
                     focus:ring-2 focus:ring-primary/60 focus:outline-none"
            />
          </div>

          <!-- Localisation -->
          <div>
            <label class="block text-sm font-medium mb-1">
              Location
            </label>

            <input
              v-model="form.localisation"
              type="text"
              required
              class="w-full rounded-lg border border-border bg-background px-3 py-2
                     focus:ring-2 focus:ring-primary/60 focus:outline-none"
            />
          </div>

        </div>

      </div>

      <!-- SECTION CONFIGURATION -->
      <div>

        <h2 class="text-sm font-semibold text-primary mb-4 uppercase tracking-wide">
          Portal Configuration
        </h2>

        <div class="grid md:grid-cols-2 gap-6">

          <!-- Etat -->
          <div>
            <label class="block text-sm font-medium mb-1">
              Status
            </label>

            <select
              v-model="form.etat"
              class="w-full rounded-lg border border-border bg-background px-3 py-2
                     focus:ring-2 focus:ring-primary/60 focus:outline-none"
            >
              <option value="actif">Actif</option>
              <option value="maintenance">inActif</option>
              <option value="hors service">Hors Service</option>
            </select>
          </div>

          <!-- Tension actuelle -->
          <div>
            <label class="block text-sm font-medium mb-1">
              Current Voltage (V)
            </label>

            <input
              type="number"
              v-model="form.tension_actuelle"
              required
              class="w-full rounded-lg border border-border bg-background px-3 py-2
                     focus:ring-2 focus:ring-primary/60 focus:outline-none"
            />
          </div>

        </div>

      </div>

      <!-- SECTION MAINTENANCE -->
      <div>

        <h2 class="text-sm font-semibold text-primary mb-4 uppercase tracking-wide">
          Maintenance
        </h2>

        <div>

          <label class="block text-sm font-medium mb-1">
            Maintenance Date
          </label>

          <input
            type="date"
            v-model="form.date_maintenance"
            class="w-full rounded-lg border border-border bg-background px-3 py-2
                   focus:ring-2 focus:ring-primary/60 focus:outline-none"
          />

        </div>

      </div>

      <!-- FOOTER ACTIONS -->
      <div class="border-t pt-6 flex justify-between items-center">

        <span class="text-xs text-muted-foreground">
          All required fields must be completed.
        </span>

        <div class="flex gap-3">

          <!-- Cancel -->
          <button
            type="button"
            @click="cancel"
            class="px-4 py-2 rounded-lg border border-border
                   hover:bg-gray-200 transition duration-200 text-blue-600"
          >
            Cancel
          </button>

          <!-- Save -->
          <button
            type="submit"
            class="px-5 py-2 rounded-lg bg-primary text-primary-foreground
                   hover:opacity-90 transition shadow"
          >
            Save Portal
          </button>

        </div>

      </div>

    </form>

    <!-- Message Success -->
    <div
      v-if="success"
      class="mt-6 text-center text-green-500 text-sm font-medium"
    >
      ✔ Portal successfully registered
    </div>

  </div>

</div>

</template>