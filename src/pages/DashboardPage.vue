<template>
  <div class="app-layout">
    <!-- Header Modernizado -->
    <header class="app-header">
      <div class="header-content">
        <div class="user-profile" @click="goTo('profile')">
          <q-avatar size="52px" class="profile-avatar glow-on-hover">
            <img :src="user.avatar || 'https://randomuser.me/api/portraits/men/47.jpg'">
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

          <!-- Botão de Menu com Ícone Animado -->
          <q-btn
            flat
            round
            :icon="showMenu ? 'close' : 'menu'"
            color="grey-8"
            class="action-btn"
            @click="toggleMenu"
          >
            <q-menu
              v-model="showMenu"
              anchor="bottom right"
              self="top right"
              class="menu-dropdown shadow-5"
              transition-show="jump-down"
              transition-hide="jump-up"
            >
              <q-list style="min-width: 250px" class="menu-list">
                <q-item-label header class="text-weight-bold text-primary">
                  <q-icon name="person" class="q-mr-sm" />
                  {{ user.name || 'Usuário' }}
                </q-item-label>

                <q-item clickable v-ripple class="menu-item" @click="goTo('profile')">
                  <q-item-section avatar>
                    <q-icon name="person" color="primary" />
                  </q-item-section>
                  <q-item-section>Meu Perfil</q-item-section>
                  <q-item-section side>
                    <q-icon name="chevron_right" color="grey-5" />
                  </q-item-section>
                </q-item>

                <q-item clickable v-ripple class="menu-item" @click="goTo('settings')">
                  <q-item-section avatar>
                    <q-icon name="settings" color="primary" />
                  </q-item-section>
                  <q-item-section>Configurações</q-item-section>
                  <q-item-section side>
                    <q-icon name="chevron_right" color="grey-5" />
                  </q-item-section>
                </q-item>

                <q-item clickable v-ripple class="menu-item" @click="goTo('Cadeiras')">
                  <q-item-section avatar>
                    <q-icon name="school" color="primary" />
                  </q-item-section>
                  <q-item-section>Minhas Cadeiras</q-item-section>
                  <q-item-section side>
                    <q-icon name="chevron_right" color="grey-5" />
                  </q-item-section>
                </q-item>

                <q-item clickable v-ripple class="menu-item" @click="goTo('ebooks')">
                  <q-item-section avatar>
                    <q-icon name="menu_book" color="primary" />
                  </q-item-section>
                  <q-item-section>Livros Digitais</q-item-section>
                  <q-item-section side>
                    <q-icon name="chevron_right" color="grey-5" />
                  </q-item-section>
                </q-item>

                <q-item clickable v-ripple class="menu-item" @click="goTo('loja-academica')">
                  <q-item-section avatar>
                    <q-icon name="shopping_cart" color="primary" />
                  </q-item-section>
                  <q-item-section>Loja Acadêmica</q-item-section>
                  <q-item-section side>
                    <q-icon name="chevron_right" color="grey-5" />
                  </q-item-section>
                </q-item>

                <q-separator class="q-my-sm" />

                <q-item clickable v-ripple class="menu-item text-negative" @click="logout">
                  <q-item-section avatar>
                    <q-icon name="logout" color="negative" />
                  </q-item-section>
                  <q-item-section>Sair</q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-btn>
        </div>
      </div>
    </header>

    <!-- Conteúdo Principal Modernizado -->
    <q-page class="main-content">
      <div class="hero-section">
        <div class="hero-content">
          <h1 class="hero-title">
            <span class="hero-highlight">Bem-vindo, {{ user.name?.split(' ')[0] || 'Estudante' }}</span>
            <span class="hero-subtitle">O que vamos aprender hoje?</span>
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
      </div>

      <div class="dashboard-container">
        <div class="section-header">
          <q-icon name="dashboard" color="primary" size="md" class="q-mr-sm" />
          <h2 class="section-title">Painel Acadêmico</h2>
        </div>

        <p class="section-description">
          Selecione uma das opções abaixo para começar sua jornada de aprendizagem
        </p>

        <div class="dashboard-grid">
          <dashboard-card
            v-for="(card, index) in cards"
            :key="index"
            :label="card.label"
            :icon="card.icon"
            :color="card.color"
            :gradient="card.gradient"
            :delay="index * 100"
            @click="goTo(card.route)"
          />
        </div>
      </div>
    </q-page>

    <!-- Footer Modernizado -->
    <footer class="app-footer">
      <div class="footer-wave">
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none">
          <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" opacity=".25" fill="currentColor"></path>
          <path d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" opacity=".5" fill="currentColor"></path>
          <path d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z" fill="currentColor"></path>
        </svg>
      </div>

      <div class="footer-content">
        <div class="footer-main">
          <div class="footer-brand">
            <div class="logo-wrapper">
              <q-icon name="school" size="xl" color="primary" />
              <span class="logo-text">Mawonelo</span>
            </div>
            <p class="brand-slogan">
              Transformando a educação através da tecnologia
            </p>
            <div class="footer-social">
              <q-btn
                flat
                round
                icon="facebook"
                color="grey-7"
                size="md"
                class="social-icon"
              />
              <q-btn
                flat
                round
                icon="twitter"
                color="grey-7"
                size="md"
                class="social-icon"
              />
              <q-btn
                flat
                round
                icon="instagram"
                color="grey-7"
                size="md"
                class="social-icon"
              />
              <q-btn
                flat
                round
                icon="linkedin"
                color="grey-7"
                size="md"
                class="social-icon"
              />
            </div>
          </div>

          <div class="footer-links">
            <div class="link-group">
              <h3 class="link-title">Recursos</h3>
              <a href="#" class="footer-link">Cadeiras</a>
              <a href="#" class="footer-link">Livros Digitais</a>
              <a href="#" class="footer-link">Loja Acadêmica</a>
              <a href="#" class="footer-link">Exames</a>
            </div>

            <div class="link-group">
              <h3 class="link-title">Suporte</h3>
              <a href="#" class="footer-link">Central de Ajuda</a>
              <a href="#" class="footer-link">Tutoriais</a>
              <a href="#" class="footer-link">Contato</a>
              <a href="#" class="footer-link">Feedback</a>
            </div>

            <div class="link-group">
              <h3 class="link-title">Legal</h3>
              <a href="#" class="footer-link">Termos de Uso</a>
              <a href="#" class="footer-link">Política de Privacidade</a>
              <a href="#" class="footer-link">Cookies</a>
              <a href="#" class="footer-link">Licenças</a>
            </div>
          </div>
        </div>

        <div class="footer-bottom">
          <div class="footer-copyright">
            © 2025 Mawonelo - Todos os direitos reservados
          </div>
          <div class="footer-apps">
            <q-btn
              flat
              round
              icon="android"
              color="grey-7"
              size="sm"
              class="app-icon"
            />
            <q-btn
              flat
              round
              icon="apple"
              color="grey-7"
              size="sm"
              class="app-icon"
            />
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import DashboardCard from 'components/dashboard/DashboardCard.vue'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { firebaseAuth, db } from 'boot/firebase'

