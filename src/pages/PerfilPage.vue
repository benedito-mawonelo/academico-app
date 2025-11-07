<template>
  <div class="app-layout">
    <app-header @navigate="goTo" />
    <q-page class="main-content">
      <div class="hero-section">
        <div class="hero-content">
          <h1 class="hero-title animate__animated animate__fadeInDown">
            <span class="hero-highlight">Meu Perfil</span>
            <span class="hero-subtitle">Suas informações pessoais</span>
          </h1>
        </div>
      </div>

      <div class="profile-container">
        <q-card v-if="!loading" flat bordered class="profile-card shadow-4 animate__animated animate__fadeIn">
          <q-card-section class="text-center">
            <q-avatar size="120px" class="q-mb-md">
              <template v-if="user.foto">
                <img :src="user.foto" alt="Foto do perfil" />
              </template>
              <q-icon v-else name="person" color="grey-6" size="80px" />
            </q-avatar>
            <div class="profile-name text-weight-bold text-green">{{ user.name }} {{ user.apelido }}</div>
            <div class="profile-email text-grey-8 q-mt-sm">{{ user.email }}</div>
          </q-card-section>

          <q-card-section>
            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-6">
                <q-item>
                  <q-item-section>
                    <q-item-label caption>Instituição</q-item-label>
                    <q-item-label>{{ user.instituicao || 'Não informado' }}</q-item-label>
                  </q-item-section>
                </q-item>
              </div>
              <div class="col-12 col-md-6">
                <q-item>
                  <q-item-section>
                    <q-item-label caption>Ano Acadêmico</q-item-label>
                    <q-item-label>{{ user.ano || 'Não informado' }}</q-item-label>
                  </q-item-section>
                </q-item>
              </div>
              <div class="col-12 col-md-6">
                <q-item>
                  <q-item-section>
                    <q-item-label caption>Nível</q-item-label>
                    <q-item-label>{{ user.nivel || 'Não informado' }}</q-item-label>
                  </q-item-section>
                </q-item>
              </div>
              <div class="col-12 col-md-6">
                <q-item>
                  <q-item-section>
                    <q-item-label caption>Curso</q-item-label>
                    <q-item-label>{{ user.curso || 'Não informado' }}</q-item-label>
                  </q-item-section>
                </q-item>
              </div>
              <div class="col-12 col-md-6">
                <q-item>
                  <q-item-section>
                    <q-item-label caption>Província</q-item-label>
                    <q-item-label>{{ user.provincia || 'Não informado' }}</q-item-label>
                  </q-item-section>
                </q-item>
              </div>
              <div class="col-12 col-md-6">
                <q-item>
                  <q-item-section>
                    <q-item-label caption>Telefone</q-item-label>
                    <q-item-label>{{ user.telefone || 'Não informado' }}</q-item-label>
                  </q-item-section>
                </q-item>
              </div>
              <div class="col-12 col-md-6">
                <q-item>
                  <q-item-section>
                    <q-item-label caption>Ano de Nascimento</q-item-label>
                    <q-item-label>{{ user.birthYear || 'Não informado' }}</q-item-label>
                  </q-item-section>
                </q-item>
              </div>
            </div>
          </q-card-section>

          <q-card-actions align="center">
            <q-btn
              color="green"
              label="Editar Perfil"
              rounded
              class="full-width q-py-sm"
              @click="goTo('editar-perfil')"
            />
          </q-card-actions>
        </q-card>

        <div v-else class="text-center q-pa-md">
          <q-spinner color="green" size="3em" />
          <div class="q-mt-md">Carregando perfil...</div>
        </div>
      </div>
    </q-page>
    <app-footer />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { firebaseAuth, db } from 'src/boot/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import AppHeader from 'components/AppHeader.vue';
import AppFooter from 'components/AppFooter.vue';

const $q = useQuasar();
const router = useRouter();

const user = ref({
  name: '',
  apelido: '',
  email: '',
  instituicao: '',
  ano: '',
  nivel: '',
  foto: '',
  birthYear: '',
  curso: '',
  provincia: '',
  telefone: ''
});
const loading = ref(true);

onMounted(() => {
  onAuthStateChanged(firebaseAuth, async (currentUser) => {
    if (!currentUser) {
      $q.notify({
        type: 'negative',
        message: 'Nenhum usuário autenticado.',
        position: 'top'
      });
      router.push('/login');
      return;
    }

    try {
      const uid = currentUser.uid;
      const docRef = doc(db, 'users_academico', uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        user.value = {
          name: data.name || '',
          apelido: data.apelido || '',
          email: data.email || currentUser.email,
          instituicao: data.instituicao || '',
          ano: data.ano || '',
          nivel: data.nivel || '',
          foto: data.image || '',
          birthYear: data.birthYear || '',
          curso: data.curso || '',
          provincia: data.provincia || '',
          telefone: data.telefone || ''
        };
      } else {
        $q.notify({
          type: 'negative',
          message: 'Dados do usuário não encontrados.',
          position: 'top'
        });
      }
    } catch (error) {
      $q.notify({
        type: 'negative',
        message: 'Erro ao carregar perfil',
        caption: error?.message || '',
        position: 'top'
      });
    } finally {
      loading.value = false;
    }
  });
});

function goTo(page) {
  router.push(`/${page}`);
}
</script>

<style lang="scss" scoped>
.app-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: linear-gradient(to bottom, #f0f4f8, #ffffff);
}

.main-content {
  flex: 1;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0;
}

.hero-section {
  background: linear-gradient(135deg, #2E7D32 0%, #81C784 100%);
  color: white;
  padding: 40px 24px;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiPjxkZWZzPjxwYXR0ZXJuIGlkPSJwYXR0ZXJuIiB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiIHBhdHRlcm5UcmFuc2Zvcm09InJvdGF0ZSg0NSkiPjxyZWN0IHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjA4KSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3QgZmlsbD0idXJsKCNwYXR0ZXJuKSIgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIvPjwvc3ZnPg==');
    opacity: 0.3;
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
  font-size: 2.2rem;
  font-weight: 700;
  line-height: 1.2;
  margin-bottom: 16px;

  .hero-highlight {
    display: block;
    text-shadow: 0 3px 6px rgba(0, 0, 0, 0.2);
  }

  .hero-subtitle {
    display: block;
    font-size: 1.4rem;
    font-weight: 400;
    opacity: 0.9;
    margin-top: 8px;
  }
}

.profile-container {
  padding: 32px;
}

.profile-card {
  border-radius: 16px;
  background: white;
  max-width: 800px;
  margin: 0 auto;

  .q-avatar {
    transition: transform 0.3s ease;

    &:hover {
      transform: scale(1.05);
    }
  }

  .profile-name {
    font-size: 1.8rem;
  }

  .profile-email {
    font-size: 1rem;
  }
}

@media (max-width: 600px) {
  .hero-title {
    font-size: 1.8rem;

    .hero-subtitle {
      font-size: 1.2rem;
    }
  }

  .profile-container {
    padding: 16px;
  }

  .profile-card {
    .profile-name {
      font-size: 1.4rem;
    }

    .profile-email {
      font-size: 0.9rem;
    }

    .q-avatar {
      size: 100px;
    }
  }
}
</style>
