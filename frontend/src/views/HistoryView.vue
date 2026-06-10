<script setup lang="ts">
import { ref, computed, onMounted } from "vue"
import axios from "axios"

// =============================
// STATE
// =============================

const selectedHistory = ref("normal")

const selectedNormalMode = ref("ALL")

const dateFilter = ref("")

const loading = ref(false)

const normalHistory = ref<any[]>([])
const balayageHistory = ref<any[]>([])

const showDetails = ref(false)

const selectedSession = ref<any>(null)

const detailsData = ref<any[]>([])

// =============================
// LOAD NORMAL HISTORY
// =============================

const loadNormalHistory = async () => {
  try {

    loading.value = true

    const res = await axios.get(
      "http://localhost:3000/api/history/normal"
    )

    normalHistory.value = res.data

  }
  catch (err) {

    console.error(err)

  }
  finally {

    loading.value = false

  }
}

// =============================
// LOAD BALAYAGE HISTORY
// =============================

const loadBalayageHistory = async () => {

  try {

    loading.value = true

    const res = await axios.get(
      "http://localhost:3000/api/history/balayage"
    )

    balayageHistory.value = res.data

  }
  catch (err) {

    console.error(err)

  }
  finally {

    loading.value = false

  }

}

// =============================
// FILTER NORMAL HISTORY
// =============================

const filteredNormalHistory = computed(() => {

  let data = [...normalHistory.value]

  // CPS / CPM
  if (selectedNormalMode.value !== "ALL") {

    data = data.filter(
      item =>
        item.mode_mesure === selectedNormalMode.value
    )

  }

  // DATE
  if (dateFilter.value) {

    data = data.filter(item => {

      const sessionDate =
        new Date(item.date_creation)
          .toISOString()
          .split("T")[0]

      return sessionDate === dateFilter.value

    })

  }

  return data

})

// =============================
// FILTER BALAYAGE HISTORY
// =============================

const filteredBalayageHistory = computed(() => {

  let data = [...balayageHistory.value]

  if (dateFilter.value) {

    data = data.filter(item => {

      const sessionDate =
        new Date(item.date_creation)
          .toISOString()
          .split("T")[0]

      return sessionDate === dateFilter.value

    })

  }

  return data

})

// =============================
// DETAILS NORMAL
// =============================

const openNormalDetails = async (
  id: string
) => {

  try {

    const res = await axios.get(
      `http://localhost:3000/api/history/normal/${id}`
    )

    selectedSession.value =
      res.data.session

    detailsData.value =
      res.data.mesures

    showDetails.value = true

  }
  catch (err) {

    console.error(err)

  }

}

// =============================
// DETAILS BALAYAGE
// =============================

const openBalayageDetails = async (
  id: string
) => {

  try {

    const res = await axios.get(
      `http://localhost:3000/api/history/balayage/${id}`
    )

    selectedSession.value =
      res.data.session

    detailsData.value =
      res.data.points

    showDetails.value = true

  }
  catch (err) {

    console.error(err)

  }

}

// =============================
// CLOSE MODAL
// =============================

const closeModal = () => {

  showDetails.value = false

  selectedSession.value = null

  detailsData.value = []

}

// =============================
// FORMAT DATE
// =============================

const formatDate = (
  date: string
) => {

  return new Date(date)
    .toLocaleString()

}

// =============================
// INIT
// =============================

onMounted(async () => {

  await Promise.all([
    loadNormalHistory(),
    loadBalayageHistory()
  ])

})
</script>

<template>

<div class="space-y-6">

  <!-- HEADER -->
  <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

    <div>
      <h1 class="text-2xl font-bold">
        History Management
      </h1>

      <p class="text-sm text-muted-foreground">
        Consultation des historiques des mesures radiologiques
      </p>
    </div>

    <div class="flex flex-wrap gap-3">

      <!-- TYPE -->
      <select
        v-model="selectedHistory"
        class="border rounded-lg px-3 py-2
        bg-white text-black
        dark:bg-slate-800 dark:text-white"
      >
        <option value="normal">
          Normal Mode
        </option>

        <option value="balayage">
          Scan Mode
        </option>
      </select>

      <!-- CPS / CPM -->
      <select
        v-if="selectedHistory === 'normal'"
        v-model="selectedNormalMode"
        class="border rounded-lg px-3 py-2
        bg-white text-black
        dark:bg-slate-800 dark:text-white"
      >
        <option value="ALL">
          All
        </option>

        <option value="CPS">
          CPS
        </option>

        <option value="CPM">
          CPM
        </option>

      </select>

      <!-- DATE -->
      <input
        type="date"
        v-model="dateFilter"
        class="border rounded-lg px-3 py-2
        bg-white text-black
        dark:bg-slate-800 dark:text-white"
      />

    </div>

  </div>

  <!-- TABLE -->
  <div
    class="bg-white dark:bg-slate-900
    rounded-xl border shadow"
  >

    <div class="px-4 py-3 border-b font-semibold">
      Sessions History
    </div>

    <div
      v-if="loading"
      class="p-6 text-center"
    >
      Loading...
    </div>

   <div
  v-else
  class="max-h-[500px] overflow-y-auto"
