<template>
  <q-page class="bg-grey-1 flex flex-center">
    <q-card class="auth-card">
      <q-card-section class="text-center">
        <q-avatar size="80px" color="green-10" text-color="white" icon="lock_reset" />
        <div class="text-h4 text-weight-bold text-green-10 q-mt-md">Nova Senha</div>
        <div class="text-subtitle1 text-grey-7 q-mt-sm">
          Crie uma nova senha para sua conta
        </div>
      </q-card-section>

      <q-card-section>
        <q-form @submit.prevent="resetPassword" class="q-gutter-md">
          <q-input
            v-model="newPassword"
            label="Nova Senha"
            :type="showPassword ? 'text' : 'password'"
            outlined
            bg-color="white"
            color="green-10"
            :rules="[
              val => !!val || 'Senha é obrigatória',
              val => val.length >= 8 || 'Mínimo 8 caracteres'
            ]"
          >
            <template v-slot:prepend>
              <q-icon name="lock" color="green-10" />
            </template>
            <template v-slot:append>
              <q-icon
                :name="showPassword ? 'visibility_off' : 'visibility'"
                class="cursor-pointer"
                @click="showPassword = !showPassword"
              />
            </template>
          </q-input>

          <q-input
            v-model="confirmPassword"
            label="Confirmar Senha"
            :type="showPassword ? 'text' : 'password'"
            outlined
            bg-color="white"
            color="green-10"
            :rules="[
              val => !!val || 'Confirmação é obrigatória',
              val => val === newPassword || 'Senhas não coincidem'
            ]"
          >
            <template v-slot:prepend>
              <q-icon name="lock" color="green-10" />
            </template>
          </q-input>

          <q-btn
            label="Redefinir Senha"
            type="submit"
            color="green-10"
            text-color="white"
            class="full-width"
            size="lg"
            unelevated
            :loading="loading"
            :disable="!passwordsValid"
          >
            <template v-slot:loading>
              <q-spinner-hourglass class="on-left" />
              Processando...
            </template>
          </q-btn>
        </q-form>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<!-- <script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const route = useRoute()
const router = useRouter()
const phoneNumber = ref(route.query.phone || '')
const newPassword = ref('')
const confirmPassword = ref('')
const showPassword = ref(false)
const loading = ref(false)

const passwordsValid = computed(() => {
  return newPassword.value.length >= 8 &&
         confirmPassword.value === newPassword.value
})

const resetPassword = async () => {
  loading.value = true

  // Simulação de redefinição de senha
  setTimeout(() => {
    loading.value = false
    router.push({
      path: '/reset-password-success',
      query: { phone: phoneNumber.value }
    })
  }, 1500)
}
</script> -->

<!-- <script setup>
import { ref, computed } from 'vue'
import { db, firebaseAuth } from 'boot/firebase'
import { useQuasar } from 'quasar'

import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc
} from 'firebase/firestore'





const $q = useQuasar()

const newPassword = ref('')
const confirmPassword = ref('')
const showPassword = ref(false)
const loading = ref(false)

const passwordsValid = computed(() => {
  return newPassword.value.length >= 8 &&
         confirmPassword.value === newPassword.value
})

// const resetPassword = async () => {
//   loading.value = true

//   if (newPassword.value !== confirmPassword.value) {
//     $q.notify({
//       color: 'negative',
//       message: 'As senhas não coincidem.',
//       position: 'top',
//       icon: 'error'
//     })
//     loading.value = false
//     return
//   }

//   const telefone = localStorage.getItem('otpPhone')

//   console.log(telefone)
//   if (!telefone) {
//     $q.notify({
//       color: 'negative',
//       message: 'Número de telefone não encontrado.',
//       position: 'top',
//       icon: 'error'
//     })
//     loading.value = false
//     return
//   }

//   try {
//     const usersRef = db.collection('users_academico')
//     const snapshot = await usersRef.where('telefone', '==', telefone).get()

//     if (snapshot.empty) {
//       $q.notify({
//         color: 'negative',
//         message: 'Usuário não encontrado.',
//         position: 'top',
//         icon: 'error'
//       })
//       loading.value = false
//       return
//     }

//     const userDoc = snapshot.docs[0]
//     const userData = userDoc.data()
//     const emailFake = `${telefone}@gmail.com`
//     const senhaAtual = userData.password

//     const userCredential = await firebaseAuth.signInWithEmailAndPassword(emailFake, senhaAtual)

//     await userCredential.user.updatePassword(newPassword.value)

//     await usersRef.doc(userDoc.id).update({
//       password: newPassword.value,
//       updatedAt: new Date().toISOString()
//     })

//     localStorage.removeItem('otpPhone')
//     localStorage.removeItem('otpCode')
//     localStorage.removeItem('reauthenticated')

//     $q.notify({
//       color: 'positive',
//       message: 'Senha atualizada com sucesso!',
//       position: 'top',
//       icon: 'check'
//     })

//   } catch (err) {
//     console.error('Erro ao redefinir a senha:', err)
//     $q.notify({
//       color: 'negative',
//       message: 'Erro ao redefinir a senha. Verifique se o número está correto.',
//       position: 'top',
//       icon: 'error'
//     })
//   } finally {
//     loading.value = false
//   }
// }

