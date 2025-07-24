<template>
  <div class="app-layout">
    <!-- Header -->
    <header class="app-header">
      <div class="header-content">
        <div class="user-profile">
          <q-avatar size="48px" class="profile-avatar">
            <img src="https://randomuser.me/api/portraits/men/47.jpg">
          </q-avatar>
          <div class="user-info">
            <div class="user-name">
              Benedito Muianga
              <q-icon
                v-if="user.isPro"
                name="verified"
                size="16px"
                color="primary"
                class="q-ml-xs"
              />
              <q-badge
                rounded
                :color="user.isPro ? 'primary' : 'grey'"
                class="plan-badge q-ml-xs"
              >
                {{ user.isPro ? 'PRO' : 'Básico' }}
              </q-badge>
            </div>
            <div class="user-details">
              <span class="text-caption">Engenharia Informática</span>
              <span class="text-caption q-mx-sm">•</span>
              <span class="text-caption">Universidade Eduardo Mondlane</span>
            </div>
          </div>
        </div>

        <div class="header-actions">
          <!-- Botão de Notificações com Dropdown -->
          <q-btn flat round icon="notifications" color="grey-7" @click="toggleNotifications">
            <q-badge v-if="unreadNotifications.length" color="red" floating rounded>
              {{ unreadNotifications.length }}
            </q-badge>

            <q-menu
              v-model="showNotifications"
              anchor="bottom right"
              self="top right"
              class="notification-menu"
            >
              <q-list style="min-width: 300px">
                <q-item-label header class="text-weight-bold">
                  Notificações
                </q-item-label>

                <template v-if="notifications.length > 0">
                  <q-item
                    v-for="(notification, index) in notifications.slice(0, 3)"
                    :key="index"
                    clickable
                    v-ripple
                    :class="{ 'unread-notification': !notification.read }"
                  >
                    <q-item-section avatar>
                      <q-icon :name="notification.icon" :color="notification.color" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>{{ notification.title }}</q-item-label>
                      <q-item-label caption lines="2">{{ notification.message }}</q-item-label>
                    </q-item-section>
                    <q-item-section side>
                      <q-item-label caption>{{ formatTime(notification.time) }}</q-item-label>
                    </q-item-section>
                  </q-item>

                  <q-separator />

                  <q-item clickable v-ripple @click="goTo('notificacoes')">
                    <q-item-section class="text-primary text-center">
                      Ver todas as notificações
                    </q-item-section>
                  </q-item>
                </template>

                <q-item v-else>
                  <q-item-section class="text-grey-7 text-center">
                    Nenhuma notificação
                  </q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-btn>

          <q-btn flat round icon="settings" color="grey-7"/>
        </div>
      </div>
    </header>

    <!-- Conteúdo Principal -->
    <q-page class="main-content">
      <div class="text-center q-mb-lg">
        <div class="text-h4 text-weight-bold text-primary q-mb-xs">
          Painel Acadêmico
        </div>
        <div class="text-subtitle1 text-grey-7">
          Selecione uma das opções abaixo para começar
        </div>
      </div>

      <div class="dashboard-grid">
        <dashboard-card
          v-for="card in cards"
          :key="card.label"
          :label="card.label"
          :icon="card.icon"
          :color="card.color"
          :gradient="card.gradient"
          @click="goTo(card.route)"
        />
      </div>
    </q-page>

    <!-- Footer -->
    <footer class="app-footer">
      <div class="footer-content">
        <div class="footer-links">
          <a href="#" class="footer-link">Termos de Uso</a>
          <a href="#" class="footer-link">Política de Privacidade</a>
          <a href="#" class="footer-link">Suporte</a>
        </div>
        <div class="footer-copyright">
          © 2025 Mawonelo - Todos os direitos reservados
        </div>
        <div class="footer-social">
          <q-btn flat round icon="facebook" color="grey-7" size="sm"/>
          <q-btn flat round icon="twitter" color="grey-7" size="sm"/>
          <q-btn flat round icon="instagram" color="grey-7" size="sm"/>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import DashboardCard from 'components/dashboard/DashboardCard.vue'

const router = useRouter()

