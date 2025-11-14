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
        <!-- Ícones de notificações e logout removidos conforme solicitado -->
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar, QAvatar, QBadge, QIcon, QChip } from 'quasar';
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

// Estados de notificações/logout removidos (header simplificado)

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

function capitalizeWords(text) {
  if (!text) return '';
  return text.replace(/\b\w/g, char => char.toUpperCase());
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
