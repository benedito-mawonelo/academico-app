<template>
  <q-page class="cadeiras-page">
    <!-- Hero Section -->
    <div class="hero-section">
      <div class="hero-overlay"></div>
      <div class="hero-content">
        <h1 class="hero-title animate__animated animate__fadeInDown">Descubra Suas Cadeiras</h1>
        <p class="hero-subtitle animate__animated animate__fadeIn animate__delay-1s">
          Explore disciplinas, acesse materiais e eleve sua aprendizagem
        </p>
        <q-btn
          unelevated
          color="accent"
          label="Como Funciona?"
          icon="help_outline"
          class="hero-button animate__animated animate__fadeInUp animate__delay-1s"
          @click="showTutorial"
        />
      </div>
      <!-- <div class="hero-wave"></div> -->
    </div>

    <!-- Main Content -->
    <div class="page-content q-pa-lg">
      <!-- Search and Filter -->
      <div class="search-filter-container q-mb-lg animate__animated animate__fadeIn">
        <q-input
          v-model="searchTerm"
          outlined
          dense
          placeholder="Pesquisar cadeiras..."
          class="search-input"
          bg-color="white"
          rounded
        >
          <template v-slot:prepend>
            <q-icon name="search" color="primary" />
          </template>
        </q-input>

        <q-select
          v-model="filterSemester"
          outlined
          dense
          options-dense
          :options="semesterOptions"
          label="Filtrar por semestre"
          class="filter-select"
          bg-color="white"
          rounded
          clearable
        />
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="loading-container">
        <q-spinner-orbit color="primary" size="xl" />
        <div class="loading-text">Carregando disciplinas...</div>
      </div>

      <!-- Empty State -->
      <div v-else-if="filteredCadeiras.length === 0" class="empty-state text-center q-pa-xl">
        <q-icon name="folder_off" size="lg" color="grey-6" />
        <div class="empty-title q-mt-md">Nenhuma disciplina encontrada</div>
        <div class="empty-subtitle q-mt-sm">Ajuste os filtros ou tente outra busca</div>
        <q-btn
          unelevated
          color="primary"
          label="Recarregar"
          icon="refresh"
          class="q-mt-md"
          @click="loadData"
        />
      </div>

      <!-- Cadeiras Grid -->
      <div v-else class="cadeiras-grid">
        <q-card
          v-for="(cadeira, index) in filteredCadeiras"
          :key="index"
          class="cadeira-card"
          :class="{ 'animate__animated animate__fadeInUp': true }"
          v-intersection="onCardIntersection(index)"
          @click="goToCadeira(cadeira.id)"
        >
          <q-card-section class="card-header">
            <div class="card-icon">
              <q-avatar
                :color="getRandomColor(index)"
                text-color="white"
                size="md"
                :icon="getRandomIcon(index)"
              />
            </div>
            <div class="card-badge" v-if="cadeira.isNew">
              <q-badge color="accent" rounded>NOVO</q-badge>
            </div>
          </q-card-section>

          <q-card-section class="card-body">
            <h3 class="card-title">{{ cadeira.nome }}</h3>
            <div class="card-description">{{ cadeira.descricao || 'Sem descrição disponível' }}</div>

            <div class="card-modules" v-if="cadeira.modulos && cadeira.modulos.length">
              <q-chip
                v-for="(modulo, modIndex) in cadeira.modulos.slice(0, 3)"
                :key="modIndex"
                dense
                size="sm"
                :color="getRandomColor(modIndex + 10)"
                text-color="white"
                class="module-chip"
              >
                {{ modulo.nome }}
              </q-chip>
              <q-chip
                v-if="cadeira.modulos.length > 3"
                dense
                size="sm"
                color="grey-4"
                text-color="grey-8"
              >
                +{{ cadeira.modulos.length - 3 }} mais
              </q-chip>
            </div>
          </q-card-section>

          <q-card-actions class="card-actions">
            <q-btn
              flat
              color="primary"
              label="Acessar"
              icon-right="arrow_forward"
              class="full-width"
            />
          </q-card-actions>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { collection, getDocs, query, orderBy } from 'firebase/firestore'
