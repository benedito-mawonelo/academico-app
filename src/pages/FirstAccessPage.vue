<template>
  <q-page class="bg-grey-1 flex flex-center">
    <q-card class="q-pa-lg shadow-10" style="min-width: 320px; max-width: 500px; width: 100%; border-radius: 16px">
      <q-card-section class="text-center">
        <q-avatar size="80px" class="q-mb-sm" color="green-10" text-color="white" icon="school" />
        <div class="text-h4 text-weight-bold text-green-10">Complete seu Perfil</div>
        <!-- <div class="text-subtitle1 text-grey-7 q-mt-sm">Ajude-nos a personalizar sua experiência acadêmica</div> -->
        <div class="text-subtitle1 text-grey-7 q-mt-sm">Para receber o material da sua àrea</div>

      </q-card-section>

      <q-card-section>
        <q-form @submit.prevent="handleSubmit" class="q-gutter-md">
          <q-select
            v-model="nivel"
            label="Nível Acadêmico"
            :options="niveis"
            emit-value
            map-options
            outlined
            dense
            bg-color="white"
            :rules="[val => !!val || 'Campo obrigatório']"
            @update:model-value="updateCursos"
          >
            <template v-slot:prepend>
              <q-icon name="school" color="green-10" />
            </template>
          </q-select>

          <q-select
            v-model="curso"
            label="Curso que está frequentando"
            :options="cursosDisponiveis"
            emit-value
            map-options
            outlined
            dense
            bg-color="white"
            :rules="[val => !!val || 'Campo obrigatório']"
            :disable="!nivel"
          >
            <template v-slot:prepend>
              <q-icon name="menu_book" color="green-10" />
            </template>
          </q-select>

          <q-input
            v-model="instituicao"
            label="Instituição de Ensino"
            outlined
            dense
            bg-color="white"
            :rules="[val => !!val || 'Campo obrigatório']"
          >
            <template v-slot:prepend>
              <q-icon name="account_balance" color="green-10" />
            </template>
          </q-input>

          <q-select
            v-model="ano"
            label="Ano Acadêmico"
            :options="anos"
            emit-value
            map-options
            outlined
            dense
            bg-color="white"
            :rules="[val => !!val || 'Campo obrigatório']"
          >
            <template v-slot:prepend>
              <q-icon name="calendar_today" color="green-10" />
            </template>
          </q-select>

          <q-btn
            label="Continuar"
            type="submit"
            color="green-10"
            text-color="white"
            class="full-width q-mt-md"
            :loading="loading"
            size="md"
            unelevated
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
import { useRouter } from 'vue-router'
import { getAuth } from 'firebase/auth'
import { doc, setDoc } from 'firebase/firestore'
import { db } from 'boot/firebase' // ou ajuste o caminho conforme seu projeto

const router = useRouter()

const nivel = ref(null)
const curso = ref(null)
const instituicao = ref('')
const ano = ref(null)
const loading = ref(false)

const niveis = [
  { label: 'Ensino Médio', value: 'ensino_medio' },
  { label: 'Licenciatura', value: 'graduacao' },
  { label: 'Pós-graduação', value: 'pos' },
  { label: 'Mestrado', value: 'mestrado' },
  { label: 'Doutorado', value: 'doutorado' }
]

const cursos = {
  ensino_medio: [
    { label: 'Ensino Médio Regular', value: 'medio_regular' },
    { label: 'Ensino Médio Técnico', value: 'medio_tecnico' },
    { label: 'Ensino Médio Integrado', value: 'medio_integrado' }
  ],
  graduacao: [
    { label: 'Administração', value: 'administracao' },
    { label: 'Ciência da Computação', value: 'cc' },
    { label: 'Direito', value: 'direito' },
    { label: 'Engenharia Civil', value: 'eng_civil' },
    { label: 'Medicina', value: 'medicina' },
    { label: 'Psicologia', value: 'psicologia' }
  ],
  pos: [
    { label: 'MBA em Gestão', value: 'mba_gestao' },
    { label: 'Especialização em Direito', value: 'espec_direito' }
  ],
  mestrado: [
    { label: 'Mestrado Acadêmico', value: 'mestrado_academico' },
    { label: 'Mestrado Profissional', value: 'mestrado_profissional' }
  ],
  doutorado: [
    { label: 'Doutorado', value: 'doutorado' }
  ]
}

const anos = [
  { label: '1º Ano', value: '1' },
  { label: '2º Ano', value: '2' },
  { label: '3º Ano', value: '3' },
  { label: '4º Ano', value: '4' },
  { label: '5º Ano', value: '5' },
  { label: 'Outro', value: 'outro' }
]

const cursosDisponiveis = computed(() => {
  return nivel.value ? cursos[nivel.value] : []
})

function updateCursos() {
  curso.value = null
}

const handleSubmit = async () => {
  loading.value = true
  try {
    const auth = getAuth()
    const user = auth.currentUser

    if (!user) throw new Error('Usuário não autenticado.')

    const docRef = doc(db, 'users_academico', user.uid)

    await setDoc(docRef, {
      nivel: nivel.value,
      curso: curso.value,
      instituicao: instituicao.value,
      ano: ano.value,
      preenchidoEm: new Date()
    }, { merge: true })

    router.push('/dashboard')
  } catch (error) {
    console.error('Erro ao salvar dados:', error)
    alert('Erro ao salvar seus dados. Tente novamente.')
  } finally {
    loading.value = false
  }
}
</script>

<style lang="scss" scoped>
.q-card {
  transition: transform 0.3s ease;

  &:hover {
    transform: translateY(-5px);
  }
}

.q-field--outlined .q-field__control:before {
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.q-btn {
  transition: all 0.3s ease;
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
</style>
