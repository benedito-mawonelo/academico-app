<template>
  <header class="app-header">
    <div class="header-content">
      <div class="user-profile" @click="$emit('navigate', 'profile')">
        <q-avatar size="56px" class="profile-avatar glow-on-hover">
          <template v-if="user.avatar">
            <img :src="user.avatar">
          </template>
          <q-icon v-else name="person" color="white" />
        </q-avatar>
        <div class="user-info">
          <div class="user-name">
            <span class="name-text">{{ capitalizeWords(user.name + ' ' + user.apelido) }}</span>
            <q-icon v-if="user.isPro" name="verified" size="20px" color="yellow" class="q-ml-xs" />
            <q-badge rounded :color="user.isPro ? 'yellow' : 'grey-6'" class="plan-badge q-ml-xs" text-color="black">
              {{ user.isPro ? 'PRO' : 'BÁSICO' }}
            </q-badge>
          </div>
          <div class="user-details">
            <q-chip dense size="sm" color="green" text-color="white" icon="school" class="q-mr-xs">
              {{ capitalizeWords(user.curso) }}
            </q-chip>
            <q-chip dense size="sm" color="teal" text-color="white" icon="apartment" class="q-mr-xs">
              {{ user.instituicao?.toUpperCase() || 'N/A' }}
            </q-chip>
          </div>
        </div>
      </div>
      <div class="header-actions">
        <div class="notification-wrapper">
          <q-btn flat round icon="notifications" color="white" class="action-btn pulse-on-notification" @click="toggleNotifications">
            <q-badge v-if="unreadNotifications.length" color="red" floating rounded class="notification-badge" :class="{ 'pulse': unreadNotifications.length }">
              {{ unreadNotifications.length }}
            </q-badge>
          </q-btn>
          <q-menu v-model="showNotifications" anchor="bottom right" self="top right" class="notification-menu shadow-5" transition-show="fade" transition-hide="fade">
            <q-list style="min-width: 350px" class="menu-list">
              <q-item-label header class="text-weight-bold text-green">
                <q-icon name="notifications" class="q-mr-sm" /> Notificações
              </q-item-label>
              <template v-if="notifications.length > 0">
                <q-item v-for="(notification) in notifications.slice(0, 5)" :key="notification.id" clickable v-ripple class="notification-item" :class="{ 'unread-notification': !notification.read }" @click="handleNotificationClick(notification)">
                  <q-item-section avatar>
                    <q-icon :name="notification.icon" :color="notification.color" size="24px" />
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
                <q-item clickable v-ripple class="text-green text-weight-medium" @click="$emit('navigate', 'notificacoes')">
                  <q-item-section avatar>
                    <q-icon name="list_alt" color="green" />
                  </q-item-section>
                  <q-item-section>Ver todas as notificações</q-item-section>
                  <q-item-section side>
                    <q-icon name="chevron_right" color="green" />
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
        <q-btn
          flat
          round
          icon="logout"
          color="white"
          class="action-btn"
          @click="showLogoutConfirm = true"
        >
          <q-tooltip>Sair</q-tooltip>
        </q-btn>

        <q-dialog v-model="showLogoutConfirm" persistent>
          <q-card>
            <q-card-section class="text-h6">Confirmar saída</q-card-section>
            <q-card-section>Tem certeza que deseja sair?</q-card-section>
            <q-card-actions align="right">
              <q-btn flat label="Cancelar" color="grey-7" v-close-popup />
              <q-btn color="negative" label="Sair" @click="doLogout" />
            </q-card-actions>
          </q-card>
        </q-dialog>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar, QAvatar, QBadge, QBtn, QIcon, QChip, QMenu, QList, QItem, QItemSection, QItemLabel, QSeparator } from 'quasar';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { firebaseAuth, db } from 'boot/firebase';

const $q = useQuasar();
const router = useRouter();

const user = ref({
  name: 'Estudante',
  apelido: '',
  instituicao: 'N/A',
  curso: 'N/A',
  avatar: '',
  isPro: false,
  isLoaded: false
});

const showNotifications = ref(false);
const showLogoutConfirm = ref(false);

const notifications = ref([
  {
    id: 1,
    title: 'Novo Curso Disponível',
    message: 'Curso de Inteligência Artificial já está na loja!',
    icon: 'school',
    color: 'green',
    time: new Date(Date.now() - 1000 * 60 * 10),
    read: false
  },
  {
    id: 2,
    title: 'Desconto Exclusivo',
    message: '40% de desconto em todos os cursos de Tecnologia!',
    icon: 'local_offer',
    color: 'yellow',
    time: new Date(Date.now() - 1000 * 60 * 60),
    read: false
  },
  {
    id: 3,
    title: 'Certificado Gerado',
    message: 'Seu certificado de Marketing Digital está disponível.',
    icon: 'workspace_premium',
    color: 'teal',
    time: new Date(Date.now() - 1000 * 60 * 60 * 2),
    read: true
  }
]);

