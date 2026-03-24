<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import axios from 'axios'

import Card from '@/components/ui/Card.vue'
import CardHeader from '@/components/ui/CardHeader.vue'
import CardTitle from '@/components/ui/CardTitle.vue'
import CardContent from '@/components/ui/CardContent.vue'

import barrierOpen from '@/assets/pictures/barriereOv.png'
import barrierClose from '@/assets/pictures/barriereFe.png'
import alarmOn from '@/assets/pictures/alarmOn.gif'
import alarmOff from '@/assets/pictures/alarmOff.png'

import Button from '@/components/ui/Button.vue'
import { Activity, Zap, Gauge, Upload } from 'lucide-vue-next'
import { Line } from 'vue-chartjs'

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler,
  type ChartData,
  type ChartOptions
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler
)

import { useRoute } from 'vue-router'

const route = useRoute()

const portiqueId = route.params.id
const portiqueNom = ref("")



//  DONNÉES RPM
const cps = ref(0)
const cpm = ref(0)
const tension = ref(0)
const chartMesures = ref([])


// Charger depuis MongoDB
onMounted(async () => {
  try {
    const latest = await axios.get(
  `http://localhost:3000/api/mesure/latest/${portiqueId}`
   )

    cps.value = latest.data?.cps || 0
    cpm.value = latest.data?.cpm || 0
    tension.value = latest.data?.tension || 0

    const chart = await axios.get(
  `http://localhost:3000/api/mesure/chart/${portiqueId}`
   )
    chartMesures.value = chart.data || []

  } catch (err) {
    console.error("Erreur dashboard:", err)
  }

   try {

    const res = await axios.get(
      `http://localhost:3000/api/portiques/${portiqueId}`
    )

    portiqueNom.value = res.data.nom

  } catch (error) {
    console.error("Erreur chargement portique", error)
  }
})


//  Graphe CPS

const sortedMesures = computed(() =>
  [...chartMesures.value].sort(
    (a: any, b: any) => new Date(a.date_mesure).getTime() - new Date(b.date_mesure).getTime()
  )
)
const cpsData = computed<ChartData<'line'>>(() => ({
  labels: sortedMesures.value.map((m: any) =>
    new Date(m.date_mesure).toLocaleTimeString()
  ),
  datasets: [
    {
      label: "CPS",
      data: sortedMesures.value.map((m: any) => m.cps),
      borderColor: 'rgb(37, 99, 235)',
      backgroundColor: 'rgba(37, 99, 235, 0.1)',
      tension: 0.4,
      fill: true
    }
  ]
}))

const options = computed<ChartOptions<'line'>>(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false }
  }
}))

const barriere = ref(false)
const alarme = ref(false)

const barrierImage = computed(() =>
  barriere.value ? barrierOpen : barrierClose
)

const alarmImage = computed(() =>
  alarme.value ? alarmOn : alarmOff
)

// charger état
const loadControle = async () => {
  const res = await axios.get("http://localhost:3000/api/controle")
  barriere.value = res.data?.barriere || false
  alarme.value = res.data?.alarme || false
}

onMounted(() => {
  loadControle()
})

// 🔥 contrôle
const toggleBarriere = async () => {
  barriere.value = !barriere.value

  await axios.post("http://localhost:3000/api/barriere", {
    state: barriere.value
  })
}

const toggleAlarme = async () => {
  alarme.value = !alarme.value

  await axios.post("http://localhost:3000/api/alarme", {
    state: alarme.value
  })
}



// 🟢 statut radiation simple
const status = computed(() => {
  if (cps.value > 100) return "ALERTE"
  if (cps.value > 50) return "SURVEILLANCE"
  return "NORMAL"
})


const totalMesures = ref(0)
const totalAlarmes = ref(0)
const mesures = ref([])
const handleImport = () => {

  window.open(
    `http://localhost:3000/api/report/${portiqueId}`,
    "_blank"
  )

}

onMounted(async () => {

  try {

    const res = await axios.get(
      `http://localhost:3000/api/mesure/chart/${portiqueId}`
    )

    mesures.value = res.data

    totalMesures.value = res.data.length

    totalAlarmes.value = res.data.filter(
      (m:any) => m.cps > 100
    ).length

  } catch (error) {

    console.error("Erreur chargement rapport", error)

  }

})

</script>


