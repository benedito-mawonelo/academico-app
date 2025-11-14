<template>
  <div class="doubts-layout">
    <!-- Header igual ao Dashboard -->
    <app-header @navigate="goTo" />

    <!-- Conteúdo principal -->
    <q-page class="main-content">
      <!-- Tabs Dúvidas / Testes -->
      <div class="menu-tabs">
        <q-tabs
          v-model="activeTab"
          class="tabs-modern text-primary"
          active-color="primary"
          indicator-color="accent"
          align="center"
          dense
        >
          <q-tab name="doubts" label="Dúvidas" icon="help" class="tab-item" @click="goTo('doubts')" />
          <q-tab name="tests" label="Testes" icon="assignment" class="tab-item" @click="goTo('tests')" />
        </q-tabs>
      </div>

      <div class="doubts-container">
        <div class="section-header">
          <q-icon name="help" color="primary" size="md" class="q-mr-sm" />
          <h2 class="section-title">Histórico de Dúvidas</h2>
        </div>
        <q-list class="doubts-list" v-if="doubts.length">
          <q-item
            v-for="doubt in doubts"
            :key="doubt.id"
            clickable
            v-ripple
            @click="goToVideoFromDoubt(doubt)"
            class="doubt-item"
          >
            <q-item-section avatar>
              <q-icon name="chat" color="primary" />
            </q-item-section>
            <q-item-section>
              <q-item-label class="doubt-question">{{ doubt.texto }}</q-item-label>
              <q-item-label caption>Vídeo: {{ videoTitles[doubt.videoId] || 'Vídeo' }}</q-item-label>
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
import { collection, getDocs, query, where, orderBy, doc, getDoc } from 'firebase/firestore'
import { db } from 'boot/firebase'
import AppHeader from 'components/AppHeader.vue'

const router = useRouter()
const activeTab = ref('doubts')
const doubts = ref([])
const videoTitles = ref({})

const goTo = (page) => router.push(`/${page}`)
const formatDate = (date) => (date instanceof Date ? date.toLocaleDateString('pt-BR') : '')

async function loadDoubts() {
  const auth = getAuth()
  const user = auth.currentUser
  if (!user) return
  // Carrega dúvidas do usuário atual
  const q = query(collection(db, 'duvidas'), where('userId', '==', user.uid), orderBy('createdAt', 'desc'))
  const snap = await getDocs(q)
  const items = snap.docs.map(d => {
    const data = d.data()
    const date = data.createdAt?.toDate ? data.createdAt.toDate() : new Date()
    const resolvedComputed = !!(data.resolved || (Array.isArray(data.respostas) && data.respostas.length > 0))
    return { id: d.id, ...data, date, resolved: resolvedComputed }
  })
  doubts.value = items
  // Carrega títulos dos vídeos relacionados (em batches de 10)
  const ids = [...new Set(items.map(i => i.videoId).filter(Boolean))]
  const chunk = (arr, size) => arr.reduce((acc, _, i) => (i % size ? acc : [...acc, arr.slice(i, i + size)]), [])
  const batches = chunk(ids, 10)
  const map = {}
  for (const batch of batches) {
    // Firestore não permite 'in' com doc id direto sem campo; buscar individualmente por simplicidade
    for (const vid of batch) {
      const vref = doc(collection(db, 'videoaulas'), vid)
      const vsnap = await getDoc(vref)
      if (vsnap.exists()) {
        map[vid] = vsnap.data().titulo || 'Vídeo'
      }
    }
  }
  videoTitles.value = map
}

function goToVideoFromDoubt(d) {
  // Navega para o player do vídeo da dúvida
  router.push({ path: '/video-player', query: { id: d.videoId } })
}

onMounted(async () => {
  await loadDoubts()
})
</script>

<style lang="scss" scoped>
.doubts-layout {
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

@media (max-width: 600px) {
  .hero-title { font-size: 2rem; }
  .hero-subtitle { font-size: 1.2rem; }
  .section-title { font-size: 1.5rem; }
}
</style>