import { db } from 'boot/firebase'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const router = useRouter()
const cadeiras = ref([])
const modulos = ref([])
const loading = ref(false)
const searchTerm = ref('')
const filterSemester = ref(null)
const cardVisible = ref([])

const semesterOptions = [
  { label: '1º Semestre', value: 1 },
  { label: '2º Semestre', value: 2 },
  { label: '3º Semestre', value: 3 },
  { label: '4º Semestre', value: 4 },
  { label: '5º Semestre', value: 5 },
  { label: '6º Semestre', value: 6 }
]

const iconOptions = [
  'school', 'psychology', 'calculate', 'biotech', 'code', 'history_edu',
  'science', 'language', 'architecture', 'memory', 'public', 'insights'
]

const colorOptions = [
  'primary', 'secondary', 'accent', 'positive', 'negative', 'info', 'warning',
  'teal-8', 'indigo-7', 'purple-6', 'orange-7', 'pink-6'
]

// Computed
const filteredCadeiras = computed(() => {
  let result = cadeiras.value

  if (searchTerm.value) {
    const term = searchTerm.value.toLowerCase()
    result = result.filter(c =>
      c.nome.toLowerCase().includes(term) ||
      (c.descricao && c.descricao.toLowerCase().includes(term)))
  }

  if (filterSemester.value) {
    result = result.filter(c => c.semestre === filterSemester.value.value)
  }

  return result
})

// Methods
function getRandomColor(index) {
  return colorOptions[index % colorOptions.length]
}

function getRandomIcon(index) {
  return iconOptions[index % iconOptions.length]
}

function showTutorial() {
  $q.dialog({
    title: 'Navegue pelas Disciplinas',
    message: 'Escolha uma disciplina para acessar módulos, vídeos e materiais exclusivos. Use a busca ou filtros para encontrar o que precisa!',
    ok: {
      label: 'Entendi',
      color: 'primary',
      unelevated: true
    },
    class: 'dialog-modern'
  })
}

function onCardIntersection(index) {
  return (entry) => {
    if (entry.isIntersecting && !cardVisible.value[index]) {
      cardVisible.value[index] = true
    }
  }
}

async function loadData() {
  loading.value = true
  cardVisible.value = []
  try {
    const cadeirasQuery = query(collection(db, 'cadeiras'), orderBy('nome'))
    const cadeirasSnapshot = await getDocs(cadeirasQuery)
    cadeiras.value = cadeirasSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      isNew: Math.random() > 0.7
    }))

    const modulosQuery = query(collection(db, 'modulos'), orderBy('nome'))
    const modulosSnapshot = await getDocs(modulosQuery)
    modulos.value = modulosSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))

    cadeiras.value = cadeiras.value.map(cadeira => {
      const modulosCadeira = modulos.value.filter(modulo => modulo.cadeiraId === cadeira.id)
      return {
        ...cadeira,
        modulos: modulosCadeira,
        descricao: modulosCadeira.slice(0, 3).map(m => m.nome).join(', ') || 'Sem módulos disponíveis'
      }
    })

    cardVisible.value = new Array(cadeiras.value.length).fill(false)

    if (cadeiras.value.length === 0) {
      $q.notify({
        message: 'Nenhuma disciplina encontrada.',
        color: 'warning',
        icon: 'info',
        position: 'top-right'
      })
    }
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Erro ao carregar disciplinas',
      caption: error?.message || '',
      position: 'top-right'
    })
  } finally {
    loading.value = false
  }
}

function goToCadeira(id) {
  router.push(`/cadeiras/${id}`)
}

onMounted(async () => {
  await loadData()
})
</script>

