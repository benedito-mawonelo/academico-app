<template>
  <div class="app-layout">
    <!-- Header Modernizado -->
    <header class="app-header">
      <div class="header-content">
        <div class="user-profile">
          <q-avatar size="52px" class="profile-avatar glow-on-hover">
            <template v-if="user.avatar">
              <img :src="user.avatar">
            </template>
            <q-icon v-else name="person" color="white" />
          </q-avatar>
          <div class="user-info">
            <div class="user-name">
              <span class="name-text">{{ capitalizeWords(user.name + " " + user.apelido) }}</span>
              <q-icon
                v-if="user.isPro"
                name="verified"
                size="18px"
                color="accent"
                class="q-ml-xs"
              />
              <q-badge
                rounded
                :color="user.isPro ? 'accent' : 'grey-6'"
                class="plan-badge q-ml-xs"
                text-color="white"
              >
                {{ user.isPro ? 'PRO' : 'BÁSICO' }}
              </q-badge>
            </div>
            <div class="user-details">
              <q-chip dense size="sm" color="primary" text-color="white" icon="school" class="q-mr-xs">
                {{ capitalizeWords(user.curso) }}
              </q-chip>
              <q-chip dense size="sm" color="secondary" text-color="white" icon="apartment" class="q-mr-xs">
                {{ user.instituicao?.toUpperCase() }}
              </q-chip>
            </div>
          </div>
        </div>

        <div class="header-actions">
        </div>
      </div>
    </header>

    <!-- Page Content -->
    <q-page class="notificacoes-page">
      <div class="page-content q-pa-lg">
        <!-- Header Section -->
        <div class="notificacoes-header q-mb-lg">
          <h1 class="text-h4 text-weight-bold text-dark">Minhas Notificações</h1>
          <p class="text-subtitle2 text-grey-8">Acompanhe os últimos avisos e lembretes</p>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="loading-container">
          <q-spinner color="primary" size="lg" />
          <div class="loading-text">Carregando notificações...</div>
        </div>

        <!-- Empty State -->
        <div v-else-if="notificacoes.length === 0" class="empty-state text-center q-pa-xl">
          <q-icon name="notifications_none" size="lg" color="grey-6" />
          <div class="empty-title q-mt-md">Nenhuma notificação</div>
          <div class="empty-subtitle q-mt-sm">Você está em dia com as novidades</div>
        </div>

        <!-- Notificações List -->
        <div v-else class="notificacoes-list">
          <q-card
            v-for="notificacao in notificacoes"
            :key="notificacao.id"
            class="notificacao-card q-mb-md"
            :class="{ 'not-read': !notificacao.read }"
          >
            <q-card-section horizontal>
              <q-card-section class="col-12">
                <div class="notificacao-header">
                  <div class="notificacao-title text-weight-bold">{{ notificacao.title }}</div>
                  <div class="notificacao-time text-caption text-grey-7">
                    {{ formatDate(notificacao.createdAt) }}
                  </div>
                </div>
                <div class="notificacao-message q-mt-sm text-grey-9">
                  {{ notificacao.message }}
                </div>
                <div v-if="notificacao.link" class="q-mt-md">
                  <q-btn
                    flat
                    dense
                    color="primary"
                    label="Ver Mais"
                    icon-right="arrow_forward"
                    :to="notificacao.link"
                  />
                </div>
              </q-card-section>
              <q-card-section v-if="!notificacao.read" class="col-auto">
                <q-badge color="primary" rounded />
              </q-card-section>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </q-page>

    <!-- Footer com 3 Ícones -->
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
          <q-badge v-if="unreadNotifications.length" color="red" floating rounded>
            {{ unreadNotifications.length }}
          </q-badge>
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
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { collection, query, where, orderBy, onSnapshot, doc, getDoc } from 'firebase/firestore'
import { db } from 'boot/firebase'
import { onAuthStateChanged } from 'firebase/auth'
import { firebaseAuth } from 'boot/firebase'

const router = useRouter()

const notificacoes = ref([])
const loading = ref(false)
const user = ref({
  name: '',
  apelido: '',
  instituicao: '',
  curso: '',
  avatar: '',
  isPro: false
})

let unsubNotifications = null

const unreadNotifications = computed(() => {
  return notificacoes.value.filter(n => !n.read)
})

function capitalizeWords(text) {
  if (!text) return ''
  return text.replace(/\b\w/g, (char) => char.toUpperCase())
}

