<template>
  <q-page class="profile-page">
    <!-- Header verde com avatar central -->
    <div class="profile-hero">
      <div class="hero-actions">
        <q-btn flat round dense icon="arrow_back" class="action-left" @click="goBack" />
        <q-btn flat round dense icon="logout" class="action-right" @click="logout" />
      </div>
      <div class="profile-hero-inner">
        <q-avatar size="96px" class="profile-avatar">
          <img v-if="user.image" :src="user.image" alt="avatar" />
          <q-icon v-else name="account_circle" size="96px" />
        </q-avatar>
      </div>
    </div>

    <div class="content-container q-pa-md">
      <!-- Cartão de Assinaturas -->
      <q-card flat bordered class="q-mb-md rounded-12">
        <q-card-section class="text-subtitle1 text-weight-bold">Minhas Assinaturas</q-card-section>
        <q-separator />
        <q-card-section class="subscription-box">
          <div class="row items-center justify-between">
            <div>
              <div class="text-weight-bold">{{ subscription.name }}</div>
              <div class="text-caption text-grey-8">{{ formatDate(subscription.start) }} - {{ formatDate(subscription.end) }}</div>
              <div class="text-caption text-positive q-mt-xs">{{ daysLeft }} dias restantes</div>
            </div>
            <div class="row items-center q-gutter-sm">
              <q-badge color="positive" class="q-px-sm" outline v-if="daysLeft > 0">ATIVO</q-badge>
              <q-badge color="negative" class="q-px-sm" outline v-else>EXPIRADO</q-badge>
              <q-btn color="primary" dense label="RENOVAR" @click="onRenew" />
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- Lista de campos do perfil -->
      <q-card flat bordered class="rounded-12">
        <q-list separator>
          <q-item>
            <q-item-section top class="text-grey-7">Nome Completo</q-item-section>
            <q-item-section>{{ user.name }}</q-item-section>
          <q-item-section side>
              <q-btn flat round dense icon="edit" @click="openEdit('name')" />
            </q-item-section>
          </q-item>
          <q-item>
            <q-item-section top class="text-grey-7">Apelido</q-item-section>
            <q-item-section>{{ user.apelido }}</q-item-section>
            <q-item-section side>
              <q-btn flat round dense icon="edit" @click="openEdit('apelido')" />
            </q-item-section>
          </q-item>
          <q-item>
            <q-item-section top class="text-grey-7">Telefone</q-item-section>
            <q-item-section>{{ user.telefone }}</q-item-section>
            <q-item-section side>
              <q-btn flat round dense icon="edit" @click="openEdit('telefone')" />
            </q-item-section>
          </q-item>
          <q-item>
            <q-item-section top class="text-grey-7">Gênero</q-item-section>
            <q-item-section>{{ user.genero }}</q-item-section>
            <q-item-section side>
              <q-btn flat round dense icon="edit" @click="openEdit('genero')" />
            </q-item-section>
          </q-item>
          <q-item>
            <q-item-section top class="text-grey-7">Ano de Nascimento</q-item-section>
            <q-item-section>{{ user.anoNascimento }}</q-item-section>
            <q-item-section side>
              <q-btn flat round dense icon="edit" @click="openEdit('anoNascimento')" />
            </q-item-section>
          </q-item>
          <q-item>
            <q-item-section top class="text-grey-7">Província</q-item-section>
            <q-item-section>{{ user.provincia }}</q-item-section>
            <q-item-section side>
              <q-btn flat round dense icon="edit" @click="openEdit('provincia')" />
            </q-item-section>
          </q-item>
        </q-list>
        <q-separator />
        <div class="row justify-center q-pa-md">
          <q-btn outline color="negative" label="ELIMINAR MINHA CONTA" disable />
        </div>
      </q-card>
    </div>
    <q-dialog v-model="editDialogOpen">
      <q-card style="min-width: 320px">
        <q-card-section class="text-h6">Editar</q-card-section>
        <q-card-section>
          <q-input v-model="editValue" :type="inputType" :label="inputLabel" dense outlined />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancelar" v-close-popup />
          <q-btn color="primary" label="Salvar" :loading="saving" @click="saveEdit" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { onAuthStateChanged } from 'firebase/auth'
