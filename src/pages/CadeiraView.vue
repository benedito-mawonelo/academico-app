<template>
  <q-page class="cadeira-page">
    <!-- Header Section -->
    <div class="header-section">
      <div class="header-overlay"></div>
      <div class="header-content">
        <h1 class="header-title animate__animated animate__fadeInDown">{{ cadeira.nome }}</h1>
        <p class="header-subtitle animate__animated animate__fadeIn animate__delay-1s">
          Explore vídeos, módulos, resumos e mais para dominar esta disciplina
        </p>
      </div>
    </div>

    <!-- Tabs -->
    <q-tabs
      v-model="tab"
      class="tabs-modern text-primary"
      active-color="primary"
      indicator-color="accent"
      align="center"
      dense
    >
      <q-tab name="videos" label="Vídeos" icon="play_circle" class="tab-item" />
      <q-tab name="modulos" label="Módulos" icon="view_module" class="tab-item" />
      <!-- <q-tab name="resumos" label="Resumos" icon="description" class="tab-item" />
      <q-tab name="cadernos" label="Cadernos" icon="folder" class="tab-item" />
      <q-tab name="anotacoes" label="Anotações" icon="edit" class="tab-item" /> -->
    </q-tabs>

    <q-tab-panels v-model="tab" animated class="tab-panels">
      <!-- Videos Tab -->
      <q-tab-panel name="videos" class="tab-panel">
        <div v-if="loading" class="loading-container">
          <q-spinner-orbit color="primary" size="lg" />
          <div class="loading-text">Carregando vídeos...</div>
        </div>
        <div v-else-if="videos.length === 0" class="empty-state text-center q-pa-xl">
          <q-icon name="play_circle" size="lg" color="grey-6" />
          <div class="empty-title q-mt-md">Nenhum vídeo disponível</div>
          <div class="empty-subtitle q-mt-sm">Volte mais tarde para novos conteúdos</div>
        </div>
        <div v-else class="video-section">
          <!-- Featured Video -->
          <div class="featured-video q-mb-lg" v-if="videos.length > 0">
            <q-video
              :src="getEmbedUrl(videos[0].url)"
              class="video-player animate__animated animate__fadeIn"
              :ratio="16/9"
            />
            <div class="video-info">
              <h3 class="video-title">{{ videos[0].titulo }}</h3>
              <p class="video-description">{{ videos[0].descricao }}</p>
            </div>
          </div>
          <!-- Video Grid -->
          <div class="video-grid">
            <q-card
              v-for="(video, index) in videos"
              :key="video.id"
              class="video-card animate__animated"
              :class="{ 'animate__fadeInUp': cardVisible[index] }"
              v-intersection="onCardIntersection(index)"
              @click="playVideo(video)"
            >
              <q-img
                :src="getThumbnailUrl(video.url)"
                :ratio="16/9"
                class="video-thumbnail"
                placeholder-src="https://via.placeholder.com/320x180"
              />
              <q-card-section>
                <div class="video-card-title">{{ video.titulo }}</div>
                <div class="video-card-description">{{ video.descricao }}</div>
              </q-card-section>
            </q-card>
          </div>
        </div>
      </q-tab-panel>

      <!-- Módulos Tab -->
      <q-tab-panel name="modulos" class="tab-panel">
        <div v-if="loading" class="loading-container">
          <q-spinner-orbit color="primary" size="lg" />
          <div class="loading-text">Carregando módulos...</div>
        </div>
        <div v-else-if="modulos.length === 0" class="empty-state text-center q-pa-xl">
          <q-icon name="view_module" size="lg" color="grey-6" />
          <div class="empty-title q-mt-md">Nenhum módulo disponível</div>
          <div class="empty-subtitle q-mt-sm">Volte mais tarde para novos conteúdos</div>
        </div>
        <div v-else class="modulos-grid">
          <q-card
            v-for="(modulo, index) in modulos"
            :key="index"
            class="modulo-card animate__animated"
            :class="{ 'animate__fadeInUp': cardVisible[index + videos.length] }"
            v-intersection="onCardIntersection(index + videos.length)"
            @click="goToModulo(modulo.id)"
          >
            <q-card-section class="modulo-header">
              <q-avatar color="secondary" text-color="white" icon="view_module" size="md" />
            </q-card-section>
            <q-card-section>
              <div class="modulo-title">{{ modulo.nome }}</div>
              <div class="modulo-description">{{ modulo.descricao }}</div>
            </q-card-section>
            <q-card-actions>
              <q-btn flat color="primary" label="Explorar" icon-right="chevron_right" />
            </q-card-actions>
          </q-card>
        </div>
      </q-tab-panel>

      <!-- Resumos Tab -->
      <q-tab-panel name="resumos" class="tab-panel">
        <div v-if="loading" class="loading-container">
          <q-spinner-orbit color="primary" size="lg" />
          <div class="loading-text">Carregando resumos...</div>
        </div>
        <div v-else-if="resumos.length === 0" class="empty-state text-center q-pa-xl">
          <q-icon name="description" size="lg" color="grey-6" />
          <div class="empty-title q-mt-md">Nenhum resumo disponível</div>
          <div class="empty-subtitle q-mt-sm">Volte mais tarde para novos conteúdos</div>
        </div>
        <div v-else class="resumos-grid">
          <q-card
            v-for="(resumo, index) in resumos"
            :key="resumo.id"
            class="resumo-card animate__animated"
            :class="{ 'animate__fadeInUp': cardVisible[index + videos.length + modulos.length] }"
            v-intersection="onCardIntersection(index + videos.length + modulos.length)"
            @click="openResumo(resumo.url)"
          >
            <q-card-section class="resumo-header">
              <q-avatar color="secondary" text-color="white" icon="description" size="md" />
            </q-card-section>
            <q-card-section>
              <div class="resumo-title">{{ resumo.titulo }}</div>
              <div class="resumo-description">{{ resumo.descricao }}</div>
            </q-card-section>
            <q-card-actions>
              <q-btn flat color="primary" label="Abrir" icon-right="open_in_new" />
            </q-card-actions>
          </q-card>
        </div>
      </q-tab-panel>

      <!-- Cadernos Tab -->
      <q-tab-panel name="cadernos" class="tab-panel">
        <CadernoCard />
      </q-tab-panel>

      <!-- Anotações Tab -->
      <q-tab-panel name="anotacoes" class="tab-panel">
        <q-input
          filled
          type="textarea"
          v-model="anotacaoTexto"
          label="Suas anotações"
          autogrow
          rows="8"
          class="anotacao-input animate__animated animate__fadeIn"
          bg-color="white"
        />
        <q-btn
          unelevated
          color="primary"
          label="Salvar Anotação"
          icon="save"
          class="anotacao-btn q-mt-md"
          :loading="saving"
          @click="salvarAnotacao"
        />
      </q-tab-panel>
    </q-tab-panels>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { collection, getDocs, query, orderBy, where } from 'firebase/firestore'
