<template>
  <div class="app-layout">
    <app-header @navigate="goTo" />
    <q-page class="main-content">
      <div class="hero-section">
        <div class="hero-content">
          <h1 class="hero-title animate__animated animate__fadeInDown">
            <span class="hero-highlight">Editar Perfil</span>
            <span class="hero-subtitle">Atualize suas informações pessoais</span>
          </h1>
        </div>
      </div>

      <div class="profile-container">
        <q-card v-if="!loading" flat bordered class="profile-card shadow-4 animate__animated animate__fadeIn">
          <q-card-section class="text-center">
            <q-avatar size="120px" class="q-mb-md">
              <img :src="user.foto || 'https://via.placeholder.com/120'" alt="Foto do perfil" />
            </q-avatar>
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
          </q-card-section>

          <q-card-section>
            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-6">
                <q-input
                  v-model="user.name"
                  label="Nome"
                  outlined
                  dense
                  bg-color="white"
                  :rules="[val => !!val || 'Nome é obrigatório']"
                />
              </div>
              <div class="col-12 col-md-6">
                <q-input
                  v-model="user.apelido"
                  label="Apelido"
                  outlined
                  dense
                  bg-color="white"
                  :rules="[val => !!val || 'Apelido é obrigatório']"
                />
              </div>
              <div class="col-12 col-md-6">
                <q-input
                  v-model="user.email"
                  label="Email"
                  type="email"
                  outlined
                  dense
                  bg-color="white"
                  :rules="[val => !!val || 'Email é obrigatório', val => /.+@.+\..+/.test(val) || 'Email inválido']"
                  readonly
                />
              </div>
              <div class="col-12 col-md-6">
                <q-input
                  v-model="user.telefone"
                  label="Telefone"
                  outlined
                  dense
                  bg-color="white"
                  mask="#########"
                  :rules="[val => !!val || 'Telefone é obrigatório']"
                />
              </div>
              <div class="col-12 col-md-6">
                <q-input
                  v-model="user.instituicao"
                  label="Instituição"
                  outlined
                  dense
                  bg-color="white"
                  :rules="[val => !!val || 'Instituição é obrigatória']"
                />
              </div>
              <div class="col-12 col-md-6">
                <q-input
                  v-model="user.ano"
                  label="Ano Acadêmico"
                  outlined
                  dense
                  bg-color="white"
                  :rules="[val => !!val || 'Ano é obrigatório']"
                />
              </div>
              <div class="col-12 col-md-6">
                <q-select
                  v-model="user.nivel"
                  label="Nível"
                  :options="['Ensino Médio', 'Pré-Universitário', 'Universitário', 'Graduação', 'Pós-Graduação']"
                  outlined
                  dense
                  bg-color="white"
                  :rules="[val => !!val || 'Nível é obrigatório']"
                />
              </div>
              <div class="col-12 col-md-6">
                <q-input
                  v-model="user.curso"
                  label="Curso"
                  outlined
                  dense
                  bg-color="white"
                  :rules="[val => !!val || 'Curso é obrigatório']"
                />
              </div>
              <div class="col-12 col-md-6">
                <q-select
                  v-model="user.provincia"
                  label="Província"
                  :options="provincias"
                  outlined
                  dense
                  bg-color="white"
                  :rules="[val => !!val || 'Província é obrigatória']"
                />
              </div>
              <div class="col-12 col-md-6">
                <q-input
                  v-model="user.birthYear"
                  label="Ano de Nascimento"
                  outlined
                  dense
                  bg-color="white"
                  mask="####"
                  :rules="[val => !!val || 'Ano de nascimento é obrigatório', val => /^[0-9]{4}$/.test(val) || 'Ano inválido']"
                />
              </div>
            </div>
          </q-card-section>

          <q-card-actions align="center">
            <q-btn
              color="green"
              label="Salvar Alterações"
              rounded
              class="full-width q-py-sm"
              @click="salvarPerfil"
              :loading="savingProfile"
            />
            <q-btn
              color="negative"
              label="Sair"
              rounded
              flat
              class="full-width q-py-sm q-mt-sm"
              @click="logout"
            />
            <q-btn
              color="grey-8"
              label="Voltar"
              rounded
              flat
              class="full-width q-py-sm q-mt-sm"
              @click="goTo('perfil')"
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
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import AppHeader from 'components/AppHeader.vue';
import AppFooter from 'components/AppFooter.vue';

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
const uploadingPhoto = ref(false);
const savingProfile = ref(false);
const photoInput = ref(null);

const provincias = [
  'Cabo Delgado', 'Gaza', 'Inhambane', 'Manica', 'Maputo', 'Nampula',
  'Niassa', 'Sofala', 'Tete', 'Zambézia'
];

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
          foto: data.image || 'https://via.placeholder.com/120',
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

function editarFoto() {
  photoInput.value.click();
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
    photoInput.value.value = '';
  }
}

async function salvarPerfil() {
  savingProfile.value = true;
  try {
    const userId = firebaseAuth.currentUser?.uid;
    if (!userId) throw new Error('Usuário não autenticado.');

    const userData = {
      name: user.value.name,
      apelido: user.value.apelido,
      email: user.value.email,
      instituicao: user.value.instituicao,
      ano: user.value.ano,
      nivel: user.value.nivel,
      image: user.value.foto,
      birthYear: user.value.birthYear,
      curso: user.value.curso,
      provincia: user.value.provincia,
      telefone: user.value.telefone,
      updatedAt: new Date().toISOString()
    };

    await updateDoc(doc(db, 'users_academico', userId), userData);

    $q.notify({
      type: 'positive',
      message: 'Perfil atualizado com sucesso!',
      position: 'top'
    });
    router.push('/perfil');
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Erro ao salvar perfil',
      caption: error?.message || '',
      position: 'top'
    });
  } finally {
    savingProfile.value = false;
  }
}

async function logout() {
  try {
    await signOut(firebaseAuth);
    $q.notify({
      type: 'positive',
      message: 'Logout realizado com sucesso!',
      position: 'top'
    });
    router.push('/login');
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Erro ao fazer logout',
      caption: error?.message || '',
      position: 'top'
    });
  }
}

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
    .q-avatar {
      size: 100px;
    }
  }
}
</style>
