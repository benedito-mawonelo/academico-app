<template>
  <div class="forum-layout">
    <app-header @navigate="goTo" />

    <q-page class="forum-page">
      <div class="page-container q-pa-md">
      <!-- Cabeçalho da Página -->
      <div class="page-header q-mb-lg">
        <div class="row items-center justify-between">
          <div>
            <h1 class="page-title">
              <q-icon name="forum" size="lg" class="q-mr-sm" />
              Fórum de Discussões
            </h1>
            <p class="page-subtitle text-grey-7">
              Participe de aulas ao vivo ou assista às gravações
            </p>
          </div>
          <q-btn
            v-if="isInstructor"
            unelevated
            color="primary"
            icon="add"
            label="Agendar Aula"
            size="md"
            @click="showScheduleDialog = true"
          />
        </div>
      </div>

      <!-- Filtros e Pesquisa -->
      <div class="filters-section q-mb-md">
        <q-tabs
          v-model="activeTab"
          class="forum-tabs"
          active-color="primary"
          indicator-color="primary"
          align="left"
          dense
        >
          <q-tab name="live" label="Ao Vivo" :badge="liveClasses.length || undefined" />
          <q-tab name="scheduled" label="Agendadas" :badge="scheduledClasses.length || undefined" />
          <q-tab name="recorded" label="Gravações" :badge="recordedClasses.length || undefined" />
        </q-tabs>

        <div class="row q-mt-md q-gutter-sm">
          <q-input
            v-model="searchQuery"
            outlined
            dense
            placeholder="Pesquisar aulas..."
            class="col-12 col-md-4"
          >
            <template v-slot:prepend>
              <q-icon name="search" />
            </template>
          </q-input>

          <q-select
            v-model="subjectFilter"
            outlined
            dense
            :options="subjectOptions"
            placeholder="Filtrar por matéria"
            class="col-12 col-md-3"
            clearable
          />
        </div>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="text-center q-pa-xl">
        <q-spinner-dots size="xl" color="primary" />
        <p class="text-grey-7 q-mt-md">Carregando aulas...</p>
      </div>

      <!-- Conteúdo das Tabs -->
      <div v-else>
        <!-- Tab: Aulas Ao Vivo -->
        <div v-if="activeTab === 'live'">
          <div v-if="filteredLiveClasses.length === 0" class="empty-state">
            <q-icon name="live_tv" size="xl" color="grey-4" />
            <p class="text-h6 text-grey-6 q-mt-md">Nenhuma aula ao vivo no momento</p>
            <p class="text-grey-7">Verifique as aulas agendadas</p>
          </div>
          <div v-else class="classes-grid">
            <live-class-card
              v-for="classItem in filteredLiveClasses"
              :key="classItem.id"
              :class-data="classItem"
              @join="joinLiveClass"
              @share="shareClass"
              @favorite="toggleFavorite"
            />
          </div>
        </div>

        <!-- Tab: Aulas Agendadas -->
        <div v-if="activeTab === 'scheduled'">
          <div v-if="filteredScheduledClasses.length === 0" class="empty-state">
            <q-icon name="event" size="xl" color="grey-4" />
            <p class="text-h6 text-grey-6 q-mt-md">Nenhuma aula agendada</p>
            <p class="text-grey-7">Novas aulas serão exibidas aqui</p>
          </div>
          <div v-else class="classes-grid">
            <live-class-card
              v-for="classItem in filteredScheduledClasses"
              :key="classItem.id"
              :class-data="classItem"
              :can-start="isInstructor && classItem.instructorId === firebaseAuth.currentUser?.uid"
              @start="startScheduledClass"
              @remind="setReminder"
              @share="shareClass"
              @favorite="toggleFavorite"
            />
          </div>
        </div>

        <!-- Tab: Gravações -->
        <div v-if="activeTab === 'recorded'">
          <div v-if="filteredRecordedClasses.length === 0" class="empty-state">
            <q-icon name="video_library" size="xl" color="grey-4" />
            <p class="text-h6 text-grey-6 q-mt-md">Nenhuma gravação disponível</p>
            <p class="text-grey-7">As aulas gravadas ficarão disponíveis por tempo limitado</p>
          </div>
          <div v-else class="classes-grid">
            <live-class-card
              v-for="classItem in filteredRecordedClasses"
              :key="classItem.id"
              :class-data="classItem"
              @watch="watchRecording"
              @share="shareClass"
              @favorite="toggleFavorite"
            />
          </div>
        </div>
      </div>
      </div>
    </q-page>

    <!-- Footer compacto igual ao Dashboard -->
    <footer class="app-footer-compact">
      <div class="footer-icons-container">
        <q-btn
          flat
          round
          icon="home"
          color="grey-8"
          size="lg"
          class="footer-icon-btn"
          @click="goTo('dashboard')"
        >
          <q-tooltip>Dashboard</q-tooltip>
        </q-btn>
        <q-btn
          flat
          round
          icon="notifications"
          color="grey-8"
          size="lg"
          class="footer-icon-btn"
          @click="goTo('notificacoes')"
        >
          <q-tooltip>Notificações</q-tooltip>
        </q-btn>
        <q-btn
          flat
          round
          icon="person"
          color="grey-8"
          size="lg"
          class="footer-icon-btn"
          @click="goTo('profile')"
        >
          <q-tooltip>Perfil</q-tooltip>
        </q-btn>
      </div>
    </footer>

    <!-- Dialog para Agendar Aula (Professores) -->
    <q-dialog v-model="showScheduleDialog" persistent>
      <q-card style="min-width: 500px">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">Agendar Nova Aula</div>
          <q-space />
          <q-btn icon="close" flat round dense @click="showScheduleDialog = false" />
        </q-card-section>

        <q-card-section>
            <q-form @submit="scheduleClass" class="q-gutter-md">
            <q-input
              v-model="newClass.title"
              label="Título da Aula *"
              outlined
              :rules="[val => !!val || 'Campo obrigatório']"
            />

            <q-input
              v-model="newClass.liveUrl"
              label="Link da Aula (YouTube/Zoom/Meet)"
              outlined
              type="url"
              hint="Cole o link da transmissão ao vivo"
            />

            <q-input
              v-model="newClass.subject"
              label="Matéria *"
              outlined
              :rules="[val => !!val || 'Campo obrigatório']"
            />

            <q-input
              v-model="newClass.description"
              label="Descrição"
              outlined
              type="textarea"
              rows="3"
            />

            <q-input
              v-model="newClass.scheduledFor"
              label="Data e Hora *"
              outlined
              type="datetime-local"
              :rules="[val => !!val || 'Campo obrigatório']"
            />

            <q-input
              v-model.number="newClass.duration"
              label="Duração (minutos)"
              outlined
              type="number"
              min="15"
              max="180"
            />

            <q-select
              v-model="newClass.icon"
              :options="iconOptions"
              label="Ícone"
              outlined
              emit-value
              map-options
            />

            <div class="row justify-end q-gutter-sm">
              <q-btn
                flat
                label="Cancelar"
                color="grey-7"
                @click="showScheduleDialog = false"
              />
              <q-btn
                unelevated
                label="Agendar"
                color="primary"
                type="submit"
                :loading="submitting"
              />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useForumStore } from '../stores/modules/forumService'