import { db } from 'boot/firebase'
import { useQuasar } from 'quasar'
import CadernoCard from 'src/components/CadernoCard.vue'

const $q = useQuasar()
const router = useRouter()
const route = useRoute()

const tab = ref('videos') // Default to videos
const cadeiraId = route.params.id
const cadeira = ref({ nome: 'Carregando...' })
const modulos = ref([])
const temas = ref([])
const videos = ref([])
const resumos = ref([]) // Placeholder, assuming resumos collection
const anotacaoTexto = ref('')
const saving = ref(false)
const loading = ref(false)
const cardVisible = ref([])

async function loadData() {
  loading.value = true
  cardVisible.value = []
  try {
    // Load cadeira
    const cadeiraDoc = await getDocs(query(collection(db, 'cadeiras'), where('id', '==', cadeiraId)))
    if (!cadeiraDoc.empty) {
      cadeira.value = { id: cadeiraDoc.docs[0].id, ...cadeiraDoc.docs[0].data() }
    } else {
      cadeira.value = { nome: 'Cadeira desconhecida' }
      $q.notify({
        type: 'negative',
        message: 'Cadeira não encontrada',
        position: 'top-right'
      })
      return
    }

    // Load modulos
    const modulosQuery = query(collection(db, 'modulos'), where('cadeiraId', '==', cadeiraId), orderBy('nome'))
    const modulosSnapshot = await getDocs(modulosQuery)
    modulos.value = modulosSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))

    // Load temas
    const modulosIds = modulos.value.map(modulo => modulo.id)
    const temasQuery = modulosIds.length
      ? query(collection(db, 'temas'), where('moduloId', 'in', modulosIds), orderBy('nome'))
      : query(collection(db, 'temas'), where('moduloId', '==', 'none'))
    const temasSnapshot = await getDocs(temasQuery)
    temas.value = temasSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))

    // Generate modulo descriptions
    modulos.value = modulos.value.map(modulo => {
      const temasModulo = temas.value
        .filter(tema => tema.moduloId === modulo.id)
        .map(tema => tema.nome)
        .join(', ') || 'Sem temas disponíveis'
      return { ...modulo, descricao: temasModulo }
    })

    // Load videos
    const temasIds = temas.value.map(tema => tema.id)
    const videosQuery = temasIds.length
      ? query(collection(db, 'videoaulas'), where('temaId', 'in', temasIds), orderBy('titulo'))
      : query(collection(db, 'videoaulas'), where('temaId', '==', 'none'))
    const videosSnapshot = await getDocs(videosQuery)
    videos.value = videosSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))

    // Initialize card visibility
    cardVisible.value = new Array(videos.value.length + modulos.value.length + resumos.value.length).fill(false)

    if (modulos.value.length === 0 && videos.value.length === 0) {
      $q.notify({
        message: 'Nenhum conteúdo encontrado para esta cadeira.',
        color: 'warning',
        icon: 'info',
        position: 'top-right'
      })
    }
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Erro ao carregar dados',
      caption: error?.message || '',
      position: 'top-right'
    })
  } finally {
    loading.value = false
  }
}

