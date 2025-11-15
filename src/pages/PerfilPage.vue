<template>
  <div class="app-layout">
    <!-- Custom Header -->
    <header class="custom-header">
      <q-btn flat round icon="arrow_back" @click="goBack" />
      <div class="header-title">Meu Perfil</div>
      <q-btn flat round icon="logout" @click="confirmLogout" />
    </header>

    <q-page class="main-content">
      <div class="hero-section">
        <div class="hero-content">
          <h1 class="hero-title animate__animated animate__fadeInDown">
            <span class="hero-highlight">Meu Perfil</span>
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
            <div class="q-mb-sm">
              <q-btn
                flat
                color="green"
                icon="edit"
                label="Editar Foto"
                @click="editarFoto"
                :loading="uploadingPhoto"
                class="edit-photo-btn"
              >
                <input
                  type="file"
                  ref="photoInput"
                  accept="image/*"
                  style="display: none"
                  @change="handlePhotoUpload"
                />
              </q-btn>
            </div>
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
              @click="openEditDialog"
            />
          </q-card-actions>
        </q-card>

        <div v-else class="text-center q-pa-md">
          <q-spinner color="green" size="3em" />
          <div class="q-mt-md">Carregando perfil...</div>
        </div>
      </div>

      <!-- Meus Módulos Section -->
      <div class="modules-section">
        <div class="section-container">
          <h2 class="section-title">Meus Módulos</h2>
          
          <div v-if="loadingModules" class="text-center q-pa-lg">
            <q-spinner color="primary" size="md" />
          </div>
          
          <div v-else-if="purchasedModules.length === 0" class="empty-modules text-center q-pa-lg">
            <q-icon name="school" size="lg" color="grey-6" />
            <div class="q-mt-md">Nenhum módulo adquirido</div>
            <q-btn color="primary" label="Explorar Módulos" class="q-mt-md" @click="goTo('cadeiras')" />
          </div>
          
          <div v-else class="modules-list">
            <q-card v-for="modulo in purchasedModules" :key="modulo.id" class="module-card q-mb-md">
              <q-card-section>
                <div class="row items-center">
                  <div class="col">
                    <div class="module-name text-weight-bold text-dark">{{ modulo.nome }}</div>
                    <div class="module-desc text-grey-8 q-mt-xs">{{ modulo.descricao }}</div>
                    <div class="module-date text-caption text-grey-7 q-mt-sm">
                      Adquirido em: {{ formatDate(modulo.purchaseDate) }}
                    </div>
                  </div>
                  <div class="col-auto">
                    <q-btn flat dense color="primary" icon="arrow_forward" @click="goToModulo(modulo.id)" />
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </div>
        </div>
      </div>
    </q-page>

    <!-- Edit Profile Dialog -->
    <q-dialog v-model="showEditDialog" persistent>
      <q-card style="min-width: 400px; max-width: 500px;">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">Editar Perfil</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-form @submit="saveProfile" class="q-gutter-md">
            <q-input
              v-model="editUser.name"
              label="Nome"
              outlined
              dense
              :rules="[val => !!val || 'Nome é obrigatório']"
            />
            <q-input
              v-model="editUser.apelido"
              label="Apelido"
              outlined
              dense
            />
            <q-input
              v-model="editUser.email"
              label="Email"
              outlined
              dense
              type="email"
              disable
            />
            <q-input
              v-model="editUser.telefone"
              label="Telefone"
              outlined
              dense
            />
            <q-input
              v-model="editUser.instituicao"
              label="Instituição"
              outlined
              dense
            />
            <q-input
              v-model="editUser.curso"
              label="Curso"
              outlined
              dense
            />
            <q-input
              v-model="editUser.provincia"
              label="Província"
              outlined
              dense
            />
            <q-input
              v-model="editUser.birthYear"
              label="Ano de Nascimento"
              outlined
              dense
              type="number"
            />
            <q-input
              v-model="editUser.ano"
              label="Ano Acadêmico"
              outlined
              dense
            />
            <q-input
              v-model="editUser.nivel"
              label="Nível"
              outlined
              dense
            />

            <div class="row q-gutter-md q-mt-md">
              <q-btn
                label="Cancelar"
                color="grey-8"
                flat
                class="col"
                v-close-popup
              />
              <q-btn
                label="Salvar"
                color="green"
                type="submit"
                class="col"
                :loading="savingProfile"
              />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Footer -->
    <footer class="app-footer">
      <div class="footer-icons-container">
        <q-btn flat round icon="home" color="grey-8" size="lg" @click="goTo('dashboard')">
          <q-tooltip>Dashboard</q-tooltip>
        </q-btn>
        <q-btn flat round icon="notifications" color="grey-8" size="lg" @click="goTo('notificacoes')">
          <q-badge v-if="unreadCount" color="red" floating rounded>{{ unreadCount }}</q-badge>
          <q-tooltip>Notificações</q-tooltip>
        </q-btn>
        <q-btn flat round icon="person" color="grey-8" size="lg" @click="goTo('profile')">
          <q-tooltip>Perfil</q-tooltip>
        </q-btn>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { firebaseAuth, db } from 'src/boot/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, collection, query, where, getDocs, updateDoc } from 'firebase/firestore';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';

