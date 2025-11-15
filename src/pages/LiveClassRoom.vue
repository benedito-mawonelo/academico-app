<template>
  <q-page class="live-class-room">
    <div class="room-container">
      <!-- Header da Sala -->
      <div class="room-header">
        <div class="header-left">
          <q-btn
            flat
            round
            dense
            icon="arrow_back"
            color="white"
            @click="confirmLeave"
          >
            <q-tooltip>Sair da aula</q-tooltip>
          </q-btn>
          <div class="class-info">
            <div class="class-title">{{ classData.title }}</div>
            <div class="class-meta">
              <q-badge color="red" class="live-badge">
                <q-icon name="fiber_manual_record" size="xs" class="q-mr-xs" />
                AO VIVO
              </q-badge>
              <span class="participants-count">
                <q-icon name="group" size="sm" />
                {{ participants.length }} participantes
              </span>
            </div>
          </div>
        </div>
        <div class="header-right">
          <q-btn
            flat
            round
            dense
            :icon="showChat ? 'chat' : 'chat_bubble_outline'"
            color="white"
            @click="toggleChat"
          >
            <q-badge v-if="unreadMessages > 0" color="red" floating>
              {{ unreadMessages }}
            </q-badge>
            <q-tooltip>{{ showChat ? 'Ocultar chat' : 'Mostrar chat' }}</q-tooltip>
          </q-btn>
          <q-btn
            flat
            round
            dense
            icon="people"
            color="white"
            @click="showParticipants = !showParticipants"
          >
            <q-tooltip>Ver participantes</q-tooltip>
          </q-btn>
        </div>
      </div>

      <!-- Conteúdo Principal -->
      <div class="room-content">
        <!-- Área do Vídeo -->
        <div class="video-area" :class="{ 'with-chat': showChat }">
          <div v-if="externalLiveLink && !videoUrl" class="external-join">
            <q-btn color="positive" icon="open_in_new" label="Abrir link da aula" :href="externalLiveLink" target="_blank" />
          </div>
          <div v-else-if="!videoUrl" class="video-placeholder">
            <q-spinner-dots size="xl" color="white" />
            <p class="text-white q-mt-md">Aguardando transmissão...</p>
          </div>
          <iframe
            v-else
            :src="videoUrl"
            frameborder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen
            class="video-iframe"
          ></iframe>

          <!-- Controles de Vídeo (se for instrutor) -->
          <div v-if="isInstructor" class="instructor-controls">
            <q-btn
              unelevated
              color="red"
              icon="stop"
              label="Encerrar Aula"
              @click="confirmEndClass"
            />
          </div>
        </div>

        <!-- Painel de Chat -->
        <transition name="slide-left">
          <div v-if="showChat" class="chat-panel">
            <div class="chat-header">
              <div class="text-h6">Chat da Aula</div>
              <q-btn
                flat
                round
                dense
                icon="close"
                @click="showChat = false"
              />
            </div>

            <div class="chat-messages" ref="chatMessages">
              <div
                v-for="message in messages"
                :key="message.id"
                class="chat-message"
                :class="{ 'own-message': message.userId === currentUserId }"
              >
                <div class="message-avatar">
                  <q-avatar size="32px" :color="message.color || 'primary'" text-color="white">
                    {{ message.userName?.charAt(0) || 'U' }}
                  </q-avatar>
                </div>
                <div class="message-content">
                  <div class="message-header">
                    <span class="message-author">{{ message.userName }}</span>
                    <span class="message-time">{{ formatTime(message.timestamp) }}</span>
                  </div>
                  <div class="message-text">{{ message.text }}</div>
                </div>
              </div>

              <div v-if="messages.length === 0" class="empty-chat">
                <q-icon name="chat_bubble_outline" size="xl" color="grey-5" />
                <p class="text-grey-6">Seja o primeiro a enviar uma mensagem!</p>
              </div>
            </div>

            <div class="chat-input">
              <q-input
                v-model="newMessage"
                outlined
                dense
                placeholder="Digite sua mensagem..."
                @keyup.enter="sendMessage"
                class="message-input"
              >
                <template v-slot:append>
                  <q-btn
                    flat
                    round
                    dense
                    icon="send"
                    color="primary"
                    @click="sendMessage"
                    :disable="!newMessage.trim()"
                  />
                </template>
              </q-input>
            </div>
          </div>
        </transition>
      </div>

      <!-- Drawer de Participantes -->
      <q-drawer
        v-model="showParticipants"
        side="right"
        overlay
        behavior="mobile"
        :width="300"
        class="participants-drawer"
      >
        <q-scroll-area class="fit">
          <div class="drawer-header">
            <div class="text-h6">Participantes ({{ participants.length }})</div>
            <q-btn
              flat
              round
              dense
              icon="close"
              @click="showParticipants = false"
            />
          </div>

          <q-list>
            <q-item
              v-for="participant in participants"
              :key="participant.id"
              class="participant-item"
            >
              <q-item-section avatar>
                <q-avatar :color="participant.color || 'primary'" text-color="white">
                  {{ participant.userName?.charAt(0) || 'U' }}
                </q-avatar>
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ participant.userName }}</q-item-label>
                <q-item-label caption>
                  Entrou às {{ formatTime(participant.joinedAt) }}
                </q-item-label>
              </q-item-section>
              <q-item-section side v-if="participant.userId === classData.instructorId">
                <q-chip dense color="accent" text-color="white" size="sm">
                  Professor
                </q-chip>
              </q-item-section>
            </q-item>
          </q-list>
        </q-scroll-area>
      </q-drawer>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useForumStore } from '../stores/modules/forumService'
