<script setup>
import { ref, onMounted } from "vue"
import axios from "axios"

const message = ref("")

onMounted(async () => {
  try {
    const res = await axios.get("http://localhost:3000/api/test")
    message.value = res.data.message
  } catch (error) {
    console.error(error)
  }
})
</script>

<template>
  <h1>{{ message }}</h1>
</template>