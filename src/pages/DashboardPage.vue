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

    <!-- Conteúdo Principal Modernizado -->
    <q-page class="main-content">
      <q-carousel
        v-model="carouselSlide"
        animated
        swipeable
        infinite
        class="hero-carousel"
        :autoplay="carouselAutoplay"
      >
        <q-carousel-slide name="slide1" class="hero-section">
          <div class="hero-content">
            <h1 class="hero-title">
              <span class="hero-highlight">Benvindo, {{ user.name?.split(' ')[0] || 'Estudante' }}!</span>
              <span class="hero-subtitle">Vamos começar sua jornada de aprendizagem?</span>
            </h1>

            <q-banner inline-actions rounded class="bg-green-10 text-white q-mb-lg">
              <template v-slot:avatar>
                <q-icon name="stars" size="sm" />
              </template>
              Você tem {{ unreadNotifications.length }} notificação{{ unreadNotifications.length !== 1 ? 'es' : '' }} não lida{{ unreadNotifications.length !== 1 ? 's' : '' }}
              <template v-slot:action>
                <q-btn flat color="white" label="Ver" @click="goTo('notificacoes')" />
              </template>
            </q-banner>
          </div>
        </q-carousel-slide>

        <q-carousel-slide name="slide2" class="hero-section">
          <div class="hero-content">
            <h1 class="hero-title">
              <span class="hero-highlight">Bem vindo de volta, {{ user.name?.split(' ')[0] || 'Estudante' }}!</span>
              <span class="hero-subtitle">Pronto para continuar aprendendo?</span>
            </h1>

            <q-banner inline-actions rounded class="bg-blue-10 text-white q-mb-lg">
              <template v-slot:avatar>
                <q-icon name="trending_up" size="sm" />
              </template>
              Continue sua jornada de aprendizado e alcance novos objetivos!
              <template v-slot:action>
                <q-btn flat color="white" label="Ver progresso" @click="goTo('profile')" />
              </template>
            </q-banner>
          </div>
        </q-carousel-slide>
      </q-carousel>

      <div class="dashboard-container">
        <div class="section-header">
          <q-icon name="dashboard" color="primary" size="md" class="q-mr-sm" />
          <h2 class="section-title">Painel Acadêmico</h2>
        </div>

        <p class="section-description">
          Selecione uma das opções abaixo para começar sua jornada de aprendizagem
        </p>

        <div class="nav-bars-container">
          <div
            v-for="(card, index) in cards"
            :key="index"
            class="nav-bar"
            :class="`nav-bar-${index}`"
            @click="goTo(card.route)"
          >
            <div class="nav-bar-icon">
              <q-icon :name="card.icon" size="lg" />
            </div>
            <div class="nav-bar-content">
              <h3 class="nav-bar-title">{{ card.label }}</h3>
              <p class="nav-bar-description">Acesse agora</p>
            </div>
            <div class="nav-bar-arrow">
              <q-icon name="arrow_forward" size="md" />
            </div>
          </div>
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
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { onAuthStateChanged } from 'firebase/auth'
import { collection, onSnapshot, query, where, orderBy, doc, getDoc } from 'firebase/firestore'
import { firebaseAuth, db } from 'boot/firebase'

const router = useRouter()

const user = ref({
  name: '',
  isPro: true,
  avatar: ''
})

const carouselSlide = ref('slide1')
const carouselAutoplay = ref(5000) // 5 segundos

onMounted(() => {
  onAuthStateChanged(firebaseAuth, async (authUser) => {
    if (authUser) {
      const docRef = doc(db, 'users_academico', authUser.uid)
      const docSnap = await getDoc(docRef)

      if (docSnap.exists()) {
        const data = docSnap.data()
        user.value = {
          name: data.name || '',
          apelido: data.apelido || '',
          instituicao: data.instituicao || '',
          curso: data.curso || '',
          avatar: data.image || '',
          provincia: data.provincia || '',
          telefone: data.telefone || '',
          email: data.email || '',
          isLoaded: true
        }
      } else {
        console.error('Documento do usuário não encontrado.')
      }

      // Subscrever notificações em tempo real
      if (unsubNotifications) unsubNotifications()
      const qn = query(
        collection(db, 'notifications'),
        where('userId', '==', authUser.uid),
        orderBy('createdAt', 'desc')
      )
      unsubNotifications = onSnapshot(qn, (snap) => {
        notifications.value = snap.docs.map(d => ({
          id: d.id,
          ...d.data(),
          time: d.data().createdAt?.toDate ? d.data().createdAt.toDate() : new Date(),
          read: !!d.data().read
        }))
      })
    } else {
      notifications.value = []
      if (unsubNotifications) unsubNotifications()
      unsubNotifications = null
    }
  })
})

