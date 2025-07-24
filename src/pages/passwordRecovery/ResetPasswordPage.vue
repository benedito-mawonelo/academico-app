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

<script setup>
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
