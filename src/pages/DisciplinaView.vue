<template>
  <q-page class="q-pa-md">
    <div class="text-h5 text-primary q-mb-md text-center">{{ disciplina.nome }}</div>

    <q-tabs
      v-model="tab"
      class="text-primary"
      active-color="primary"
      indicator-color="primary"
      align="justify"
      dense
    >
      <q-tab name="videos" label="Vídeos" icon="play_circle" />
      <q-tab name="resumos" label="Resumos" icon="description" />
      <q-tab name="cadernos" label="Cadernos Virtuais" icon="folder" />
      <q-tab name="anotacoes" label="Anotações" icon="edit" />
    </q-tabs>

    <q-separator />

    <q-tab-panels v-model="tab" animated>
      <q-tab-panel name="videos">
        <div v-if="videos.length === 0" class="text-center q-pa-md">Nenhum vídeo disponível.</div>
        <q-list v-else>
          <q-item v-for="video in videos" :key="video.id" clickable @click="playVideo(video)">
            <q-item-section avatar>
              <q-icon name="play_circle" color="primary" />
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ video.titulo }}</q-item-label>
              <q-item-label caption>{{ video.descricao }}</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-tab-panel>

      <q-tab-panel name="resumos">
        <div v-if="resumos.length === 0" class="text-center q-pa-md">Nenhum resumo disponível.</div>
        <q-list v-else>
          <q-item v-for="resumo in resumos" :key="resumo.id" clickable @click="openResumo(resumo.url)">
            <q-item-section avatar>
              <q-icon name="description" color="secondary" />
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ resumo.titulo }}</q-item-label>
              <q-item-label caption>{{ resumo.descricao }}</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-tab-panel>

      <!-- <q-tab-panel name="cadernos">
        <div v-if="cadernos.length === 0" class="text-center q-pa-md">Nenhum caderno virtual.</div>
        <q-list v-else>
          <q-item v-for="caderno in cadernos" :key="caderno.id" clickable @click="openCaderno(caderno.url)">
            <q-item-section avatar>
              <q-icon name="folder" color="teal" />
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ caderno.titulo }}</q-item-label>
              <q-item-label caption>{{ caderno.descricao }}</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-tab-panel> -->
    <q-tab-panel name="cadernos">
      <CadernoCard />
    </q-tab-panel>


      <q-tab-panel name="anotacoes">
        <q-input
          filled
          type="textarea"
          v-model="anotacaoTexto"
          label="Escreva suas anotações aqui"
          autogrow
          rows="6"
          class="q-mb-md"
        />
        <q-btn label="Salvar Anotação" color="primary" @click="salvarAnotacao" :loading="saving" />
      </q-tab-panel>
    </q-tab-panels>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import CadernoCard from 'src/components/CadernoCard.vue'


const router = useRouter() // ✅ correto
const route = useRoute()

const tab = ref('videos')

const disciplinaId = route.params.id

const disciplina = ref({ nome: 'Carregando...' })

const videos = ref([])
const resumos = ref([])
const cadernos = ref([])
const anotacaoTexto = ref('')
const saving = ref(false)

onMounted(() => {
  // Simula carregar dados da disciplina via ID
  if (disciplinaId === 'matematica') {
    disciplina.value.nome = 'Matemática'
    videos.value = [
      { id: 1, titulo: 'Álgebra Básica', descricao: 'Introdução a álgebra', url: 'https://youtu.be/video1' },
      { id: 2, titulo: 'Geometria', descricao: 'Conceitos básicos', url: 'https://youtu.be/video2' }
    ]
    resumos.value = [
      { id: 1, titulo: 'Resumo Álgebra', descricao: 'Pontos principais', url: '#' },
      { id: 2, titulo: 'Resumo Geometria', descricao: 'Conceitos chave', url: '#' }
    ]
    cadernos.value = [
      { id: 1, titulo: 'Caderno Álgebra', descricao: 'Notas e exercícios', url: '#' }
    ]
  } else {
    disciplina.value.nome = 'Disciplina desconhecida'
    videos.value = []
    resumos.value = []
    cadernos.value = []
  }
})

videos.value = [
  {
    titulo: 'Funções Matemáticas',
    descricao: 'Introdução às funções com exemplos práticos',
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
  },
  {
    titulo: 'Gramática Básica',
    descricao: 'Apostila introdutória de gramática',
    url: 'https://www.youtube.com/watch?v=9bZkp7q19f0'
  }
]


function playVideo(video) {
  const embedUrl = video.url.replace('watch?v=', 'embed/')
  router.push({
    path: '/video-player',
    query: {
      titulo: video.titulo,
      descricao: video.descricao,
      url: embedUrl
    }
  })
}



function openResumo(url) {
  alert('Abrir resumo: ' + url)
}

// function openCaderno(url) {
//   alert('Abrir caderno: ' + url)
// }

function salvarAnotacao() {
  saving.value = true
  // Aqui salvar anotação (Firebase etc)
  setTimeout(() => {
    saving.value = false
    alert('Anotação salva com sucesso!')
  }, 1000)
}
</script>
