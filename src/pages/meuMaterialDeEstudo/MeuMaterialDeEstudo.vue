<template>
  <div class="app-layout">
    <!-- Header igual ao Dashboard -->
    <app-header @navigate="goTo" />

    <!-- Conteúdo Principal -->
    <q-page class="main-content">
      <!-- Apenas menus Vídeos / Favoritos -->
      <div class="menu-tabs">
        <q-tabs
          v-model="activeTab"
          class="tabs-modern text-primary"
          active-color="primary"
          indicator-color="accent"
          align="center"
          dense
        >
          <q-tab name="videos" label="Vídeos" icon="ondemand_video" class="tab-item" />
          <q-tab name="favorites" label="Favoritos" icon="favorite" class="tab-item" />
        </q-tabs>
      </div>

      <div class="study-container">
        <!-- Conteúdo quando a aba "Vídeos" está ativa -->
        <template v-if="activeTab === 'videos'">
          <div class="section-header">
            <q-icon name="ondemand_video" color="primary" size="md" class="q-mr-sm" />
            <h2 class="section-title">Vídeos Baixados</h2>
          </div>
          <q-carousel
            v-if="downloadedVideos.length"
            v-model="videoSlide"
            swipeable
            animated
            control-color="primary"
            navigation
            class="video-carousel"
          >
            <q-carousel-slide
              v-for="(video, index) in downloadedVideos"
              :key="video.id"
              :name="index"
              class="video-slide"
            >
              <div class="video-card" @click="goToDownloadedVideo(video)">
                <q-img :src="video.thumbnail" class="video-thumbnail" />
                <div class="video-info">
                  <div class="video-title">{{ video.titulo }}</div>
                  <div class="text-caption text-grey-7">{{ video.duracao ? video.duracao + ' min' : '' }}</div>
                </div>
              </div>
            </q-carousel-slide>
          </q-carousel>
          <div v-else class="text-center q-pa-lg text-grey-7">
            Nenhum vídeo baixado ainda.
          </div>
        </template>

        <!-- Conteúdo quando a aba "Favoritos" está ativa -->
        <template v-else>
          <div class="section-header">
            <q-icon name="favorite" color="primary" size="md" class="q-mr-sm" />
            <h2 class="section-title">Vídeos Favoritos</h2>
          </div>
          <div class="favorites-grid" v-if="favorites.length">
            <div
              v-for="video in favorites"
              :key="video.id"
              class="video-card"
              @click="goToFavoriteVideo(video)"
            >
              <q-img :src="video.thumbnail" class="video-thumbnail" />
              <div class="video-info">
                <div class="video-title">{{ video.titulo }}</div>
                <q-btn
                  flat
                  round
                  icon="favorite"
                  color="red"
                  @click.stop="removeFavorite(video.id)"
                />
              </div>
            </div>
          </div>
          <div v-else class="text-center q-pa-lg text-grey-7">
            Nenhum vídeo favorito ainda.
          </div>
        </template>
      </div>
    </q-page>

    <!-- Footer compacto igual ao Dashboard -->
    <footer class="app-footer-compact">
      <div class="footer-icons-container">
        <q-btn
          flat
          round
          icon="home"
          color="grey-8"
          size="lg"
          class="footer-icon-btn"
          @click="goTo('dashboard')"
        >
          <q-tooltip>Dashboard</q-tooltip>
        </q-btn>
        <q-btn
          flat
          round
          icon="notifications"
          color="grey-8"
          size="lg"
          class="footer-icon-btn"
          @click="goTo('notificacoes')"
        >
          <q-tooltip>Notificações</q-tooltip>
        </q-btn>
        <q-btn
          flat
          round
          icon="person"
          color="grey-8"
          size="lg"
          class="footer-icon-btn"
          @click="goTo('profile')"
        >
          <q-tooltip>Perfil</q-tooltip>
        </q-btn>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getAuth } from 'firebase/auth'
import { collection, getDocs, query, where, doc, deleteDoc } from 'firebase/firestore'
import { db } from 'boot/firebase'
import AppHeader from 'components/AppHeader.vue'

const router = useRouter()
const activeTab = ref('videos')
const videoSlide = ref(0)

// Vídeos baixados pelo usuário (coleção userDownloadedVideos)
const downloadedVideos = ref([])

// Favoritos reais do usuário (coleção userFavorites)
const favorites = ref([])

// Navegação genérica
const goTo = (page) => router.push(`/${page}`)

// Abrir vídeo baixado
const goToDownloadedVideo = (video) => {
  const embedUrl = getEmbedUrl(video.url)
  router.push({
    path: '/video-player',
    query: {
      id: video.id,
      titulo: video.titulo,
      descricao: video.descricao,
      url: embedUrl,
      duracao: video.duracao,
      temaId: video.temaId,
    },
  })
}

