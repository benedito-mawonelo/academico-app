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
          <!-- Botão de Notificações com Badge Animado -->
          <div class="notification-wrapper">
            <q-btn
              flat
              round
              icon="notifications"
              color="grey-8"
              class="action-btn pulse-on-notification"
              @click="toggleNotifications"
            >
              <q-badge
                v-if="unreadNotifications.length"
                color="red"
                floating
                rounded
                class="notification-badge"
                :class="{ 'pulse': unreadNotifications.length }"
              >
                {{ unreadNotifications.length }}
              </q-badge>
            </q-btn>

            <q-menu
              v-model="showNotifications"
              anchor="bottom right"
              self="top right"
              class="notification-menu shadow-5"
              transition-show="jump-down"
              transition-hide="jump-up"
            >
              <q-list style="min-width: 350px" class="menu-list">
                <q-item-label header class="text-weight-bold text-primary">
                  <q-icon name="notifications" class="q-mr-sm" />
                  Notificações
                </q-item-label>

                <template v-if="notifications.length > 0">
                  <q-item
                    v-for="(notification, index) in notifications.slice(0, 5)"
                    :key="index"
                    clickable
                    v-ripple
                    class="notification-item"
                    :class="{ 'unread-notification': !notification.read }"
                    @click="handleNotificationClick(notification)"
                  >
                    <q-item-section avatar>
                      <q-icon
                        :name="notification.icon"
                        :color="notification.color"
                        size="24px"
                      />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label class="text-weight-medium">{{ notification.title }}</q-item-label>
                      <q-item-label caption lines="2" class="text-grey-7">{{ notification.message }}</q-item-label>
                    </q-item-section>
                    <q-item-section side top>
                      <q-item-label caption class="text-grey-5">{{ formatTime(notification.time) }}</q-item-label>
                    </q-item-section>
                  </q-item>

                  <q-separator class="q-my-sm" />

                  <q-item
                    clickable
                    v-ripple
                    class="text-accent text-weight-medium"
                    @click="goTo('notificacoes')"
                  >
                    <q-item-section avatar>
                      <q-icon name="list_alt" color="accent" />
                    </q-item-section>
                    <q-item-section>Ver todas as notificações</q-item-section>
                    <q-item-section side>
                      <q-icon name="chevron_right" color="accent" />
                    </q-item-section>
                  </q-item>
                </template>

                <q-item v-else class="text-center q-py-lg">
                  <q-item-section>
                    <q-icon name="notifications_off" size="xl" color="grey-4" class="q-mb-sm" />
                    <q-item-label class="text-grey-6">Nenhuma notificação</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </div>

          <!-- Botão de Perfil no lugar do logout -->
          <q-btn
            flat
            round
            icon="person"
            color="grey-8"
            class="action-btn"
            @click="goTo('profile')"
          />
        </div>
      </div>
    </header>

    <q-page class="main-content">
      <div class="hero-section">
        <div class="hero-content">
          <q-carousel v-model="heroSlide" animated infinite height="180px" arrows navigation class="hero-carousel">
            <q-carousel-slide :name="1" class="hero-slide">
              <div class="slide-content column items-start justify-center">
                <div class="text-overline text-white opacity-7 q-mb-xs">Saudação</div>
                <h1 class="hero-title q-mb-none">
                  <span class="hero-highlight">{{ isFirstLogin ? 'Bem-vindo' : 'Bem-vindo de volta' }}, {{ firstName }}</span>
                </h1>
                <div class="hero-subtitle q-mt-xs">O que vamos aprender hoje?</div>
              </div>
            </q-carousel-slide>
            <q-carousel-slide :name="2" class="hero-slide">
              <div class="slide-content column items-start justify-center">
                <div class="text-overline text-white opacity-7 q-mb-xs">Sugestão</div>
                <div class="text-subtitle1">Continue de onde parou</div>
              </div>
            </q-carousel-slide>
          </q-carousel>
        </div>
      </div>

      <div class="dashboard-container">
        <div class="section-header">
          <q-icon name="dashboard" color="primary" size="md" class="q-mr-sm" />
          <h2 class="section-title">Painel Acadêmico</h2>
        </div>

        <p class="section-description">
          Selecione uma das opções abaixo para começar sua jornada de aprendizagem
        </p>

        <q-list bordered separator class="menu-bars q-mt-sm">
          <q-item v-for="(item, index) in menuItems" :key="index" clickable v-ripple @click="goTo(item.route)" class="menu-bar-item">
            <q-item-section avatar>
              <q-icon :name="item.icon" :color="item.color || 'primary'" />
            </q-item-section>
            <q-item-section>
              <q-item-label class="text-weight-medium">{{ item.label }}</q-item-label>
              <q-item-label caption v-if="item.caption">{{ item.caption }}</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-icon name="chevron_right" color="grey-6" />
            </q-item-section>
          </q-item>
        </q-list>
      </div>
    </q-page>

    
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
// Removido o uso de DashboardCard; usando barras (q-list/q-item)
import { onAuthStateChanged } from 'firebase/auth'
import { collection, onSnapshot, query, where, orderBy, updateDoc, serverTimestamp, doc, getDoc, setDoc } from 'firebase/firestore'
import { firebaseAuth, db } from 'boot/firebase'