const unreadNotifications = computed(() => notifications.value.filter(n => !n.read));

onMounted(async () => {
  onAuthStateChanged(firebaseAuth, async (authUser) => {
    if (authUser) {
      try {
        const docRef = doc(db, 'users_academico', authUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          user.value = {
            name: data.name || 'Estudante',
            apelido: data.apelido || '',
            instituicao: data.instituicao || 'N/A',
            curso: data.curso || 'N/A',
            avatar: data.image || '',
            isPro: data.isPro || false,
            isLoaded: true
          };
        } else {
          $q.notify({
            type: 'negative',
            message: 'Perfil do usuário não encontrado. Complete seu perfil.',
            position: 'top'
          });
          router.push('/profile');
        }
      } catch (error) {
        $q.notify({
          type: 'negative',
          message: 'Erro ao carregar perfil do usuário',
          caption: error?.message || '',
          position: 'top'
        });
        console.error('Firebase error:', error);
      }
    } else {
      $q.notify({
        type: 'negative',
        message: 'Você precisa estar logado para acessar esta página.',
        position: 'top'
      });
      router.push('/login');
    }
  });
});

function toggleNotifications() {
  console.log('Toggling notifications, current state:', showNotifications.value);
  showNotifications.value = !showNotifications.value;
  if (showNotifications.value) {
    notifications.value.forEach(n => (n.read = true));
  }
}


function handleNotificationClick(notification) {
  if (!notification.read) {
    notification.read = true;
  }
}

function formatTime(date) {
  const now = new Date();
  const diff = now - date;
  const minutes = Math.floor(diff / (1000 * 60));
  if (minutes < 60) return `${minutes} min atrás`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} h atrás`;
  const days = Math.floor(hours / 24);
  return `${days} d atrás`;
}

function capitalizeWords(text) {
  if (!text) return '';
  return text.replace(/\b\w/g, char => char.toUpperCase());
}

function doLogout() {
  firebaseAuth.signOut();
  router.push('/login');
}
</script>

<style lang="scss" scoped>
.app-header {
  background: linear-gradient(135deg, #2E7D32, #66BB6A);
  color: white;
  padding: 16px 32px;
  position: sticky;
  top: 0;
  z-index: 1000;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);

  .header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    max-width: 1400px;
    margin: 0 auto;
  }

  .user-profile {
    display: flex;
    align-items: center;
    gap: 16px;
    cursor: pointer;
    transition: transform 0.3s ease;

    &:hover {
      transform: translateX(5px);

      .profile-avatar {
        transform: scale(1.1);
        box-shadow: 0 0 0 4px rgba(255, 255, 255, 0.3);
      }
    }

    .profile-avatar {
      border: 3px solid white;
      border-radius: 50%;
      transition: all 0.3s ease;

      img {
        object-fit: cover;
      }
    }

    .user-info {
      .user-name {
        font-weight: 700;
        font-size: 1.2rem;
        display: flex;
        align-items: center;

        .name-text {
          margin-right: 8px;
        }
      }

      .user-details {
        margin-top: 6px;
        display: flex;
        gap: 8px;
      }
    }
  }

  .header-actions {
    display: flex;
    gap: 16px;

    .action-btn {
      transition: all 0.3s ease;

      &:hover {
        transform: scale(1.2);
        color: #ffffff !important;
      }
    }

    .notification-badge {
      font-size: 0.7rem;
      padding: 3px 8px;
      min-width: 20px;
      min-height: 20px;
      top: 2px;
      right: 2px;

      &.pulse {
        animation: pulse 1.5s infinite;
      }
    }
  }
}

@keyframes pulse {
  0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(255, 0, 0, 0.7); }
  70% { transform: scale(1); box-shadow: 0 0 0 12px rgba(255, 0, 0, 0); }
  100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(255, 0, 0, 0); }
}

.glow-on-hover:hover {
  filter: drop-shadow(0 0 10px rgba(46, 125, 50, 0.5));
}

.notification-menu, .menu-dropdown {
  border-radius: 16px !important;
  background: white;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  z-index: 2000; /* Ensure menu appears above other elements */
  max-height: 80vh; /* Prevent overflow on small screens */
  overflow-y: auto;

  .menu-list {
    padding: 12px 0;
  }

  .q-item-label.header {
    padding: 16px;
    font-size: 1.1rem;
    background: linear-gradient(135deg, #f0f4f8, #ffffff);
  }

  .notification-item, .menu-item {
    padding: 12px 16px;
    border-radius: 8px;
    margin: 0 8px;

    &:hover {
      background-color: rgba(46, 125, 50, 0.1) !important;
      transform: translateX(4px);
    }
  }

  .unread-notification {
    background-color: rgba(46, 125, 50, 0.05);
    border-left: 4px solid #2E7D32;
  }
}
</style>
