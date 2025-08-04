<template>
  <div class="notes-layout">
    <q-page class="main-content">
      <div class="hero-section">
        <div class="hero-content">
          <h1 class="hero-title">
            <span class="hero-highlight">Suas Notas</span>
            <span class="hero-subtitle">Organize suas ideias</span>
          </h1>
        </div>
      </div>

      <div class="notes-container">
        <div class="section-header">
          <q-icon name="edit_note" color="primary" size="md" class="q-mr-sm" />
          <h2 class="section-title">Notas Pessoais</h2>
          <q-btn round color="primary" icon="add" @click="createNote" />
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
            <div class="note-date">{{ formatDate(note.date) }}</div>
          </div>
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
const activeTab = ref('notes')

const notes = ref([
  { id: 1, title: 'Resumo de Cálculo', content: 'Derivadas e integrais...', date: new Date('2025-07-30') },
  { id: 2, title: 'Fórmulas de Física', content: 'Leis de Newton...', date: new Date('2025-07-29') },
])

const goTo = (page) => router.push(`/${page}`)
const goToNote = (id) => router.push(`/note/${id}`)
const createNote = () => router.push('/note/new')
const formatDate = (date) => date.toLocaleDateString('pt-BR')
</script>

<style lang="scss" scoped>
.notes-layout {
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

.notes-container {
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

.notes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 16px;
}

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

  .note-title {
    font-size: 1.1rem;
    font-weight: 600;
    margin-bottom: 8px;
  }

  .note-preview {
    font-size: 0.9rem;
    color: #666;
    margin-bottom: 8px;
  }

  .note-date {
    font-size: 0.8rem;
    color: #999;
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
  .notes-grid { grid-template-columns: 1fr; }
}
</style>
