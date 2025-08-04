<template>
  <div class="app-layout">
    <!-- Header -->
    <header class="app-header">
      <div class="header-content">
        <div class="logo-wrapper">
          <q-icon name="school" size="lg" color="primary" />
          <span class="logo-text">EstudoPro</span>
        </div>
        <div class="header-actions">
          <q-btn flat round icon="search" color="grey-8" @click="goTo('search')" />
          <q-btn flat round icon="notifications" color="grey-8">
            <q-badge v-if="unreadNotifications" color="red" floating rounded>
              {{ unreadNotifications }}
            </q-badge>
          </q-btn>
        </div>
      </div>
    </header>

    <!-- Conteúdo Principal -->
    <q-page class="main-content">
      <div class="hero-section">
        <div class="hero-content">
          <h1 class="hero-title">
            <span class="hero-highlight">Organize seus estudos</span>
            <span class="hero-subtitle">Acesse vídeos, notas e testes em um só lugar</span>
          </h1>
        </div>
      </div>

      <div class="study-container">
        <!-- Seção de Vídeos -->
        <div class="section-header">
          <q-icon name="ondemand_video" color="primary" size="md" class="q-mr-sm" />
          <h2 class="section-title">Vídeos Offline</h2>
        </div>
        <q-carousel
          v-model="videoSlide"
          swipeable
          animated
          control-color="primary"
          navigation
          class="video-carousel"
        >
          <q-carousel-slide
            v-for="(video, index) in videos"
            :key="index"
            :name="index"
            class="video-slide"
          >
            <div class="video-card" @click="goToVideo(video.id)">
              <q-img :src="video.thumbnail" class="video-thumbnail" />
              <div class="video-info">
                <div class="video-title">{{ video.title }}</div>
                <q-btn
                  flat
                  round
                  :icon="video.isFavorite ? 'favorite' : 'favorite_border'"
                  color="red"
                  @click.stop="toggleFavorite(video.id)"
                />
              </div>
            </div>
          </q-carousel-slide>
        </q-carousel>

        <!-- Seção de Notas -->
        <div class="section-header">
          <q-icon name="edit_note" color="primary" size="md" class="q-mr-sm" />
          <h2 class="section-title">Suas Notas</h2>
        </div>
        <div class="notes-grid">
          <div
            v-for="note in notes"
            :key="note.id"
            class="note-card"
            @click="goToNote(note.id)"
          >
            <div class="note-title">{{ note.title }}</div>
            <div class="note-preview">{{ note.content.slice(0, 50) }}...</div>
          </div>
        </div>

        <!-- Seção de Dúvidas -->
        <div class="section-header">
          <q-icon name="help" color="primary" size="md" class="q-mr-sm" />
          <h2 class="section-title">Suas Dúvidas</h2>
        </div>
        <q-list class="doubts-list">
          <q-item
            v-for="doubt in doubts"
            :key="doubt.id"
            clickable
            v-ripple
            @click="goToDoubt(doubt.id)"
          >
            <q-item-section avatar>
              <q-icon name="chat" color="primary" />
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ doubt.question }}</q-item-label>
              <q-item-label caption>{{ doubt.videoTitle }}</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>

        <!-- Seção de Testes Práticos -->
        <div class="section-header">
          <q-icon name="assignment" color="primary" size="md" class="q-mr-sm" />
          <h2 class="section-title">Testes Práticos</h2>
        </div>
        <div class="tests-grid">
          <div
            v-for="test in tests"
            :key="test.id"
            class="test-card"
            @click="goToTest(test.id)"
          >
            <div class="test-title">{{ test.title }}</div>
            <q-progress
              :percentage="test.progress"
              color="primary"
              height="4px"
              class="q-mt-sm"
            />
          </div>
        </div>
      </div>
    </q-page>

    <!-- Bottom Menu -->
    <q-footer class="bottom-menu">
      <q-tabs
        v-model="activeTab"
        dense
        class="text-grey-8"
        active-color="primary"
        indicator-color="primary"
      >
        <q-tab name="videos" icon="ondemand_video" label="Vídeos" @click="goTo('videos')" />
        <q-tab name="favorites" icon="favorite" label="Favoritos" @click="goTo('favorites')" />
        <q-tab name="notes" icon="edit_note" label="Notas" @click="goTo('notes')" />
        <q-tab name="doubts" icon="help" label="Dúvidas" @click="goTo('doubts')" />
        <q-tab name="tests" icon="assignment" label="Testes" @click="goTo('tests')" />
      </q-tabs>
    </q-footer>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const activeTab = ref('videos')