<style lang="scss" scoped>
.cadeiras-page {
  background: linear-gradient(180deg, #f0f4f8 0%, #ffffff 100%);
  min-height: 100vh;
  position: relative;
  overflow: hidden;

  // Subtle background texture
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

.hero-section {
  position: relative;
  padding: 40px 24px;
  background: linear-gradient(135deg, var(--q-primary) 0%, var(--q-secondary) 100%);
  color: #ffffff;
  text-align: center;
  z-index: 1;

  .hero-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.3);
    z-index: 1;
  }

  .hero-content {
    position: relative;
    z-index: 2;
    max-width: 800px;
    margin: 0 auto;
  }

  .hero-title {
    font-size: 2.2rem;
    font-weight: 800;
    margin-bottom: 12px;
    text-shadow: 0 2px 6px rgba(0,0,0,0.2);
    animation-duration: 0.8s;
  }

  .hero-subtitle {
    font-size: 1.1rem;
    opacity: 0.9;
    max-width: 600px;
    margin: 0 auto 20px;
    animation-duration: 0.8s;
  }

  .hero-button {
    padding: 10px 28px;
    border-radius: 50px;
    font-weight: 600;
    transition: all 0.3s ease;
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    animation-duration: 0.8s;

    &:hover {
      transform: scale(1.05);
      box-shadow: 0 6px 16px rgba(0,0,0,0.3);
    }
  }

  .hero-wave {
    position: relative;
    bottom: 0;
    left: 0;
    right: 0;
    height: 60px;
    background: url('data:image/svg+xml;utf8,<svg viewBox="0 0 1200 120" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg"><path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113.64,28.06,1200,39.85V0Z" fill="white"/></svg>');
    background-size: cover;
    z-index: 2;
  }
}

.page-content {
  max-width: 1200px;
  margin: 0 auto;
  position: relative;
  z-index: 2;
}

.search-filter-container {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 16px;
  align-items: center;
  margin-bottom: 24px;
  animation-duration: 0.6s;

  .search-input {
    border-radius: 50px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    transition: all 0.3s ease;

    &:hover {
      box-shadow: 0 6px 16px rgba(0,0,0,0.15);
    }
  }

  .filter-select {
    border-radius: 50px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    transition: all 0.3s ease;

    &:hover {
      box-shadow: 0 6px 16px rgba(0,0,0,0.15);
    }
  }
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

  .q-btn {
    border-radius: 50px;
    padding: 8px 24px;
  }
}

.cadeiras-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 16px;
}

.cadeira-card {
  border-radius: 16px;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: #ffffff;
  box-shadow: 0 6px 16px rgba(0,0,0,0.1);
  position: relative;
  animation-duration: 0.6s;

  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 12px 24px rgba(0,0,0,0.15);

    .card-title {
      color: var(--q-primary);
    }

    .card-icon .q-avatar {
      transform: scale(1.1);
    }
  }

  .card-header {
    padding: 24px 24px 16px;
    position: relative;

    .card-icon {
      display: flex;
      justify-content: center;

      .q-avatar {
        transition: transform 0.3s ease;
      }
    }

    .card-badge {
      position: absolute;
      top: 16px;
      right: 16px;
      transform: scale(0.9);
    }
  }

  .card-body {
    padding: 0 24px 16px;

    .card-title {
      font-size: 1.3rem;
      font-weight: 600;
      margin-bottom: 8px;
      color: var(--q-dark);
      transition: color 0.3s ease;
    }

    .card-description {
      color: var(--q-grey-8);
      font-size: 0.95rem;
      line-height: 1.5;
      margin-bottom: 12px;
    }

    .card-modules {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-bottom: 12px;

      .module-chip {
        border-radius: 12px;
        font-size: 0.8rem;
        padding: 4px 12px;
        transition: transform 0.3s ease;

        &:hover {
          transform: scale(1.05);
        }
      }
    }
  }

  .card-actions {
    padding: 12px 24px;
    border-top: 1px solid rgba(0,0,0,0.05);
    justify-content: center;

    .q-btn {
      border-radius: 50px;
      padding: 8px 16px;
      font-weight: 500;
      transition: all 0.3s ease;

      &:hover {
        background: var(--q-primary);
        color: #ffffff;
      }
    }
  }
}

@media (max-width: 768px) {
  .hero-section {
    padding: 30px 16px;

    .hero-title {
      font-size: 1.8rem;
    }

    .hero-subtitle {
      font-size: 1rem;
    }
  }

  .search-filter-container {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .cadeiras-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .hero-title {
    font-size: 1.5rem;
  }

  .hero-subtitle {
    font-size: 0.9rem;
  }

  .cadeira-card {
    .card-title {
      font-size: 1.2rem;
    }

    .card-description {
      font-size: 0.9rem;
    }
  }
}
</style>
