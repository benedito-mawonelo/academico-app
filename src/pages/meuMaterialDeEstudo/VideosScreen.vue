<template>
  <div class="videos-layout">
    <q-page class="main-content">
      <div class="hero-section">
        <div class="hero-content">
          <h1 class="hero-title">
            <span class="hero-highlight">Vídeos Offline</span>
            <span class="hero-subtitle">Assista a qualquer momento</span>
          </h1>
        </div>
      </div>

      <div class="videos-container">
        <div class="section-header">
          <q-icon name="ondemand_video" color="primary" size="md" class="q-mr-sm" />
          <h2 class="section-title">Seus Vídeos</h2>
        </div>
        <q-list class="videos-list">
          <q-item
            v-for="video in videos"
            :key="video.id"
            clickable
            v-ripple
            @click="goToVideo(video.id)"
            class="video-item"
          >
            <q-item-section avatar>
              <q-img :src="video.thumbnail" class="video-thumbnail" />
            </q-item-section>
            <q-item-section>
              <q-item-label class="video-title">{{ video.title }}</q-item-label>
              <q-item-label caption>{{ video.duration }}</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-btn
                flat
                round
                :icon="video.isFavorite ? 'favorite' : 'favorite_border'"
                color="red"
                @click.stop="toggleFavorite(video.id)"
              />
            </q-item-section>
          </q-item>
        </q-list>
      </div>
    </q-page>

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
      </q-tabs>
    </q-footer>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const activeTab = ref('videos')

const videos = ref([
  { id: 1, title: 'Matemática: Equações Lineares', thumbnail: 'https://placeimg.com/120/80/tech', duration: '15:30', isFavorite: false },
  { id: 2, title: 'Física: Leis de Newton', thumbnail: 'https://placeimg.com/120/80/tech', duration: '22:45', isFavorite: true },
  { id: 3, title: 'Química: Ligações Químicas', thumbnail: 'https://placeimg.com/120/80/tech', duration: '18:20', isFavorite: false },
])

const goTo = (page) => router.push(`/${page}`)
const goToVideo = (id) => router.push(`/video/${id}`)
const toggleFavorite = (id) => {
  const video = videos.value.find(v => v.id === id)
  if (video) video.isFavorite = !video.isFavorite
}
</script>

<style lang="scss" scoped>
.videos-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #f8f9fa;
}

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

.videos-container {
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

.videos-list {
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.video-item {
  padding: 16px;
  transition: transform 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    background: rgba(0, 0, 0, 0.02);
  }

  .video-thumbnail {
    width: 120px;
    height: 80px;
    border-radius: 4px;
  }

  .video-title {
    font-size: 1.1rem;
    font-weight: 600;
  }
}

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

@media (max-width: 600px) {
  .hero-title { font-size: 2rem; }
  .hero-subtitle { font-size: 1.2rem; }
  .section-title { font-size: 1.5rem; }
  .video-thumbnail { width: 100px; height: 60px; }
}
</style>
