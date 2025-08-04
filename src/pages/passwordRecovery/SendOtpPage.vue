<template>
  <q-page class="bg-grey-1 flex flex-center">
    <q-card class="auth-card">
      <q-card-section class="text-center">
        <q-btn
          flat
          round
          icon="arrow_back"
          class="back-btn absolute-left"
          style="left: 16px; top: 16px;"
          @click="$router.back()"
        />
        <q-avatar size="80px" color="green-10" text-color="white" icon="vpn_key" />
        <div class="text-h4 text-weight-bold text-green-10 q-mt-md">Encontre sua conta</div>
        <div class="text-subtitle1 text-grey-7 q-mt-sm">Insira o número de telemóvel vinculado à sua conta</div>
      </q-card-section>

      <q-card-section>
        <q-form @submit.prevent="submitForm" class="q-gutter-md">
          <q-input
            v-model="formData.telefone"
            label="Número de telemóvel"
            outlined
            bg-color="white"
            color="green-10"
            mask="#########"
            unmasked-value
            :rules="[
              val => !!val || 'Número é obrigatório',
              val => val.length === 9 || 'Número deve ter 9 dígitos'
            ]"
            clearable
          >
            <template v-slot:prepend>
              <q-icon name="phone" color="green-10" />
            </template>
          </q-input>

          <!-- Área de conta encontrada -->
          <transition name="fade-slide-up">
            <div v-if="returnedUser" class="account-found-section q-mt-md">
              <div class="text-caption text-grey-7 q-mb-sm">
                <q-icon name="info" color="blue" size="sm" />
                Sua conta foi encontrada. Escolha como receber o código:
              </div>

              <q-input
                v-model="maskedFullName"
                outlined
                readonly
                label="Sua conta:"
                class="q-mb-sm"
                color="green-10"
              />

              <div class="row q-gutter-sm q-mt-md">
                <q-btn
                  icon="send"
                  label="WhatsApp"
                  color="green-10"
                  size="md"
                  @click="irParaTelaDeOtp"
                  class="action-btn full-width"
                />
                <q-btn
                  icon="sms"
                  label="SMS"
                  color="blue"
                  size="md"
                  @click="irParaTelaDeOtpSMS"
                  class="action-btn full-width"
                />
              </div>
            </div>
          </transition>

          <q-btn
            label="Recuperar"
            type="submit"
            :color="formData.telefone.length === 9 ? 'green-10' : 'grey-5'"
            text-color="white"
            class="full-width"
            size="lg"
            unelevated
            :loading="isLoading"
            :disable="formData.telefone.length !== 9"
          >
            <template v-slot:loading>
              <q-spinner-hourglass class="on-left" />
              Procurando conta...
            </template>
          </q-btn>
        </q-form>
      </q-card-section>

      <q-card-section class="text-center q-pt-none">
        <q-btn
          flat
          label="Voltar para Login"
          color="green-10"
          @click="$router.push('/login')"
        />
      </q-card-section>
    </q-card>

    <!-- Diálogo para conta não encontrada -->
    <q-dialog v-model="showNotFoundDialog">
      <q-card style="width: 300px">
        <q-card-section>
          <div class="text-h6">Conta não encontrada</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          Não encontramos nenhuma conta associada a este número. Deseja criar uma nova conta ou tentar novamente?
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Tentar novamente" color="grey-7" v-close-popup @click="resetForm" />
          <q-btn label="Criar conta" color="green-10" v-close-popup @click="$router.push('/cadastro')" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<!-- <script setup>
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const router = useRouter()

// Dados reativos
const formData = ref({
  telefone: '',
  mustReturnEmail: true
})
const returnedUser = ref(null)
const isLoading = ref(false)
const showNotFoundDialog = ref(false)

// Simulação de busca de usuário
const mockUsers = [
  { telefone: '912345678', name: 'João', apelido: 'Silva' },
  { telefone: '923456789', name: 'Maria', apelido: 'Santos' }
]

// Máscara para nome do usuário
const maskNamePart = (name) => {
  if (!name) return ''
  if (name.length <= 2) return name
  if (name.length <= 4) {
    const first = name.charAt(0)
    const last = name.charAt(name.length - 1)
    return first + '*'.repeat(name.length - 2) + last
  }
  const firstTwo = name.slice(0, 2)
  const last = name.charAt(name.length - 1)
  const masked = '*'.repeat(name.length - 3)
  return firstTwo + masked + last
}

// Nome mascarado computado
const maskedFullName = computed(() => {
  if (!returnedUser.value) return ''
  const nome = maskNamePart(returnedUser.value.name)
  const apelido = maskNamePart(returnedUser.value.apelido)
  return `${nome} ${apelido}`
})

// Enviar formulário
const submitForm = () => {
  if (formData.value.telefone.length === 9) {
    isLoading.value = true

    // Simulação de busca assíncrona
    setTimeout(() => {
      const foundUser = mockUsers.find(user => user.telefone === formData.value.telefone)

      if (foundUser) {
        returnedUser.value = foundUser
      } else {
        showNotFoundDialog.value = true
      }

      isLoading.value = false
    }, 1500)
  }
}