const goTo = (page) => {
  router.push(`/${page}`)
}

function capitalizeWords(text) {
  if (!text) return ''
  return text.replace(/\b\w/g, (char) => char.toUpperCase())
}

const notifications = ref([])
let unsubNotifications = null

const unreadNotifications = computed(() => {
  return notifications.value.filter(n => !n.read)
})

const cards = ref([
  {
    label: 'Explorar Vídeos',
    icon: 'ondemand_video',
    color: 'primary',
    gradient: 'linear-gradient(135deg, #1976D2 0%, #2196F3 100%)',
    route: 'cadeiras'
  },
  {
    label: 'Vídeos Baixados/Favoritos',
    icon: 'folder_special',
    color: 'cyan',
    gradient: 'linear-gradient(135deg, #00BCD4 0%, #4DD0E1 100%)',
    route: 'meu-material'
  },
  {
    label: 'Aulas de Dúvidas Online',
    icon: 'forum',
    color: 'brown',
    gradient: 'linear-gradient(135deg, #795548 0%, #A1887F 100%)',
    route: 'forum'
  },
  {
    label: 'Dúvidas',
    icon: 'help',
    color: 'orange',
    gradient: 'linear-gradient(135deg, #FF9800 0%, #FFC107 100%)',
    route: 'doubts'
  }
])

</script>

<style lang="scss" scoped>
.app-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #f8f9fa;
}

/* Header Modernizado */
.app-header {
  background: white;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  padding: 12px 24px;
  position: sticky;
  top: 0;
  z-index: 1000;
  transition: all 0.3s ease;

  .header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    max-width: 1400px;
    margin: 0 auto;
    width: 100%;
  }

  .user-profile {
    display: flex;
    align-items: center;
    gap: 16px;
    cursor: pointer;
    transition: transform 0.2s ease;

    &:hover {
      transform: translateX(5px);

      .profile-avatar {
        transform: scale(1.05);
        box-shadow: 0 0 0 3px rgba(25, 118, 210, 0.2);
      }
    }

    .profile-avatar {
      transition: all 0.3s ease;
      border: 2px solid white;
      box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);

      img {
        object-fit: cover;
      }
    }

    .user-info {
      .user-name {
        font-weight: 700;
        font-size: 1.1rem;
        display: flex;
        align-items: center;
        color: #333;

        .name-text {
          margin-right: 6px;
        }
      }

      .user-details {
        margin-top: 4px;
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 8px;
      }
    }
  }

  .header-actions {
    display: flex;
    gap: 12px;

    .action-btn {
      transition: all 0.3s ease;
      position: relative;

      &:hover {
        transform: translateY(-2px);
        color: var(--q-primary) !important;
      }
    }

    .notification-wrapper {
      position: relative;
    }

    .notification-badge {
      font-size: 0.6rem;
      padding: 2px 6px;
      min-width: 18px;
      min-height: 18px;
      top: 5px;
      right: 5px;
      transition: all 0.3s ease;

      &.pulse {
        animation: pulse 1.5s infinite;
      }
    }
  }
}

/* Efeitos e Animações */
.glow-on-hover:hover {
  filter: drop-shadow(0 0 8px rgba(25, 118, 210, 0.4));
}

.pulse-on-notification {
  position: relative;

  &:hover::after {
    content: '';
    position: absolute;
    top: -5px;
    left: -5px;
    right: -5px;
    bottom: -5px;
    border-radius: 50%;
    background-color: rgba(255, 0, 0, 0.1);
    animation: pulse 1.5s infinite;
    z-index: -1;
  }
}

@keyframes pulse {
  0% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(255, 0, 0, 0.7);
  }
  70% {
    transform: scale(1);
    box-shadow: 0 0 0 10px rgba(255, 0, 0, 0);
  }
  100% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(255, 0, 0, 0);
  }
}

/* Menus Modernizados */
.notification-menu,
.menu-dropdown {
  border-radius: 12px !important;
  overflow: hidden;
  border: none;

  .menu-list {
    padding: 8px 0;
  }

  .q-item-label.header {
    padding: 12px 16px;
    font-size: 1rem;
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  }

  .notification-item,
  .menu-item {
    transition: all 0.2s ease;
    padding: 12px 16px;

    &:hover {
      background-color: rgba(25, 118, 210, 0.05) !important;
      transform: translateX(3px);
    }
  }

  .unread-notification {
    background-color: rgba(25, 118, 210, 0.03);
    border-left: 3px solid var(--q-primary);
  }
}

/* Conteúdo Principal Modernizado */
.main-content {
  flex: 1;
  padding: 0;
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
}

