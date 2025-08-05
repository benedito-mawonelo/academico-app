<template>
  <div class="app-layout">
    <!-- <app-header @navigate="goTo" /> -->
    <q-page class="main-content">
      <div class="hero-section">
        <div class="hero-content">
          <h1 class="hero-title animate__animated animate__fadeInDown">
            <span class="hero-highlight">Criar Conta</span>
            <span class="hero-subtitle">Junte-se à Loja Acadêmica</span>
          </h1>
        </div>
      </div>

      <div class="auth-container">
        <q-card flat bordered class="auth-card shadow-4 animate__animated animate__fadeIn">
          <q-card-section>
            <!-- Logotipos -->
            <div class="logo-container">
              <img src="/mwlogo.png" alt="Logo MW" class="logo" />
              <img src="/cflogo.png" alt="Logo CF" class="logo" />
            </div>

            <!-- Formulário -->
            <div class="form-container">
              <div class="row q-col-gutter-md">
                <!-- Nome -->
                <div class="col-12 col-md-6">
                  <q-input
                    v-model="form.name"
                    label="Nome"
                    outlined
                    dense
                    bg-color="white"
                    color="green-10"
                    :rules="[val => !!val || 'Nome é obrigatório']"
                    class="form-input"
                  />
                </div>
                <!-- Apelido -->
                <div class="col-12 col-md-6">
                  <q-input
                    v-model="form.apelido"
                    label="Apelido"
                    outlined
                    dense
                    bg-color="white"
                    color="green-10"
                    :rules="[val => !!val || 'Apelido é obrigatório']"
                    class="form-input"
                  />
                </div>
                <!-- Celular -->
                <div class="col-12">
                  <q-input
                    v-model="form.telefone"
                    label="Celular"
                    outlined
                    dense
                    bg-color="white"
                    color="green-10"
                    prefix="(+258)"
                    type="tel"
                    mask="#########"
                    :rules="[val => !!val || 'Celular é obrigatório', val => /^\d{9}$/.test(val) || 'Número inválido']"
                    :error="telefoneEmUso"
                    error-message="Este número já está em uso"
                    class="form-input"
                  >
                    <template v-slot:append>
                      <q-icon name="error" color="red" v-if="telefoneEmUso" />
                    </template>
                  </q-input>
                </div>
                <!-- Sexo e Ano de Nascimento -->
                <div class="col-12 col-md-6">
                  <q-select
                    v-model="form.gender"
                    :options="sexos"
                    label="Sexo (opcional)"
                    outlined
                    dense
                    bg-color="white"
                    color="green-10"
                    :rules="[val => !!val || 'Sexo é obrigatório']"
                    class="form-select"
                  />
                </div>
                <div class="col-12 col-md-6">
                  <q-select
                    v-model="form.birthYear"
                    :options="anosNascimento"
                    label="Ano de Nascimento"
                    outlined
                    dense
                    bg-color="white"
                    color="green-10"
                    :rules="[val => !!val || 'Ano é obrigatório']"
                    class="form-select"
                  />
                </div>
                <!-- Província -->
                <div class="col-12">
                  <q-select
                    v-model="form.provincia"
                    :options="provincias"
                    label="Província"
                    outlined
                    dense
                    bg-color="white"
                    color="green-10"
                    :rules="[val => !!val || 'Província é obrigatória']"
                    class="form-input"
                  />
                </div>
                <!-- Email -->
                <div class="col-12">
                  <q-input
                    v-model="form.email"
                    label="Email (opcional)"
                    type="email"
                    outlined
                    dense
                    bg-color="white"
                    color="green-10"
                    :rules="[val => !val || /.+@.+\..+/.test(val) || 'Email inválido']"
                    class="form-input"
                  />
                </div>
                <!-- Palavra-Passe -->
                <div class="col-12">
                  <q-input
                    ref="senhaRef"
                    v-model="form.password"
                    label="Palavra-Passe"
                    outlined
                    dense
                    bg-color="white"
                    color="green-10"
                    :type="showPassword ? 'text' : 'password'"
                    :rules="[val => !!val || 'Palavra-passe é obrigatória', val => val.length >= 6 || 'Mínimo 6 caracteres']"
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
                </div>
                <!-- Confirmar Palavra-Passe -->
                <div class="col-12">
                  <q-input
                    ref="confirmSenhaRef"
                    v-model="form.confirmPassword"
                    label="Confirmar Palavra-Passe"
                    outlined
                    dense
                    bg-color="white"
                    color="green-10"
                    :type="showPassword ? 'text' : 'password'"
                    :rules="[val => !!val || 'Confirmação é obrigatória', val => val === form.password || 'Senhas não coincidem']"
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
                </div>
              </div>

              <!-- Botões -->
              <q-btn
                label="Criar Conta"
                color="green-10"
                class="submit-btn full-width q-mt-md"
                @click="criarConta"
                :loading="submitting"
              />
              <q-btn
                label="Voltar"
                color="grey-8"
                flat
                rounded
                class="full-width q-mt-sm"
                @click="goBack"
              />
            </div>
          </q-card-section>
        </q-card>
      </div>
    </q-page>
    <!-- <app-footer /> -->
  </div>