function goTo(page) {
  router.push(`/${page}`)
}

function formatDate(date) {
  if (!date) return ''
  const d = date?.toDate ? date.toDate() : new Date(date)
  return d.toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

async function loadUserData(authUser) {
  if (authUser) {
    try {
      const docRef = doc(db, 'users_academico', authUser.uid)
      const docSnap = await getDoc(docRef)
      if (docSnap.exists()) {
        const data = docSnap.data()
        user.value = {
          name: data.name || '',
          apelido: data.apelido || '',
          instituicao: data.instituicao || '',
          curso: data.curso || '',
          avatar: data.image || authUser.photoURL || '',
          isPro: data.isPro || false
        }
      }
    } catch (error) {
      console.error('Erro ao carregar dados do usuário:', error)
    }
  }
}

function subscribeToNotifications(authUser) {
  if (!authUser) return

  loading.value = true
  if (unsubNotifications) unsubNotifications()

  const notificationsQuery = query(
    collection(db, 'notifications'),
    where('userId', '==', authUser.uid),
    orderBy('createdAt', 'desc')
  )

  unsubNotifications = onSnapshot(notificationsQuery, (snapshot) => {
    notificacoes.value = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate ? doc.data().createdAt.toDate() : new Date()
    }))
    loading.value = false
  }, (error) => {
    console.error('Erro ao carregar notificações:', error)
    loading.value = false
  })
}

onMounted(() => {
  onAuthStateChanged(firebaseAuth, async (authUser) => {
    if (authUser) {
      await loadUserData(authUser)
      subscribeToNotifications(authUser)
    } else {
      router.push('/login')
    }
  })
})

onUnmounted(() => {
  if (unsubNotifications) unsubNotifications()
})
</script>

<style lang="scss" scoped>
.app-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.app-header {
  background: linear-gradient(135deg, var(--q-primary) 0%, var(--q-secondary) 100%);
  color: white;
  padding: 16px 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);

  .header-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    max-width: 1400px;
    margin: 0 auto;
  }

  .user-profile {
    display: flex;
    align-items: center;
    gap: 16px;

    .profile-avatar {
      width: 52px;
      height: 52px;
      flex-shrink: 0;
    }

    .user-info {
      display: flex;
      flex-direction: column;

      .user-name {
        display: flex;
        align-items: center;
        gap: 8px;
        font-weight: 600;
        font-size: 1rem;
      }

      .user-details {
        display: flex;
        gap: 8px;
        margin-top: 4px;
      }
    }
  }
}

.notificacoes-page {
  flex: 1;
  background: linear-gradient(180deg, #f5f7fa 0%, #ffffff 100%);
}

.page-content {
  max-width: 900px;
  margin: 0 auto;
}

.notificacoes-header {
  margin-bottom: 32px;

  h1 {
    margin: 0 0 8px 0;
    color: var(--q-dark);
  }

  p {
    margin: 0;
  }
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 16px;
  text-align: center;

  .loading-text {
    margin-top: 16px;
    color: var(--q-dark);
    font-size: 1rem;
  }
}

.empty-state {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  max-width: 400px;
  margin: 0 auto;
  padding: 48px 32px;

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

.notificacoes-list {
  .notificacao-card {
    background: white;
    border-radius: 12px;
    border: 1px solid rgba(0, 0, 0, 0.08);
    transition: all 0.3s ease;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

    &:hover {
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
      transform: translateY(-2px);
    }

    &.not-read {
      border-left: 4px solid var(--q-primary);
      background: rgba(33, 150, 243, 0.02);
    }

    .notificacao-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 16px;
    }

    .notificacao-title {
      font-size: 1.1rem;
      color: var(--q-dark);
    }

    .notificacao-time {
      color: var(--q-grey-7);
      white-space: nowrap;
    }

    .notificacao-message {
      font-size: 0.95rem;
      line-height: 1.6;
      color: var(--q-grey-8);
    }
  }
}

.app-footer-compact {
  background: white;
  border-top: 1px solid rgba(0, 0, 0, 0.08);
  padding: 12px 0;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.05);

  .footer-icons-container {
    display: flex;
    justify-content: center;
    gap: 32px;
    max-width: 1400px;
    margin: 0 auto;
    padding: 0 16px;

    .footer-icon-btn {
      position: relative;
      transition: all 0.3s ease;

      &:hover {
        transform: scale(1.1);
        color: var(--q-primary) !important;
      }
    }
  }
}
</style>