// Helper para extrair ID do YouTube e montar thumbnail/embed
function getVideoId(url) {
  const regExp = /^.*(youtu.be\/_?|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
  const match = url?.match(regExp)
  return match && match[2].length === 11 ? match[2] : ''
}

function getEmbedUrl(url) {
  if (!url) return ''
  if (url.includes('/embed/')) return url
  if (url.includes('watch?v=')) return url.replace('watch?v=', 'embed/')
  const m = url.match(/youtu\.be\/([^?&]+)/)
  if (m && m[1]) return `https://www.youtube.com/embed/${m[1]}`
  return url
}

async function loadFavorites() {
  const auth = getAuth()
  const user = auth.currentUser
  if (!user) return

  const snap = await getDocs(query(collection(db, 'userFavorites'), where('userId', '==', user.uid)))
  favorites.value = snap.docs.map(d => {
    const data = d.data()
    return {
      id: data.videoId,
      ...data,
      thumbnail: `https://img.youtube.com/vi/${getVideoId(data.url)}/mqdefault.jpg`,
    }
  })
}

async function loadDownloadedVideos() {
  const auth = getAuth()
  const user = auth.currentUser
  if (!user) return

  const snap = await getDocs(query(collection(db, 'userDownloadedVideos'), where('userId', '==', user.uid)))
  downloadedVideos.value = snap.docs.map(d => {
    const data = d.data()
    return {
      id: data.videoId,
      ...data,
      thumbnail: `https://img.youtube.com/vi/${getVideoId(data.url)}/mqdefault.jpg`,
    }
  })
}

const goToFavoriteVideo = (video) => {
  const embedUrl = getEmbedUrl(video.url)
  router.push({
    path: '/video-player',
    query: {
      id: video.id,
      titulo: video.titulo,
      descricao: video.descricao,
      url: embedUrl,
      duracao: video.duracao,
      temaId: video.temaId,
    },
  })
}

async function removeFavorite(id) {
  const auth = getAuth()
  const user = auth.currentUser
  if (!user) return
  const ref = doc(db, 'userFavorites', `${user.uid}_${id}`)
  await deleteDoc(ref)
  favorites.value = favorites.value.filter(v => v.id !== id)
}

onMounted(async () => {
  await loadDownloadedVideos()
  await loadFavorites()
})
</script>

<style lang="scss" scoped>
.app-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #f8f9fa;
}

/* Tabs de menu estilo "MÓDULOS" */
.menu-tabs {
  max-width: 1200px;
  margin: 16px auto 0;
  padding: 0 24px;
}

.tabs-modern {
  background: #ffffff;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  border-radius: 12px;
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

/* Hero removido (apenas para limpar estilos antigos) */

/* Study Container */
.study-container {
  padding: 40px 24px;
  max-width: 1200px;
  margin: 0 auto;
}

.section-header {
  display: flex;
  align-items: center;
  margin-bottom: 16px;

  .section-title {
    font-size: 1.8rem;
    font-weight: 700;
    color: #333;
  }
}

/* Vídeos / Favoritos */
.video-carousel {
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 32px;
}

.favorites-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 16px;
}

.video-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: transform 0.3s ease;

  &:hover {
    transform: translateY(-5px);
  }

  .video-thumbnail {
    border-top-left-radius: 8px;
    border-top-right-radius: 8px;
    height: 180px;
  }

  .video-info {
    padding: 16px;
    display: flex;
    justify-content: space-between;
    align-items: center;

    .video-title {
      font-size: 1.1rem;
      font-weight: 600;
      color: #333;
    }
  }
}

/* Notas */
.notes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 16px;
  margin-bottom: 32px;

  .note-card {
    background: white;
    border-radius: 8px;
    padding: 16px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
    cursor: pointer;
    transition: transform 0.3s ease;

    &:hover {
      transform: translateY(-5px);
    }

    .note-title { font-size: 1.1rem; font-weight: 600; margin-bottom: 8px; }
    .note-preview { font-size: 0.9rem; color: #666; }
  }
}

/* Dúvidas */
.doubts-list {
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 32px;
}

/* Testes */
.tests-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 16px;

  .test-card {
    background: white;
    border-radius: 8px;
    padding: 16px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
    cursor: pointer;
    transition: transform 0.3s ease;

    &:hover {
      transform: translateY(-5px);
    }

    .test-title { font-size: 1.1rem; font-weight: 600; }
  }
}

/* Footer compacto igual ao Dashboard */
.app-footer-compact {
  background: white;
  border-top: 1px solid #e0e0e0;
  padding: 12px 0;
  position: sticky;
  bottom: 0;
  z-index: 900;
  box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.08);

  .footer-icons-container {
    display: flex;
    justify-content: space-around;
    align-items: center;
    max-width: 100%;
    padding: 8px 0;

    .footer-icon-btn {
      transition: all 0.3s ease;
      position: relative;
      color: #999 !important;

      &:hover {
        color: var(--q-primary) !important;
        transform: scale(1.1);
      }

      &::after {
        content: '';
        position: absolute;
        bottom: -12px;
        left: 50%;
        transform: translateX(-50%);
        width: 0;
        height: 3px;
        background-color: var(--q-primary);
        border-radius: 3px;
        transition: width 0.3s ease;
      }

      &:hover::after {
        width: 24px;
      }
    }
  }
}

/* Responsividade */
@media (max-width: 600px) {
  .hero-title { font-size: 2rem; }
  .hero-subtitle { font-size: 1.2rem; }
  .section-title { font-size: 1.5rem; }
  .video-thumbnail { height: 140px; }
  .notes-grid, .tests-grid { grid-template-columns: 1fr; }
}
</style>