</template>

<script setup>
import { ref, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { useAuthStore } from 'stores/modules/auth';
// import AppHeader from 'components/AppHeader.vue';
// import AppFooter from 'components/AppFooter.vue';

const $q = useQuasar();
const router = useRouter();
const store = useAuthStore();

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
const submitting = ref(false);
const senhaRef = ref(null);
const confirmSenhaRef = ref(null);

const sexos = ['Masculino', 'Feminino'];
const anoAtual = new Date().getFullYear();
const anosNascimento = Array.from({ length: 63 }, (_, i) => `${anoAtual - 18 - i}`)
  .filter(ano => (anoAtual - parseInt(ano)) >= 18 && (anoAtual - parseInt(ano)) <= 80);
const provincias = ['Cabo Delgado', 'Gaza', 'Inhambane', 'Manica', 'Maputo', 'Matola', 'Nampula', 'Niassa', 'Sofala', 'Tete', 'Zambézia'];

function goBack() {
  router.back();
}

// function goTo(page) {
//   router.push(`/${page}`);
// }

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
  submitting.value = true;
  try {
    const exists = await store.findUserByTelefone(form.value);
    telefoneEmUso.value = !!exists;

    if (telefoneEmUso.value) {
      $q.notify({
        type: 'negative',
        message: 'Este número já está em uso.',
        position: 'top'
      });
      return;
    }

    const TrueEmail = form.value.email || '';
    const telefoneEmail = form.value.telefone + '@gmail.com';
    const payload = {
      ...form.value,
      email: telefoneEmail,
      email_true: TrueEmail,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const success = await store.registerUser(payload);

    if (success) {
      $q.notify({
        type: 'positive',
        message: 'Conta criada com sucesso!',
        position: 'top'
      });
      router.push({ path: 'upload-photo', query: { id: success.id } });
    } else {
      throw new Error('Erro ao registrar o usuário.');
    }
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Erro ao criar conta',
      caption: error?.message || '',
      position: 'top'
    });
  } finally {
    submitting.value = false;
  }
}
</script>
<style lang="scss" scoped>
.app-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: #F0F4F8; /* Light gray background, similar to Monica AI's likely clean aesthetic */
}

.main-content {
  flex: 1;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0;
}

.hero-section {
  background: linear-gradient(135deg, #2E7D32 0%, #81C784 100%); /* Your project's green gradient */
  color: #FFFFFF;
  padding: 40px 24px;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiPjxkZWZzPjxwYXR0ZXJuIGlkPSJwYXR0ZXJuIiB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiIHBhdHRlcm5UcmFuc2Zvcm09InJvdGF0ZSg0NSkiPjxyZWN0IHdpZHRoPSIyMCIgaGVpZ2h0PSI2MCIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjA4KSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3QgZmlsbD0idXJsKCNwYXR0ZXJuKSIgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIvPjwvc3ZnPg==');
    opacity: 0.3;
  }
}

.hero-content {
  position: relative;
  z-index: 1;
  max-width: 1200px;
  margin: 0 auto;
  text-align: left;
}

.hero-title {
  font-size: 2.2rem;
  font-weight: 700;
  line-height: 1.2;
  margin-bottom: 16px;

  .hero-highlight {
    display: block;
    text-shadow: 0 3px 6px rgba(0, 0, 0, 0.2);
  }

  .hero-subtitle {
    display: block;
    font-size: 1.4rem;
    font-weight: 400;
    opacity: 0.9;
    margin-top: 8px;
  }
}

