<template>
  <div class="p-6">

    <!-- HEADER -->
    <div class="flex items-center justify-between mb-6">

      <div>
        <h1 class="text-3xl font-bold">
          Users Management
        </h1>

        <p class="text-muted-foreground mt-1">
          Manage system users and permissions
        </p>
      </div>

      <router-link
        to="/create-user"
        class="
          flex items-center gap-2
          px-4 py-2
          rounded-xl
          bg-green-600
          hover:bg-green-700
          dark:bg-blue-600
          dark:hover:bg-blue-700
          text-white
          transition
        "
      >
        <Plus class="w-4 h-4" />
        Add User
      </router-link>

    </div>

    <!-- TABLE -->
    <div
      class="
      rounded-2xl
      border
      overflow-hidden
      bg-card
      shadow-lg
      "
    >

      <table class="w-full">

        <thead
          class="
          bg-muted
          border-b
          "
        >
          <tr>

            <th class="text-left p-4">
              Username
            </th>

            <th class="text-left p-4">
              Email
            </th>

            <th class="text-left p-4">
              Role
            </th>

            <th class="text-left p-4">
              Status
            </th>

            <th class="text-center p-4">
              Actions
            </th>

          </tr>
        </thead>

        <tbody>

          <tr
            v-for="user in users"
            :key="user._id"
            class="
            border-b
            hover:bg-muted/30
            transition
            "
          >

            <td class="p-4">
              {{ user.username }}
            </td>

            <td class="p-4">
              {{ user.email }}
            </td>

            <td class="p-4">

              <span
                class="
                px-3 py-1
                rounded-full
                text-xs
                font-medium
                "
                :class="
                  user.role === 'admin'
                    ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                    : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                "
              >
                {{ user.role }}
              </span>

            </td>

            <td class="p-4">

              <span
                :class="
                  user.is_active
                    ? 'text-green-600'
                    : 'text-red-500'
                "
              >
                {{
                  user.is_active
                    ? 'Active'
                    : 'Disabled'
                }}
              </span>

            </td>

            <td class="p-4">

              <div
                class="
                flex
                justify-center
                gap-3
                "
              >

                <!-- EDIT -->
                <button
                  @click="openEditModal(user)"
                  class="
                  p-2
                  rounded-lg
                  hover:bg-blue-100
                  dark:hover:bg-blue-900/30
                  transition
                  "
                >
                  <Pencil class="w-5 h-5 text-blue-600" />
                </button>

                <!-- DELETE -->
                <button
                  @click="deleteUser(user._id)"
                  class="
                  p-2
                  rounded-lg
                  hover:bg-red-100
                  dark:hover:bg-red-900/30
                  transition
                  "
                >
                  <Trash2 class="w-5 h-5 text-red-500" />
                </button>

              </div>

            </td>

          </tr>

        </tbody>

      </table>

    </div>

    <!-- EDIT MODAL -->
    <div
      v-if="showEditModal"
      class="
      fixed inset-0
      bg-black/50
      flex items-center
      justify-center
      z-50
      "
    >

      <div
        class="
        bg-card
        border
        rounded-3xl
        p-8
        w-[500px]
        shadow-2xl
        "
      >

        <h2
          class="
          text-2xl
          font-bold
          mb-6
          "
        >
          Edit User
        </h2>

        <div class="space-y-4">

          <input
            v-model="selectedUser.username"
            class="
            w-full
            border
            rounded-xl
            p-3
            bg-background
            "
            placeholder="Username"
          />

          <input
            v-model="selectedUser.email"
            class="
            w-full
            border
            rounded-xl
            p-3
            bg-background
            "
            placeholder="Email"
          />

          <select
            v-model="selectedUser.role"
            class="
            w-full
            border
            rounded-xl
            p-3
            bg-background
            "
          >
            <option value="admin">
              Admin
            </option>

            <option value="user">
              User
            </option>
          </select>

          <select
            v-model="selectedUser.is_active"
            class="
            w-full
            border
            rounded-xl
            p-3
            bg-background
            "
          >
            <option :value="true">
              Active
            </option>

            <option :value="false">
              Disabled
            </option>
          </select>

        </div>

        <div
          class="
          flex
          justify-end
          gap-3
          mt-6
          "
        >

          <button
            @click="showEditModal = false"
            class="
            px-5 py-2
            rounded-xl
            border
            "
          >
            Cancel
          </button>

          <button
            @click="saveUser"
            class="
            px-5 py-2
            rounded-xl
            bg-green-600
            hover:bg-green-700
            dark:bg-blue-600
            dark:hover:bg-blue-700
            text-white
            "
          >
            Save
          </button>

        </div>

      </div>

    </div>

  </div>
</template>

<script setup>
import axios from "axios"
import { ref, onMounted } from "vue"

import {
  Plus,
  Pencil,
  Trash2
} from "lucide-vue-next"

const users = ref([])

const showEditModal = ref(false)

const selectedUser = ref(null)

const loadUsers = async () => {

  try {

    const res = await axios.get(
      "http://localhost:3000/api/users/all",
      {
        withCredentials: true
      }
    )

    users.value = res.data

  } catch (error) {

    console.log(error)

  }

}

const openEditModal = (user) => {

  selectedUser.value = {
    ...user
  }

  showEditModal.value = true

}

const saveUser = async () => {

  try {

    await axios.put(

      `http://localhost:3000/api/users/edit/${selectedUser.value._id}`,

      selectedUser.value,

      {
        withCredentials: true
      }

    )

    showEditModal.value = false

    loadUsers()

  } catch (error) {

    console.log(error)

  }

}


const deleteUser = async (id) => {

  if (
    !confirm(
      "Delete this user ?"
    )
  ) return

  try {

    await axios.delete(

      `http://localhost:3000/api/users/delete/${id}`,

      {
        withCredentials: true
      }

    )

    loadUsers()

  } catch (error) {

    console.log(error)

  }

}

onMounted(() => {

  loadUsers()

})
</script>