function getEmbedUrl(url) {
  return url.includes('youtube.com') ? url.replace('watch?v=', 'embed/') : url
}

function getThumbnailUrl(url) {
  if (url.includes('youtube.com')) {
    const videoId = url.split('v=')[1]?.split('&')[0]
    return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
  }
  return 'https://via.placeholder.com/320x180'
}

function onCardIntersection(index) {
  return (entry) => {
    if (entry.isIntersecting && !cardVisible.value[index]) {
      cardVisible.value[index] = true
    }
  }
}

function goToModulo(id) {
  router.push(`/cadeiras/${cadeiraId}/modulos/${id}`)
}

function playVideo(video) {
  const embedUrl = getEmbedUrl(video.url)
  router.push({
    path: '/video-player',
    query: {
      id: video.id,
      titulo: video.titulo,
      descricao: video.descricao,
      url: embedUrl,
      duracao: video.duracao,
    }
  })
}

function openResumo(url) {
  window.open(url, '_blank')
}

async function salvarAnotacao() {
  saving.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate save
    $q.notify({
      message: 'Anotação salva com sucesso!',
      color: 'positive',
      position: 'top-right'
    })
    anotacaoTexto.value = ''
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Erro ao salvar anotação',
      caption: error?.message || '',
      position: 'top-right'
    })
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  await loadData()
})
</script>

<style lang="scss" scoped>
.cadeira-page {
  background: linear-gradient(180deg, #f5f7fa 0%, #ffffff 100%);
  min-height: 100vh;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(circle, rgba(0,0,0,0.03) 2px, transparent 2px);
    background-size: 30px 30px;
    opacity: 0.5;
    z-index: 0;
  }
}

.header-section {
  position: relative;
  padding: 40px 24px;
  background: linear-gradient(135deg, var(--q-primary) 0%, var(--q-secondary) 100%);
  color: #ffffff;
  text-align: center;
  z-index: 1;

  .header-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.3);
    z-index: 1;
  }

  .header-content {
    position: relative;
    z-index: 2;
    max-width: 800px;
    margin: 0 auto;
  }

  .header-title {
    font-size: 2.2rem;
    font-weight: 800;
    margin-bottom: 12px;
    text-shadow: 0 2px 6px rgba(0,0,0,0.2);
    animation-duration: 0.8s;
  }

  .header-subtitle {
    font-size: 1.1rem;
    opacity: 0.9;
    max-width: 600px;
    margin: 0 auto;
    animation-duration: 0.8s;
  }

  .header-wave {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 60px;
    background: url('data:image/svg+xml;utf8,<svg viewBox="0 0 1200 120" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg"><path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113.64,28.06,1200,39.85V0Z" fill="white"/></svg>');
    background-size: cover;
    z-index: 2;
  }
}

.tabs-modern {
  background: #ffffff;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  border-radius: 12px;
  margin: 0 16px;
  overflow: hidden;

  .tab-item {
    font-weight: 500;
    padding: 12px 24px;
    transition: all 0.3s ease;

    &:hover {
      background: rgba(0,0,0,0.05);
    }
  }
}

.tab-panels {
  background: transparent;
  padding: 24px 16px;
}

.tab-panel {
  max-width: 1200px;
  margin: 0 auto;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 0;
  background: rgba(255,255,255,0.9);
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);

  .loading-text {
    margin-top: 16px;
    color: var(--q-dark);
    font-size: 1.1rem;
    font-weight: 500;
  }
}

.empty-state {
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  max-width: 400px;
  margin: 0 auto;
  padding: 32px;

  .empty-title {
    font-size: 1.3rem;
    font-weight: 600;
    color: var(--q-dark);
  }

  .empty-subtitle {
    color: var(--q-grey-7);
    font-size: 0.95rem;
  }
}