const resetPassword = async () => {
  loading.value = true

  if (newPassword.value !== confirmPassword.value) {
    $q.notify({
      color: 'negative',
      message: 'As senhas não coincidem.',
      position: 'top',
      icon: 'error'
    })
    loading.value = false
    return
  }

  const telefone = localStorage.getItem('otpPhone')
  if (!telefone) {
    $q.notify({
      color: 'negative',
      message: 'Número de telefone não encontrado.',
      position: 'top',
      icon: 'error'
    })
    loading.value = false
    return
  }

  try {
    const usersRef = collection(db, 'users_academico')
    const q = query(usersRef, where('telefone', '==', telefone))
    const snapshot = await getDocs(q)

    if (snapshot.empty) {
      $q.notify({
        color: 'negative',
        message: 'Usuário não encontrado.',
        position: 'top',
        icon: 'error'
      })
      loading.value = false
      return
    }

    const userDoc = snapshot.docs[0]
    const userData = userDoc.data()
    const emailFake = `${telefone}@gmail.com`
    const senhaAtual = userData.password

    const userCredential = await firebaseAuth.signInWithEmailAndPassword(emailFake, senhaAtual)
    await userCredential.user.updatePassword(newPassword.value)

    const userRef = doc(db, 'users_academico', userDoc.id)
    await updateDoc(userRef, {
      password: newPassword.value,
      updatedAt: new Date().toISOString()
    })

    localStorage.removeItem('otpPhone')
    localStorage.removeItem('otpCode')
    localStorage.removeItem('reauthenticated')

    $q.notify({
      color: 'positive',
      message: 'Senha atualizada com sucesso!',
      position: 'top',
      icon: 'check'
    })

  } catch (err) {
    console.error('Erro ao redefinir a senha:', err)
    $q.notify({
      color: 'negative',
      message: 'Erro ao redefinir a senha. Verifique se o número está correto.',
      position: 'top',
      icon: 'error'
    })
  } finally {
    loading.value = false
  }
}

</script> -->


<script setup>
import { ref, computed } from 'vue'
import { db, firebaseAuth } from 'boot/firebase'
import { useQuasar } from 'quasar'
import { useRouter } from 'vue-router'
const router = useRouter()

import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc
} from 'firebase/firestore'

import {
  signInWithEmailAndPassword,
  updatePassword
} from 'firebase/auth'

const $q = useQuasar()

const newPassword = ref('')
const confirmPassword = ref('')
const showPassword = ref(false)
const loading = ref(false)

const passwordsValid = computed(() => {
  return newPassword.value.length >= 8 &&
         confirmPassword.value === newPassword.value
})

const resetPassword = async () => {
  loading.value = true

  if (newPassword.value !== confirmPassword.value) {
    $q.notify({
      color: 'negative',
      message: 'As senhas não coincidem.',
      position: 'top',
      icon: 'error'
    })
    loading.value = false
    return
  }

  const telefone = localStorage.getItem('otpPhone')
  if (!telefone) {
    $q.notify({
      color: 'negative',
      message: 'Número de telefone não encontrado.',
      position: 'top',
      icon: 'error'
    })
    loading.value = false
    return
  }

  try {
    const usersRef = collection(db, 'users_academico')
    const q = query(usersRef, where('telefone', '==', telefone))
    const snapshot = await getDocs(q)

    if (snapshot.empty) {
      $q.notify({
        color: 'negative',
        message: 'Usuário não encontrado.',
        position: 'top',
        icon: 'error'
      })
      loading.value = false
      return
    }

    const userDoc = snapshot.docs[0]
    const userData = userDoc.data()
    // const emailFake = `${telefone}@gmail.com`
    const emailFake = userData.email
    const senhaAtual = userData.password

    // Uso correto das funções modulares
    const userCredential = await signInWithEmailAndPassword(firebaseAuth, emailFake, senhaAtual)
    await updatePassword(userCredential.user, newPassword.value)

    const userRef = doc(db, 'users_academico', userDoc.id)
    await updateDoc(userRef, {
      password: newPassword.value,
      updatedAt: new Date().toISOString()
    })

    localStorage.removeItem('otpPhone')
    localStorage.removeItem('otpCode')
    localStorage.removeItem('reauthenticated')

    // $q.notify({
    //   color: 'positive',
    //   message: 'Senha atualizada com sucesso!',
    //   position: 'top',
    //   icon: 'check'
    // })
    router.push('reset-password-success')

  } catch (err) {
    console.error('Erro ao redefinir a senha:', err)
    $q.notify({
      color: 'negative',
      message: 'Erro ao redefinir a senha. Verifique se o número está correto.',
      position: 'top',
      icon: 'error'
    })
  } finally {
    loading.value = false
  }
}
</script>


<style scoped>
.auth-card {
  width: 100%;
  max-width: 420px;
  border-radius: 16px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08);
  padding: 30px;
}

@media (max-width: 600px) {
  .auth-card {
    width: 90%;
    padding: 20px;
  }
}
</style>
