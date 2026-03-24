<script setup lang="ts">
 import { ref, onMounted } from "vue" 
 import axios from "axios" 
 import Card from '@/components/ui/Card.vue' 
 import CardHeader from '@/components/ui/CardHeader.vue' 
 import CardTitle from '@/components/ui/CardTitle.vue' 
 import CardContent from '@/components/ui/CardContent.vue'
 import Button from '@/components/ui/Button.vue'


const username = ref("")
const email = ref("")
const password = ref("")
const userId = ref("")

console.log("Settings page loaded")

onMounted(async () => {

  try {

    const res = await axios.get(
      "http://localhost:3000/api/me"
    )

    userId.value = res.data.id
    username.value = res.data.username
    email.value = res.data.email

  } catch (error) {

    console.error("Erreur chargement utilisateur", error)

  }

})

async function saveChanges() {


  console.log("button clicked")


  await axios.post(
    `http://localhost:3000/api/user/update/${userId.value}`,
    {
      username: username.value,
      email: email.value,
      password: password.value
    }
  )

}

function saveChangess() {
  console.log("CLICK WORKS")
}
</script>

<template>

  <div class="space-y-6">
    <div>
      <h1 class="text-xl font-bold tracking-tight">Settings</h1>
      <p class="text-muted-foreground">Manage your application preferences</p>
    </div>

    <Card>
      <CardHeader>
        <CardTitle>Profile Settings</CardTitle>
      </CardHeader>
      <CardContent class="space-y-4">
      
        
      <div class="space-y-2">
  <label class="text-sm font-medium">Full Name</label>
  <input 
    v-model="username"
    type="text" :placeholder="username"
    class="w-full p-2 border border-input rounded-md bg-background outline-none focus:ring-2 focus:ring-ring"
  />
</div>

<div class="space-y-2">
  <label class="text-sm font-medium">Email Address</label>
  <input 
    v-model="email"
    type="email"
    class="w-full p-2 border border-input rounded-md bg-background outline-none focus:ring-2 focus:ring-ring"
  />
</div>

<div class="space-y-2">
  <label class="text-sm font-medium">Password</label>
  <input 
    v-model="password"
    type="password"
    placeholder="********"
    class="w-full p-2 border border-input rounded-md bg-background outline-none focus:ring-2 focus:ring-ring"
  />
</div>

        <Button size="sm" @click="saveChanges">Save Changes</Button>
       
        
      </CardContent>
    </Card>

  </div>
</template>
