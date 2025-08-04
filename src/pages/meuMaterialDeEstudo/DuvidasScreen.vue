<template>
  <div class="doubts-layout">
    <q-page class="main-content">
      <div class="hero-section">
        <div class="hero-content">
          <h1 class="hero-title">
            <span class="hero-highlight">Suas Dúvidas</span>
            <span class="hero-subtitle">Acompanhe suas perguntas</span>
          </h1>
        </div>
      </div>

      <div class="doubts-container">
        <div class="section-header">
          <q-icon name="help" color="primary" size="md" class="q-mr-sm" />
          <h2 class="section-title">Histórico de Dúvidas</h2>
          <q-btn round color="primary" icon="add" @click="createDoubt" />
        </div>
        <q-list class="doubts-list" v-if="doubts.length">
          <q-item
            v-for="doubt in doubts"
            :key="doubt.id"
            clickable
            v-ripple
            @click="goToDoubt(doubt.id)"
            class="doubt-item"
          >
            <q-item-section avatar>
              <q-icon name="chat" color="primary" />
            </q-item-section>
            <q-item-section>
              <q-item-label class="doubt-question">{{ doubt.question }}</q-item-label>
              <q-item-label caption>Vídeo: {{ doubt.videoTitle }}</q-item-label>
              <q-item-label caption>{{ formatDate(doubt.date) }}</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-chip
                :color="doubt.resolved ? 'green' : 'orange'"
                text-color="white"
                size="sm"
              >
                {{ doubt.resolved ? 'Resolvida' : 'Pendente' }}
              </q-chip>
            </q-item-section>
          </q-item>
        </q-list>
        <div v-else class="no-doubts">
          <q-icon name="help_outline" size="xl" color="grey-6" class="q-mb-sm" />
          <p>Nenhuma dúvida registrada ainda.</p>
        </div>
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
const activeTab = ref('doubts')

const doubts = ref([
  { id: 1, question: 'Como resolver equações quadráticas?', videoTitle: 'Matemática: Equações', date: new Date('2025-07-30'), resolved: false },
  { id: 2, question: 'O que é energia cinética?', videoTitle: 'Física: Leis de Newton', date: new Date('2025-07-29'), resolved: true },
])

const goTo = (page) => router.push(`/${page}`)
const goToDoubt = (id) => router.push(`/doubt/${id}`)
const createDoubt = () => router.push('/doubt/new')
const formatDate = (date) => date.toLocaleDateString('pt-BR')
</script>

<style lang="scss" scoped>
.doubts-layout {
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

.doubts-container {
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
    flex-grow: 1;
  }
}

.doubts-list {
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.doubt-item {
  padding: 16px;
  transition: transform 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    background: rgba(0, 0, 0, 0.02);
  }

  .doubt-question {
    font-size: 1.1rem;
    font-weight: 600;
  }
}

.no-doubts {
  text-align: center;
  padding: 40px;
  color: #666;
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
}
</style>