.video-section {
  .featured-video {
    max-width: 800px;
    margin: 0 auto 32px;

    .video-player {
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 6px 16px rgba(0,0,0,0.15);
      animation-duration: 0.8s;
    }

    .video-info {
      margin-top: 16px;
      text-align: center;

      .video-title {
        font-size: 1.4rem;
        font-weight: 600;
        color: var(--q-dark);
      }

      .video-description {
        font-size: 0.95rem;
        color: var(--q-grey-8);
        margin-top: 8px;
      }
    }
  }

  .video-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 20px;
  }

  .video-card {
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 6px 16px rgba(0,0,0,0.1);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    animation-duration: 0.6s;

    &:hover {
      transform: translateY(-8px);
      box-shadow: 0 12px 24px rgba(0,0,0,0.15);

      .video-card-title {
        color: var(--q-primary);
      }
    }

    .video-thumbnail {
      transition: transform 0.3s ease;

      &:hover {
        transform: scale(1.05);
      }
    }

    .q-card__section {
      padding: 16px;

      .video-card-title {
        font-size: 1.2rem;
        font-weight: 600;
        color: var(--q-dark);
        transition: color 0.3s ease;
      }

      .video-card-description {
        font-size: 0.9rem;
        color: var(--q-grey-8);
        margin-top: 8px;
      }
    }
  }
}

.modulos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;

  .modulo-card {
    border-radius: 12px;
    box-shadow: 0 6px 16px rgba(0,0,0,0.1);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    animation-duration: 0.6s;

    &:hover {
      transform: translateY(-8px);
      box-shadow: 0 12px 24px rgba(0,0,0,0.15);

      .modulo-title {
        color: var(--q-primary);
      }
    }

    .modulo-header {
      display: flex;
      justify-content: center;
      padding: 16px;
    }

    .q-card__section {
      padding: 0 16px 16px;

      .modulo-title {
        font-size: 1.2rem;
        font-weight: 600;
        color: var(--q-dark);
        transition: color 0.3s ease;
      }

      .modulo-description {
        font-size: 0.9rem;
        color: var(--q-grey-8);
        margin-top: 8px;
      }
    }

    .q-card__actions {
      padding: 12px 16px;
      justify-content: center;

      .q-btn {
        border-radius: 50px;
        padding: 8px 16px;
      }
    }
  }
}

.resumos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;

  .resumo-card {
    border-radius: 12px;
    box-shadow: 0 6px 16px rgba(0,0,0,0.1);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    animation-duration: 0.6s;

    &:hover {
      transform: translateY(-8px);
      box-shadow: 0 12px 24px rgba(0,0,0,0.15);

      .resumo-title {
        color: var(--q-primary);
      }
    }

    .resumo-header {
      display: flex;
      justify-content: center;
      padding: 16px;
    }

    .q-card__section {
      padding: 0 16px 16px;

      .resumo-title {
        font-size: 1.2rem;
        font-weight: 600;
        color: var(--q-dark);
        transition: color 0.3s ease;
      }

      .resumo-description {
        font-size: 0.9rem;
        color: var(--q-grey-8);
        margin-top: 8px;
      }
    }

    .q-card__actions {
      padding: 12px 16px;
      justify-content: center;

      .q-btn {
        border-radius: 50px;
        padding: 8px 16px;
      }
    }
  }
}

.anotacao-input {
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  animation-duration: 0.6s;

  :deep(.q-field__control) {
    border-radius: 12px;
  }
}

.anotacao-btn {
  border-radius: 50px;
  padding: 10px 24px;
  font-weight: 500;
  transition: all 0.3s ease;

  &:hover {
    transform: scale(1.05);
    box-shadow: 0 6px 16px rgba(0,0,0,0.2);
  }
}

@media (max-width: 768px) {
  .header-section {
    padding: 30px 16px;

    .header-title {
      font-size: 1.8rem;
    }

    .header-subtitle {
      font-size: 1rem;
    }
  }

  .video-grid, .modulos-grid, .resumos-grid {
    grid-template-columns: 1fr;
  }

  .tabs-modern {
    margin: 0 8px;

    .tab-item {
      padding: 8px 16px;
    }
  }
}

@media (max-width: 480px) {
  .header-title {
    font-size: 1.5rem;
  }

  .header-subtitle {
    font-size: 0.9rem;
  }

  .video-card, .modulo-card, .resumo-card {
    .video-card-title, .modulo-title, .resumo-title {
      font-size: 1.1rem;
    }

    .video-card-description, .modulo-description, .resumo-description {
      font-size: 0.85rem;
    }
  }
}
</style>