const videoSlide = ref(0)
const unreadNotifications = ref(3)

// Dados simulados
const videos = ref([
  { id: 1, title: 'Matemática: Equações', thumbnail: 'https://placeimg.com/640/360/tech', isFavorite: false },
  { id: 2, title: 'Física: Movimento', thumbnail: 'https://placeimg.com/640/360/tech', isFavorite: true },
])
const notes = ref([
  { id: 1, title: 'Resumo de Cálculo', content: 'Derivadas e integrais...' },
  { id: 2, title: 'Fórmulas de Física', content: 'Leis de Newton...' },
])
const doubts = ref([
  { id: 1, question: 'Como resolver equações quadráticas?', videoTitle: 'Matemática: Equações' },
  { id: 2, question: 'O que é energia cinética?', videoTitle: 'Física: Movimento' },
])
const tests = ref([
  { id: 1, title: 'Teste de Matemática', progress: 75 },
  { id: 2, title: 'Teste de Física', progress: 20 },
])

// Funções de navegação
const goTo = (page) => router.push(`/${page}`)
const goToVideo = (id) => router.push(`/video/${id}`)
const goToNote = (id) => router.push(`/note/${id}`)
const goToDoubt = (id) => router.push(`/doubt/${id}`)
const goToTest = (id) => router.push(`/test/${id}`)
const toggleFavorite = (id) => {
  const video = videos.value.find(v => v.id === id)
  if (video) video.isFavorite = !video.isFavorite
}
</script>

<style lang="scss" scoped>
.app-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #f8f9fa;
}

/* Header */
.app-header {
  background: white;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  padding: 12px 24px;
  position: sticky;
  top: 0;
  z-index: 1000;

  .header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    max-width: 1400px;
    margin: 0 auto;
  }

  .logo-wrapper {
    display: flex;
    align-items: center;
    gap: 12px;

    .logo-text {
      font-size: 1.5rem;
      font-weight: 700;
      color: #333;
    }
  }

  .header-actions {
    display: flex;
    gap: 12px;
  }
}

/* Hero Section */
.hero-section {
  background: linear-gradient(135deg, #2E7D32 0%, #66BB6A 100%);
  color: white;
  padding: 60px 24px 40px;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiPjxkZWZzPjxwYXR0ZXJuIGlkPSJwYXR0ZXJuIiB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiIHBhdHRlcm5UcmFuc2Zvcm09InJvdGF0ZSg0NSkiPjxyZWN0IHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3QgZmlsbD0idXJsKCNwYXR0ZXJuKSIgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIvPjwvc3ZnPg==');
  }

  .hero-content {
    max-width: 1200px;
    margin: 0 auto;
  }

  .hero-title {
    font-size: 2.5rem;
    font-weight: 700;
    line-height: 1.2;

    .hero-highlight { display: block; }
    .hero-subtitle { font-size: 1.5rem; font-weight: 400; opacity: 0.9; }
  }
}

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

/* Vídeos */
.video-carousel {
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 32px;
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

/* Bottom Menu */
.bottom-menu {
  background: white;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
  position: sticky;
  bottom: 0;
  z-index: 1000;

  .q-tabs {
    justify-content: space-around;
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
