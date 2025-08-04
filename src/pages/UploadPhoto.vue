<template>
  <q-page class="bg-soft flex flex-center">
    <!-- Floating Skip Button -->
    <q-btn
      label="Pular"
      flat
      color="grey-7"
      class="skip-btn floating-skip"
      dense
      no-caps
      @click="skipAndContinue"
    />

    <div class="profile-update-container">
      <!-- Header with elegant styling nao esta em funcionamento -->
      <div class="header-section text-center q-pb-lg">
        <div class="icon-wrapper q-mb-sm">
          <q-icon name="account_circle" size="xl" color="green-10" class="profile-icon" />
        </div>
        <h4 class="text-h5 text-weight-bold text-dark q-mt-none">Complete seu perfil</h4>
        <p class="text-caption text-grey-7">Adicione uma foto para personalizar sua conta</p>
      </div>

      <!-- Avatar with elegant upload interaction -->
      <div class="avatar-section flex flex-center q-mb-xl">
        <div class="avatar-uploader" @click="triggerFileInput">
          <q-avatar
            size="130px"
            class="profile-avatar"
            :class="{'has-photo': userPhoto}"
          >
            <img v-if="userPhoto" :src="userPhoto" class="avatar-image">
            <div v-else class="empty-avatar flex flex-center">
              <q-icon name="add_a_photo" size="40px" color="grey-5" />
            </div>
            <div class="edit-badge flex flex-center">
              <q-icon name="edit" size="xs" color="white" />
            </div>
          </q-avatar>
          <div v-if="!userPhoto" class="upload-hint text-caption text-grey-6 q-mt-sm">
            Toque para adicionar foto
          </div>
        </div>
        <input
          ref="fileInput"
          type="file"
          accept="image/*"
          style="display: none"
          @change="handleFileUpload"
        >
      </div>

      <!-- Action buttons with beautiful green styling -->
      <div class="action-buttons q-mb-lg">
        <q-btn
          v-if="userPhoto"
          label="Remover foto"
          flat
          color="red"
          icon="delete"
          class="full-width q-mb-sm"
          size="12px"
          dense
          @click="removePhoto"
        />

        <q-btn
          label="Tirar foto"
          unelevated
          color="blue"
          text-color="white"
          icon="photo_camera"
          class="full-width q-mb-sm"
          size="12px"
          dense
          @click="takePhoto"
        />
      </div>

      <!-- Continue button -->
      <div class="footer-actions">
        <q-btn
          label="Continuar"
          color="green-10"
          unelevated
          class="continue-btn full-width"
          :disable="!userPhoto"
          :loading="saving"
          no-caps
          @click="saveAndContinue"
        >
          <template v-slot:loading>
            <q-spinner-dots class="on-left" />
            Salvando...
          </template>
        </q-btn>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useQuasar } from 'quasar'
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage'
import { getFirestore, doc, updateDoc } from 'firebase/firestore'
import { app } from 'boot/firebase'


const router = useRouter()
const route = useRoute()
const $q = useQuasar()

const fileInput = ref(null)
const userPhoto = ref(null)
const saving = ref(false)

const triggerFileInput = () => {
  fileInput.value.click()
}

const handleFileUpload = (event) => {
  const file = event.target.files[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      userPhoto.value = e.target.result
    }
    reader.readAsDataURL(file)
  }
}

const removePhoto = () => {
  userPhoto.value = null
  fileInput.value.value = null
}

const takePhoto = async () => {
  $q.notify({
    message: 'Funcionalidade de câmera será implementada futuramente.',
    color: 'green-10',
    position: 'bottom',
    timeout: 2000,
    icon: 'photo_camera'
  })
}

const skipAndContinue = () => {
  router.push('first-access')
}

// const saveAndContinue = async () => {
//   const id = route.query.id
//   const file = fileInput.value.files[0]

//   console.log('UID:', id)
//   console.log('FILE:', file)

//   if (!id || !file) {
//     $q.notify({
//       type: 'negative',
//       message: 'Erro: usuário ou imagem inválidos.',
//       position: 'bottom'
//     })
//     return
//   }

//   saving.value = true

//   try {
//     // Upload para Firebase Storage
//     const storageRef = firebase.storage().ref(`users/${id}/profile.jpg`)
//     await storageRef.put(file)

//     const downloadURL = await storageRef.getDownloadURL()

//     // Atualizar Firestore
//     await firebase.firestore().collection('users').doc(id).update({
//       image: downloadURL
//     })

//     $q.notify({
//       type: 'positive',
//       message: 'Foto de perfil salva com sucesso!',
//       position: 'bottom',
//       color: 'green-10'
//     })
//     router.push('/explorar2')
//   } catch (error) {
//     console.error(error)
//     $q.notify({
//       type: 'negative',
//       message: 'Erro ao salvar a foto.',
//       position: 'bottom'
//     })
//   } finally {
//     saving.value = false
//   }
// }