// Redirecionar para OTP
const irParaTelaDeOtp = () => {
  const codigoOtp = Math.floor(100000 + Math.random() * 900000)
  localStorage.setItem('otpCode', codigoOtp.toString())
  localStorage.setItem('otpPhone', formData.value.telefone)

  $q.notify({
    type: 'positive',
    message: 'Código enviado via WhatsApp!',
    icon: 'check_circle'
  })

  router.push({
    path: '/verificar-otp',
    query: { via: 'whatsapp' }
  })
}

const irParaTelaDeOtpSMS = () => {
  const codigoOtp = Math.floor(100000 + Math.random() * 900000)
  localStorage.setItem('otpCode', codigoOtp.toString())
  localStorage.setItem('otpPhone', formData.value.telefone)

  $q.notify({
    type: 'positive',
    message: 'Código enviado via SMS!',
    icon: 'check_circle'
  })

  router.push({
    path: '/verificar-otp',
    query: { via: 'sms' }
  })
}

// Resetar formulário
const resetForm = () => {
  formData.value.telefone = ''
  returnedUser.value = null
}

// Watcher para limpar usuário quando telefone é alterado
watch(() => formData.value.telefone, (newVal) => {
  if (!newVal) {
    returnedUser.value = null
  }
})
</script> -->


<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useAuthStore } from 'src/stores/modules/auth'


// Composables reais para envio OTP
import { useOtpSender } from 'src/composables/useOtpSender'
import { useOtpSenderTwilio } from 'src/composables/useOtpSenderTwilio'

const $q = useQuasar()
const router = useRouter()
const authStore = useAuthStore()


// Dados do formulário
const formData = ref({
  telefone: '',
  mustReturnEmail: true
})

// Estados de controle
const returnedUser = ref(null)
const isLoading = ref(false)
const showNotFoundDialog = ref(false)

// Composables
const { sendOtpViaWhatsApp } = useOtpSender()
const { sendOtpViaTwilio } = useOtpSenderTwilio()

// Função para mascarar nome
const maskNamePart = (name) => {
  if (!name) return ''
  if (name.length <= 2) return name
  if (name.length <= 4) {
    const first = name.charAt(0)
    const last = name.charAt(name.length - 1)
    return first + '*'.repeat(name.length - 2) + last
  }
  const firstTwo = name.slice(0, 2)
  const last = name.charAt(name.length - 1)
  const masked = '*'.repeat(name.length - 3)
  return firstTwo + masked + last
}

// Nome completo mascarado
const maskedFullName = computed(() => {
  if (!returnedUser.value) return ''
  const nome = maskNamePart(returnedUser.value.name)
  const apelido = maskNamePart(returnedUser.value.apelido)
  return `${nome} ${apelido}`
})

// Envio do formulário
const submitForm = async () => {
  if (formData.value.telefone.length === 9) {
    isLoading.value = true
    try {
      const resp = await authStore.findUserByUserNameAndTelefone(formData.value)
      returnedUser.value = resp

      if (!resp) {
        showNotFoundDialog.value = true
      }
    } catch (error) {
      console.log(error)
      showNotFoundDialog.value = true
    } finally {
      isLoading.value = false
    }
  }
}

// Enviar código via WhatsApp
const irParaTelaDeOtp = async () => {
  const codigoOtp = Math.floor(100000 + Math.random() * 900000)
  try {
    await sendOtpViaWhatsApp(formData.value.telefone, codigoOtp)
    localStorage.setItem('otpCode', codigoOtp.toString())
    localStorage.setItem('otpPhone', formData.value.telefone)

    router.push({
      path: '/verify-otp',
      query: { via: 'whatsapp' }
    })
  } catch (e) {
    $q.notify({
      color: 'red',
      position: 'top',
      message: 'Erro ao enviar o código OTP via WhatsApp.' + e,
      icon: 'error'
    })
  }
}

// Enviar código via SMS
const irParaTelaDeOtpSMS = async () => {
  const codigoOtp = Math.floor(100000 + Math.random() * 900000)
  try {
    await sendOtpViaTwilio(formData.value.telefone, codigoOtp)
    localStorage.setItem('otpCode', codigoOtp.toString())
    localStorage.setItem('otpPhone', formData.value.telefone)

    router.push({
      path: '/verif-otp',
      query: { via: 'sms' }
    })
  } catch (e) {
    $q.notify({
      color: 'red',
      position: 'top',
      message: 'Erro ao enviar o código OTP via SMS.' + e,
      icon: 'error'
    })
  }
}

// Resetar formulário
const resetForm = () => {
  formData.value.telefone = ''
  returnedUser.value = null
}

// Limpar conta encontrada ao apagar número
watch(() => formData.value.telefone, (val) => {
  if (!val) {
    returnedUser.value = null
  }
})
</script>

<style scoped>
.auth-card {
  width: 100%;
  max-width: 420px;
  border-radius: 16px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08);
  padding: 30px;
  position: relative;
}

.account-found-section {
  background: rgba(225, 245, 254, 0.5);
  border-radius: 12px;
  padding: 12px;
  border-left: 4px solid var(--q-green-10);
}

.back-btn {
  transition: all 0.3s ease;
}

.back-btn:hover {
  transform: translateX(-3px);
  color: var(--q-green-10);
}

.action-btn {
  transition: all 0.3s ease;
}

.action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.fade-slide-up-enter-active,
.fade-slide-up-leave-active {
  transition: all 0.4s ease;
}

.fade-slide-up-enter-from,
.fade-slide-up-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

@media (max-width: 600px) {
  .auth-card {
    width: 90%;
    padding: 20px;
  }
}
</style>
