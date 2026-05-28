<script setup lang="ts">
import { ref, computed } from "vue"
import axios from "axios"

import Card from "@/components/ui/Card.vue"
import CardHeader from "@/components/ui/CardHeader.vue"
import CardTitle from "@/components/ui/CardTitle.vue"
import CardContent from "@/components/ui/CardContent.vue"
import Button from "@/components/ui/Button.vue"

import { Line } from "vue-chartjs"

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
} from "chart.js"

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
)

// ==========================
// SOURCES
// ==========================

const source1 = ref({
  name: "Cs-137",
  energy: 662,
  amplitude: 3.2
})

const source2 = ref({
  name: "Co-60",
  energy: 1332,
  amplitude: 6.1
})

// ==========================
// RESULTATS
// ==========================

const slope = ref(0)
const offset = ref(0)
const equation = ref("")

const calibrationStatus = ref("Not Calibrated")

// ==========================
// CALCUL LOCAL
// ==========================

const calculateCalibration = async () => {

  try {

    const res = await axios.post(
      "http://localhost:3000/api/calibration",
      {
        source1: source1.value,
        source2: source2.value
      }
    )

    slope.value = res.data.slope
    offset.value = res.data.offset
    equation.value = res.data.equation

    calibrationStatus.value = "Valid"

  } catch (error) {

    console.error(error)

    calibrationStatus.value = "Failed"
  }
}

// ==========================
// GRAPH
// ==========================

const calibrationChart = computed(() => ({

  labels: [
    source1.value.amplitude,
    source2.value.amplitude
  ],

  datasets: [
    {
      label: "Calibration Curve",

      data: [
        source1.value.energy,
        source2.value.energy
      ],

      borderColor: "rgb(239, 68, 68)",
      backgroundColor: "rgba(239, 68, 68, 0.15)",

      tension: 0.3,
      fill: true,
      pointRadius: 5
    }
  ]
}))

const calibrationOptions = {

  responsive: true,
  maintainAspectRatio: false,

  plugins: {
    legend: {
      display: true
    }
  },

  scales: {

    x: {
      title: {
        display: true,
        text: "Amplitude"
      }
    },

    y: {
      title: {
        display: true,
        text: "Energy (keV)"
      }
    }
  }
}
</script>

<template>

<div class="space-y-6">

  <!-- ================= HEADER ================= -->

  <div class="flex items-center justify-between">

    <div>
      <h1 class="text-2xl font-bold tracking-tight">
        Detector Calibration
      </h1>

      <p class="text-sm text-muted-foreground mt-1">
        Energy calibration of radiation detector
      </p>
    </div>
    <Button
      class="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
      @click="calculateCalibration"
    >
      Calculate Calibration
    </Button>

  </div>

  <!-- ================= KPI ================= -->

  <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">

    <!-- SLOPE -->

    <Card>
      <CardHeader>
        <CardTitle class="text-sm font-medium">
          Slope
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div class="text-xl font-bold">
          {{ slope }}
        </div>
      </CardContent>
    </Card>
    <!-- OFFSET -->

    <Card>
      <CardHeader>
        <CardTitle class="text-sm font-medium">
          Offset
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div class="text-xl font-bold">
          {{ offset }}
        </div>
      </CardContent>
    </Card>

    <!-- STATUS -->

    <Card>
      <CardHeader>
        <CardTitle class="text-sm font-medium">
          Status
        </CardTitle>
      </CardHeader>

      <CardContent>

        <div
          class="text-xl font-bold"
          :class="
            calibrationStatus === 'Valid'
            ? 'text-green-500'
            : 'text-red-500'
          "
        >
          {{ calibrationStatus }}
        </div>

      </CardContent>
    </Card>

    <!-- EQUATION -->

    <Card>
      <CardHeader>
        <CardTitle class="text-sm font-medium">
          Equation
        </CardTitle>
      </CardHeader>

      <CardContent>

        <div class="text-sm font-semibold break-words">
          {{ equation }}
        </div>

      </CardContent>
    </Card>

  </div>

  <!-- ================= SOURCES ================= -->

  <div class="grid gap-4 md:grid-cols-2">

    <!-- SOURCE 1 -->

    <Card>

      <CardHeader>
        <CardTitle>
          Source 1
        </CardTitle>
      </CardHeader>

      <CardContent class="space-y-4">

        <!-- NAME -->

        <div class="flex flex-col">

          <label class="text-sm mb-1">
            Source Name
          </label>

          <input
            v-model="source1.name"
            type="text"
            class="border rounded px-3 py-2
                   bg-white text-black
                   dark:bg-slate-800 dark:text-white"
          />

        </div>

        <!-- ENERGY -->

        <div class="flex flex-col">

          <label class="text-sm mb-1">
            Energy (keV)
          </label>

          <input
            v-model.number="source1.energy"
            type="number"
            class="border rounded px-3 py-2
                   bg-white text-black
                   dark:bg-slate-800 dark:text-white"
          />
        </div>
        <!-- AMPLITUDE -->
        <div class="flex flex-col">
          <label class="text-sm mb-1">
            Amplitude
          </label>
          <input
            v-model.number="source1.amplitude"
            type="number"
            step="0.1"
            class="border rounded px-3 py-2
                   bg-white text-black
                   dark:bg-slate-800 dark:text-white"
          />

        </div>
      </CardContent>

    </Card>

    <!-- SOURCE 2 -->

    <Card>

      <CardHeader>
        <CardTitle>
          Source 2
        </CardTitle>
      </CardHeader>

      <CardContent class="space-y-4">

        <!-- NAME -->

        <div class="flex flex-col">

          <label class="text-sm mb-1">
            Source Name
          </label>

          <input
            v-model="source2.name"
            type="text"
            class="border rounded px-3 py-2
                   bg-white text-black
                   dark:bg-slate-800 dark:text-white"
          />

        </div>

        <!-- ENERGY -->

        <div class="flex flex-col">

          <label class="text-sm mb-1">
            Energy (keV)
          </label>

          <input
            v-model.number="source2.energy"
            type="number"
            class="border rounded px-3 py-2
                   bg-white text-black
                   dark:bg-slate-800 dark:text-white"
          />

        </div>

        <!-- AMPLITUDE -->

        <div class="flex flex-col">

          <label class="text-sm mb-1">
            Amplitude
          </label>

          <input
            v-model.number="source2.amplitude"
            type="number"
            step="0.1"
            class="border rounded px-3 py-2
                   bg-white text-black
                   dark:bg-slate-800 dark:text-white"
          />

        </div>

      </CardContent>

    </Card>

  </div>

  <!-- ================= GRAPH ================= -->

  <Card>

    <CardHeader>

      <CardTitle>
        Calibration Curve
      </CardTitle>

    </CardHeader>

    <CardContent>

      <div class="h-[400px]">

        <Line
          :data="calibrationChart"
          :options="calibrationOptions"
        />

      </div>

    </CardContent>

  </Card>

</div>

</template>