const user = ref({
  name: 'Benedito Muianga',
  isPro: true,
  avatar: 'https://randomuser.me/api/portraits/women/45.jpg'
})

const showNotifications = ref(false)

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
  }
])

const unreadNotifications = computed(() => {
  return notifications.value.filter(n => !n.read)
})

const cards = ref([
  {
    label: 'Disciplinas',
    icon: 'school',
    color: 'primary',
    gradient: 'linear-gradient(135deg, #1976D2 0%, #2196F3 100%)',
    route: 'disciplinas'
  },
  {
    label: 'Livros Digitais',
    icon: 'menu_book',
    color: 'secondary',
    gradient: 'linear-gradient(135deg, #9C27B0 0%, #E91E63 100%)',
    route: 'ebooks'
  },
  {
    label: 'Cursos #com certificado',
    icon: 'shopping_cart',
    color: 'purple',
    gradient: 'linear-gradient(135deg, #673AB7 0%, #9C27B0 100%)',
    route: 'loja-academica'
  },

  {
    label: 'Minha Biblioteca',
    icon: 'cloud_upload',
    color: 'teal',
    gradient: 'linear-gradient(135deg, #009688 0%, #4CAF50 100%)',
    route: 'uploads'
  },
{
    label: 'Scanner',
    icon: 'qr_code_scanner',
    color: 'deep-orange',
    gradient: 'linear-gradient(135deg, #FF5722 0%, #FF9800 100%)',
    route: 'scanner'
  },
  {
    label: 'Exames',
    icon: 'assignment',
    color: 'indigo',
    gradient: 'linear-gradient(135deg, #3F51B5 0%, #2196F3 100%)',
    route: 'exames'
  },
  {
    label: 'Anotações',
    icon: 'edit_note',
    color: 'green',
    gradient: 'linear-gradient(135deg, #4CAF50 0%, #8BC34A 100%)',
    route: 'anotacoes'
  },
{
  label: 'Duvidas frequentes',
  icon: 'help_outline',
  color: 'cyan',
  gradient: 'linear-gradient(135deg, #00BCD4 0%, #4DD0E1 100%)',
  route: 'faqs'
},

])

function toggleNotifications() {
  showNotifications.value = !showNotifications.value
  // Marcar como lido quando abre
  if (showNotifications.value) {
    notifications.value.forEach(n => n.read = true)
  }
}

function goTo(route) {
  router.push(`/${route}`)
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
}

.app-header {
  background: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
  padding: 12px 24px;
  position: sticky;
  top: 0;
  z-index: 100;

  .header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    max-width: 1200px;
    margin: 0 auto;
  }

  .user-profile {
    display: flex;
    align-items: center;
    gap: 12px;

    .user-info {
      .user-name {
        font-weight: 600;
        font-size: 1rem;
        display: flex;
        align-items: center;
      }

      .user-details {
        margin-top: 2px;
        display: flex;
        align-items: center;

        .text-caption {
          font-size: 0.75rem;
          color: #666;
        }
      }

      .plan-badge {
        font-size: 0.7rem;
        padding: 2px 8px;
      }
    }
  }

  .header-actions {
    display: flex;
    gap: 8px;
  }
}

.notification-menu {
  .unread-notification {
    background-color: rgba(25, 118, 210, 0.05);
  }

  .q-item {
    border-left: 3px solid transparent;

    &.unread-notification {
      border-left-color: #1976D2;
    }
  }
}

.main-content {
  flex: 1;
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

.app-footer {
  background: #f8f9fa;
  border-top: 1px solid #e0e0e0;
  padding: 24px;

  .footer-content {
    max-width: 1200px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
  }

  .footer-links {
    display: flex;
    gap: 24px;

    .footer-link {
      color: #666;
      text-decoration: none;
      font-size: 0.875rem;

      &:hover {
        color: #1976D2;
      }
    }
  }

  .footer-copyright {
    color: #888;
    font-size: 0.75rem;
  }

  .footer-social {
    display: flex;
    gap: 12px;
  }
}

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 24px;
  margin: 0 auto;

  @media (max-width: 600px) {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 16px;
  }
}

.text-h4 {
  font-size: 1.75rem;
  letter-spacing: -0.5px;
}
</style>
