<template>
  <div class="auth-container">
    <div class="auth-card">
      <!-- Botão voltar -->
      <q-btn
        label="Voltar"
        color="green-10"
        icon="arrow_back"
        class="back-btn"
        @click="goBack"
      />

      <!-- Logotipos -->
      <div class="logo-container">
        <img src="mwlogo.png" alt="Logo MW" class="logo" />
        <img src="cflogo.png" alt="Logo CF" class="logo" />
      </div>

      <!-- Formulário -->
      <div class="form-container">
        <!-- Nome -->
        <q-input outlined label="Nome" v-model="form.name" color="green-10" class="form-input" />

        <!-- Apelido -->
        <q-input outlined label="Apelido" v-model="form.apelido" color="green-10" class="form-input" />
<!-- Celular -->
        <q-input
          outlined
          label="Celular"
          color="green-10"
          v-model="form.telefone"
          class="form-input"
          prefix="(+258)"
          type="tel"
          :error="telefoneEmUso"
          error-message="Este número já está em uso"
        >
          <template v-slot:append>
            <q-icon name="error" color="red" v-if="telefoneEmUso" />
          </template>
        </q-input>


        <!-- Sexo e Ano de nascimento -->
        <div class="row-container">
          <q-select
            outlined
            v-model="form.gender"
            :options="sexos"
            label="Sexo"
            color="green-10"
            class="form-select"
          />
          <q-select
            outlined
            v-model="form.birthYear"
            :options="anosNascimento"
            label="Ano de nascimento"
            color="green-10"
            class="form-select"
          />
        </div>


        <!-- Província -->
        <q-select
          outlined
          color="green-10"
          v-model="form.provincia"
          :options="provincias"
          label="Província"
          class="form-input"
        />


          <!-- Email -->
        <q-input outlined label="Email (opcional)" v-model="form.email" color="green-10" class="form-input" />


        <!-- Palavra Passe -->
        <q-input
          ref="senhaRef"
          outlined
          v-model="form.password"
          color="green-10"
          label="Palavra-Passe"
          :type="showPassword ? 'text' : 'password'"
          class="form-input"
          @focus="scrollToInput('senhaRef')"
        >
          <template v-slot:append>
            <q-icon
              :name="showPassword ? 'visibility_off' : 'visibility'"
              class="cursor-pointer"
              @click="showPassword = !showPassword"
            />
          </template>
        </q-input>

        <!-- Confirmar Palavra Passe -->
        <q-input
          ref="confirmSenhaRef"
          outlined
          color="green-10"
          v-model="form.confirmPassword"
          label="Confirmar palavra-passe"
          :type="showPassword ? 'text' : 'password'"
          class="form-input"
          @focus="scrollToInput('confirmSenhaRef')"
        >
          <template v-slot:append>
            <q-icon
              :name="showPassword ? 'visibility_off' : 'visibility'"
              class="cursor-pointer"
              @click="showPassword = !showPassword"
            />
          </template>
        </q-input>

        <!-- Botão Criar conta -->
        <q-btn
          label="Criar conta"
          color="green-10"
          class="submit-btn"
          @click="criarConta"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from 'stores/modules/auth'; // ajuste o path se necessário
const store = useAuthStore();
// import { useStore } from 'vuex';

const router = useRouter();
// const store = useStore();

const form = ref({
  name: '',
  apelido: '',
  gender: '',
  birthYear: '',
  provincia: '',
  telefone: '',
  email: '',
  password: '',
  confirmPassword: '',
  image: null
});

const telefoneEmUso = ref(false);
const showPassword = ref(false);
const senhaRef = ref(null);
const confirmSenhaRef = ref(null);

const sexos = ['Masculino', 'Feminino'];
const anoAtual = new Date().getFullYear();
const anosNascimento = Array.from({ length: 63 }, (_, i) => `${anoAtual - 18 - i}`).filter(ano => (anoAtual - parseInt(ano)) >= 18 && (anoAtual - parseInt(ano)) <= 80);
const provincias = ['Maputo', 'Matola', 'Gaza', 'Inhambane', 'Sofala', 'Manica', 'Tete', 'Zambézia', 'Nampula', 'Niassa', 'Cabo Delgado'];

function goBack() {
  router.back();
}

function scrollToInput(refName) {
  nextTick(() => {
    const el = {
      senhaRef: senhaRef.value?.$el,
      confirmSenhaRef: confirmSenhaRef.value?.$el
    }[refName];

    if (el?.scrollIntoView) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  });
}

async function criarConta() {
  const exists = await store.findUserByTelefone(form.value);
  telefoneEmUso.value = !!exists;

  if (!telefoneEmUso.value) {
    const TrueEmail = form.value.email || ''
    const telefoneEmail = form.value.telefone + '@gmail.com'
    const payload = {
       ...form.value,
      email: telefoneEmail,
      email_true: TrueEmail};
    // delete payload.confirmPassword;
    // payload.email = payload.email || payload.telefone + '@gmail.com';

    const success = await store.registerUser(payload);

    if (success) {
      router.push({ path:'upload-photo', query: { id: success.id } });
    } else {
      console.error('Erro ao registrar o usuário');
    }
  }
}


</script>

<style scoped>
.auth-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 20px;
  background-color: #f5f5f5;
}

.auth-card {
  width: 100%;
  max-width: 450px;
  background: white;
  border-radius: 16px;
  padding: 30px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.back-btn {
  margin-bottom: 20px;
  border-radius: 10px;
}

.logo-container {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 40px;
  margin-bottom: 30px;
}

.logo {
  height: 70px;
  width: auto;
}

.form-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-input, .form-select {
  width: 100%;
}

.row-container {
  display: flex;
  gap: 10px;
  width: 100%;
}

.row-container .form-select {
  flex: 1;
}

.submit-btn {
  width: 100%;
  border-radius: 10px;
  height: 48px;
  font-size: 16px;
  margin-top: 10px;
}

/* Responsividade */
@media (max-width: 600px) {
  .auth-card {
    padding: 20px;
    width: 95%;
  }

  .logo-container {
    gap: 20px;
  }

  .logo {
    height: 60px;
  }

  .row-container {
    flex-direction: column;
    gap: 16px;
  }
}
</style>
