<script setup lang="ts">
import { ref, onMounted } from "vue"
import axios from "axios"

import Card from '@/components/ui/Card.vue'
import CardHeader from '@/components/ui/CardHeader.vue'
import CardTitle from '@/components/ui/CardTitle.vue'
import CardContent from '@/components/ui/CardContent.vue'
import Button from '@/components/ui/Button.vue'

// 🔹 State
const username = ref("")
const email = ref("")
const password = ref("")
const userId = ref("")

console.log("Settings page loaded")

// ✅ Charger user
onMounted(async () => {
  try {
    const res = await axios.get(
      "http://localhost:3000/api/me",
      {
        withCredentials: true   // 🔥 IMPORTANT (session)
      }
    )

    console.log("USER DATA:", res.data)

    // 🔥 Vérification
    if (!res.data || !res.data._id) {
      console.error("ID manquant ❌")
      return
    }

    userId.value = res.data._id
    username.value = res.data.username
    email.value = res.data.email

    console.log("USER ID SET:", userId.value)

  } catch (error) {
    console.error("Erreur chargement utilisateur", error)
  }
})


// ✅ UPDATE USER
async function saveChanges() {
  console.log("button clicked")
  console.log("USER ID:", userId.value)

  // 🔴 sécurité anti bug
  if (!userId.value) {
    alert("User ID manquant ❌")
    return
  }

  try {
    const res = await axios.put(
      `http://localhost:3000/api/user/update/${userId.value}`,
      {
        username: username.value,
        email: email.value,
        password: password.value
      },
      {
        withCredentials: true   // 🔥 IMPORTANT
      }
    )

    console.log("SUCCESS", res.data)

    password.value = ""

    alert("Profil mis à jour avec succès ✅")

  } catch (error) {
    console.error("ERROR UPDATE", error)
    alert("Erreur lors de la mise à jour ❌")
  }
}
</script>


<template>
  <div class="space-y-6">

    <div>
      <h1 class="text-xl font-bold tracking-tight">Settings</h1>
      <p class="text-muted-foreground">
        Manage your application preferences
      </p>
    </div>

    <Card>
      <CardHeader>
        <CardTitle>Profile Settings</CardTitle>
      </CardHeader>

      <CardContent class="space-y-4">

        <!-- NAME -->
        <div class="space-y-2">
          <label class="text-sm font-medium">Name</label>
          <input 
            v-model="username"
            type="text"
            class="w-full p-2 border border-input rounded-md bg-background outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <!-- EMAIL -->
        <div class="space-y-2">
          <label class="text-sm font-medium">Email Address</label>
          <input 
            v-model="email"
            type="email"
            class="w-full p-2 border border-input rounded-md bg-background outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <!-- PASSWORD -->
        <div class="space-y-2">
          <label class="text-sm font-medium">Password</label>
          <input 
            v-model="password"
            type="password"
            placeholder="********"
            class="w-full p-2 border border-input rounded-md bg-background outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <!-- BUTTON -->
        <Button size="sm" @click="saveChanges">
          Save Changes
        </Button>

      </CardContent>
    </Card>

  </div>
</template>