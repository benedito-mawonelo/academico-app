<template>
  <q-card 
    class="live-class-card" 
    :class="[statusClass, { 'pulse-card': classData.status === 'live' }]"
    flat 
    bordered
  >
    <!-- Badge de Status -->
    <q-badge 
      :color="statusColor" 
      floating 
      class="status-badge"
      :class="{ 'live-badge': classData.status === 'live' }"
    >
      <q-icon :name="statusIcon" size="xs" class="q-mr-xs" />
      {{ statusLabel }}
    </q-badge>

    <q-card-section class="card-header">
      <div class="row items-center">
        <q-avatar size="48px" color="primary" text-color="white">
          <q-icon :name="classData.icon || 'school'" size="28px" />
        </q-avatar>
        <div class="col q-ml-md">
          <div class="class-title">{{ classData.title }}</div>
          <div class="class-subject text-grey-7">{{ classData.subject }}</div>
        </div>
      </div>
    </q-card-section>

    <q-separator />

    <q-card-section class="card-body">
      <!-- Descrição -->
      <div class="class-description q-mb-md">
        {{ classData.description || 'Aula de reforço sobre o tema proposto' }}
      </div>

      <!-- Informações da Aula -->
      <div class="class-info">
        <div class="info-item">
          <q-icon name="person" size="sm" color="grey-7" />
          <span class="info-text">{{ classData.instructorName || 'Professor' }}</span>
        </div>
        
        <div class="info-item">
          <q-icon name="schedule" size="sm" color="grey-7" />
          <span class="info-text">{{ formatDateTime(classData.scheduledFor) }}</span>
        </div>

        <div class="info-item" v-if="classData.duration">
          <q-icon name="timer" size="sm" color="grey-7" />
          <span class="info-text">{{ classData.duration }} min</span>
        </div>

        <div class="info-item" v-if="classData.participants?.length">
          <q-icon name="group" size="sm" color="grey-7" />
          <span class="info-text">{{ classData.participants.length }} participantes</span>
        </div>
      </div>

      <!-- Informação de Expiração para Gravações -->
      <div v-if="classData.status === 'recorded' && classData.expiresAt" class="expiration-info q-mt-sm">
        <q-icon name="info" size="sm" color="warning" />
        <span class="text-warning text-caption">
          Disponível até {{ formatDate(classData.expiresAt) }}
        </span>
      </div>
    </q-card-section>

    <q-separator />

<q-card-actions align="right" class="card-actions">
      <!-- Botões para aulas agendadas -->
      <q-btn 
        v-if="classData.status === 'scheduled' && !canStart"
        flat
        color="grey-7"
        label="Lembrar-me"
        icon="notifications"
        size="sm"
        @click="$emit('remind', classData.id)"
      />
      <q-btn 
        v-if="classData.status === 'scheduled' && canStart"
        unelevated
        color="primary"
        label="Iniciar Aula"
        icon="play_arrow"
        size="md"
        @click="$emit('start', classData.id)"
      />

      <!-- Botão para aulas ao vivo -->
      <q-btn 
        v-if="classData.status === 'live'"
        unelevated
        color="red"
        label="Entrar Agora"
        icon="sensors"
        class="live-button"
        size="md"
        @click="$emit('join', classData.id)"
      />

      <!-- Botão para gravações -->
      <q-btn 
        v-if="classData.status === 'recorded'"
        unelevated
        color="primary"
        label="Assistir Gravação"
        icon="play_circle"
        size="md"
        @click="$emit('watch', classData.id)"
      />

      <!-- Botões adicionais -->
      <q-btn 
        flat
        round
        dense
        color="grey-7"
        icon="share"
        size="sm"
        @click="$emit('share', classData.id)"
      >
        <q-tooltip>Compartilhar</q-tooltip>
      </q-btn>

      <q-btn 
        flat
        round
        dense
        color="grey-7"
        :icon="isFavorite ? 'bookmark' : 'bookmark_border'"
        size="sm"
        @click="toggleFavorite"
      >
        <q-tooltip>{{ isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos' }}</q-tooltip>
      </q-btn>
    </q-card-actions>
  </q-card>
</template>

<script setup>
import { ref, computed } from 'vue'
import { date } from 'quasar'

const props = defineProps({
  classData: {
    type: Object,
    required: true
  },
  canStart: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['join', 'watch', 'remind', 'share', 'favorite', 'start'])

const isFavorite = ref(false)

const statusClass = computed(() => {
  return `status-${props.classData.status}`
})

const statusColor = computed(() => {
  const colors = {
    scheduled: 'grey-6',
    live: 'red',
    recorded: 'green'
  }
  return colors[props.classData.status] || 'grey'
})

const statusIcon = computed(() => {
  const icons = {
    scheduled: 'schedule',
    live: 'radio_button_checked',
    recorded: 'videocam'
  }
  return icons[props.classData.status] || 'help'
})

const statusLabel = computed(() => {
  const labels = {
    scheduled: 'AGENDADA',
    live: 'AO VIVO',
    recorded: 'GRAVADA'
  }
  return labels[props.classData.status] || 'DESCONHECIDO'
})

function formatDateTime(dateValue) {
  if (!dateValue) return 'Data não definida'
  const d = dateValue instanceof Date ? dateValue : new Date(dateValue)
  return date.formatDate(d, 'DD/MM/YYYY [às] HH:mm')
}

function formatDate(dateValue) {
  if (!dateValue) return ''
  const d = dateValue instanceof Date ? dateValue : new Date(dateValue)
  return date.formatDate(d, 'DD/MM/YYYY')
}

function toggleFavorite() {
  isFavorite.value = !isFavorite.value
  emit('favorite', { id: props.classData.id, favorite: isFavorite.value })
}
</script>

<style scoped lang="scss">
.live-class-card {
  transition: all 0.3s ease;
  border-radius: 12px;
  overflow: hidden;

  &:hover {
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
    transform: translateY(-4px);
  }

  &.status-live {
    border-left: 4px solid #f44336;
  }

  &.status-scheduled {
    border-left: 4px solid #9e9e9e;
  }

  &.status-recorded {
    border-left: 4px solid #4caf50;
  }
}

.pulse-card {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(244, 67, 54, 0.4);
  }
  50% {
    box-shadow: 0 0 0 15px rgba(244, 67, 54, 0);
  }
}

.status-badge {
  font-weight: 600;
  font-size: 10px;
  padding: 6px 10px;
  letter-spacing: 0.5px;

  &.live-badge {
    animation: blink 1.5s infinite;
  }
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

.card-header {
  padding: 16px;
}

.class-title {
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
  line-height: 1.3;
}

.class-subject {
  font-size: 13px;
  margin-top: 2px;
}

.card-body {
  padding: 16px;
}

.class-description {
  font-size: 14px;
  color: #555;
  line-height: 1.5;
}

.class-info {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.info-text {
  font-size: 13px;
  color: #666;
}

.expiration-info {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px;
  background: rgba(255, 152, 0, 0.1);
  border-radius: 6px;
}

.card-actions {
  padding: 12px 16px;
  background: #fafafa;
}

.live-button {
  animation: pulse-button 1.5s infinite;
}

@keyframes pulse-button {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}
</style>