const router = useRouter()

const user = ref({
  name: '',
  isPro: true,
  avatar: ''
})
const heroSlide = ref(1)
const isFirstLogin = ref(false)
const firstName = computed(() => (user.value.name || '').split(' ')[0] || 'Estudante')

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

      // Detectar primeiro login por usuário
      try {
        const flagKey = `firstLoginFlag_${authUser.uid}`
        const localFlag = localStorage.getItem(flagKey)
        if (!localFlag) {
          isFirstLogin.value = true
          localStorage.setItem(flagKey, 'seen')
          // opcional: marcar no Firestore
          await setDoc(doc(db, 'users_meta', authUser.uid), { firstLoginSeenAt: serverTimestamp() }, { merge: true })
        } else {
          isFirstLogin.value = false
        }
      } catch (e) {
        console.warn('Não foi possível registrar flag de primeiro login', e)
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

const showNotifications = ref(false)

const notifications = ref([])
let unsubNotifications = null
// Removido logout: função e estado não utilizados

const unreadNotifications = computed(() => {
  return notifications.value.filter(n => !n.read)
})

const menuItems = ref([
  { label: 'Encontrar Explicações em Vídeo', icon: 'ondemand_video', color: 'primary', route: 'cadeiras', caption: 'Explore cadeiras e aulas em vídeo' },
  { label: 'Meu Material de Estudo', icon: 'folder_special', color: 'teal', route: 'meu-material', caption: 'Anotações, dúvidas, favoritos e testes' },
  { label: 'Fórum de Discussão', icon: 'forum', color: 'brown', route: 'forum', caption: 'Converse com a comunidade' },
  { label: 'Dúvidas', icon: 'help', color: 'orange', route: 'doubts', caption: 'Veja e crie dúvidas' }
])

async function toggleNotifications() {
  showNotifications.value = !showNotifications.value
  // Marcar como lidas no Firestore quando abrir
  if (showNotifications.value) {
    const unread = notifications.value.filter(n => !n.read)
    for (const n of unread) {
      try {
        await updateDoc(doc(db, 'notifications', n.id), {
          read: true,
          readAt: serverTimestamp()
        })
      } catch (e) {
        console.error('Erro ao marcar notificação como lida:', e)
      }
    }
  }
}

async function handleNotificationClick(n) {
  try {
    if (!n.read) {
      await updateDoc(doc(db, 'notifications', n.id), { read: true, readAt: serverTimestamp() })
      n.read = true
    }
    if (n.linkPath) {
      router.push({ path: n.linkPath, query: n.linkQuery || {} })
      return
    }
    if (n.videoId) {
      router.push({ path: '/video-player', query: { id: n.videoId } })
      return
    }
  } catch (e) {
    console.error('Erro ao abrir notificação:', e)
  }
}

function formatTime(date) {
  const now = new Date()
  const diff = now - date

  const minutes = Math.floor(diff / (1000 * 60))
  if (minutes < 60) return `${minutes} min atrás`

  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} h atrás`

  const days = Math.floor(hours / 24)
  return `${days} d atrás`
}
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

.hero-section {
  background: linear-gradient(135deg, #2E7D32 0%, #66BB6A 100%);
  color: white;
  padding: 24px 24px 24px;
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
.hero-carousel { background: transparent; }
.hero-slide { display:flex; align-items:center; height:100%; }
.slide-content { width:100%; }
.text-overline { letter-spacing: .08em; text-transform: uppercase; font-size: .75rem; }
.opacity-7 { opacity: .7; }

/* Tipografia refinada do hero */
.hero-title { font-size: 2.2rem; margin: 0; }
.hero-subtitle { font-size: 1.1rem; opacity: .9; }

/* Navegação do carousel mais discreta */
:deep(.q-carousel__navigation .q-btn) { opacity: .85; }
:deep(.q-carousel__arrow) { opacity: .85; }

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

/* Lista de barras do menu */
.menu-bars {
  border-radius: 12px;
  overflow: hidden;
  background: white;
  box-shadow: 0 4px 20px rgba(0,0,0,0.05);
}
.menu-bar-item {
  transition: all 0.2s ease;
  padding: 16px 18px; /* aumento da altura */
  min-height: 68px;
}
.menu-bar-item .q-item__section--avatar .q-icon {
  font-size: 28px; /* ícone maior */
}
.menu-bar-item .q-item__label {
  font-size: 1.05rem; /* texto levemente maior */
}
.menu-bar-item:hover {
  background-color: rgba(25,118,210,0.05);
}

/* Footer Modernizado */
.app-footer {
  background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
  color: white;
  position: relative;
  margin-top: 80px;

  .footer-wave {
    position: absolute;
    top: -60px;
    left: 0;
    width: 100%;
    height: 60px;
    overflow: hidden;

    svg {
      width: 100%;
      height: 100%;
      fill: #f8f9fa;
    }
  }

  .footer-content {
    max-width: 1400px;
    margin: 0 auto;
    padding: 60px 24px 40px;
  }

  .footer-main {
    display: grid;
    grid-template-columns: 1fr 2fr;
    gap: 60px;
    margin-bottom: 40px;

    @media (max-width: 768px) {
      grid-template-columns: 1fr;
      gap: 40px;
    }
  }

  .footer-brand {
    .logo-wrapper {
      display: flex;
      align-items: center;
      margin-bottom: 16px;

      .logo-text {
        font-size: 1.5rem;
        font-weight: 700;
        margin-left: 12px;
      }
    }

    .brand-slogan {
      opacity: 0.8;
      margin-bottom: 24px;
      line-height: 1.6;
    }

    .footer-social {
      display: flex;
      gap: 12px;

      .social-icon {
        transition: all 0.3s ease;

        &:hover {
          color: var(--q-primary) !important;
          transform: translateY(-3px);
        }
      }
    }
  }

  .footer-links {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 40px;

    @media (max-width: 768px) {
      // grid-template-columns: 1fr;
      gap: 30px;
    }

    .link-group {
      .link-title {
        font-size: 1.1rem;
        font-weight: 600;
        margin-bottom: 16px;
        position: relative;
        padding-bottom: 8px;

        &::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 40px;
          height: 2px;
          background-color: var(--q-primary);
        }
      }

      .footer-link {
        display: block;
        color: rgba(255, 255, 255, 0.7);
        margin-bottom: 12px;
        transition: all 0.3s ease;
        text-decoration: none;

        &:hover {
          color: white;
          transform: translateX(5px);
        }
      }
    }
  }

  .footer-bottom {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 30px;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    margin-top: 40px;

    .footer-copyright {
      opacity: 0.7;
      font-size: 0.9rem;
    }

    .footer-apps {
      display: flex;
      gap: 12px;

      .app-icon {
        transition: all 0.3s ease;

        &:hover {
          transform: scale(1.2);
          color: white !important;
        }
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
