<script setup lang="ts">

import { ref, onMounted, onUnmounted } from "vue"
import { computed } from "vue"
import socket from "@/lib/socket"
import { Line } from "vue-chartjs"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement
} from "chart.js"

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement)

/* ------------------ SOCKET ------------------ */

const topic = ref("")
const message = ref("")
const connected = ref(false)

const mode = ref<"CPS" | "CPM">("CPS")
/* ------------------ CPS ------------------ */
const cpmValue = ref(0)
const cpsValue = ref(0)

const cpsData = ref<number[]>([])
const cpmData = ref<number[]>([])

const cpsLabels = ref<string[]>([])
const cpmLabels = ref<string[]>([])



/* ------------------ CHART ------------------ */


const chartData = computed(() => {
  const isCPS = mode.value === "CPS"

  return {
    labels: isCPS ? cpsLabels.value : cpmLabels.value,
    datasets: [
      {
        label: mode.value,
        data: isCPS ? cpsData.value : cpmData.value,
        borderColor: isCPS ? "#42A5F5" : "#FF9800",
        tension: 0.3
      }
    ]
  }
})

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false
}

/* ------------------ MOUNT ------------------ */

onMounted(() => {

  socket.connect()

  socket.on("connect", () => {
    connected.value = true
  })

 socket.on("mqtt_message", (data: any) => {

  topic.value = data.topic
  message.value = data.message

  try {
    const parsed = JSON.parse(data.message)

    const time = new Date().toLocaleTimeString()

    // CPS
    if (parsed.cps !== undefined) {

      cpsValue.value = parsed.cps

      cpsLabels.value = [...cpsLabels.value, time]
      cpsData.value = [...cpsData.value, parsed.cps]

      if (cpsData.value.length > 20) {
        cpsData.value = cpsData.value.slice(-20)
        cpsLabels.value = cpsLabels.value.slice(-20)
      }
    }

    // CPM
    if (parsed.cpm !== undefined) {

      cpmValue.value = parsed.cpm

      cpmLabels.value = [...cpmLabels.value, time]
      cpmData.value = [...cpmData.value, parsed.cpm]

      if (cpmData.value.length > 20) {
        cpmData.value = cpmData.value.slice(-20)
        cpmLabels.value = cpmLabels.value.slice(-20)
      }
    }

  } catch (e) {
    console.log("Message non JSON")
  }

})

})

onUnmounted(() => {
  socket.off("mqtt_message")
})

</script>

<template>

  <div class="p-8 space-y-6">

    <h1 class="text-2xl font-bold">Test MQTT + Graph</h1>
    <select v-model="mode" class="border p-2 rounded">
      <option value="CPS">CPS</option>
      <option value="CPM">CPM</option>
    </select>
    <!-- Connexion -->
    <div>
      <span :class="connected ? 'text-green-600' : 'text-red-600'">
        {{ connected ? "Connecté" : "Déconnecté" }}
      </span>
    </div>

    <!-- CPS VALUE -->
   <div class="text-4xl font-bold">
      {{ mode }} :
      {{ mode === "CPS" ? cpsValue : cpmValue }}
    </div>

    <!-- GRAPH -->
    <div class="h-[300px] bg-white p-4 rounded shadow">
      <Line :data="chartData" :options="chartOptions" :key="mode" />
    </div>

    <!-- DEBUG -->
    <div class="bg-gray-100 p-4 rounded">
      <p><strong>Topic :</strong> {{ topic }}</p>
      <p><strong>Message :</strong> {{ message }}</p>
    </div>

  </div>

</template>