<script setup lang="ts">
import socket from "../lib/socket"
import { computed, ref, onMounted, onUnmounted, watch } from "vue"
import axios from "axios"
import { useRoute } from "vue-router"

// ================= UI =================
import Card from "@/components/ui/Card.vue"
import CardHeader from "@/components/ui/CardHeader.vue"
import CardTitle from "@/components/ui/CardTitle.vue"
import CardContent from "@/components/ui/CardContent.vue"
import Button from "@/components/ui/Button.vue"

// ================= ICON =================
import { Upload } from "lucide-vue-next"

// ================= IMAGES =================
import barrierOpen from "@/assets/pictures/barriereOv.png"
import barrierClose from "@/assets/pictures/barriereFe.png"
import alarmOff from "@/assets/pictures/alarmOff.png"

// ================= CHART =================
import { Line } from "vue-chartjs"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler
} from "chart.js"

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler
)

// ================= ROUTE =================
const route = useRoute()
const portiqueId = route.params.id as string
const portiqueNom = ref("")
const chartKey = ref(0)

// ================= STATE =================
const selectedMode = ref(0)
const barriere = ref(false)
const alarme = ref(false)
const isRunning = ref(false)

// ================= NORMAL =================
const normal = ref({
  lld: 3,
  hld: 5,
  ht: 2000,
  cps: 0,
  cpm: 0,
  mode: "CPS"
})

// ================= SPECTRUM =================
const spectrum = ref({
  lld: 0.5,
  dv: 0.5,
  vmax: 9,
  currentCps: 0
})

const spectrumData = ref<any[]>([])
const chartMesures = ref<any[]>([])

// ================= IMAGES =================
const barrierImage = computed(() =>
  barriere.value ? barrierOpen : barrierClose
)

const alarmImage = computed(() =>
  alarme.value ? alarmOff : alarmOff
)

// ================= FETCH =================
const loadData = async () => {
  try {
    const portique = await axios.get(
      `http://localhost:3000/api/portiques/${portiqueId}`
    )

    portiqueNom.value = portique.data.nom

    // ❌ NE PLUS charger MongoDB pour le graphe
    chartMesures.value = []

  } catch (err) {
    console.error(err)
  }
}


// ================= SOCKET =================
let handler: any
const initSocket = () => {
  handler = (data: any) => {

    console.log("📡 RAW MQTT:", data)

    // ===================== 1. FORMAT STM32 STRING =====================
    if (typeof data === "string") {

      if (data.startsWith("#CPS")) {
        const cps = Number(data.split(",")[1])

        normal.value.cps = cps
        spectrum.value.currentCps = cps

        chartMesures.value.push({
          date_mesure: new Date(),
          cps,
          cpm: 0
        })
      }

      else if (data.startsWith("#CPM")) {
        const cpm = Number(data.split(",")[1])

        normal.value.cpm = cpm

        chartMesures.value.push({
          date_mesure: new Date(),
          cps: 0,
          cpm
        })
      }

      else if (data.startsWith("#")) {
        // spectrum format: #LLD,HLD,CPS
        const parts = data.replace("#", "").split(",")

        const lld = Number(parts[0])
        const hld = Number(parts[1])
        const cps = Number(parts[2])

        const energy = lld

        if (!isNaN(cps)) {
          spectrum.value.currentCps = cps

          const index = spectrumData.value.findIndex(
            p => p.energy === energy
          )

          if (index !== -1) {
            spectrumData.value[index].cps = cps
          }

          spectrumData.value = [...spectrumData.value]
        }
      }

      return
    }

    // ===================== 2. FORMAT JSON =====================

console.log("📡 MQTT JSON:", data)

const type = data.type?.toLowerCase()

if (type === "cps") {

  normal.value.cps = data.value

  chartMesures.value.push({
    date_mesure: new Date(),
    cps: data.value,
    cpm: 0
  })
}

else if (type === "cpm") {

  normal.value.cpm = data.value

  chartMesures.value.push({
    date_mesure: new Date(),
    cps: 0,
    cpm: data.value
  })
}

else if (type === "scan") {

  const parts = data.raw.split(",")

  const lld = Number(parts[0])
  const cps = Number(parts[2])

  if (!isNaN(cps)) {

    spectrum.value.currentCps = cps

    const index = spectrumData.value.findIndex(
      p => p.energy === lld
    )

    if (index !== -1) {
      spectrumData.value[index].cps = cps
    }

    spectrumData.value = [...spectrumData.value]
  }
}
  }

  socket.on("mqttData", handler)
}

