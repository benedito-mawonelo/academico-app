<template>
  <q-card class="stat-card" :style="`border-left: 4px solid var(--q-${color});`">
    <q-card-section>
      <div class="row items-center no-wrap">
        <div>
          <div class="text-caption text-grey-7">{{ title }}</div>
          <div class="text-h5 text-weight-bold">{{ value }}</div>
        </div>
        <q-space />
        <q-icon :name="icon" :color="color" size="lg" />
      </div>
      <q-linear-progress
        v-if="progress"
        :value="progress/100"
        :color="color"
        class="q-mt-sm"
      />
    </q-card-section>
  </q-card>
</template>

<script setup>
defineProps({
  title: String,
  value: [String, Number],
  icon: String,
  color: String,
  progress: [String, Number]
})
</script>

<style lang="scss" scoped>
.stat-card {
  height: 100%;
  transition: transform 0.3s ease;

  &:hover {
    transform: translateY(-3px);
  }
}
</style>
