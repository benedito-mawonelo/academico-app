<template>
  <q-card
    class="dashboard-card cursor-pointer"
    :style="{ background: gradient }"
    @click="$emit('click')"
  >
    <!-- Efeito de brilho dinâmico -->
    <div class="glow-effect" :style="{ background: gradient }"></div>

    <q-card-section class="text-center card-content">
      <div class="card-icon-wrapper">
        <q-icon
          :name="icon"
          size="xl"
          color="white"
          class="card-icon"
        />
      </div>
      <div class="text-h6 text-white q-mt-sm text-weight-bold card-label">
        {{ label }}
      </div>
      <div v-if="count !== undefined" class="text-subtitle2 text-white q-mt-xs card-count">
        {{ count }} {{ count === 1 ? 'item' : 'itens' }}
      </div>
    </q-card-section>

    <!-- Ícone de ação com efeito -->
    <q-card-actions class="absolute-bottom-right q-pa-sm action-icon">
      <q-icon name="arrow_forward" color="white" size="sm" />
    </q-card-actions>

    <!-- Efeito de borda animada -->
    <div class="border-animation"></div>
  </q-card>
</template>

<script setup>
defineProps({
  label: String,
  icon: String,
  color: String,
  gradient: String,
  count: Number
})
</script>

<style lang="scss" scoped>
.dashboard-card {
  border-radius: 16px;
  transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.12);
  height: 180px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  position: relative;
  isolation: isolate;

  // Efeito de brilho
  .glow-effect {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    opacity: 0;
    z-index: -1;
    filter: blur(20px);
    transition: opacity 0.6s ease;
  }

  // Borda animada
  .border-animation {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border-radius: 16px;
    border: 2px solid transparent;
    background: linear-gradient(90deg, rgba(255,255,255,0.3), rgba(255,255,255,0)) border-box;
    mask: linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0);
    mask-composite: exclude;
    transition: all 0.6s ease;
    opacity: 0;
  }

  .card-content {
    transition: transform 0.3s ease;
    z-index: 2;

    .card-icon-wrapper {
      background: rgba(255, 255, 255, 0.2);
      width: 64px;
      height: 64px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto;
      transition: all 0.4s ease;
      backdrop-filter: blur(4px);
      border: 1px solid rgba(255, 255, 255, 0.1);

      .card-icon {
        transition: transform 0.3s ease;
      }
    }

    .card-label {
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
      transition: all 0.3s ease;
    }

    .card-count {
      opacity: 0.9;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
      transition: all 0.3s ease;
    }
  }

  .action-icon {
    transition: all 0.3s ease;
    opacity: 0.8;
  }

  &:hover {
    transform: translateY(-8px) scale(1.02);
    box-shadow: 0 16px 32px rgba(0, 0, 0, 0.2);

    .glow-effect {
      opacity: 0.6;
    }

    .border-animation {
      opacity: 1;
      transform: scale(1.02);
    }

    .card-content {
      transform: translateY(-4px);

      .card-icon-wrapper {
        transform: scale(1.1);
        background: rgba(255, 255, 255, 0.3);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);

        .card-icon {
          transform: scale(1.1);
        }
      }

      .card-label {
        letter-spacing: 0.5px;
      }

      .card-count {
        opacity: 1;
      }
    }

    .action-icon {
      transform: translateX(-2px);
      opacity: 1;
    }
  }

  &:active {
    transform: scale(0.97) translateY(-5px);
    transition: all 0.2s ease;

    .card-content .card-icon-wrapper {
      transform: scale(1.05);
    }
  }
}
</style>
