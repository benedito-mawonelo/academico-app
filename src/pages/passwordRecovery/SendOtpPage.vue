<template>
  <q-page class="bg-grey-1 flex flex-center">
    <q-card class="auth-card">
      <q-card-section class="text-center">
        <q-avatar size="80px" color="green-10" text-color="white" icon="vpn_key" />
        <div class="text-h4 text-weight-bold text-green-10 q-mt-md">Redefinir Senha</div>
        <div class="text-subtitle1 text-grey-7 q-mt-sm">Digite seu número para receber o código de verificação</div>
      </q-card-section>

      <q-card-section>
        <q-form @submit.prevent="sendOtp" class="q-gutter-md">
          <q-input
            v-model="phoneNumber"
            label="Número de Celular"
            outlined
            bg-color="white"
            color="green-10"
            mask="(##) #####-####"
            unmasked-value
            :rules="[
              val => !!val || 'Número é obrigatório',
              val => val.length === 11 || 'Número inválido'
            ]"
          >
            <template v-slot:prepend>
              <q-icon name="phone" color="green-10" />
            </template>
            <template v-slot:append>
              <q-icon v-if="phoneNumber.length === 11" name="check_circle" color="green" />
            </template>
          </q-input>

          <q-btn
            label="Enviar Código"
            type="submit"
            color="green-10"
            text-color="white"
            class="full-width"
            size="lg"
            unelevated
            :loading="loading"
            :disable="phoneNumber.length !== 11"
          >
            <template v-slot:loading>
              <q-spinner-hourglass class="on-left" />
              Enviando...
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
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const phoneNumber = ref('')
const loading = ref(false)
const router = useRouter()

const sendOtp = async () => {
  loading.value = true

  // Simulação de envio de OTP
  setTimeout(() => {
    loading.value = false
    router.push({
      path: '/verify-otp',
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

@media (max-width: 600px) {
  .auth-card {
    width: 90%;
    padding: 20px;
  }
}
</style>
