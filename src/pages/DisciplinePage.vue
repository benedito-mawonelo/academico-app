<template>
  <q-page class="q-pa-md">
    <div class="text-h5 text-primary q-mb-md text-center">Minhas Disciplinas</div>

    <q-list bordered class="rounded-borders">

      <q-item
        v-for="(disciplina, index) in disciplinas"
        :key="index"
        clickable
        @click="goToDisciplina(disciplina.id)"
        class="q-my-sm"
      >
        <q-item-section avatar>
          <q-avatar color="primary" text-color="white" icon="book" />
        </q-item-section>

        <q-item-section>
          <q-item-label>{{ disciplina.nome }}</q-item-label>
          <q-item-label caption>{{ disciplina.descricao }}</q-item-label>
        </q-item-section>

        <q-item-section side>
          <q-icon name="chevron_right" />
        </q-item-section>
      </q-item>

    </q-list>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// Simulação de disciplinas — depois virá do Firebase
const disciplinas = ref([
  { id: 'matematica', nome: 'Matemática', descricao: 'Álgebra, Geometria e mais' },
  { id: 'fisica', nome: 'Física', descricao: 'Mecânica, Termodinâmica' },
  { id: 'quimica', nome: 'Química', descricao: 'Reações, Tabela Periódica' },
  { id: 'biologia', nome: 'Biologia', descricao: 'Seres vivos e genética' },
])

function goToDisciplina(id) {
  router.push(`/disciplinas/${id}`) // Redireciona para visualização da disciplina
}
</script>