const $q = useQuasar();
const router = useRouter();
const storage = getStorage();

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
const loadingModules = ref(false);
const purchasedModules = ref([]);
const unreadCount = ref(0);
const showEditDialog = ref(false);
const savingProfile = ref(false);
const uploadingPhoto = ref(false);
const photoInput = ref(null);
const currentAuthUser = ref(null);
const editUser = ref({
  name: '',
  apelido: '',
  email: '',
  instituicao: '',
  ano: '',
  nivel: '',
  birthYear: '',
  curso: '',
  provincia: '',
  telefone: ''
});

async function loadPurchasedModules(uid) {
  loadingModules.value = true;
  try {
    const purchasesQuery = query(
      collection(db, 'userPurchases'),
      where('userId', '==', uid)
    );
    const purchasesSnapshot = await getDocs(purchasesQuery);
    const moduleIds = new Set();
    
    purchasesSnapshot.docs.forEach(doc => {
      const data = doc.data();
      if (data.moduloId) {
        moduleIds.add(data.moduloId);
      }
    });

    if (moduleIds.size === 0) {
      purchasedModules.value = [];
      return;
    }

    // Carregar dados dos módulos
    const modulosSnapshot = await getDocs(collection(db, 'modulos'));
    const allModulos = modulosSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    purchasedModules.value = allModulos.filter(m => moduleIds.has(m.id));
  } catch (error) {
    console.error('Erro ao carregar módulos:', error);
  } finally {
    loadingModules.value = false;
  }
}

function formatDate(date) {
  if (!date) return '';
  const d = date?.toDate ? date.toDate() : new Date(date);
  return d.toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
}

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

    currentAuthUser.value = currentUser;

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

        // Preenche o formulário de edição automaticamente com os dados carregados
        editUser.value = { ...user.value };
      } else {
        $q.notify({
          type: 'negative',
          message: 'Dados do usuário não encontrados.',
          position: 'top'
        });
      }
      
      // Carregar módulos comprados
      await loadPurchasedModules(uid);
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

function goBack() {
  router.back();
}

function goToModulo(moduloId) {
  const modulo = purchasedModules.value.find(m => m.id === moduloId);
  if (!modulo || !modulo.cadeiraId) {
    $q.notify({
      type: 'negative',
      message: 'Disciplina deste módulo não encontrada',
      position: 'top'
    });
    return;
  }

  router.push(`/cadeiras/${modulo.cadeiraId}`);
}

function openEditDialog() {
  // Garante que o popup sempre abra com os dados mais recentes do usuário
  editUser.value = { ...user.value };
  showEditDialog.value = true;
}

