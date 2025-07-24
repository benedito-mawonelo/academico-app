<template>
  <q-page class="q-pa-md bg-grey-1">
    <div class="text-center q-mb-md">
      <div class="text-h5 text-primary text-weight-bold">Notificações Acadêmicas</div>
      <div class="text-subtitle2 text-grey-7">
        Acompanhe os últimos avisos e lembretes
      </div>
    </div>

    <q-timeline color="primary">
      <q-timeline-entry
        v-for="(notificacao, index) in notificacoes"
        :key="index"
        :title="notificacao.titulo"
        :subtitle="notificacao.data"
        :icon="notificacao.icon"
      >
        <div>{{ notificacao.mensagem }}</div>
      </q-timeline-entry>
    </q-timeline>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'

const notificacoes = ref([
  {
    titulo: 'Prova Final de Matemática',
    data: '22 de Julho, 08:00',
    mensagem: 'A prova será realizada na sala 3B.',
    icon: 'event'
  },
  {
    titulo: 'Entrega de Trabalho',
    data: '24 de Julho, 12:00',
    mensagem: 'Trabalho de Biologia deve ser entregue via plataforma.',
    icon: 'assignment'
  }
])
</script>
