<template>
  <q-page class="bg-grey-1 flex flex-center">
    <q-card class="login-card">
      <q-card-section class="text-center q-pb-none">
        <q-avatar size="80px" color="green-10" text-color="white" icon="lock" />
        <div class="text-h4 text-weight-bold text-green-10 q-mt-md">Bem-vindo de volta</div>
        <div class="text-subtitle1 text-grey-7">Faça login para acessar sua conta</div>
      </q-card-section>

      <q-card-section class="q-pt-md">
        <q-form @submit.prevent="handleLogin" class="q-gutter-md">
          <q-input
            v-model="email"
            label="Telefone"
            type="number"
            outlined
            bg-color="white"
            color="green-10"
            :rules="[val => !!val || 'Telefone é obrigatório']"
          >
            <template v-slot:prepend>
              <q-icon name="phone" color="green-10" />
            </template>
          </q-input>

          <!-- <q-input
            v-model="senha"
            label="Senha"
            type="password"
            outlined
            bg-color="white"
            color="green-10"
            :rules="[val => !!val || 'Senha é obrigatória', val => val.length >= 6 || 'Mínimo 6 caracteres']"
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
          </q-input> -->

          <q-input
  v-model="senha"
  :type="showPassword ? 'text' : 'password'"
            label="Senha"
            outlined
            bg-color="white"
            color="green-10"
            :rules="[val => !!val || 'Senha é obrigatória', val => val.length >= 6 || 'Mínimo 6 caracteres']"
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

          <div class="text-right">
            <q-btn
              flat
              label="Esqueceu a senha?"
              color="green-10"
              size="sm"
              @click="$router.push('forgot-password')"
            />
          </div>

          <q-btn
            label="Entrar"
            type="submit"
            color="green-10"
            text-color="white"
            class="full-width"
            size="lg"
            unelevated
            :loading="loading"
          >
            <template v-slot:loading>
              <q-spinner-hourglass class="on-left" />
              Entrando...
            </template>
          </q-btn>

          <div class="text-center text-caption text-grey-7 q-mt-sm">
            ou continue com
          </div>

          <q-btn
            label="Entrar com Carta Facil"
            color="white"
            text-color="grey-9"
            class="full-width google-btn"
            icon="img:https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg"
            @click="loginGoogle"
          />
        </q-form>
      </q-card-section>

      <q-card-section class="text-center q-pt-none">
        <div class="text-caption">
          Não tem uma conta?
          <q-btn
            flat
            label="Cadastre-se"
            color="green-10"
            size="sm"
            @click="$router.push('/register')"
          />
        </div>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<!-- <script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const email = ref('')
const senha = ref('')
const showPassword = ref(false)
const loading = ref(false)
const router = useRouter()

// const isValidEmail = (val) => {
//   const emailPattern = /^(?=[a-zA-Z0-9@._%+-]{6,254}$)[a-zA-Z0-9._%+-]{1,64}@(?:[a-zA-Z0-9-]{1,63}\.){1,8}[a-zA-Z]{2,63}$/
//   return emailPattern.test(val) || 'Email inválido'
// }

const handleLogin = async () => {
  loading.value = true

  try {
    // 🔒 Aqui futuramente chamaremos o Firebase Auth
    console.log('Email:', email.value)
    console.log('Senha:', senha.value)

    // Simulação de login
    setTimeout(() => {
      loading.value = false
      router.push('/first-access') // ou '/dashboard' se já completou perfil
    }, 1200)

  } catch (error) {
    loading.value = false
    console.error(error)
  }
}

const loginGoogle = () => {
  console.log('Login com Google (a implementar)')
}
</script> -->


<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from 'src/stores/modules/auth'
import { doc, getDoc } from 'firebase/firestore'
import { db } from 'src/boot/firebase' // ajuste conforme seu caminho
import { getAuth } from 'firebase/auth'


const email = ref('')
const senha = ref('')
const showPassword = ref(false)
const loading = ref(false)
const router = useRouter()
const authStore = useAuthStore()


// const isValidEmail = (val) => {
//   const emailPattern = /^(?=[a-zA-Z0-9@._%+-]{6,254}$)[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,63}$/
//   return emailPattern.test(val) || 'Email inválido'
// }