const saveAndContinue = async () => {
  const id = route.query.id
  const file = fileInput.value.files[0]

  if (!id || !file) {
    $q.notify({
      type: 'negative',
      message: 'Erro: usuário ou imagem inválidos.',
      position: 'bottom'
    })
    return
  }

  saving.value = true

  try {
    const storage = getStorage(app)
    const firestore = getFirestore(app)

    // Upload para Firebase Storage
    const filePath = `users_academico/${id}/profile.jpg`
    const imageRef = storageRef(storage, filePath)
    await uploadBytes(imageRef, file)

    const downloadURL = await getDownloadURL(imageRef)

    // Atualizar Firestore
    const userDocRef = doc(firestore, 'users_academico', id)
    await updateDoc(userDocRef, { image: downloadURL })

    $q.notify({
      type: 'positive',
      message: 'Foto de perfil salva com sucesso!',
      position: 'bottom',
      color: 'green-10'
    })
    router.push('first-access')
  } catch (error) {
    console.error(error)
    $q.notify({
      type: 'negative',
      message: 'Erro ao salvar a foto.',
      position: 'bottom'
    })
  } finally {
    saving.value = false
  }
}

</script>

<style scoped lang="scss">
.bg-soft {
  margin-top:-20px;
  background: #f8fafc;
}

.profile-update-container {
  width: 100%;
  max-width: 100%;
  height: 100vh;
  margin-top: 10px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 24px 20px;
  box-sizing: border-box;
  position: relative;
}

/* Floating Skip Button */
.floating-skip {
  position: absolute;
  top: 16px;
  margin-top: 10px;
  right: 16px;
  z-index: 1000;
  background: white;
  border-radius: 20px;
  padding: 0 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;

  &:hover {
    background: #f5f5f5;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  &:active {
    transform: translateY(0);
  }
}

.header-section {
  .icon-wrapper {
    display: inline-flex;
    padding: 14px;
    background: rgba(56, 142, 60, 0.1);
    border-radius: 50%;
    margin-bottom: 16px;

    .profile-icon {
      transition: all 0.3s ease;
    }

    &:hover .profile-icon {
      transform: scale(1.1);
    }
  }

  h4 {
    color: #2e7d32;
    margin-bottom: 4px;
  }
}

.avatar-section {
  .avatar-uploader {
    text-align: center;
    cursor: pointer;

    &:active .profile-avatar {
      transform: scale(0.98);
    }
  }

  .profile-avatar {
    border: 3px solid #e8f5e9;
    background: #f1f8e9;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    overflow: hidden;
    box-shadow: 0 4px 12px rgba(46, 125, 50, 0.1);

    &.has-photo {
      border-color: #2e7d32;
    }

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(46, 125, 50, 0.15);
    }
  }

  .avatar-image {
    object-fit: cover;
    width: 100%;
    height: 100%;
  }

  .empty-avatar {
    width: 100%;
    height: 100%;
    background: #f1f8e9;
  }

  .edit-badge {
    position: absolute;
    bottom: 8px;
    elevation: 8px;
    right: 8px;
    width: 28px;
    height: 28px;
    background: #2e7d32;
    border-radius: 50%;
    opacity: 0.9;
    transition: all 0.2s;

    .q-icon {
      filter: drop-shadow(0 1px 1px rgba(0,0,0,0.2));
    }
  }

  .profile-avatar:hover .edit-badge {
    opacity: 1;
    transform: scale(1.1);
  }

  .profile-avatar {
  overflow: visible; /* Permite que o badge ultrapasse os limites */
}

  .upload-hint {
    transition: all 0.2s;
  }

  .avatar-uploader:hover .upload-hint {
    color: #2e7d32;
    font-weight: 500;
  }
}

.action-buttons {
  width: 100%;
  max-width: 280px;
  margin: 0 auto;

  .q-btn {
    border-radius: 8px;
    height: 44px;
    font-weight: 500;
    letter-spacing: 0.5px;

    &--green-10 {
      box-shadow: 0 2px 4px rgba(46, 125, 50, 0.3);

      &:hover {
        background: #1b5e20 !important;
      }

      &:active {
        transform: translateY(1px);
      }
    }
  }
}

.footer-actions {
  // padding-top: 16px;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
  position: sticky;
  bottom: 0;
  background: white;
  padding-bottom: env(safe-area-inset-bottom);

  .continue-btn {
    border-radius: 8px;
    font-weight: 500;
    letter-spacing: 0.5px;
    transition: all 0.2s;
    height: 48px;

    &:not(:disabled) {
      box-shadow: 0 2px 8px rgba(46, 125, 50, 0.3);

      &:hover {
        background: #1b5e20;
      }

      &:active {
        transform: translateY(1px);
        box-shadow: 0 1px 4px rgba(46, 125, 50, 0.3);
      }
    }

    &:disabled {
      opacity: 0.6;
    }
  }
}

/* Animation for avatar upload */
@keyframes gentlePulse {
  0% { transform: scale(1); box-shadow: 0 4px 12px rgba(46, 125, 50, 0.1); }
  50% { transform: scale(1.03); box-shadow: 0 6px 16px rgba(46, 125, 50, 0.2); }
  100% { transform: scale(1); box-shadow: 0 4px 12px rgba(46, 125, 50, 0.1); }
}

.profile-avatar:active {
  animation: gentlePulse 0.4s ease;
}

/* Responsive adjustments */
@media (max-height: 700px) {
  .profile-update-container {
    justify-content: flex-start;
  }

  .header-section {
    padding-bottom: 12px;

    .icon-wrapper {
      padding: 10px;
      margin-bottom: 12px;
    }
  }

  .avatar-section {
    margin-bottom: 20px;

    .profile-avatar {
      width: 110px;
      height: 110px;
    }
  }

  .floating-skip {
    top: 12px;
    right: 12px;
  }
}
</style>