<template>
  <div class="space-y-6">

    <!-- HEADER -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-xl font-bold tracking-tight">
          Radiation Portal Dashboard - {{ portiqueNom }}
        </h1>
        <p class="text-muted-foreground">
           Surveillance temps réel des portiques RPM – CNESTEN
        </p>
      </div>

      <Button variant="outline" size="sm" @click="handleImport">
        <Upload class="mr-2 h-4 w-4" />
        Importer Rapport
      </Button>
    </div>


    <!-- KPI -->
    <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">

      <!-- CPS -->
      <Card>
        <CardHeader class="flex flex-row items-center justify-between pb-2">
          <CardTitle class="text-sm font-medium">CPS</CardTitle>
          <Activity class="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">{{ cps }}</div>
          <p class="text-xs text-muted-foreground">
            Counts per second
          </p>
        </CardContent>
      </Card>

      <!-- CPM -->
      <Card>
        <CardHeader class="flex flex-row items-center justify-between pb-2">
          <CardTitle class="text-sm font-medium">CPM</CardTitle>
          <Gauge class="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">{{ cpm }}</div>
          <p class="text-xs text-muted-foreground">
            Counts per minute
          </p>
        </CardContent>
      </Card>

      <!-- Voltage -->
      <Card>
        <CardHeader class="flex flex-row items-center justify-between pb-2">
          <CardTitle class="text-sm font-medium">Voltage</CardTitle>
          <Zap class="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">{{ tension }} V</div>
          <p class="text-xs text-muted-foreground">
            Alimentation portique
          </p>
        </CardContent>
      </Card>

      <!-- Status -->
      <Card>
        <CardHeader>
          <CardTitle class="text-sm font-medium">Radiation Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            class="text-2xl font-bold"
            :class="{
              'text-green-500': status === 'NORMAL',
              'text-yellow-500': status === 'SURVEILLANCE',
              'text-red-500': status === 'ALERTE'
            }"
          >
            {{ status }}
          </div>
          <p class="text-xs text-muted-foreground">
            Analyse automatique
          </p>
        </CardContent>
      </Card>
    </div>


<Card>
  <CardHeader>
    <CardTitle>Remote Control</CardTitle>
  </CardHeader>

  <CardContent>
    <div class="grid md:grid-cols-2 gap-6">

      <!-- Barrière -->
      <div class="p-4 border rounded-lg space-y-3">
        <h3 class="font-semibold">Gate Barrier</h3>

        <div class="h-32 flex items-center justify-center">
          <img :src="barrierImage" class="max-h-16 object-contain"/>
        </div>

        <p class="text-sm text-muted-foreground">
          Contrôle d’accès du portique
        </p>

        <div class="flex items-center justify-between">
          <span
            :class="barriere ? 'text-green-500' : 'text-red-500'"
            class="font-bold"
          >
            {{ barriere ? "OPEN" : "CLOSED" }}
          </span>

          <button
            @click="toggleBarriere"
            class="px-4 py-2 rounded-md bg-primary text-white hover:opacity-90"
          >
            {{ barriere ? "Close" : "Open" }}
          </button>
        </div>
      </div>

      <!-- Alarme -->
      <div class="p-4 border rounded-lg space-y-3 relative">
        <h3 class="font-semibold">Radiation Alarm</h3>

        <div class="h-32 flex items-center justify-center">
          <img
            :src="alarmImage"
            class="max-h-28 object-contain"
          />
        </div>

        <p class="text-sm text-muted-foreground">
          Activation sonore et visuelle
        </p>

        <div class="flex items-center justify-between">
          <span
            :class="alarme ? 'text-green-500' : 'text-red-500'"
            class="font-bold"
          >
            {{ alarme ? "ACTIVE" : "OFF" }}
          </span>

          <button
            @click="toggleAlarme"
            class="px-4 py-2 rounded-md bg-primary text-white hover:opacity-90"
          >
            {{ alarme ? "Stop" : "Activate" }}
          </button>
        </div>
      </div>

    </div>
  </CardContent>
</Card>

<!-- Graphe CPS -->
    <Card>
      <CardHeader>
        <CardTitle>Radiation CPS Trend</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="h-[320px]">
          <Line :data="cpsData" :options="options" />
        </div>
      </CardContent>
    </Card>

   <!-- <div class="grid gap-4 md:grid-cols-2">

      <Card>
        <CardHeader>
          <CardTitle></CardTitle>
        </CardHeader>
        <CardContent>
        </CardContent>
      </Card>

    </div>-->
  </div>
</template>