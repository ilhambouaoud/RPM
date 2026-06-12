<script setup lang="ts">
import type { ChartOptions } from "chart.js"
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
  Filler,
  Title
} from "chart.js"

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler,
  Title
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

const spectrumData = ref<Array<{tension: number, cps: number, energy: number}>>([])
interface Mesure {
  date_mesure: Date
  cps: number
  cpm: number
}

const chartMesures = ref<Mesure[]>([])

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
    chartMesures.value = []
  } catch (err) {
    console.error(err)
  }
}

// ================= SOCKET =================
let handler: ((data: any) => void) | null = null
const initSocket = () => {
  handler = (data: any) => {
    console.log("📡 RAW MQTT:", data)

    // ===================== 1. FORMAT STRING =====================
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
      } else if (data.startsWith("#CPM")) {
        const cpm = Number(data.split(",")[1])
        normal.value.cpm = cpm
        chartMesures.value.push({
          date_mesure: new Date(),
          cps: 0,
          cpm
        })
      } else if (data.startsWith("#")) {
        const parts = data.replace("#", "").split(",")
        const tension = Number(parts[0])
        //const hld = Number(parts[1])
        const cps = Number(parts[2])

        if (!isNaN(cps) && !isNaN(tension)) {
          console.log(`📊 String SCAN - Tension: ${tension}, CPS: ${cps}`);
          
          const existingIndex = spectrumData.value.findIndex(p => p.tension === tension)
          if (existingIndex !== -1) {
            spectrumData.value[existingIndex].cps = cps
          } else {
            spectrumData.value.push({
              tension: tension,
              cps: cps,
              energy: tension
            })
          }
          // Trier par tension
          spectrumData.value.sort((a, b) => a.tension - b.tension)
          // Forcer la réactivité
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
    } else if (type === "cpm") {
      normal.value.cpm = data.value
      chartMesures.value.push({
        date_mesure: new Date(),
        cps: 0,
        cpm: data.value
      })
    } else if (type === "scan") {
      // Récupérer les données directement
      const tension = data.tension || Number(data.raw?.split(",")[1]) || 0
      const cps = data.cps || Number(data.raw?.split(",")[2]) || 0
      const energy = data.energy || 0

      console.log(`📊 JSON SCAN - Tension: ${tension}, CPS: ${cps}, Energy: ${energy}`);

      if (!isNaN(cps) && !isNaN(tension) && cps > 0) {
        const existingIndex = spectrumData.value.findIndex(p => Math.abs(p.tension - tension) < 0.01)
        
        if (existingIndex !== -1) {
          spectrumData.value[existingIndex].cps = cps
          spectrumData.value[existingIndex].energy = energy
        } else {
          spectrumData.value.push({
            tension: tension,
            cps: cps,
            energy: energy
          })
        }
        
        // Trier par tension
        spectrumData.value.sort((a, b) => a.tension - b.tension)
        // Forcer la réactivité
        spectrumData.value = [...spectrumData.value]
        
        console.log(`📊 Données spectrum mises à jour: ${spectrumData.value.length} points`);
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
  if (handler) {
    socket.off("mqttData", handler)
  }
  observer?.disconnect()
})

// ================= IMPORT =================
const handleImport = () => {
  window.open(`http://localhost:3000/api/report/${portiqueId}`, "_blank")
}

// ================= DISPLAY VALUE =================
const displayedValue = computed(() => {
  if (selectedMode.value === 0) {
    return normal.value.mode === "CPS" ? normal.value.cps : normal.value.cpm
  }
  return spectrum.value.currentCps
})

// ================= WATCH MODE =================
watch(selectedMode, (val) => {
  chartKey.value++
  if (val === 1) {
    // Ne pas réinitialiser les données quand on change de mode
    // spectrumData.value = []
    isRunning.value = false
  }
})

// ================ send Trame ============
const sendTrame = async () => {
  try {
    let payload: any = {}

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

      if (isNaN(payload.LLD) || isNaN(payload.HLD) || isNaN(payload.HT)) {
        console.error("❌ valeurs invalides MODE NORMAL")
        return
      }
    } else if (selectedMode.value === 1) {
      payload = {
        mode: 1,
        LLD: Number(spectrum.value.lld),
        dV: Number(spectrum.value.dv),
        Vmax: Number(spectrum.value.vmax),
        B: barriere.value ? 1 : 0,
        A: alarme.value ? 1 : 0
      }

      if (isNaN(payload.LLD) || isNaN(payload.dV) || isNaN(payload.Vmax)) {
        console.error("❌ valeurs invalides MODE SPECTRUM")
        return
      }
    }

    console.log("📤 PAYLOAD:", payload)
    await axios.post("http://localhost:3000/api/send-trame", payload)
    console.log("✅ trame envoyée")
  } catch (err) {
    console.error("❌ Erreur sendTrame:", err)
  }
}

// ================== Barriere ===================
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
const isDark = ref(document.documentElement.classList.contains("dark"))
let observer: MutationObserver | null = null

onMounted(() => {
  observer = new MutationObserver(() => {
    isDark.value = document.documentElement.classList.contains("dark")
  })
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"]
  })
})