const handleLogin = async () => {
  loading.value = true
  try {
    const fakeEmail = `${email.value.trim()}@gmail.com`
    const firstAccess = await authStore.login(fakeEmail, senha.value)

    const user = getAuth().currentUser

    if (!user) throw new Error('Usuário não autenticado')

    const docRef = doc(db, 'users_academico', user.uid)
    const docSnap = await getDoc(docRef)

    if (!docSnap.exists()) {
      alert('Dados do usuário não encontrados.')
      return
    }

    const userData = docSnap.data()

    if (userData.isAdmin === true) {
      router.push('/admin')
    } else if (firstAccess) {
      router.push('/first-access')
    } else {
      router.push('/dashboard')
    }

  } catch (error) {
    if (error.code === 'auth/user-not-found') {
      alert('Usuário não encontrado.')
    } else if (error.code === 'auth/wrong-password') {
      alert('Senha incorreta.')
    } else {
      alert('Erro ao entrar: ' + error.message)
    }
  } finally {
    loading.value = false
  }
}



// const handleLogin = async () => {
//   loading.value = true
//   try {
//     const firstAccess = await authStore.login(email.value, senha.value)

//     if (firstAccess) {
//       router.push('/first-access')
//     } else {
//       router.push('/dashboard')
//     }

//   } catch (error) {
//     if (error.code === 'auth/user-not-found') {
//       alert('Usuário não encontrado.')
//     } else if (error.code === 'auth/wrong-password') {
//       alert('Senha incorreta.')
//     } else {
//       alert('Erro ao entrar: ' + error.message)
//     }
//   } finally {
//     loading.value = false
//   }
// }


// const handleLogin = async () => {
//   loading.value = true
//   try {
//     await authStore.login(email.value, senha.value)
//     router.push('/dashboard')
//   } catch (error) {
//     loading.value = false
//     if (error.code === 'auth/user-not-found') {
//       alert('Usuário não encontrado.')
//     } else if (error.code === 'auth/wrong-password') {
//       alert('Senha incorreta.')
//     } else {
//       alert('Erro ao entrar: ' + error.message)
//     }
//   } finally {
//     loading.value = false
//   }
// }



// const handleLogin = async () => {
//   loading.value = true
//   try {
//     await store.dispatch('auth/login', {
//       email: email.value,
//       password: senha.value
//     })
//     router.push('/dashboard')
//   } catch (error) {
//     loading.value = false
//     if (error.code === 'auth/user-not-found') {
//       alert('Usuário não encontrado.')
//     } else if (error.code === 'auth/wrong-password') {
//       alert('Senha incorreta.')
//     } else {
//       alert('Erro ao entrar: ' + error.message)
//     }
//   }
// }




// const handleLogin = async () => {
//   loading.value = true

//   try {
//     await signInWithEmailAndPassword(firebaseAuth, email.value, senha.value)
//     loading.value = false
//     router.push('/dashboard') // rota após login
//   } catch (error) {
//     loading.value = false
//     // Exemplo básico de tratamento de erro
//     if (error.code === 'auth/user-not-found') {
//       alert('Usuário não encontrado.')
//     } else if (error.code === 'auth/wrong-password') {
//       alert('Senha incorreta.')
//     } else {
//       alert('Erro ao entrar: ' + error.message)
//     }
//   }
// }

// const loginGoogle = async () => {
//   try {
//     const provider = new firebase.auth.GoogleAuthProvider()
//     await auth.signInWithPopup(provider)
//     router.push('/dashboard')
//   } catch (error) {
//     alert('Erro no login Google: ' + error.message)
//   }
// }


</script>




<style lang="scss" scoped>
.login-card {
  width: 100%;
  max-width: 420px;
  border-radius: 16px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08);
  padding: 20px;
}

.q-input {
  border-radius: 8px;

  .q-field__control:before {
    border: 1px solid rgba(0, 0, 0, 0.1);
  }
}

.q-btn {
  transition: all 0.3s ease;
  border-radius: 8px;
  font-weight: 500;
  letter-spacing: 0.5px;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(46, 125, 50, 0.3);
  }

  &:active {
    transform: scale(0.98);
  }
}

.google-btn {
  border: 1px solid #e0e0e0;

  &:hover {
    background-color: #f8f8f8 !important;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }

  .q-icon {
    margin-right: 8px;
    width: 18px;
    height: 18px;
  }
}

@media (max-width: 600px) {
  .login-card {
    width: 90%;
    padding: 16px;
  }
}
</style>
