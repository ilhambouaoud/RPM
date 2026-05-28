<template>
  <div class="min-h-screen flex items-center justify-center bg-background px-4 relative">

    <!-- 🌙 DARK MODE BUTTON STYLE PORTIQUE -->
    <div class="absolute top-4 right-4">
      <button
        @click="toggleDark"
        class="w-14 h-14 flex items-center justify-center
               rounded-xl
               bg-gray-200/60 dark:bg-white/10
               backdrop-blur-md
               border border-white/20
               shadow-md
               hover:scale-105 transition"
      >
        <span class="text-xl">
          {{ isDark ? "☀️" : "🌙" }}
        </span>
      </button>
    </div>

    <!-- Container -->
    <div class="w-full max-w-md">

      <!-- Card -->
      <div class="bg-card border border-border shadow-lg rounded-xl p-8">

        <!-- Logo -->
        <div class="flex flex-col items-center mb-8">
          <img
            src="@/assets/pictures/CNESTEN_nuit.png"
            alt="CNESTEN"
            class="w-16"
          />
          <p class="text-sm text-muted-foreground text-center mt-1">
            Radiation Portal Monitoring System
          </p>
        </div>

        <!-- Form -->
        <form @submit.prevent="login" class="space-y-5">

          <!-- Email -->
          <div class="space-y-1">
            <label class="text-sm font-medium">
              Corporate Email
            </label>
            <input
              v-model="email"
              type="email"
              required
              placeholder="user@cnesten.ma"
              class="w-full h-10 rounded-md border border-input bg-background px-3 text-sm
                     focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <!-- Password -->
          <div class="space-y-1">
            <label class="text-sm font-medium">
              Password
            </label>
            <input
              v-model="password"
              type="password"
              required
              placeholder="••••••••"
              class="w-full h-10 rounded-md border border-input bg-background px-3 text-sm
                     focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <!-- Remember -->
          <div class="flex items-center justify-between text-sm">
            <label class="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" class="accent-primary" />
              Remember session
            </label>

            <a href="#" class="text-primary hover:underline">
              Forgot password?
            </a>
          </div>

          <!-- Button -->
          <button
            type="submit"
            class="w-full h-10 bg-primary text-primary-foreground rounded-md
                   hover:opacity-90 transition font-medium"
          >
            Sign in
          </button>

        </form>

        <!-- Error -->
        <p v-if="error" class="text-destructive text-sm mt-4 text-center">
          {{ error }}
        </p>

        <!-- Footer -->
        <div class="mt-6 border-t pt-4 text-center">
          <p class="text-xs text-muted-foreground leading-relaxed">
            Restricted access. Authorized personnel only. <br />
            All system activities are monitored and audited.
          </p>
        </div>

      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from "axios"

const token = localStorage.getItem('token')

const router = useRouter()

const email = ref('')
const password = ref('')
const error = ref('')

/* ================= DARK MODE ================= */

const isDark = ref(false)

const toggleDark = () => {
  const html = document.documentElement
  html.classList.toggle("dark")

  isDark.value = html.classList.contains("dark")

  localStorage.setItem(
    "theme",
    isDark.value ? "dark" : "light"
  )
}

onMounted(() => {
  const theme = localStorage.getItem("theme")

  if (theme === "dark") {
    document.documentElement.classList.add("dark")
    isDark.value = true
  }
})

/* ================= LOGIN ================= */

const login = async () => {

  error.value = ""

  try {

    const res = await axios.post(
      "http://localhost:3000/api/login",

      {
        email: email.value,
        password: password.value,
      },

      {
        withCredentials: true
      }
    );

    console.log("LOGIN SUCCESS =", res.data);

    // SAVE USER DATA
    localStorage.setItem(
      "role",
      res.data.user.role
    );

    localStorage.setItem(
      "username",
      res.data.user.username
    );

    localStorage.setItem(
      "email",
      res.data.user.email
    );

    // IMPORTANT
    localStorage.setItem(
      "user",
      JSON.stringify(res.data.user)
    );

    router.push("/portiques");

  } catch (err) {

    error.value =
      err.response?.data?.message ||
      "Erreur login";

  }

};
</script>