// ================= CLEAN =================
onMounted(() => {
  loadData()
  initSocket()
})

onUnmounted(() => {
  socket.off("mqttData", handler)
})

// ================= IMPORT =================
const handleImport = () => {
  window.open(`http://localhost:3000/api/report/${portiqueId}`, "_blank")
}

// ================= DISPLAY VALUE =================
const displayedValue = computed(() => {
  if (selectedMode.value === 0) {
    return normal.value.mode === "CPS"
      ? normal.value.cps
      : normal.value.cpm
  }
  return spectrum.value.currentCps
})

// ================= WATCH MODE =================
watch(selectedMode, (val) => {

  chartKey.value++   // 🔥 force refresh chart

  if (val === 1) {
    spectrumData.value = []
    isRunning.value = false
  }

})



// ================ send Trame ============
const sendTrame = async () => {
  try {

    let payload: any = {}

    // ================= MODE NORMAL =================
    if (selectedMode.value === 0) {

      payload = {
        mode: 0,
        LLD: Number(normal.value.lld),
        HLD: Number(normal.value.hld),
        HT: Number(normal.value.ht),
        CP: normal.value.mode === "CPM" ? 1 : 0,
        B: barriere.value ? 1 : 0,
        A: alarme.value ? 1 : 0
      }

      // ✅ VALIDATION (très important)
      if (
        isNaN(payload.LLD) ||
        isNaN(payload.HLD) ||
        isNaN(payload.HT)
      ) {
        console.error("❌ valeurs invalides MODE NORMAL")
        return
      }
    }

    // ================= MODE SPECTRUM =================
    else if (selectedMode.value === 1) {

      payload = {
        mode: 1,
        LLD: Number(spectrum.value.lld),
        dV: Number(spectrum.value.dv),
        Vmax: Number(spectrum.value.vmax),
        B: barriere.value ? 1 : 0,
        A: alarme.value ? 1 : 0
      }

      // ✅ VALIDATION (MANQUANTE CHEZ TOI)
      if (
        isNaN(payload.LLD) ||
        isNaN(payload.dV) ||
        isNaN(payload.Vmax)
      ) {
        console.error("❌ valeurs invalides MODE SPECTRUM")
        return
      }
    }
    console.log("📤 PAYLOAD:", payload)
    console.log("📤 PAYLOAD FINAL:", JSON.stringify(payload))
    payload.portiqueId = portiqueId 
    await axios.post("http://localhost:3000/api/send-trame", payload)

    console.log("✅ trame envoyée")

  } catch (err) {
    console.error("❌ Erreur sendTrame:", err)
  }
}

// ================== Barriere===================
const toggleBarriere = async () => {
  barriere.value = !barriere.value

  try {
    await axios.post("http://localhost:3000/api/barriere", {
      state: barriere.value
    })
  } catch (err) {
    console.error(err)
  }
}

// ================= Alarme =====================
const toggleAlarme = async () => {
  alarme.value = !alarme.value

  try {
    await axios.post("http://localhost:3000/api/alarme", {
      state: alarme.value
    })
  } catch (err) {
    console.error(err)
  }
}

// ================= THEME dark =================
const isDark = ref(
  document.documentElement.classList.contains("dark")
)

const observer = new MutationObserver(() => {
  isDark.value =
    document.documentElement.classList.contains("dark")
})

onMounted(() => {
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"]
  })
})

onUnmounted(() => {
  observer.disconnect()
})
// ================= CHART NORMAL =================
const sortedMesures = computed(() =>
  [...chartMesures.value].sort(
    (a, b) => new Date(a.date_mesure).getTime() - new Date(b.date_mesure).getTime()
  )
)

const cpsData = computed(() => ({
  labels: sortedMesures.value.map(m =>
    new Date(m.date_mesure).toLocaleTimeString()
  ),

  datasets: [
    {
      label: normal.value.mode,

      data: sortedMesures.value.map(m =>
        normal.value.mode === "CPS"
          ? m.cps
          : m.cpm
      ),

      borderColor: isDark.value
        ? "rgb(37, 99, 235)"   // 🔵 dark
        : "rgb(34, 197, 94)",  // 🟢 light

      backgroundColor: isDark.value
        ? "rgba(37, 99, 235, 0.15)"
        : "rgba(34, 197, 94, 0.15)",

      tension: 0.4,
      fill: true
    }
  ]
}))

// ================= OPTIONS =================
const options = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false }
  }
}

const spectrumOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: true }
  },
  scales: {
    x: { title: { display: true, text: "Tension" } },
    y: { title: { display: true, text: "CPS" } }
  }
}

