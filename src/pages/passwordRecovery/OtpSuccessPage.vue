<template>
  <q-page class="bg-grey-1 flex flex-center">
    <q-card class="auth-card text-center">
      <q-card-section>
        <q-icon name="check_circle" color="green" size="80px" />
        <div class="text-h4 text-weight-bold text-green-10 q-mt-md">Verificado!</div>
        <div class="text-subtitle1 text-grey-7 q-mt-sm">
          Seu número +258 {{ phoneNumber }} foi verificado com sucesso
        </div>
      </q-card-section>

      <q-card-section>
        <q-btn
          label="Redefinir Senha"
          color="green-10"
          text-color="white"
          class="full-width"
          size="lg"
          unelevated
          @click="goToResetPassword"
        />
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
import { useRouter, useRoute } from 'vue-router'
import { ref } from 'vue'


const route = useRoute()
const router = useRouter()
const phoneNumber = ref(route.query.phone || '')

const goToResetPassword = () => {
  router.push({
    path: '/reset-password',
    query: { phone: phoneNumber.value }
  })
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