// ================= CHART NORMAL =================
const sortedMesures = computed(() =>
  [...chartMesures.value].sort(
    (a, b) => new Date(a.date_mesure).getTime() - new Date(b.date_mesure).getTime()
  )
)

const cpsData = computed(() => ({
  labels: sortedMesures.value.map(m => new Date(m.date_mesure).toLocaleTimeString()),
  datasets: [
    {
      label: normal.value.mode,
      data: sortedMesures.value.map(m => normal.value.mode === "CPS" ? m.cps : m.cpm),
      borderColor: isDark.value ? "rgb(37, 99, 235)" : "rgb(34, 197, 94)",
      backgroundColor: isDark.value ? "rgba(37, 99, 235, 0.15)" : "rgba(34, 197, 94, 0.15)",
      tension: 0.4,
      fill: true,
      pointRadius: 2,
      pointHoverRadius: 5
    }
  ]
}))

// ================= OPTIONS =================
const options = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false }
  },
  scales: {
    y: {
      beginAtZero: true,
      title: {
        display: true,
        text: "Counts"
      }
    },
    x: {
      title: {
        display: true,
        text: "Temps"
      }
    }
  }
}

// ================= SPECTRUM OPTIONS CORRIGÉES =================
const spectrumOptions: ChartOptions<"line"> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    tooltip: {
      callbacks: {
        label: function (context: any) {
          const point = context.raw
          if (point && point.x !== undefined && point.y !== undefined) {
            return [
              `Tension: ${point.x.toFixed(2)} V`,
              `CPS: ${point.y.toFixed(2)}`,
              `Énergie: ${point.energy ? point.energy.toFixed(2) : "N/A"} keV`
            ]
          }
          return []
        }
      }
    },
    legend: {
      position: "top" as const
    }
  },
  scales: {
    x: {
      type: "linear" as const,
      title: {
        display: true,
        text: "Tension (V)",
        font: {
            size: 14,
            weight: 700
        }
      },
      ticks: {
        stepSize: 1,
        callback: (val) => {
           return Number(val).toFixed(1) + " V"
        }
      },
      min: 0,
      grid: {
        display: true,
      }
    },
    y: {
       type: "linear" as const,
      title: {
        display: true,
        text: "CPS (Counts per second)",
        font: {
           size: 14,
            weight: 700
}
      },
      beginAtZero: true,
      ticks: {
        callback: (val) => {
          return Number(val).toFixed(0)
        }
      },
      grid: {
        display: true,
      }
    }
  },
  elements: {
    point: {
      radius: 5,
      hoverRadius: 8,
      pointStyle: 'circle'
    },
    line: {
      borderWidth: 2,
      tension: 0.3
    }
  }
}

// ================= Initialiser SPECTRUM =================
const initSpectrumGrid = () => {
  spectrumData.value = []
  let current = spectrum.value.lld
  const points = []
  
  console.log(`📊 Initialisation grille: LLD=${spectrum.value.lld}, Vmax=${spectrum.value.vmax}, dV=${spectrum.value.dv}`);
  
  while (current <= spectrum.value.vmax + 0.01) {
    points.push({
      energy: 0,
      cps: 0,
      tension: Number(current.toFixed(2))
    })
    current += spectrum.value.dv
  }
  
  spectrumData.value = points
  console.log(`📊 Grille initialisée avec ${spectrumData.value.length} points`);
}