// ================= Initialiser SPECTRUM =================
const initSpectrumGrid = () => {
  spectrumData.value = []

  let current = spectrum.value.lld

  while (current <= spectrum.value.vmax) {
    spectrumData.value.push({
      energy: Number(current.toFixed(2)),
      cps: 0
    })

    current += spectrum.value.dv
  }

  spectrumData.value = [...spectrumData.value]
}

// ================= SPECTRUM =================

const startSpectrum = async () => {
  isRunning.value = true

  initSpectrumGrid() // 🔥 important

  await axios.post("http://localhost:3000/api/send-trame", {
    mode: 1,
    LLD: spectrum.value.lld,
    dV: spectrum.value.dv,
    Vmax: spectrum.value.vmax
  })
}

const spectrumChart = computed(() => ({
  labels: spectrumData.value.map(p => p.energy),
  datasets: [
    {
      label: "Spectrum CPS",
      data: spectrumData.value.map(p => p.cps),
      borderColor: "rgb(239, 68, 68)",
      backgroundColor: "rgba(239, 68, 68, 0.15)",
      tension: 0.3,
      fill: true
    }
  ]
}))
</script>

<template>
  <div class="space-y-6">

    <!-- HEADER -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-xl font-bold tracking-tight">
          Radiation Portal Dashboard - {{ portiqueNom }}
        </h1>

      </div>

      <Button variant="outline" size="sm" @click="handleImport">
        <Upload class="mr-2 h-4 w-4" />
        Importer Rapport
      </Button>
      <!---------------------- Button test mqtt ------------------------>
      <select v-model="selectedMode" class="h-9 px-2 rounded border ml-2 bg-white text-black dark:bg-slate-800 dark:text-white">
          <option :value="0">Mode Monocanal</option>
          <option :value="1">Mode Multicanal</option>
      </select>
    </div>


    <!-- KPI -->
  <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-5">

  <!-- ================= CPS / CPM ================= -->
  <Card class="col-span-1">
    <CardHeader>
      <CardTitle class="text-m font-medium">
     {{ normal.mode === "CPS" ? "Counts per second" : "Counts per minute" }}
      </CardTitle>
      
    </CardHeader>

    <CardContent class="flex items-center justify-between h-[100px]">
      <div>
        <div class="text-3xl font-bold">{{ displayedValue }}</div>
        <p class="text-m text-muted-foreground">
          {{ normal.mode === "CPS" ? "CPS" : "CPM" }}
        </p>
      </div>
    </CardContent>
  </Card>

  <!-- ================= THRESHOLDS ================= -->
  <Card v-if="selectedMode === 0" class="col-span-2">
    <CardHeader>
      <CardTitle class="text-m font-medium">Thresholds</CardTitle>
    </CardHeader>

  <CardContent class="flex items-end gap-4 w-full">

  <div class="flex gap-4 items-end w-full">

    <!-- LLD -->
    <div class="flex flex-col flex-1">
      <br>
      <label class="text-m text-muted-foreground mb-1">LLD</label>
      <input
        v-model.number="normal.lld"
        type="number"
        step="0.1"
        class="w-full h-8 border px-2 rounded
              bg-white text-black
              dark:bg-slate-800 dark:text-white"
      />
    </div>

    <!-- HLD -->
    <div class="flex flex-col flex-1">
      <label class="text-m text-muted-foreground mb-1">HLD</label>
      <input
        v-model.number="normal.hld"
        type="number"
        step="0.1"
        class="w-full h-8 border px-2 rounded
              bg-white text-black
              dark:bg-slate-800 dark:text-white"
      />
    </div>

    <!-- BUTTON -->
    <button
      @click="sendTrame"
      class="h-8 px-6 text-m rounded-md bg-green-600 text-white
      dark:bg-blue-600 dark:hover:bg-blue-700"
    >
      Send
    </button>

  </div>


  </CardContent>
    </Card>

    <!-- ================= SPECTRUM ================= -->
    <Card v-if="selectedMode === 1" class="col-span-2">
      <CardHeader>
        <CardTitle class="text-m font-medium">
          Spectrum Parameters
        </CardTitle>
      </CardHeader>

  <CardContent class="flex gap-4 items-end w-full">

    <!-- INPUTS CONTAINER -->
    
    <div class="flex gap-4 flex-1">
      
      <!-- LLD -->
      <div class="flex flex-col flex-1">
        <br>
        <label class="text-m text-muted-foreground">LLD</label>
        <input
          v-model.number="spectrum.lld"
          type="number"
          step="0.1"
          class="w-full border px-2 py-1 rounded
                bg-white text-black
                dark:bg-slate-800 dark:text-white"
        />
        </div>

      <!-- dV -->
      <div class="flex flex-col flex-1">
        <br>
        <label class="text-m text-muted-foreground">ΔV</label>
        <input
          v-model.number="spectrum.dv"
          type="number"
          step="0.1"
          class="w-full border px-2 py-1 rounded
                bg-white text-black
                dark:bg-slate-800 dark:text-white"
        />
      </div>

      <!-- Vmax -->
      <div class="flex flex-col flex-1">
        <br>
        <label class="text-m text-muted-foreground">Vmax</label>
        <input
          v-model.number="spectrum.vmax"
          type="number"
          step="0.1"
          class="w-full border px-2 py-1 rounded
                bg-white text-black
                dark:bg-slate-800 dark:text-white"
        />
      </div>

    </div>

    <!-- BUTTON -->
    <button
      @click="sendTrame"
      class="h-9 px-6 text-sm rounded-md bg-green-600 text-white whitespace-nowrap
      dark:bg-blue-600 dark:hover:bg-blue-700 transition"
    >
      Send 
    </button>

  </CardContent>
    </Card>

    <!-- ================= BARRIER ================= -->
    <Card class="col-span-1">
      <CardContent class="flex flex-col items-center justify-between h-[140px]">
        <br>
        <img :src="barrierImage" class="h-16 object-contain" />

        <div class="flex items-center justify-between w-full mt-2">
          <span
            :class="barriere ? 'text-green-500' : 'text-red-500'"
            class="font-bold"
          >
            {{ barriere ? "OPEN" : "CLOSED" }}
          </span>

          <button
            @click="toggleBarriere"
            class="h-9 px-4 py-1 text-sm rounded-md bg-green-600 text-white
            dark:bg-blue-600 dark:hover:bg-blue-700"
          >
            {{ barriere ? "Close" : "Open" }}
          </button>
        </div>
      </CardContent>
    </Card>

    <!-- ================= ALARM ================= -->
    <Card class="col-span-1">
      <CardContent class="flex flex-col items-center justify-between h-[140px]">
        <br>
        <img :src="alarmImage" class="h-16 object-contain" />

        <div class="flex items-center justify-between w-full mt-2">
          <span
            class="font-bold text-gray-600"
          >
            Enable alarm
          </span>
          <button
            @click="toggleAlarme"
            class="h-9 px-4 py-1 text-sm rounded-md bg-red-600 hover:bg-red-700 text-white"
          >
            OFF
          </button>
        </div>
      </CardContent>
    </Card>

  </div>

  <Card v-if="selectedMode === 0">

    <div class="grid md:grid-cols-1 gap-6">

      <Card>
    <CardHeader>
      <CardTitle class="flex items-center justify-between">
        
        <span>
          {{ normal.mode === "CPS" 
              ? "Radiation CPS Trend" 
              : "Radiation CPM Trend" }}
        </span>

        <select
          v-model="normal.mode"
          class="h-8 px-2 text-xs rounded-md
                bg-white text-black border
                dark:bg-slate-800 dark:text-white dark:border-slate-600"
        >
          <option value="CPS">CPS</option>
          <option value="CPM">CPM</option>
        </select>

      </CardTitle>
    </CardHeader>


        <CardContent>
          <div class="h-[320px]">
              <Line 
                :key="chartKey"
                :data="cpsData"
                :options="options"
              />
          </div>
        </CardContent>
      </Card>

    </div>

  </Card>

  <!-- ================= SPECTRUM FIXE ================= -->

  <Card v-if="selectedMode === 1">

    <CardHeader>
      <div class="flex justify-between items-start w-full">

        <div>
          <CardTitle class="text-sm font-medium">
            Spectrum (LLD fixé)
          </CardTitle>

          <p class="text-xs text-muted-foreground mt-1">
            LLD: {{ spectrum.lld }} | HLD: {{ spectrum.lld}} + {{spectrum.dv }} | ΔV: {{ spectrum.dv }}
          </p>
        </div>
 
        <!--
        <button
          @click="startSpectrum"
          :disabled="isRunning"
          class="bg-red-600 text-white px-4 py-2 rounded"
        >
          {{ isRunning ? "Running..." : "Start" }}
        </button>
        -->

      </div>
    </CardHeader>

    <CardContent>
      <div class="h-[300px]">
        <Line :key="spectrumData.length" :data="spectrumChart" :options="spectrumOptions" />
      </div>
    </CardContent>

  </Card>
    </div>
</template>