import LiveClassCard from '../components/LiveClassCard.vue'
import AppHeader from '../components/AppHeader.vue'

const $q = useQuasar()
const router = useRouter()
const forumStore = useForumStore()

import { firebaseAuth, db } from '../boot/firebase'
import { doc, getDoc } from 'firebase/firestore'

const activeTab = ref('live')
const loading = ref(false)
const searchQuery = ref('')
const subjectFilter = ref(null)
const showScheduleDialog = ref(false)
const submitting = ref(false)
const isInstructor = ref(false)

const subjectOptions = [
  'Matemática',
  'Física',
  'Química',
  'Biologia',
  'História',
  'Geografia',
  'Português',
  'Inglês',
  'Filosofia',
  'Sociologia'
]

const iconOptions = [
  { label: 'Escola', value: 'school' },
  { label: 'Ciência', value: 'science' },
  { label: 'Livro', value: 'menu_book' },
  { label: 'Calculadora', value: 'calculate' },
  { label: 'Química', value: 'biotech' },
  { label: 'Globe', value: 'public' },
  { label: 'História', value: 'history_edu' }
]

const newClass = ref({
  title: '',
  subject: '',
  description: '',
  scheduledFor: '',
  duration: 60,
  icon: 'school',
  liveUrl: ''
})

const liveClasses = computed(() => forumStore.liveClasses)
const scheduledClasses = computed(() => forumStore.scheduledClasses)
const recordedClasses = computed(() => forumStore.recordedClasses)

const filteredLiveClasses = computed(() => {
  return filterClasses(liveClasses.value)
})

const filteredScheduledClasses = computed(() => {
  return filterClasses(scheduledClasses.value)
})

const filteredRecordedClasses = computed(() => {
  return filterClasses(recordedClasses.value)
})

function filterClasses(classes) {
  return classes.filter(c => {
    const matchesSearch = !searchQuery.value || 
      c.title?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      c.subject?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      c.description?.toLowerCase().includes(searchQuery.value.toLowerCase())
    
    const matchesSubject = !subjectFilter.value || c.subject === subjectFilter.value

    return matchesSearch && matchesSubject
  })
}

async function loadClasses() {
  loading.value = true
  try {
    await forumStore.loadAllClasses()
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Erro ao carregar aulas',
      caption: error.message
    })
  } finally {
    loading.value = false
  }
}

async function scheduleClass() {
  submitting.value = true
  try {
    await forumStore.createLiveClass({
      ...newClass.value,
      scheduledFor: new Date(newClass.value.scheduledFor)
    })

    $q.notify({
      type: 'positive',
      message: 'Aula agendada com sucesso!',
      icon: 'check_circle'
    })

    showScheduleDialog.value = false
    resetForm()
    await loadClasses()
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Erro ao agendar aula',
      caption: error.message
    })
  } finally {
    submitting.value = false
  }
}