import { firebaseAuth, db } from '../boot/firebase'
import { doc, getDoc } from 'firebase/firestore'
import { date } from 'quasar'

const $q = useQuasar()
const route = useRoute()
const router = useRouter()
const forumStore = useForumStore()

const classId = route.params.classId
const currentUserId = ref(firebaseAuth.currentUser?.uid)

const classData = ref({
  title: 'Carregando...',
  instructorId: null
})

const videoUrl = ref('')
const externalLiveLink = ref('')
const showChat = ref(true)
const showParticipants = ref(false)
const isInstructor = ref(false)

const messages = ref([])
const newMessage = ref('')
const unreadMessages = ref(0)
const chatMessages = ref(null)

const participants = ref([])

async function loadClassData() {
  try {
    const ref = doc(db, 'live_classes', classId)
    const snap = await getDoc(ref)
    if (!snap.exists()) {
      $q.notify({ type: 'negative', message: 'Aula não encontrada' })
      router.push('/forum')
      return
    }
    const data = snap.data()
    classData.value = { id: snap.id, ...data }
  } catch (e) {
    $q.notify({ type: 'negative', message: 'Erro ao carregar aula', caption: e.message })
    router.push('/forum')
  }
}

onMounted(async () => {
  await loadClassData()
  await loadParticipants()
  isInstructor.value = currentUserId.value === classData.value.instructorId

  // Definir origem do vídeo ao vivo
  const liveUrl = classData.value.liveUrl
  if (liveUrl) {
    const lower = String(liveUrl).toLowerCase()
    if (lower.includes('youtube.com') || lower.includes('youtu.be')) {
      videoUrl.value = toYouTubeEmbed(liveUrl)
    } else if (lower.includes('vimeo.com')) {
      videoUrl.value = toVimeoEmbed(liveUrl)
    } else if (lower.includes('meet.google.com') || lower.includes('zoom.us') || lower.includes('teams.microsoft.com')) {
      externalLiveLink.value = liveUrl
    }
  } else if (classData.value.recordingUrl) {
    videoUrl.value = classData.value.recordingUrl
  }

  // Mensagens iniciais vazias
  messages.value = []
})

onUnmounted(async () => {
  // Registrar que o usuário saiu
  await forumStore.leaveClass(classId)
})

async function loadParticipants() {
  try {
    const participantsList = await forumStore.loadParticipants(classId)
    participants.value = participantsList.map(p => ({
      ...p,
      color: getRandomColor()
    }))
  } catch (error) {
    console.error('Erro ao carregar participantes:', error)
  }
}

function sendMessage() {
  if (!newMessage.value.trim()) return

  const message = {
    id: Date.now().toString(),
    userId: currentUserId.value,
    userName: firebaseAuth.currentUser?.displayName || 'Você',
    text: newMessage.value,
    timestamp: new Date(),
    color: 'primary'
  }

  messages.value.push(message)
  newMessage.value = ''

  // Scroll para a última mensagem
  nextTick(() => {
    if (chatMessages.value) {
      chatMessages.value.scrollTop = chatMessages.value.scrollHeight
    }
  })

  // TODO: Enviar mensagem para Firebase Realtime Database
}

function toggleChat() {
  showChat.value = !showChat.value
  if (showChat.value) {
    unreadMessages.value = 0
  }
}

function confirmLeave() {
  $q.dialog({
    title: 'Sair da aula',
    message: 'Tem certeza que deseja sair da aula ao vivo?',
    cancel: true,
    persistent: true
  }).onOk(() => {
    router.push('/forum')
  })
}

