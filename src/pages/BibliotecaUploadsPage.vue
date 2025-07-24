<template>
  <q-page class="q-pa-md">
    <q-toolbar class="text-white bg-green-10">
      <q-toolbar-title>Biblioteca / Uploads</q-toolbar-title>
    </q-toolbar>

    <q-card class="q-mt-md q-pa-md">
      <q-uploader
        label="Enviar novo documento"
        url="#"
        accept=".pdf, .doc, .docx, .ppt, .pptx"
        auto-upload
        @added="onFileSelected"
        :hide-upload-btn="true"
      />
    </q-card>

    <q-separator spaced />

    <q-list bordered separator class="q-mt-md">
      <q-item v-for="file in arquivos" :key="file.id" clickable>
        <q-item-section avatar>
          <q-icon name="description" />
        </q-item-section>
        <q-item-section>
          <q-item-label>{{ file.nome }}</q-item-label>
          <q-item-label caption>{{ file.tipo }}</q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-btn icon="visibility" flat round @click="abrirArquivo(file)" />
        </q-item-section>
      </q-item>
    </q-list>
  </q-page>
</template>

<script setup>
import { ref } from 'vue';

const arquivos = ref([
  { id: 1, nome: 'Resumo de Matemática.pdf', tipo: 'PDF' },
  { id: 2, nome: 'Apresentação Física.pptx', tipo: 'PowerPoint' },
]);

function onFileSelected(files) {
  console.log('Arquivo selecionado:', files);
  // Em breve: salvar no Firebase Storage
}

function abrirArquivo(file) {
  console.log('Abrir arquivo:', file.nome);
  // Em breve: visualizar arquivo ou baixar
}
</script>
