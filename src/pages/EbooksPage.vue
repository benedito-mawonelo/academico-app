<template>
  <q-page class="q-pa-md">
    <q-toolbar class="text-white bg-green-10">
      <q-toolbar-title>Ebooks</q-toolbar-title>
    </q-toolbar>

    <q-list bordered separator class="q-mt-md">
      <q-item v-for="ebook in ebooks" :key="ebook.id" clickable>
        <q-item-section avatar>
          <q-icon name="book" />
        </q-item-section>
        <q-item-section>
          <q-item-label>{{ ebook.title }}</q-item-label>
          <q-item-label caption>{{ ebook.author }}</q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-btn flat round icon="visibility" color="green-10" @click="viewEbook(ebook)" />
        </q-item-section>
      </q-item>
    </q-list>
  </q-page>
</template>

<script setup>
import { ref } from 'vue';

const ebooks = ref([
  { id: 1, title: 'Matemática Aplicada', author: 'Prof. João' },
  { id: 2, title: 'Física Moderna', author: 'Dra. Ana' },
]);

function viewEbook(ebook) {
  console.log('Visualizar', ebook.title);
  // Aqui futuramente: navegação ou abrir leitor de PDF
}
</script>
