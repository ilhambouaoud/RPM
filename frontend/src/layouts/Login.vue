<template>
  <div class="min-h-screen flex items-center justify-center bg-background px-4">

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
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const email = ref('')
const password = ref('')
const error = ref('')

import axios from "axios"

const login = async () => {
  error.value = ""

  try {
    const res = await axios.post("http://localhost:3000/api/login", {
      email: email.value,
      password: password.value,
    });

    // Stocker les infos
    localStorage.setItem("token", res.data.token);
    localStorage.setItem("role", res.data.role);
    localStorage.setItem("username", res.data.username);

    router.push("/portiques");

  } catch (err) {
    error.value = err.response?.data?.message || "Login error";
  }
};
</script>