.auth-container {
  padding: 32px;
  display: flex;
  justify-content: center;
}

.auth-card {
  border-radius: 16px;
  background: #FFFFFF; /* White card background, matching Monica AI's clean design */
  max-width: 600px;
  width: 100%;
  padding: 24px;
  border: 1px solid #E5E7EB; /* Light gray border for subtle definition */
}

.logo-container {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 32px;
  margin-bottom: 24px;
}

.logo {
  height: 60px;
  width: auto;
  transition: transform 0.3s ease;

  &:hover {
    transform: scale(1.05);
  }
}

.form-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-input, .form-select {
  transition: all 0.3s ease;

  &:hover {
    background-color: #E8F5E9; /* Light green hover effect, inspired by Monica AI's potential highlights */
  }
}

.submit-btn {
  background-color: #4CAF50; /* Green for primary action, aligning with your theme and Monica AI's likely success states */
  transition: all 0.3s ease;

  &:hover {
    background-color: #2E7D32 !important; /* Darker green on hover */
  }
}

.q-btn.grey-8 {
  color: #616161; /* Neutral gray for secondary button, matching Monica AI's likely secondary tones */
}

@media (max-width: 600px) {
  .hero-title {
    font-size: 1.8rem;

    .hero-subtitle {
      font-size: 1.2rem;
    }
  }

  .auth-container {
    padding: 16px;
  }

  .auth-card {
    padding: 16px;
  }

  .logo-container {
    gap: 16px;
  }

  .logo {
    height: 50px;
  }
}

@media (max-width: 480px) {
  .form-container {
    gap: 12px;
  }

  .form-input, .form-select {
    font-size: 0.9rem;
  }

  .submit-btn {
    height: 40px;
    font-size: 14px;
  }
}
</style>

<!-- <style lang="scss" scoped>
.app-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: linear-gradient(to bottom, #f0f4f8, #ffffff);
}

.main-content {
  flex: 1;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0;
}

.hero-section {
  background: linear-gradient(135deg, #2E7D32 0%, #81C784 100%);
  color: white;
  padding: 40px 24px;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiPjxkZWZzPjxwYXR0ZXJuIGlkPSJwYXR0ZXJuIiB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiIHBhdHRlcm5UcmFuc2Zvcm09InJvdGF0ZSg0NSkiPjxyZWN0IHdpZHRoPSIyMCIgaGVpZ2h0PSI2MCIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjA4KSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3QgZmlsbD0idXJsKCNwYXR0ZXJuKSIgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIvPjwvc3ZnPg==');
    opacity: 0.3;
  }
}

.hero-content {
  position: relative;
  z-index: 1;
  max-width: 1200px;
  margin: 0 auto;
  text-align: left;
}

.hero-title {
  font-size: 2.2rem;
  font-weight: 700;
  line-height: 1.2;
  margin-bottom: 16px;

  .hero-highlight {
    display: block;
    text-shadow: 0 3px 6px rgba(0, 0, 0, 0.2);
  }

  .hero-subtitle {
    display: block;
    font-size: 1.4rem;
    font-weight: 400;
    opacity: 0.9;
    margin-top: 8px;
  }
}

.auth-container {
  padding: 32px;
  display: flex;
  justify-content: center;
}

.auth-card {
  border-radius: 16px;
  background: white;
  max-width: 600px;
  width: 100%;
  padding: 24px;
}

.logo-container {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 32px;
  margin-bottom: 24px;
}

.logo {
  height: 60px;
  width: auto;
  transition: transform 0.3s ease;

  &:hover {
    transform: scale(1.05);
  }
}

.form-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-input, .form-select {
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
  }
}

.submit-btn {
  transition: all 0.3s ease;

  &:hover {
    background-color: #1a3c1f !important;
  }
}

@media (max-width: 600px) {
  .hero-title {
    font-size: 1.8rem;

    .hero-subtitle {
      font-size: 1.2rem;
    }
  }

  .auth-container {
    padding: 16px;
  }

  .auth-card {
    padding: 16px;
  }

  .logo-container {
    gap: 16px;
  }

  .logo {
    height: 50px;
  }
}

@media (max-width: 480px) {
  .form-container {
    gap: 12px;
  }

  .form-input, .form-select {
    font-size: 0.9rem;
  }

  .submit-btn {
    height: 40px;
    font-size: 14px;
  }
}
</style> -->