const router = useRouter()

const user = ref({
  name: '',
  isPro: true,
  avatar: 'https://randomuser.me/api/portraits/women/45.jpg'
})

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
          avatar: data.image || 'https://randomuser.me/api/portraits/men/47.jpg',
          provincia: data.provincia || '',
          telefone: data.telefone || '',
          email: data.email || '',
          isLoaded: true
        }
      } else {
        console.error('Documento do usuário não encontrado.')
      }
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
const showMenu = ref(false)

const notifications = ref([
  {
    id: 1,
    title: 'Novo eBook disponível',
    message: 'O manual de Matemática Avançada foi adicionado à sua biblioteca',
    icon: 'menu_book',
    color: 'primary',
    time: new Date(Date.now() - 1000 * 60 * 5), // 5 minutos atrás
    read: false
  },
  {
    id: 2,
    title: 'Avaliação pendente',
    message: 'Você tem uma avaliação de Física para completar até sexta-feira',
    icon: 'assignment',
    color: 'orange',
    time: new Date(Date.now() - 1000 * 60 * 60), // 1 hora atrás
    read: false
  },
  {
    id: 3,
    title: 'Mensagem do professor',
    message: 'O professor Carlos enviou um feedback sobre seu último trabalho',
    icon: 'email',
    color: 'teal',
    time: new Date(Date.now() - 1000 * 60 * 60 * 3), // 3 horas atrás
    read: true
  },
  {
    id: 4,
    title: 'Atualização do sistema',
    message: 'Nova versão do aplicativo disponível com melhorias de performance',
    icon: 'system_update',
    color: 'purple',
    time: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 dia atrás
    read: true
  },
  {
    id: 5,
    title: 'Novo curso disponível',
    message: 'Curso de Inteligência Artificial foi liberado para sua conta PRO',
    icon: 'school',
    color: 'red',
    time: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 horas atrás
    read: false
  }
])