function editarFoto() {
  if (photoInput.value) {
    photoInput.value.click();
  }
}

async function handlePhotoUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  uploadingPhoto.value = true;
  try {
    const userId = firebaseAuth.currentUser?.uid;
    if (!userId) throw new Error('Usuário não autenticado.');

    const storagePath = `profile_photos/${userId}/${file.name}`;
    const photoRef = storageRef(storage, storagePath);
    await uploadBytes(photoRef, file);
    const photoURL = await getDownloadURL(photoRef);

    user.value.foto = photoURL;
    editUser.value.foto = photoURL;
    await updateDoc(doc(db, 'users_academico', userId), { image: photoURL });

    $q.notify({
      type: 'positive',
      message: 'Foto de perfil atualizada com sucesso!',
      position: 'top'
    });
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Erro ao fazer upload da foto',
      caption: error?.message || '',
      position: 'top'
    });
  } finally {
    uploadingPhoto.value = false;
    if (photoInput.value) {
      photoInput.value.value = '';
    }
  }
}

async function saveProfile() {
  if (!currentAuthUser.value) return;

  savingProfile.value = true;
  try {
    const uid = currentAuthUser.value.uid;
    const docRef = doc(db, 'users_academico', uid);
    await updateDoc(docRef, {
      name: editUser.value.name,
      apelido: editUser.value.apelido,
      instituicao: editUser.value.instituicao,
      curso: editUser.value.curso,
      provincia: editUser.value.provincia,
      telefone: editUser.value.telefone,
      birthYear: editUser.value.birthYear,
      ano: editUser.value.ano,
      nivel: editUser.value.nivel
    });

    // Atualizar dados locais mantendo campos que não são editados (como foto)
    user.value = { ...user.value, ...editUser.value };

    showEditDialog.value = false;
    $q.notify({
      type: 'positive',
      message: 'Perfil atualizado com sucesso',
      position: 'top'
    });
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Erro ao atualizar perfil',
      caption: error?.message || '',
      position: 'top'
    });
  } finally {
    savingProfile.value = false;
  }
}

function confirmLogout() {
  $q.dialog({
    title: 'Confirmar Saída',
    message: 'Tem certeza que deseja sair?',
    persistent: true,
    ok: {
      label: 'Sair',
      color: 'negative'
    },
    cancel: {
      label: 'Cancelar',
      color: 'grey-8'
    }
  }).onOk(async () => {
    try {
      await signOut(firebaseAuth);
      router.push('/login');
      $q.notify({
        type: 'positive',
        message: 'Desconectado com sucesso',
        position: 'top'
      });
    } catch {
      $q.notify({
        type: 'negative',
        message: 'Erro ao desconectar',
        position: 'top'
      });
    }
  });
}
</script>

<style lang="scss" scoped>
.app-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: linear-gradient(to bottom, #f0f4f8, #ffffff);
}

.custom-header {
  background: linear-gradient(135deg, #2E7D32 0%, #81C784 100%);
  color: white;
  padding: 12px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);

  .header-title {
    flex: 1;
    text-align: center;
    font-weight: 600;
    font-size: 1.1rem;
  }

  :deep(.q-btn) {
    color: white;
  }
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

  .edit-photo-btn {
    transition: all 0.3s ease;

    &:hover {
      background-color: #1a3c1f !important;
      color: white !important;
    }
  }

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

.modules-section {
  padding: 0 32px 32px;
}

.section-container {
  max-width: 800px;
  margin: 0 auto;
}

.section-title {
  font-size: 1.2rem;
  font-weight: 700;
  margin-bottom: 12px;
  color: #1f2937;
}

.module-card {
  border-radius: 12px;
  border: 1px solid rgba(0,0,0,0.08);
}

.app-footer {
  background: white;
  border-top: 1px solid rgba(0, 0, 0, 0.08);
  padding: 12px 0;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.05);
}

.footer-icons-container {
  display: flex;
  justify-content: center;
  gap: 32px;
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 16px;
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
