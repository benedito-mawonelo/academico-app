<template>
  <q-page class="bg-grey-1 flex flex-center">
    <q-card class="auth-card text-center">
      <q-card-section>
        <q-icon name="check_circle" color="green" size="80px" />
        <div class="text-h4 text-weight-bold text-green-10 q-mt-md">Senha Redefinida!</div>
        <div class="text-subtitle1 text-grey-7 q-mt-sm q-mb-lg">
          Sua senha foi alterada com sucesso
        </div>

        <q-btn
          label="Fazer Login"
          color="green-10"
          text-color="white"
          class="full-width"
          size="lg"
          unelevated
          @click="$router.push('/login')"
        />
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
// import { useRouter } from 'vue-router'

// const router = useRouter()
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