async function confirmEndClass() {
  $q.dialog({
    title: 'Encerrar aula',
    message: 'Deseja encerrar a aula e criar uma gravação?',
    cancel: true,
    persistent: true
  }).onOk(async () => {
    try {
      await forumStore.endLiveClass(classId, videoUrl.value)
      $q.notify({
        type: 'positive',
        message: 'Aula encerrada com sucesso!',
        caption: 'A gravação ficará disponível por 30 dias'
      })
      router.push('/forum')
    } catch (error) {
      $q.notify({
        type: 'negative',
        message: 'Erro ao encerrar aula',
        caption: error.message
      })
    }
  })
}

function formatTime(timestamp) {
  if (!timestamp) return ''
  const d = timestamp instanceof Date ? timestamp : timestamp.toDate?.() || new Date(timestamp)
  return date.formatDate(d, 'HH:mm')
}

function toYouTubeEmbed(url) {
  try {
    const u = new URL(url)
    if (u.hostname.includes('youtu.be')) {
      const id = u.pathname.replace('/', '')
      return `https://www.youtube.com/embed/${id}`
    }
    const id = u.searchParams.get('v')
    return id ? `https://www.youtube.com/embed/${id}` : url
  } catch { return url }
}

function toVimeoEmbed(url) {
  try {
    const match = url.match(/vimeo\.com\/(?:video\/)?(\d+)/)
    return match ? `https://player.vimeo.com/video/${match[1]}` : url
  } catch { return url }
}

function getRandomColor() {
  const colors = ['primary', 'secondary', 'accent', 'positive', 'negative', 'info', 'warning']
  return colors[Math.floor(Math.random() * colors.length)]
}
</script>

<style scoped lang="scss">
.live-class-room {
  background: #1a1a1a;
  height: 100vh;
  overflow: hidden;
}

.room-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.room-header {
  background: rgba(0, 0, 0, 0.8);
  padding: 16px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);

  .header-left {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .class-info {
    .class-title {
      color: white;
      font-size: 18px;
      font-weight: 600;
    }

    .class-meta {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-top: 4px;

      .participants-count {
        color: rgba(255, 255, 255, 0.7);
        font-size: 14px;
        display: flex;
        align-items: center;
        gap: 4px;
      }
    }
  }

  .header-right {
    display: flex;
    gap: 8px;
  }
}

.live-badge {
  animation: pulse-badge 2s infinite;
}

@keyframes pulse-badge {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

.room-content {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.video-area {
  flex: 1;
  background: #000;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;

  &.with-chat {
    flex: 0 0 calc(100% - 400px);
  }
}

.video-placeholder {
  text-align: center;
}

.video-iframe {
  width: 100%;
  height: 100%;
}

.instructor-controls {
  position: absolute;
  bottom: 24px;
  right: 24px;
}

.chat-panel {
  width: 400px;
  background: #2a2a2a;
  display: flex;
  flex-direction: column;
  border-left: 1px solid rgba(255, 255, 255, 0.1);
}

.chat-header {
  padding: 16px;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);

  .text-h6 {
    color: white;
    font-size: 16px;
  }
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.chat-message {
  display: flex;
  gap: 12px;
  animation: fadeIn 0.3s;

  &.own-message {
    flex-direction: row-reverse;

    .message-content {
      align-items: flex-end;
      background: rgba(33, 150, 243, 0.2);
    }
  }
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.message-content {
  flex: 1;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 8px 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.message-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
}

.message-author {
  color: rgba(255, 255, 255, 0.9);
  font-weight: 600;
  font-size: 13px;
}

.message-time {
  color: rgba(255, 255, 255, 0.5);
  font-size: 11px;
}

.message-text {
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
  word-wrap: break-word;
}

.empty-chat {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  opacity: 0.5;
}

.chat-input {
  padding: 16px;
  background: rgba(0, 0, 0, 0.3);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.message-input {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
}

.participants-drawer {
  background: #2a2a2a;
}

.drawer-header {
  padding: 16px;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);

  .text-h6 {
    color: white;
    font-size: 16px;
  }
}

.participant-item {
  color: white;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.slide-left-enter-active,
.slide-left-leave-active {
  transition: all 0.3s ease;
}

.slide-left-enter-from {
  transform: translateX(100%);
}

.slide-left-leave-to {
  transform: translateX(100%);
}

@media (max-width: 768px) {
  .video-area.with-chat {
    flex: 1;
  }

  .chat-panel {
    position: absolute;
    right: 0;
    top: 60px;
    bottom: 0;
    width: 100%;
    max-width: 350px;
    z-index: 1000;
  }
}
</style>
