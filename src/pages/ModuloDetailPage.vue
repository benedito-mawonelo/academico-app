<!-- src/views/ModuloDetailPage.vue -->
<template>
  <q-page class="q-pa-md">
    <div class="text-h5 text-primary q-mb-md text-center">{{ modulo.nome }}</div>

    <q-tabs
      v-model="tab"
      class="text-primary"
      active-color="primary"
      indicator-color="primary"
      align="justify"
      dense
    >
      <q-tab name="temas" label="Temas" icon="topic" />
      <q-tab name="videos" label="Vídeos" icon="play_circle" />
    </q-tabs>

    <q-separator />

    <q-tab-panels v-model="tab" animated>
      <q-tab-panel name="temas">
        <div v-if="temas.length === 0" class="text-center q-pa-md">Nenhum tema disponível.</div>
        <q-list v-else bordered class="rounded-borders">
<q-item
            v-for="(tema, index) in temas"
            :key="index"
            clickable
            @click="selectTema(tema)"
            class="q-my-sm"
          >
            <q-item-section avatar>
              <q-avatar color="teal" text-color="white" icon="topic" />
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ tema.nome }}</q-item-label>
              <q-item-label caption>{{ tema.descricao || 'Sem descrição disponível' }}</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-icon name="chevron_right" />
            </q-item-section>
          </q-item>
        </q-list>
        </q-tab-panel>

      <q-tab-panel name="videos">
        <div class="row items-center q-mb-sm" v-if="selectedTema">
          <q-chip color="primary" text-color="white" icon="topic">{{ selectedTema.nome }}</q-chip>
          <q-btn flat dense icon="clear" @click="clearTema" class="q-ml-sm" />
        </div>
        <div v-if="filteredVideos.length === 0" class="text-center q-pa-md">Nenhum vídeo disponível.</div>
        <q-list v-else>
          <q-item v-for="video in filteredVideos" :key="video.id" clickable @click="playVideo(video)">
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
    </q-tab-panels>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { collection, getDocs, query, orderBy, where } from 'firebase/firestore'
import { db } from 'boot/firebase'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const router = useRouter()
const route = useRoute()

const tab = ref('temas')
// const cadeiraId = route.params.cadeiraId
const moduloId = route.params.moduloId
const modulo = ref({ nome: 'Carregando...' })
const temas = ref([])
const videos = ref([])
const loading = ref(false)
const selectedTemaId = ref(null)
const selectedTema = computed(() => temas.value.find(t => t.id === selectedTemaId.value) || null)
const filteredVideos = computed(() => {
  return selectedTemaId.value ? videos.value.filter(v => v.temaId === selectedTemaId.value) : videos.value
})

async function loadData() {
  loading.value = true
  try {
    // Carrega o módulo específico
    const moduloDoc = await getDocs(query(collection(db, 'modulos'), where('id', '==', moduloId)))
    if (!moduloDoc.empty) {
      modulo.value = { id: moduloDoc.docs[0].id, ...moduloDoc.docs[0].data() }
    } else {
      modulo.value = { nome: 'Módulo desconhecido' }
      $q.notify({
        type: 'negative',
        message: 'Módulo não encontrado',
        position: 'top'
      })
      return
    }

    // Carrega temas associados ao módulo
    const temasQuery = query(collection(db, 'temas'), where('moduloId', '==', moduloId), orderBy('nome'))
    const temasSnapshot = await getDocs(temasQuery)
    temas.value = temasSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))

    // Carrega videoaulas associadas aos temas (em batches de 10 ids para 'in')
    const temasIds = temas.value.map(tema => tema.id)
    videos.value = []
    if (temasIds.length) {
      const chunk = (arr, size) => arr.reduce((acc, _, i) => (i % size ? acc : [...acc, arr.slice(i, i + size)]), [])
      const batches = chunk(temasIds, 10)
      for (const ids of batches) {
        const vq = query(collection(db, 'videoaulas'), where('temaId', 'in', ids), orderBy('titulo'))
        const snap = await getDocs(vq)
        videos.value.push(...snap.docs.map(doc => ({ id: doc.id, ...doc.data() })))
      }
    }
    // ordena por titulo
    videos.value = videos.value.sort((a,b) => String(a.titulo||'').localeCompare(String(b.titulo||'')))

    if (temas.value.length === 0) {
      $q.notify({
        message: 'Nenhum tema encontrado para este módulo.',
        color: 'warning',
        icon: 'info',
        position: 'top'
      })
    }
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Erro ao carregar dados do módulo',
      caption: error?.message || '',
      position: 'top'
    })
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await loadData()
})

function selectTema(tema) {
  selectedTemaId.value = tema.id
  tab.value = 'videos'
}

function clearTema() {
  selectedTemaId.value = null
}

function playVideo(video) {
  const embedUrl = video.url.includes('youtube.com') ? video.url.replace('watch?v=', 'embed/') : video.url
  router.push({
    path: '/video-player',
    query: {
      id: video.id,
      titulo: video.titulo,
      descricao: video.descricao,
      url: embedUrl,
      temaId: video.temaId || '',
      duracao: video.duracao || 0,
      createdAt: (video.createdAt?.toDate ? video.createdAt.toDate() : new Date()).toISOString()
    }
  })
}
</script>

<style scoped>
.q-tab-panel {
  padding: 16px;
}
.rounded-borders {
  border-radius: 8px;
}
</style>