/* Carousel */
.hero-carousel {
  :deep(.q-carousel__slide) {
    padding: 0;
  }
}

.hero-section {
  // background: linear-gradient(135deg, #1976D2 0%, #2196F3 100%);
  background: linear-gradient(135deg, #2E7D32 0%, #66BB6A 100%);
  color: white;
  padding: 60px 24px 40px;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiPjxkZWZzPjxwYXR0ZXJuIGlkPSJwYXR0ZXJuIiB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiIHBhdHRlcm5UcmFuc2Zvcm09InJvdGF0ZSg0NSkiPjxyZWN0IHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3QgZmlsbD0idXJsKCNwYXR0ZXJuKSIgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIvPjwvc3ZnPg==');
  }
}

.hero-content {
  position: relative;
  z-index: 1;
  max-width: 1200px;
  margin: 0 auto;
  text-align: left;
}

.hero-title {
  font-size: 2.5rem;
  font-weight: 700;
  line-height: 1.2;
  margin-bottom: 24px;

  .hero-highlight {
    display: block;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .hero-subtitle {
    display: block;
    font-size: 1.5rem;
    font-weight: 400;
    opacity: 0.9;
    margin-top: 8px;
  }
}

.dashboard-container {
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
    margin: 0;
  }
}

.section-description {
  font-size: 1.1rem;
  color: #666;
  margin-bottom: 32px;
  max-width: 800px;
}

.nav-bars-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 24px;
}

.nav-bar {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 20px 24px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  border-left: 4px solid transparent;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,0.1));
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  &:hover {
    transform: translateX(8px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);

    .nav-bar-icon {
      transform: scale(1.1);
    }

    .nav-bar-arrow {
      transform: translateX(4px);
    }

    &::before {
      opacity: 1;
    }
  }

  .nav-bar-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 56px;
    height: 56px;
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.2);
    transition: all 0.3s ease;
    flex-shrink: 0;
  }

  .nav-bar-content {
    flex: 1;

    .nav-bar-title {
      font-size: 1.1rem;
      font-weight: 600;
      color: #333;
      margin: 0 0 4px 0;
      transition: color 0.3s ease;
    }

    .nav-bar-description {
      font-size: 0.9rem;
      color: #999;
      margin: 0;
      transition: color 0.3s ease;
    }
  }

  .nav-bar-arrow {
    display: flex;
    align-items: center;
    justify-content: center;
    color: #ccc;
    transition: all 0.3s ease;
  }

  // Cores para cada barra
  &.nav-bar-0 {
    border-left-color: #1976d2;

    .nav-bar-icon {
      background: linear-gradient(135deg, rgba(25, 118, 210, 0.1) 0%, rgba(33, 150, 243, 0.1) 100%);
      color: #1976d2;
    }
  }

  &.nav-bar-1 {
    border-left-color: #00bcd4;

    .nav-bar-icon {
      background: linear-gradient(135deg, rgba(0, 188, 212, 0.1) 0%, rgba(77, 208, 225, 0.1) 100%);
      color: #00bcd4;
    }
  }

  &.nav-bar-2 {
    border-left-color: #795548;

    .nav-bar-icon {
      background: linear-gradient(135deg, rgba(121, 85, 72, 0.1) 0%, rgba(161, 136, 127, 0.1) 100%);
      color: #795548;
    }
  }

  &.nav-bar-3 {
    border-left-color: #ff9800;

    .nav-bar-icon {
      background: linear-gradient(135deg, rgba(255, 152, 0, 0.1) 0%, rgba(255, 193, 7, 0.1) 100%);
      color: #ff9800;
    }
  }

  &:hover .nav-bar-arrow {
    color: var(--q-primary);
  }
}

@media (max-width: 600px) {
  .nav-bar {
    padding: 16px 16px;
    gap: 12px;

    .nav-bar-icon {
      width: 48px;
      height: 48px;
    }

    .nav-bar-content {
      .nav-bar-title {
        font-size: 1rem;
      }

      .nav-bar-description {
        font-size: 0.85rem;
      }
    }
  }
}

/* Footer Compacto com 3 Ícones */
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
  .app-footer-compact {
    .footer-icons-container {
      padding: 4px 0;

      .footer-icon-btn {
        padding: 12px 8px;
      }
    }
  }
}

/* Transições e Efeitos */
.q-item {
  transition: all 0.3s ease;
}

.q-btn {
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

/* Responsividade */
@media (max-width: 600px) {
  .hero-title {
    font-size: 2rem;

    .hero-subtitle {
      font-size: 1.2rem;
    }
  }

  .section-title {
    font-size: 1.5rem;
  }

  .app-header {
    padding: 12px 16px;

    .user-name {
      font-size: 1rem !important;
    }
  }
}
</style>
