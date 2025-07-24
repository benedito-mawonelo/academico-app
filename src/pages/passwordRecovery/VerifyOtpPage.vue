<template>
  <q-page class="bg-grey-1 flex flex-center">
    <q-card class="auth-card">
      <q-card-section class="text-center">
        <q-avatar size="80px" color="green-10" text-color="white" icon="sms" />
        <div class="text-h4 text-weight-bold text-green-10 q-mt-md">Verificação</div>
        <div class="text-subtitle1 text-grey-7 q-mt-sm">
          Digite o código de 6 dígitos enviado para
          <span class="text-weight-medium">+258 {{ phoneNumber }}</span>
        </div>
      </q-card-section>

      <q-card-section>
        <q-form @submit.prevent="verifyOtp" class="q-gutter-md">
          <div class="otp-inputs">
            <q-input
              v-for="n in 6"
              :key="n"
              v-model="otp[n-1]"
              type="text"
              maxlength="1"
              outlined
              input-class="text-center"
              color="green-10"
              @keyup="focusNext(n, $event)"
              @keydown.delete="focusPrev(n, $event)"
              @paste="handlePaste"
              ref="otpInputs"
            />
          </div>

          <div class="text-center q-mt-md">
            <q-btn
              flat
              label="Reenviar código"
              color="green-10"
              @click="resendOtp"
              :disable="resendCooldown > 0"
            />
            <div v-if="resendCooldown > 0" class="text-caption text-grey-7 q-mt-xs">
              Pode reenviar em {{ resendCooldown }}s
            </div>
          </div>

          <q-btn
            label="Verificar"
            type="submit"
            color="green-10"
            text-color="white"
            class="full-width"
            size="lg"
            unelevated
            :loading="loading"
            :disable="!isOtpComplete"
          >
            <template v-slot:loading>
              <q-spinner-hourglass class="on-left" />
              Verificando...
            </template>
          </q-btn>
        </q-form>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const route = useRoute()
const router = useRouter()
const phoneNumber = ref(route.query.phone || '')
const otp = ref(Array(6).fill(''))
const otpInputs = ref([])
const loading = ref(false)
const resendCooldown = ref(30)

const isOtpComplete = computed(() => {
  return otp.value.every(digit => digit !== '')
})

onMounted(() => {
  startCooldown()
  if (otpInputs.value[0]) {
    otpInputs.value[0].focus()
  }
})

const startCooldown = () => {
  const timer = setInterval(() => {
    resendCooldown.value--
    if (resendCooldown.value <= 0) {
      clearInterval(timer)
    }
  }, 1000)
}

const focusNext = (index, event) => {
  if (event.keyCode >= 48 && event.keyCode <= 57 || event.keyCode >= 96 && event.keyCode <= 105) {
    if (index < 6 && otpInputs.value[index]) {
      otpInputs.value[index].focus()
    }
  }
}

const focusPrev = (index, event) => {
  if (event.keyCode === 8 && otp.value[index-1] === '') {
    if (index > 1 && otpInputs.value[index-2]) {
      otpInputs.value[index-2].focus()
    }
  }
}

const handlePaste = (event) => {
  const pasteData = event.clipboardData.getData('text').trim()
  if (/^\d{6}$/.test(pasteData)) {
    otp.value = pasteData.split('').slice(0, 6)
    event.preventDefault()
  }
}

const resendOtp = () => {
  resendCooldown.value = 30
  startCooldown()
  // Lógica para reenviar OTP
}

const verifyOtp = async () => {
  loading.value = true
  // const otpCode = otp.value.join('')

  // Simulação de verificação
  setTimeout(() => {
    loading.value = false
    router.push({
      path: '/otp-success',
      query: { phone: phoneNumber.value }
    })
  }, 1500)
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

.otp-inputs {
  display: flex;
  justify-content: center;
  gap: 10px;

  .q-field {
    width: 40px;

    .q-field__control {
      height: 50px;
      min-width: 0;
    }

    input {
      font-size: 18px;
      font-weight: bold;
    }
  }
}

@media (max-width: 600px) {
  .auth-card {
    width: 90%;
    padding: 20px;
  }

  .otp-inputs {
    gap: 8px;

    .q-field {
      width: 35px;
    }
  }
}
</style>
