<template>
  <q-page class="q-pa-md">
    <q-toolbar class="text-white bg-green-10">
      <q-toolbar-title>Scanner de Manuais</q-toolbar-title>
    </q-toolbar>

    <div class="q-mt-lg flex flex-center column">
      <q-btn icon="camera_alt" color="green-10" label="Abrir Câmera" @click="scanManual" />
      <q-btn class="q-mt-md" icon="upload_file" flat label="Carregar Manual" @click="uploadManual" />
    </div>

    <div v-if="manualPreview" class="q-mt-md">
      <q-img :src="manualPreview" :ratio="4/3" />
    </div>
  </q-page>
</template>

<script setup>
import { ref } from 'vue';

const manualPreview = ref('');

function scanManual() {
  console.log('Abrindo scanner...');
  // Integrar com Cordova plugin futuramente
}

function uploadManual() {
  console.log('Selecionar arquivo local...');
  // Aqui futuramente: file picker, upload para Firebase
}
</script>