// ================= SPECTRUM CHART CORRIGÉ =================
const startSpectrum = async () => {
  console.log("🚀 Démarrage du scan spectrum");
  isRunning.value = true
  initSpectrumGrid()
  
  // Attendre un peu pour que le frontend soit prêt
  await new Promise(resolve => setTimeout(resolve, 100));
  
  await axios.post("http://localhost:3000/api/send-trame", {
    mode: 1,
    LLD: spectrum.value.lld,
    dV: spectrum.value.dv,
    Vmax: spectrum.value.vmax,
    B: barriere.value ? 1 : 0,
    A: alarme.value ? 1 : 0
  })
  
  console.log("✅ Scan démarré");
}

const spectrumChart = computed(() => {
  // Filtrer les points avec CPS > 0 pour le graphique
  const validPoints = spectrumData.value.filter(p => p.cps > 0 || p.tension)
  
  console.log(`📊 Création graphique: ${validPoints.length} points valides sur ${spectrumData.value.length} total`);
  
  if (validPoints.length > 0) {
    console.log(`📊 Premier point: Tension=${validPoints[0].tension}, CPS=${validPoints[0].cps}`);
    console.log(`📊 Dernier point: Tension=${validPoints[validPoints.length-1].tension}, CPS=${validPoints[validPoints.length-1].cps}`);
  }
  
  return {
    datasets: [
      {
        label: "Spectre CPS vs Tension",
        data: validPoints.map(p => ({
          x: p.tension,  // X = Tension (V)
          y: p.cps,      // Y = CPS
          energy: p.energy
        })),
        borderColor: "rgb(239, 68, 68)",
        backgroundColor: "rgba(239, 68, 68, 0.1)",
        borderWidth: 2,
        tension: 0.3,
        fill: true,
        pointRadius: 6,
        pointHoverRadius: 8,
        pointBackgroundColor: "rgb(239, 68, 68)",
        pointBorderColor: "white",
        pointBorderWidth: 2,
        showLine: true,
        spanGaps: false
      }
    ]
  }
})