>
  <table class="w-full text-sm">

      <!-- NORMAL -->
      <thead
        v-if="selectedHistory === 'normal'"
        class="bg-slate-100 dark:bg-slate-800 sticky top-0 z-10"
      >
        <tr>

          <th class="p-3 text-left">
            Date
          </th>

          <th class="p-3 text-left">
            Mode
          </th>

          <th class="p-3 text-left">
            LLD
          </th>

          <th class="p-3 text-left">
            HLD
          </th>

          <th class="p-3 text-left">
            HT
          </th>

          <th class="p-3 text-left">
            Average
          </th>

          <th class="p-3 text-left">
            Measurements
          </th>

          <th class="p-3 text-center">
            Action
          </th>

        </tr>
      </thead>

      <!-- BALAYAGE -->
      <thead
        v-else
        class="bg-slate-100 dark:bg-slate-800 sticky top-0 z-10"
      >
        <tr>

          <th class="p-3 text-left">
            Date
          </th>

          <th class="p-3 text-left">
            LLD Start
          </th>

          <th class="p-3 text-left">
            ΔV
          </th>

          <th class="p-3 text-left">
            Vmax
          </th>

          <th class="p-3 text-left">
            Average CPS
          </th>

          <th class="p-3 text-left">
            Points
          </th>

          <th class="p-3 text-center">
            Action
          </th>

        </tr>
      </thead>

      <tbody>

        <!-- NORMAL -->
        <template v-if="selectedHistory === 'normal'">

          <tr
            v-for="item in filteredNormalHistory"
            :key="item._id"
            class="border-b hover:bg-slate-50 dark:hover:bg-slate-800"
          >

            <td class="p-3">
              {{ formatDate(item.date_creation) }}
            </td>

            <td class="p-3">

              <span
                v-if="item.mode_mesure === 'CPS'"
                class="px-2 py-1 rounded
                bg-green-100 text-green-700"
              >
                CPS
              </span>

              <span
                v-else
                class="px-2 py-1 rounded
                bg-blue-100 text-blue-700"
              >
                CPM
              </span>

            </td>

            <td class="p-3">
              {{ item.LLD }}
            </td>

            <td class="p-3">
              {{ item.HLD }}
            </td>

            <td class="p-3">
              {{ item.HT }}
            </td>

            <td class="p-3 font-semibold">
              {{ item.moyenne }}
            </td>

            <td class="p-3">
              {{ item.nombreMesures }}
            </td>

            <td class="p-3 text-center">

              <button
                @click="openNormalDetails(item._id)"
                class="px-3 py-1 rounded-lg
                bg-green-600 text-white
                hover:bg-green-700
                dark:bg-blue-600 dark:hover:bg-blue-700"
              >
                Details
              </button>

            </td>

          </tr>

        </template>

        <!-- BALAYAGE -->
        <template v-else>

          <tr
            v-for="item in filteredBalayageHistory"
            :key="item._id"
            class="border-b hover:bg-slate-50 dark:hover:bg-slate-800"
          >

            <td class="p-3">
              {{ formatDate(item.date_creation) }}
            </td>

            <td class="p-3">
              {{ item.LLD_depart }}
            </td>

            <td class="p-3">
              {{ item.dV }}
            </td>

            <td class="p-3">
              {{ item.Vmax }}
            </td>

            <td class="p-3 font-semibold">
              {{ item.moyenne }}
            </td>

            <td class="p-3">
              {{ item.nombrePoints }}
            </td>

            <td class="p-3 text-center">

              <button
                @click="openBalayageDetails(item._id)"
                class="px-3 py-1 rounded-lg
                bg-green-600 text-white
                hover:bg-green-700
                dark:bg-blue-600 dark:hover:bg-blue-700"
              >
                Details
              </button>

            </td>

          </tr>

        </template>

      </tbody>

    </table>
</div>
  </div>

  <!-- DETAILS MODAL -->
  <div
    v-if="showDetails"
    class="fixed inset-0 bg-black/50
    flex items-center justify-center z-50"
  >

    <div
      class="bg-white dark:bg-slate-900
      rounded-xl shadow-xl
      w-[90%] max-w-5xl
      max-h-[85vh]
      overflow-auto"
    >

      <div
        class="flex justify-between items-center
        border-b p-4"
      >

        <h2 class="font-bold text-lg">
          Session Details
        </h2>

        <button
          @click="closeModal"
          class="text-red-500 text-xl font-bold"
        >
          ✕
        </button>

      </div>

      <div class="p-4">

        <table class="w-full text-sm">

          <thead class="bg-slate-100 dark:bg-slate-800 sticky top-0 z-10">

            <tr v-if="selectedHistory === 'normal'">

              <th class="p-3 text-left">
                Timestamp
              </th>

              <th class="p-3 text-left">
                Value
              </th>

            </tr>

            <tr v-else>

              <th class="p-3 text-left">
                Voltage
              </th>

              <th class="p-3 text-left">
                CPS
              </th>

            </tr>

          </thead>

          <tbody>

            <template v-if="selectedHistory === 'normal'">

              <tr
                v-for="(m,index) in detailsData"
                :key="index"
                class="border-b"
              >

                <td class="p-3">
                  {{ formatDate(m.timestamp) }}
                </td>

                <td class="p-3">
                  {{ m.value }}
                </td>

              </tr>

            </template>

            <template v-else>

              <tr
                v-for="(p,index) in detailsData"
                :key="index"
                class="border-b"
              >

                <td class="p-3">
                  {{ p.tension }}
                </td>

                <td class="p-3">
                  {{ p.cps }}
                </td>

              </tr>

            </template>

          </tbody>

        </table>

      </div>

    </div>

  </div>

</div>

</template>