const unreadNotifications = computed(() => {
  return notifications.value.filter(n => !n.read)
})

const cards = ref([
  {
    label: 'Encontrar explicação em vídeos',
    icon: 'ondemand_video',
    color: 'primary',
    gradient: 'linear-gradient(135deg, #1976D2 0%, #2196F3 100%)',
    route: 'Cadeiras'
  },
  {
    label: 'Livros Digitais',
    icon: 'menu_book',
    color: 'secondary',
    gradient: 'linear-gradient(135deg, #9C27B0 0%, #E91E63 100%)',
    route: 'ebooks'
  },
  {
    label: 'Cursos com certificado',
    icon: 'workspace_premium',
    color: 'deep-orange',
    gradient: 'linear-gradient(135deg, #FF5722 0%, #FF9800 100%)',
    route: 'cursos'
  },
  {
    label: 'Minha Biblioteca',
    icon: 'cloud_upload',
    color: 'teal',
    gradient: 'linear-gradient(135deg, #009688 0%, #4CAF50 100%)',
    route: 'uploads'
  },
  {
    label: 'Scanner de Documentos',
    icon: 'qr_code_scanner',
    color: 'indigo',
    gradient: 'linear-gradient(135deg, #3F51B5 0%, #2196F3 100%)',
    route: 'scanner'
  },
  // {
  //   label: 'Banco de Exames',
  //   icon: 'assignment',
  //   color: 'purple',
  //   gradient: 'linear-gradient(135deg, #673AB7 0%, #9C27B0 100%)',
  //   route: 'exames'
  // },
  // {
  //   label: 'Anotações Pessoais',
  //   icon: 'edit_note',
  //   color: 'green',
  //   gradient: 'linear-gradient(135deg, #4CAF50 0%, #8BC34A 100%)',
  //   route: 'anotacoes'
  // },
  {
    label: 'Meu material de estudo',
    icon: 'folder_special',
    color: 'cyan',
    gradient: 'linear-gradient(135deg, #00BCD4 0%, #4DD0E1 100%)',
    route: 'meu-material'
  },
  {
    label: 'Fórum de Discussão',
    icon: 'forum',
    color: 'brown',
    gradient: 'linear-gradient(135deg, #795548 0%, #A1887F 100%)',
    route: 'forum'
  },
  {
    label: 'Minha Agenda',
    icon: 'calendar_today',
    color: 'pink',
    gradient: 'linear-gradient(135deg, #E91E63 0%, #F06292 100%)',
    route: 'calendario'
  }
])

function toggleNotifications() {
  showNotifications.value = !showNotifications.value
  // Marcar como lido quando abre
  if (showNotifications.value) {
    notifications.value.forEach(n => n.read = true)
     console.log('toggleNotifications chamado. showNotifications:', showNotifications.value)

  }
}

function toggleMenu() {
  showMenu.value = !showMenu.value
}

function handleNotificationClick(notification) {
  if (!notification.read) {
    notification.read = true
  }
  // Aqui você pode adicionar lógica para redirecionar com base no tipo de notificação
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

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 24px;
  margin: 0 auto;

  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 16px;
  }

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
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