import { firebaseAuth, db } from 'boot/firebase'
import { signOut } from 'firebase/auth'
import { doc, getDoc, updateDoc } from 'firebase/firestore'

const user = ref({
  name: '',
  apelido: '',
  telefone: '',
  genero: '',
  anoNascimento: '',
  provincia: '',
  image: ''
})

// Mock de assinatura (substituir por dados reais quando existirem)
const subscription = ref({
  name: 'Ganha Fácil',
  start: new Date(),
  end: new Date(Date.now() + 36 * 24 * 60 * 60 * 1000)
})

const daysLeft = computed(() => {
  const now = new Date()
  const end = subscription.value.end
  const diff = Math.ceil((end - now) / (1000 * 60 * 60 * 24))
  return Math.max(diff, 0)
})

const editDialogOpen = ref(false)
const fieldBeingEdited = ref('')
const editValue = ref('')
const saving = ref(false)
const currentUserId = ref('')
const inputLabel = computed(() => {
  const m = {
    name: 'Nome Completo',
    apelido: 'Apelido',
    telefone: 'Telefone',
    genero: 'Gênero',
    anoNascimento: 'Ano de Nascimento',
    provincia: 'Província'
  }
  return m[fieldBeingEdited.value] || 'Valor'
})
const inputType = computed(() => {
  return ['telefone', 'anoNascimento'].includes(fieldBeingEdited.value) ? 'number' : 'text'
})

const router = useRouter()

function goBack() {
  router.back()
}

async function logout() {
  try {
    await signOut(firebaseAuth)
    router.push('/login')
  } catch (e) {
    console.error(e)
  }
}

function openEdit(field) {
  fieldBeingEdited.value = field
  editValue.value = user.value[field] || ''
  editDialogOpen.value = true
}

async function saveEdit() {
  if (!currentUserId.value || !fieldBeingEdited.value) return
  try {
    saving.value = true
    const dref = doc(db, 'users_academico', currentUserId.value)
    await updateDoc(dref, { [fieldBeingEdited.value]: editValue.value })
    user.value[fieldBeingEdited.value] = editValue.value
    editDialogOpen.value = false
  } catch (e) {
    console.error(e)
  } finally {
    saving.value = false
  }
}

function onRenew () {
  // ação de renovação (placeholder)
}

function formatDate (val) {
  try {
    const d = val instanceof Date ? val : val?.toDate?.() || new Date(val)
    return d.toLocaleDateString('pt-PT')
  } catch { return '' }
}

onMounted(async () => {
  onAuthStateChanged(firebaseAuth, async (authUser) => {
    if (authUser) {
      try {
        currentUserId.value = authUser.uid
        const dref = doc(db, 'users_academico', authUser.uid)
        const snap = await getDoc(dref)
        if (snap.exists()) {
          const data = snap.data()
          user.value = {
            name: data.name || '',
            apelido: data.apelido || '',
            telefone: data.telefone || '',
            genero: data.genero || data.gender || '',
            anoNascimento: data.anoNascimento || data.birthYear || '',
            provincia: data.provincia || '',
            image: data.image || ''
          }
        }
      } catch (e) { console.error(e) }
    }
  })
})
</script>

<script>
export default {}
</script>

<style scoped>
.profile-page{ background: #f5f6f8; }
.profile-hero{ height: 140px; background: linear-gradient(135deg,#2E7D32,#66BB6A); border-bottom-left-radius: 16px; border-bottom-right-radius: 16px; position: relative; }
.hero-actions{ position: absolute; top: 8px; left: 12px; right: 12px; display: flex; justify-content: space-between; z-index: 2; }
.action-left{ }
.action-right{ }
.profile-hero-inner{ position: absolute; left: 50%; bottom: -48px; transform: translateX(-50%); }
.profile-avatar{ border: 4px solid #fff; box-shadow: 0 6px 20px rgba(0,0,0,.15); background: #fff; }
.content-container{ max-width: 1100px; margin: 64px auto 24px; }
.subscription-box{ background: #f4faf4; border-radius: 10px; border: 1px solid #e6f1e6; }
.rounded-12{ border-radius: 12px; }
</style>
