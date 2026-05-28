<template>
  <div
    class="min-h-screen p-6
    bg-background text-foreground"
  >

    <div class="max-w-3xl mx-auto">

      <!-- HEADER -->
      <div class="mb-8">

        <h1
          class="text-3xl font-bold tracking-tight"
        >
          Create User
        </h1>

        <p
          class="text-muted-foreground mt-2"
        >
          Add and manage system users with
          permissions and account settings
        </p>

      </div>

      <!-- CARD -->
      <div
        class="rounded-3xl border
        bg-card/60
        backdrop-blur-xl
        shadow-2xl
        p-8"
      >

        <form
          @submit.prevent="createUser"
          class="space-y-8"
        >

          <!-- GRID -->
          <div
            class="grid grid-cols-1
            md:grid-cols-2 gap-6"
          >

            <!-- USERNAME -->
            <div class="space-y-2">

              <label
                class="text-sm font-medium"
              >
                Username
              </label>

              <input
                v-model="form.username"
                type="text"
                placeholder="Enter username"
                class="w-full h-12 rounded-xl
                border bg-background px-4
                outline-none
                focus:ring-2
                focus:ring-blue-500
                transition"
              />

            </div>

            <!-- EMAIL -->
            <div class="space-y-2">

              <label
                class="text-sm font-medium"
              >
                Email
              </label>

              <input
                v-model="form.email"
                type="email"
                placeholder="Enter email"
                class="w-full h-12 rounded-xl
                border bg-background px-4
                outline-none
                focus:ring-2
                focus:ring-blue-500
                transition"
              />

            </div>

            <!-- PASSWORD -->
            <div class="space-y-2">

              <label
                class="text-sm font-medium"
              >
                Password
              </label>

              <input
                v-model="form.password"
                type="password"
                placeholder="Enter password"
                class="w-full h-12 rounded-xl
                border bg-background px-4
                outline-none
                focus:ring-2
                focus:ring-blue-500
                transition"
              />

            </div>

            <!-- ROLE -->
            <div class="space-y-2">

              <label
                class="text-sm font-medium"
              >
                Role
              </label>

              <select
                v-model="form.role"
                class="w-full h-12 rounded-xl
                border bg-background px-4
                outline-none
                focus:ring-2
                focus:ring-blue-500
                transition"
              >

                <option value="user">
                  User
                </option>

                <option value="admin">
                  Admin
                </option>

              </select>

            </div>

            <!-- STATUS -->
            <div class="space-y-2">

              <label
                class="text-sm font-medium"
              >
                Account Status
              </label>

              <select
                v-model="form.is_active"
                class="w-full h-12 rounded-xl
                border bg-background px-4
                outline-none
                focus:ring-2
                focus:ring-blue-500
                transition"
              >

                <option :value="true">
                  Active
                </option>

                <option :value="false">
                  Disabled
                </option>

              </select>

            </div>

            <!-- LAST LOGIN -->
            <div class="space-y-2">

              <label
                class="text-sm font-medium"
              >
                Last Login
              </label>

              <input
                :value="lastLoginText"
                disabled
                class="w-full h-12 rounded-xl
                border bg-muted px-4
                opacity-70 cursor-not-allowed"
              />

            </div>

            <!-- CREATED DATE -->
            <div class="space-y-2">

              <label
                class="text-sm font-medium"
              >
                Creation Date
              </label>

              <input
                :value="creationDate"
                disabled
                class="w-full h-12 rounded-xl
                border bg-muted px-4
                opacity-70 cursor-not-allowed"
              />

            </div>

            <!-- PASSWORD HASH -->
            <div class="space-y-2">

              <label
                class="text-sm font-medium"
              >
                Password Hash
              </label>

              <input
                value="Generated automatically"
                disabled
                class="w-full h-12 rounded-xl
                border bg-muted px-4
                opacity-70 cursor-not-allowed"
              />

            </div>

          </div>

          <!-- INFO CARD -->
          <div
            class="rounded-2xl border
            bg-muted/40 p-5"
          >

            <h2
              class="font-semibold mb-3"
            >
              User Information
            </h2>

            <div
              class="grid grid-cols-1
              md:grid-cols-2 gap-3
              text-sm"
            >

              <div>
                <span class="font-medium">
                  Role:
                </span>
                {{ form.role }}
              </div>

              <div>
                <span class="font-medium">
                  Status:
                </span>

                <span
                  :class="
                    form.is_active
                    ? 'text-green-500'
                    : 'text-red-500'
                  "
                >
                  {{
                    form.is_active
                    ? 'Active'
                    : 'Disabled'
                  }}
                </span>

              </div>

              <div>
                <span class="font-medium">
                  Creation:
                </span>
                {{ creationDate }}
              </div>

              <div>
                <span class="font-medium">
                  Security:
                </span>
                Bcrypt Encryption
              </div>

            </div>

          </div>

          <!-- BUTTONS -->
          <div
            class="flex flex-wrap gap-4 pt-2"
          >


            <Button
              type="submit"
              class="h-12 px-8 rounded-xl
              bg-green-600
              hover:bg-green-700  
              text-white font-medium
              transition-all duration-300
              shadow-lg hover:shadow-xl
              hover:scale-[1.02]
            dark:bg-blue-600
            dark:hover:bg-blue-700"
            >
              Create User
            </Button>

            <button
              type="button"
              @click="resetForm"
              class="h-12 px-8 rounded-xl
              border hover:bg-muted
              transition"
            >
              Reset
            </button>

          </div>

        </form>

      </div>

    </div>

  </div>
</template>

<script setup>
import axios from "axios"
import { reactive, computed } from "vue"


const form = reactive({
  username: "",
  email: "",
  password: "",
  role: "user",
  is_active: true
})

const creationDate = computed(() => {

  return new Date()
    .toLocaleString()

})

const lastLoginText = computed(() => {

  return "Never logged in"

})

const resetForm = () => {

  form.username = ""
  form.email = ""
  form.password = ""
  form.role = "user"
  form.is_active = true

}

const createUser = async () => {

  try {

    const res = await axios.post(
      "http://localhost:3000/api/create",
      form,
      {
        withCredentials: true
      }
    )

    alert(res.data.message)

    resetForm()

    }catch (error) {

  console.log("FULL ERROR =", error)

  console.log(
    "BACKEND ERROR =",
    error.response?.data
  )

  alert(
    error.response?.data?.message ||
    "Error creating user"
  )

}
}
</script>