// Debug: surveiller les changements de spectrumData
watch(spectrumData, (newData) => {
  console.log(`📊 spectrumData changé: ${newData.length} points`);
  if (newData.length > 0) {
    console.log(`📊 Dernier point ajouté:`, newData[newData.length - 1]);
  }
}, { deep: true })

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

      <div class="flex gap-2">
        <Button variant="outline" size="sm" @click="handleImport">
          <Upload class="mr-2 h-4 w-4" />
          Importer Rapport
        </Button>

        <select v-model="selectedMode" class="h-9 px-2 rounded border ml-2 bg-white text-black dark:bg-slate-800 dark:text-white">
          <option :value="0">Mode Monocanal</option>
          <option :value="1">Mode Multicanal</option>
        </select>
      </div>
    </div>

    <!-- KPI -->
    <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
      <!-- CPS / CPM -->
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

      <!-- THRESHOLDS -->
      <Card v-if="selectedMode === 0" class="col-span-2">
        <CardHeader>
          <CardTitle class="text-m font-medium">Thresholds</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="flex gap-4 items-end w-full">
            <div class="flex flex-col flex-1">
              <label class="text-m text-muted-foreground mb-1">LLD</label>
              <input
                v-model.number="normal.lld"
                type="number"
                step="0.1"
                class="w-full h-8 border px-2 rounded bg-white text-black dark:bg-slate-800 dark:text-white"
              />
            </div>
            <div class="flex flex-col flex-1">
              <label class="text-m text-muted-foreground mb-1">HLD</label>
              <input
                v-model.number="normal.hld"
                type="number"
                step="0.1"
                class="w-full h-8 border px-2 rounded bg-white text-black dark:bg-slate-800 dark:text-white"
              />
            </div>
            <button @click="sendTrame" class="h-8 px-6 text-m rounded-md bg-green-600 text-white dark:bg-blue-600 dark:hover:bg-blue-700">
              Send
            </button>
          </div>
        </CardContent>
      </Card>

      <!-- SPECTRUM PARAMETERS -->
      <Card v-if="selectedMode === 1" class="col-span-2">
        <CardHeader>
          <CardTitle class="text-m font-medium">Spectrum Parameters</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="flex gap-4 items-end w-full">
            <div class="flex gap-4 flex-1">
              <div class="flex flex-col flex-1">
                <label class="text-m text-muted-foreground">LLD (V)</label>
                <input
                  v-model.number="spectrum.lld"
                  type="number"
                  step="0.1"
                  class="w-full border px-2 py-1 rounded bg-white text-black dark:bg-slate-800 dark:text-white"
                />
              </div>
              <div class="flex flex-col flex-1">
                <label class="text-m text-muted-foreground">ΔV (V)</label>
                <input
                  v-model.number="spectrum.dv"
                  type="number"
                  step="0.1"
                  class="w-full border px-2 py-1 rounded bg-white text-black dark:bg-slate-800 dark:text-white"
                />
              </div>
              <div class="flex flex-col flex-1">
                <label class="text-m text-muted-foreground">Vmax (V)</label>
                <input
                  v-model.number="spectrum.vmax"
                  type="number"
                  step="0.1"
                  class="w-full border px-2 py-1 rounded bg-white text-black dark:bg-slate-800 dark:text-white"
                />
              </div>
            </div>
            <div class="flex gap-2">
              <button @click="sendTrame" class="h-9 px-6 text-sm rounded-md bg-green-600 text-white dark:bg-blue-600 dark:hover:bg-blue-700">
                Send Config
              </button>
              <button @click="startSpectrum" :disabled="isRunning" class="h-9 px-6 text-sm rounded-md bg-red-600 text-white hover:bg-red-700 disabled:opacity-50">
                {{ isRunning ? "Scanning..." : "Start Scan" }}
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- BARRIER -->
      <Card class="col-span-1">
        <CardContent class="flex flex-col items-center justify-between h-[140px]">
          <img :src="barrierImage" class="h-16 object-contain" />
          <div class="flex items-center justify-between w-full mt-2">
            <span :class="barriere ? 'text-green-500' : 'text-red-500'" class="font-bold">
              {{ barriere ? "OPEN" : "CLOSED" }}
            </span>
            <button @click="toggleBarriere" class="h-9 px-4 py-1 text-sm rounded-md bg-green-600 text-white dark:bg-blue-600 dark:hover:bg-blue-700">
              {{ barriere ? "Close" : "Open" }}
            </button>
          </div>
        </CardContent>
      </Card>

      <!-- ALARM -->
      <Card class="col-span-1">
        <CardContent class="flex flex-col items-center justify-between h-[140px]">
          <img :src="alarmImage" class="h-16 object-contain" />
          <div class="flex items-center justify-between w-full mt-2">
            <span class="font-bold text-gray-600">Enable alarm</span>
            <button @click="toggleAlarme" class="h-9 px-4 py-1 text-sm rounded-md bg-red-600 hover:bg-red-700 text-white">
              {{ alarme ? "ON" : "OFF" }}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- CHART MODE NORMAL -->
    <Card v-if="selectedMode === 0">
      <CardHeader>
        <CardTitle class="flex items-center justify-between">
          <span>{{ normal.mode === "CPS" ? "Radiation CPS Trend" : "Radiation CPM Trend" }}</span>
          <select v-model="normal.mode" class="h-8 px-2 text-xs rounded-md bg-white text-black border dark:bg-slate-800 dark:text-white">
            <option value="CPS">CPS</option>
            <option value="CPM">CPM</option>
          </select>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div class="h-[320px]">
          <Line :key="chartKey" :data="cpsData" :options="options" />
        </div>
      </CardContent>
    </Card>

    <!-- SPECTRUM CHART -->
    <Card v-if="selectedMode === 1">
      <CardHeader>
        <div class="flex justify-between items-start w-full">
          <div>
            <CardTitle class="text-sm font-medium">Spectre d'émission (Tension vs CPS)</CardTitle>
            <p class="text-xs text-muted-foreground mt-1">
              Tension: {{ spectrum.lld }} - {{ spectrum.vmax }} V | Pas: {{ spectrum.dv }} V
            </p>
          </div>
          <div class="text-xs text-muted-foreground">
            Points mesurés: {{ spectrumData.filter(p => p.cps > 0).length }} / {{ spectrumData.length }}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div class="h-[400px]">
          <Line 
            v-if="spectrumData.length > 0" 
            :key="spectrumData.length" 
            :data="spectrumChart" 
            :options="spectrumOptions" 
          />
          <div v-else class="h-full flex items-center justify-center text-muted-foreground">
            Cliquez sur "Start Scan" pour démarrer l'acquisition du spectre
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>