function resetForm() {
  newClass.value = {
    title: '',
    subject: '',
    description: '',
    scheduledFor: '',
    duration: 60,
    icon: 'school',
    liveUrl: ''
  }
}

async function joinLiveClass(classId) {
  try {
    await forumStore.joinClass(classId)
    // Tenta abrir o link definido pelo professor, se existir
    const classRef = doc(db, 'live_classes', classId)
    const classSnap = await getDoc(classRef)
    if (classSnap.exists()) {
      const data = classSnap.data()
      if (data.liveUrl) {
        window.open(String(data.liveUrl), '_blank')
        return
      }
    }
    // Fallback: sala interna
    router.push(`/forum/live/${classId}`)
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Erro ao entrar na aula',
      caption: error.message
    })
  }
}

async function startScheduledClass(classId) {
  try {
    await forumStore.startLiveClass(classId)
    $q.notify({ type: 'positive', message: 'Aula iniciada' })
    await loadClasses()
    await joinLiveClass(classId)
  } catch (error) {
    $q.notify({ type: 'negative', message: 'Não foi possível iniciar', caption: error.message })
  }
}

async function watchRecording(classId) {
  try {
    const recording = await forumStore.getRecording(classId)
    
    if (recording.recordingUrl) {
      router.push({
        path: '/video-player',
        query: {
          titulo: recording.title,
          descricao: recording.description,
          url: recording.recordingUrl,
          classId: classId
        }
      })
      
      // Marcar como assistido
      await forumStore.markAsWatched(classId)
    } else {
      $q.notify({
        type: 'warning',
        message: 'Gravação ainda não disponível'
      })
    }
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: error.message || 'Erro ao carregar gravação'
    })
  }
}

function setReminder() {
  $q.notify({
    type: 'positive',
    message: 'Lembrete ativado!',
    caption: 'Você receberá uma notificação antes da aula começar',
    icon: 'notifications_active'
  })
}

function shareClass() {
  // TODO: Implementar compartilhamento
  $q.notify({
    type: 'info',
    message: 'Link copiado!',
    caption: 'Compartilhe com seus colegas',
    icon: 'share'
  })
}

function toggleFavorite(data) {
  const message = data.favorite ? 'Adicionado aos favoritos' : 'Removido dos favoritos'
  $q.notify({
    type: 'positive',
    message,
    icon: data.favorite ? 'bookmark' : 'bookmark_border'
  })
}

function goTo(page) {
  router.push(`/${page}`)
}

async function loadUserRole() {
  try {
    const user = firebaseAuth.currentUser
    if (!user) {
      isInstructor.value = false
      return
    }
    const profileRef = doc(db, 'users_academico', user.uid)
    const snap = await getDoc(profileRef)
    if (snap.exists()) {
      const data = snap.data()
      isInstructor.value = data?.role === 'professor' || data?.isAdmin === true
    } else {
      isInstructor.value = false
    }
  } catch (e) {
    console.error('Erro ao carregar role do usuário', e)
    isInstructor.value = false
  }
}

onMounted(async () => {
  await loadUserRole()
  await loadClasses()
  
  // Auto-refresh a cada 30 segundos
  setInterval(async () => {
    await loadClasses()
  }, 30000)
})
</script>

<style scoped lang="scss">
.forum-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.forum-page {
  flex: 1;
}

.page-container {
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  .page-title {
    font-size: 32px;
    font-weight: 700;
    color: #1a1a1a;
    margin: 0;
    display: flex;
    align-items: center;
  }

  .page-subtitle {
    font-size: 16px;
    margin-top: 8px;
  }
}

.filters-section {
  background: white;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.forum-tabs {
  border-bottom: 1px solid #e0e0e0;
}

.classes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.empty-state {
  text-align: center;
  padding: 80px 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

/* Footer compacto igual ao Dashboard */
.app-footer-compact {
  background: white;
  border-top: 1px solid #e0e0e0;
  padding: 12px 0;
  position: sticky;
  bottom: 0;
  z-index: 900;
  box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.08);

  .footer-icons-container {
    display: flex;
    justify-content: space-around;
    align-items: center;
    max-width: 100%;
    padding: 8px 0;

    .footer-icon-btn {
      transition: all 0.3s ease;
      position: relative;
      color: #999 !important;

      &:hover {
        color: var(--q-primary) !important;
        transform: scale(1.1);
      }

      &::after {
        content: '';
        position: absolute;
        bottom: -12px;
        left: 50%;
        transform: translateX(-50%);
        width: 0;
        height: 3px;
        background-color: var(--q-primary);
        border-radius: 3px;
        transition: width 0.3s ease;
      }

      &:hover::after {
        width: 24px;
      }
    }
  }
}

@media (max-width: 768px) {
  .classes-grid {
    grid-template-columns: 1fr;
  }

  .page-header {
    .row {
      flex-direction: column;
      align-items: flex-start !important;
      gap: 16px;
    }
  }
}
</style>
