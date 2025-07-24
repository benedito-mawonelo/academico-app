<template>
  <q-card flat>
    <q-card-section>
      <div class="text-caption text-grey-7">Evolução Mensal</div>
      <!-- Aqui iria um gráfico real (Chart.js, ApexCharts, etc) -->
      <div class="chart-placeholder bg-grey-2 rounded-borders flex flex-center">
        <div class="text-grey-6">Gráfico de Desempenho</div>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup>
defineProps({
  data: Object
})
</script>

<style scoped>
.chart-placeholder {
  height: 200px;
  margin-top: 10px;
}
</style>
