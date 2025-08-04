<template>
  <q-page class="q-pa-lg bg-grey-1">
    <div class="row q-col-gutter-xl">
      <!-- Player e informações -->
      <div class="col-12 col-lg-8">
        <!-- Player de vídeo -->
        <div v-if="loading" class="q-pa-md flex flex-center">
          <q-spinner color="green" size="3em" />
        </div>
        <div v-else class="video-container shadow-4 rounded-borders q-mb-lg">
          <q-responsive :ratio="16/9">
            <iframe
              :src="embedUrl"
              frameborder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowfullscreen
              class="full-width full-height"
            ></iframe>
          </q-responsive>
        </div>

        <!-- Informações do vídeo -->
        <div class="video-info">
          <h1 class="text-h4 text-weight-bold text-green q-mb-sm">{{ video.titulo }}</h1>
          <div class="text-subtitle1 text-grey-8 q-mb-md">{{ video.descricao }}</div>

          <!-- Estatísticas e ações -->
          <div class="row items-center q-mb-lg">
            <div class="col-auto q-pr-md">
              <span class="text-subtitle2 text-grey-8">{{ video.duracao }} min</span>
              <span class="text-grey-6 q-mx-sm">•</span>
              <span class="text-subtitle2 text-grey-8">{{ formatDate(video.createdAt) }}</span>
            </div>
            <div class="col-auto q-ml-auto">
              <q-btn-group flat rounded>
                <q-btn color="green" icon="thumb_up" label="Curtir" dense @click="likeVideo" />
                <q-btn color="grey-8" icon="thumb_down" label="Não curtir" dense @click="dislikeVideo" />
              </q-btn-group>
            </div>
          </div>

          <!-- Botões de ação -->
          <div class="action-buttons q-mb-xl">
            <q-btn
              v-for="btn in actionButtons"
              :key="btn.label"
              flat
              round
              :icon="btn.icon"
              :color="btn.color"
              size="md"
              class="q-mr-md"
              @click="btn.action"
            >
              <q-tooltip class="bg-green text-white">{{ btn.label }}</q-tooltip>
            </q-btn>
            <q-btn
              flat
              round
              icon="more_vert"
              color="grey-8"
              size="md"
            />
          </div>

          <!-- Dúvidas -->
          <div class="comments-section">
            <div class="text-h5 text-weight-bold text-green q-mb-md">Dúvidas ({{ duvidas.length }})</div>

            <!-- Input para nova dúvida -->
            <div class="comment-input q-mb-lg">
              <q-avatar size="40px" class="q-mr-md" v-if="user.isLoaded">
                <img :src="user.avatar || 'https://ui-avatars.com/api/?name=' + user.name" />
              </q-avatar>
              <q-input
                v-model="novaDuvida"
                placeholder="Adicione uma dúvida..."
                outlined
                dense
                rounded
                class="full-width"
                bg-color="white"
                :disable="!user.isLoaded"
                :rules="[val => !!val.trim() || 'Escreva sua dúvida']"
              />
            </div>
            <q-btn
              color="green"
              label="Enviar Dúvida"
              rounded
              class="q-mb-xl"
              @click="adicionarDuvida"
              :disable="!novaDuvida.trim() || !user.isLoaded"
              :loading="saving"
            />

            <!-- Lista de dúvidas -->
            <div class="comment-list">
              <q-card
                v-for="(duvida, index) in duvidas"
                :key="duvida.id"
                class="comment-item q-mb-md bg-white shadow-2"
                flat
                bordered
              >
                <q-card-section class="q-pa-md">
                  <div class="row items-start">
                    <q-avatar size="40px" class="q-mr-md">
                      <img :src="duvida.userPhoto || `https://ui-avatars.com/api/?name=${duvida.userName}`" />
                    </q-avatar>
                    <div class="comment-content flex-1">
                      <!-- Modo de edição para dúvida -->
                      <div v-if="editingDuvidaId === duvida.id">
                        <q-input
                          v-model="editDuvidaTexto"
                          outlined
                          dense
                          rounded
                          class="q-mb-sm"
                          :rules="[val => !!val.trim() || 'Escreva sua dúvida']"
                        />
                        <div class="row q-gutter-sm">
                          <q-btn
                            color="green"
                            label="Salvar"
                            rounded
                            size="sm"
                            @click="salvarEdicaoDuvida(duvida.id)"
                            :loading="saving"
                          />
                          <q-btn
                            flat
                            color="grey-8"
                            label="Cancelar"
                            rounded
                            size="sm"
                            @click="cancelarEdicao"
                          />
                        </div>
                      </div>
                      <!-- Modo de visualização para dúvida -->
                      <div v-else>
                        <div class="text-subtitle1 text-weight-bold text-green">{{ duvida.userName || `Usuário ${index + 1}` }}</div>
                        <div class="text-body2 text-grey-9 q-mb-xs">{{ duvida.texto }}</div>
                        <div class="text-caption text-grey-7">{{ formatDate(duvida.createdAt) }}</div>
                        <!-- Ações do comentário -->
                        <div class="comment-actions q-mt-sm" v-if="user.isLoaded">
                          <q-btn
                            flat
                            dense
                            color="green"
                            label="Responder"
                            size="sm"
                            @click="toggleResponder(duvida.id, null)"
                          />
                          <q-btn
                            v-if="duvida.userId === auth.currentUser?.uid"
                            flat
                            dense
                            color="green"
                            label="Editar"
                            size="sm"
                            @click="editarDuvida(duvida)"
                          />
                          <q-btn
                            v-if="duvida.respostas?.length"
                            flat
                            dense
                            color="green"
                            :label="collapsed[duvida.id] ? `Mostrar ${duvida.respostas.length} respostas` : `Ocultar respostas`"
                            size="sm"
                            @click="toggleCollapse(duvida.id)"
                          />
                        </div>
                      </div>

                      <!-- Input para nova resposta à dúvida -->
                      <div v-if="respondendoDuvidaId === duvida.id && !respondendoRespostaId" class="response-input q-mt-md q-ml-lg">
                        <q-avatar size="32px" class="q-mr-md">
                          <img :src="user.avatar || 'https://ui-avatars.com/api/?name=' + user.name" />
                        </q-avatar>
                        <q-input
                          v-model="novaResposta"
                          placeholder="Escreva sua resposta..."
                          outlined
                          dense
                          rounded
                          class="full-width"
                          :rules="[val => !!val.trim() || 'Escreva sua resposta']"
                        />
                        <q-btn
                          color="green"
                          label="Enviar Resposta"
                          rounded
                          size="sm"
                          class="q-mt-sm"
                          @click="adicionarResposta(duvida.id, null)"
                          :disable="!novaResposta.trim()"
                          :loading="saving"
                        />
                      </div>

                      <!-- Lista de respostas -->
                      <div v-if="duvida.respostas?.length && !collapsed[duvida.id]" class="responses-list q-ml-lg q-mt-md">
                        <div
                          v-for="resposta in duvida.respostas"
                          :key="resposta.id"
                          class="response-item q-mb-sm"
                        >
                          <q-avatar size="32px" class="q-mr-md">
                            <img :src="resposta.userPhoto || `https://ui-avatars.com/api/?name=${resposta.userName}`" />
                          </q-avatar>
                          <div class="response-content flex-1">
                            <!-- Modo de edição para resposta -->
                            <div v-if="editingRespostaId === resposta.id">
                              <q-input
                                v-model="editRespostaTexto"
                                outlined
                                dense
                                rounded
                                class="q-mb-sm"
                                :rules="[val => !!val.trim() || 'Escreva sua resposta']"
                              />
                              <div class="row q-gutter-sm">
                                <q-btn
                                  color="green"
                                  label="Salvar"
                                  rounded
                                  size="sm"
                                  @click="salvarEdicaoResposta(duvida.id, resposta.id)"
                                  :loading="saving"
                                />
                                <q-btn
                                  flat
                                  color="grey-8"
                                  label="Cancelar"
                                  rounded
                                  size="sm"
                                  @click="cancelarEdicaoResposta"
                                />
                              </div>
                            </div>
                            <!-- Modo de visualização para resposta -->
                            <div v-else>
                              <div class="text-subtitle2 text-weight-bold text-green">{{ resposta.userName }}</div>
                              <div class="text-body2 text-grey-9">{{ resposta.texto }}</div>
                              <div class="text-caption text-grey-7">{{ formatDate(resposta.createdAt) }}</div>
                              <!-- Ações da resposta -->
                              <div class="response-actions q-mt-sm" v-if="user.isLoaded">
                                <q-btn
                                  flat
                                  dense
                                  color="green"
                                  label="Responder"
                                  size="sm"
                                  @click="toggleResponder(duvida.id, resposta.id)"
                                />
                                <q-btn
                                  v-if="resposta.userId === auth.currentUser?.uid"
                                  flat
                                  dense
                                  color="green"
                                  label="Editar"
                                  size="sm"
                                  @click="editarResposta(resposta)"
                                />
                              </div>
                            </div>

                            <!-- Input para nova resposta à resposta -->
                            <div v-if="respondendoDuvidaId === duvida.id && respondendoRespostaId === resposta.id" class="response-input q-mt-sm q-ml-md">
                              <q-avatar size="28px" class="q-mr-md">
                                <img :src="user.avatar || 'https://ui-avatars.com/api/?name=' + user.name" />
                              </q-avatar>
                              <q-input
                                v-model="novaResposta"
                                placeholder="Escreva sua resposta..."
                                outlined
                                dense
                                rounded
                                class="full-width"
                                :rules="[val => !!val.trim() || 'Escreva sua resposta']"
                              />
                              <q-btn
                                color="green"
                                label="Enviar Resposta"
                                rounded
                                size="sm"
                                class="q-mt-sm"
                                @click="adicionarResposta(duvida.id, resposta.id)"
                                :disable="!novaResposta.trim()"
                                :loading="saving"
                              />
                            </div>

                            <!-- Lista de respostas aninhadas -->
                            <div v-if="resposta.respostas?.length" class="nested-responses q-ml-md q-mt-sm">
                              <div
                                v-for="nestedResposta in resposta.respostas"
                                :key="nestedResposta.id"
                                class="response-item q-mb-sm"
                              >
                                <q-avatar size="28px" class="q-mr-md">
                                  <img :src="nestedResposta.userPhoto || `https://ui-avatars.com/api/?name=${nestedResposta.userName}`" />
                                </q-avatar>
                                <div class="response-content">
                                  <div class="text-subtitle2 text-weight-bold text-green">{{ nestedResposta.userName }}</div>
                                  <div class="text-body2 text-grey-9">{{ nestedResposta.texto }}</div>
                                  <div class="text-caption text-grey-7">{{ formatDate(nestedResposta.createdAt) }}</div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </q-card-section>
              </q-card>
            </div>
          </div>
        </div>
      </div>

      <!-- Vídeos relacionados -->
      <div class="col-12 col-lg-4">
        <div class="related-videos">
          <div class="text-h5 text-weight-bold text-green q-mb-md">Vídeos Relacionados</div>

          <q-card
            v-for="item in relacionados"
            :key="item.id"
            class="related-video-item q-mb-md bg-white shadow-2"
            flat
            bordered
            @click="playOutro(item)"
          >
            <q-img
              :src="`https://img.youtube.com/vi/${getVideoId(item.url)}/mqdefault.jpg`"
              :ratio="16/9"
              class="rounded-borders"
            >
              <div class="absolute-full flex flex-center">
                <q-icon name="play_circle" size="xl" color="white" />
              </div>
            </q-img>
            <q-card-section class="q-pa-md">
              <div class="text-subtitle1 text-weight-bold text-green">{{ item.titulo }}</div>
              <div class="text-caption text-grey-8">{{ item.descricao }}</div>
              <div class="text-caption text-grey-7">{{ item.duracao }} min • {{ formatDate(item.createdAt) }}</div>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { collection, getDocs, query, orderBy, where, addDoc, doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore'
import { db } from 'boot/firebase'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const route = useRoute()
const router = useRouter()
const auth = getAuth()

const video = ref({
  id: route.query.id || '',
  titulo: route.query.titulo || 'Carregando...',
  descricao: route.query.descricao || 'Sem descrição disponível',
  url: route.query.url || 'https://www.youtube.com/watch?v=i-qT5n_5Mys',
  temaId: route.query.temaId || '',
  duracao: route.query.duracao || '0',
  createdAt: route.query.createdAt ? new Date(route.query.createdAt) : new Date()
})
const novaDuvida = ref('')
const duvidas = ref([])
const relacionados = ref([])
const user = ref({
  name: '',
  apelido: '',
  instituicao: '',
  curso: '',
  avatar: '',
  provincia: '',
  telefone: '',
  email: '',
  isLoaded: false
})
const novaResposta = ref('')
const respondendoDuvidaId = ref(null)
const respondendoRespostaId = ref(null)
const editingDuvidaId = ref(null)
const editingRespostaId = ref(null)
const editDuvidaTexto = ref('')
const editRespostaTexto = ref('')
const saving = ref(false)
const loading = ref(false)
const collapsed = ref({})

const embedUrl = computed(() => {
  const videoId = getVideoId(video.value.url)
  return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`
})

const actionButtons = [
  { icon: 'bookmark', color: 'grey-7', label: 'Salvar', action: () => alert('Salvar vídeo') },
  { icon: 'share', color: 'grey-7', label: 'Compartilhar', action: () => alert('Compartilhar vídeo') },
  { icon: 'download', color: 'grey-7', label: 'Download', action: () => alert('Download vídeo') },
  { icon: 'playlist_add', color: 'grey-7', label: 'Adicionar à lista', action: () => alert('Adicionar à lista') }
]

async function loadUserData(authUser) {
  if (authUser) {
    const docRef = doc(db, 'users_academico', authUser.uid)
    const docSnap = await getDoc(docRef)
    if (docSnap.exists()) {
      const data = docSnap.data()
      user.value = {
        name: data.name || '',
        apelido: data.apelido || '',
        instituicao: data.instituicao || '',
        curso: data.curso || '',
        avatar: data.image || authUser.photoURL || 'https://randomuser.me/api/portraits/men/32.jpg',
        provincia: data.provincia || '',
        telefone: data.telefone || '',
        email: data.email || authUser.email || '',
        isLoaded: true
      }
    } else {
      $q.notify({
        type: 'negative',
        message: 'Perfil do usuário não encontrado. Complete seu perfil.',
        position: 'top'
      })
      router.push('/profile')
    }
  } else {
    user.value = { name: 'Não logado', isLoaded: false }
  }
}

async function loadVideoData() {
  loading.value = true
  try {
    // Valida o videoId
    if (!video.value.id) {
      $q.notify({
        type: 'negative',
        message: 'ID do vídeo não fornecido.',
        position: 'top'
      })
      router.push('/cadeiras/')
      return
    }

    // Carrega o vídeo específico
    const videoQuery = query(
      collection(db, 'videoaulas'),
      where('id', '==', video.value.id)
    )
    const videoDoc = await getDocs(videoQuery)
    if (!videoDoc.empty) {
      const data = videoDoc.docs[0].data()
      video.value = {
        id: videoDoc.docs[0].id,
        titulo: data.titulo,
        descricao: data.descricao,
        url: data.url,
        temaId: data.temaId,
        duracao: data.duracao,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date()
      }
    } else {
      $q.notify({
        type: 'negative',
        message: 'Vídeo não encontrado.',
        position: 'top'
      })
      router.push('/cadeiras/')
      return
    }

    // Carrega vídeos relacionados (mesmo temaId)
    if (video.value.temaId) {
      const relatedQuery = query(
        collection(db, 'videoaulas'),
        where('temaId', '==', video.value.temaId),
        where('id', '!=', video.value.id),
        orderBy('ordem')
      )
      const relatedSnapshot = await getDocs(relatedQuery)
      relacionados.value = relatedSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate ? doc.data().createdAt.toDate() : new Date()
      }))
    }

    // Carrega dúvidas associadas ao vídeo
    const duvidasQuery = query(
      collection(db, 'duvidas'),
      where('videoId', '==', video.value.id),
      orderBy('createdAt', 'desc')
    )
    const duvidasSnapshot = await getDocs(duvidasQuery)
    duvidas.value = duvidasSnapshot.docs.map(doc => {
      const data = doc.data()
      // Garante que respostas seja um array
      const respostas = Array.isArray(data.respostas) ? data.respostas : []
      if (!Array.isArray(data.respostas)) {
        console.warn(`Dúvida ${doc.id} tem respostas inválidas:`, data.respostas)
      }
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
        updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : null,
        respostas: respostas.map(resposta => ({
          ...resposta,
          createdAt: resposta.createdAt?.toDate ? resposta.createdAt.toDate() : new Date(),
          respostas: Array.isArray(resposta.respostas) ? resposta.respostas.map(nestedResposta => ({
            ...nestedResposta,
            createdAt: nestedResposta.createdAt?.toDate ? nestedResposta.createdAt.toDate() : new Date()
          })) : []
        }))
      }
    })

    // Inicializa o estado de colapso para cada dúvida
    duvidas.value.forEach(duvida => {
      collapsed.value[duvida.id] = true // Colapsado por padrão
    })

    if (relacionados.value.length === 0) {
      $q.notify({
        message: 'Nenhum vídeo relacionado encontrado.',
        color: 'warning',
        icon: 'info',
        position: 'top'
      })
    }
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Erro ao carregar dados do vídeo',
      caption: error?.message || '',
      position: 'top'
    })
    console.error('Erro em loadVideoData:', error)
  } finally {
    loading.value = false
  }
}

async function adicionarDuvida() {
  if (!user.value.isLoaded) {
    $q.notify({
      type: 'negative',
      message: 'Você precisa estar logado e com perfil completo para enviar uma dúvida.',
      position: 'top'
    })
    router.push('/profile')
    return
  }
  if (!novaDuvida.value.trim()) return

  saving.value = true
  try {
    const duvidaRef = await addDoc(collection(db, 'duvidas'), {
      videoId: video.value.id,
      temaId: video.value.temaId,
      userId: auth.currentUser.uid,
      userName: capitalizeWords(`${user.value.name} ${user.value.apelido}`.trim()) || 'Anônimo',
      userPhoto: user.value.avatar || null,
      texto: novaDuvida.value.trim(),
      createdAt: new Date(),
      respostas: []
    })
    duvidas.value.unshift({
      id: duvidaRef.id,
      videoId: video.value.id,
      temaId: video.value.temaId,
      userId: auth.currentUser.uid,
      userName: capitalizeWords(`${user.value.name} ${user.value.apelido}`.trim()) || 'Anônimo',
      userPhoto: user.value.avatar || null,
      texto: novaDuvida.value.trim(),
      createdAt: new Date(),
      respostas: []
    })
    collapsed.value[duvidaRef.id] = true
    novaDuvida.value = ''
    $q.notify({
      message: 'Dúvida enviada com sucesso!',
      color: 'positive',
      position: 'top'
    })
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Erro ao enviar dúvida',
      caption: error?.message || '',
      position: 'top'
    })
  } finally {
    saving.value = false
  }
}

async function adicionarResposta(duvidaId, parentRespostaId) {
  if (!user.value.isLoaded) {
    $q.notify({
      type: 'negative',
      message: 'Você precisa estar logado para responder.',
      position: 'top'
    })
    router.push('/profile')
    return
  }
  if (!novaResposta.value.trim()) return

  saving.value = true
  try {
    const resposta = {
      id: `${Date.now()}-${auth.currentUser.uid}`,
      userId: auth.currentUser.uid,
      userName: capitalizeWords(`${user.value.name} ${user.value.apelido}`.trim()) || 'Anônimo',
      userPhoto: user.value.avatar || null,
      texto: novaResposta.value.trim(),
      createdAt: new Date(),
      respostas: []
    }

    const duvidaRef = doc(db, 'duvidas', duvidaId)
    const duvidaIndex = duvidas.value.findIndex(d => d.id === duvidaId)

    if (parentRespostaId) {
      // Adicionar resposta aninhada
      const respostaIndex = duvidas.value[duvidaIndex].respostas.findIndex(r => r.id === parentRespostaId)
      if (respostaIndex !== -1) {
        const updateObj = {}
        updateObj[`respostas.${respostaIndex}.respostas`] = arrayUnion(resposta)
        await updateDoc(duvidaRef, updateObj)

        if (!duvidas.value[duvidaIndex].respostas[respostaIndex].respostas) {
          duvidas.value[duvidaIndex].respostas[respostaIndex].respostas = []
        }
        duvidas.value[duvidaIndex].respostas[respostaIndex].respostas.unshift({
          ...resposta,
          createdAt: new Date(resposta.createdAt)
        })
      }
    } else {
      // Adicionar resposta direta à dúvida
      await updateDoc(duvidaRef, {
        respostas: arrayUnion(resposta)
      })

      if (!duvidas.value[duvidaIndex].respostas) {
        duvidas.value[duvidaIndex].respostas = []
      }
      duvidas.value[duvidaIndex].respostas.unshift({
        ...resposta,
        createdAt: new Date(resposta.createdAt),
        respostas: []
      })
    }

    collapsed.value[duvidaId] = false // Expande ao adicionar resposta
    novaResposta.value = ''
    respondendoDuvidaId.value = null
    respondendoRespostaId.value = null
    $q.notify({
      message: 'Resposta enviada com sucesso!',
      color: 'positive',
      position: 'top'
    })
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Erro ao enviar resposta',
      caption: error?.message || '',
      position: 'top'
    })
  } finally {
    saving.value = false
  }
}

function toggleResponder(duvidaId, respostaId) {
  if (respondendoDuvidaId.value === duvidaId && respondendoRespostaId.value === respostaId) {
    respondendoDuvidaId.value = null
    respondendoRespostaId.value = null
    novaResposta.value = ''
  } else {
    respondendoDuvidaId.value = duvidaId
    respondendoRespostaId.value = respostaId
    novaResposta.value = ''
  }
}

function toggleCollapse(duvidaId) {
  collapsed.value = {
    ...collapsed.value,
    [duvidaId]: !collapsed.value[duvidaId]
  }
}

function editarDuvida(duvida) {
  editingDuvidaId.value = duvida.id
  editDuvidaTexto.value = duvida.texto
}

function editarResposta(resposta) {
  editingRespostaId.value = resposta.id
  editRespostaTexto.value = resposta.texto
}

async function salvarEdicaoDuvida(duvidaId) {
  if (!editDuvidaTexto.value.trim()) {
    $q.notify({
      type: 'negative',
      message: 'A dúvida não pode estar vazia.',
      position: 'top'
    })
    return
  }

  saving.value = true
  try {
    const duvidaRef = doc(db, 'duvidas', duvidaId)
    await updateDoc(duvidaRef, {
      texto: editDuvidaTexto.value.trim(),
      updatedAt: new Date()
    })

    const duvidaIndex = duvidas.value.findIndex(d => d.id === duvidaId)
    if (duvidaIndex !== -1) {
      duvidas.value[duvidaIndex].texto = editDuvidaTexto.value.trim()
      duvidas.value[duvidaIndex].updatedAt = new Date()
    }

    cancelarEdicao()
    $q.notify({
      message: 'Dúvida editada com sucesso!',
      color: 'positive',
      position: 'top'
    })
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Erro ao editar dúvida',
      caption: error?.message || '',
      position: 'top'
    })
  } finally {
    saving.value = false
  }
}

async function salvarEdicaoResposta(duvidaId, respostaId) {
  if (!editRespostaTexto.value.trim()) {
    $q.notify({
      type: 'negative',
      message: 'A resposta não pode estar vazia.',
      position: 'top'
    })
    return
  }

  saving.value = true
  try {
    const duvidaRef = doc(db, 'duvidas', duvidaId)
    const duvidaIndex = duvidas.value.findIndex(d => d.id === duvidaId)
    const respostaIndex = duvidas.value[duvidaIndex].respostas.findIndex(r => r.id === respostaId)

    if (respostaIndex !== -1) {
      const updateObj = {}
      updateObj[`respostas.${respostaIndex}.texto`] = editRespostaTexto.value.trim()
      updateObj[`respostas.${respostaIndex}.updatedAt`] = new Date()
      await updateDoc(duvidaRef, updateObj)

      duvidas.value[duvidaIndex].respostas[respostaIndex].texto = editRespostaTexto.value.trim()
      duvidas.value[duvidaIndex].respostas[respostaIndex].updatedAt = new Date()
    }

    cancelarEdicaoResposta()
    $q.notify({
      message: 'Resposta editada com sucesso!',
      color: 'positive',
      position: 'top'
    })
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Erro ao editar resposta',
      caption: error?.message || '',
      position: 'top'
    })
  } finally {
    saving.value = false
  }
}

function cancelarEdicao() {
  editingDuvidaId.value = null
  editDuvidaTexto.value = ''
}

function cancelarEdicaoResposta() {
  editingRespostaId.value = null
  editRespostaTexto.value = ''
}

function getVideoId(url) {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
  const match = url.match(regExp)
  return (match && match[2].length === 11) ? match[2] : 'i-qT5n_5Mys'
}

function formatDate(date) {
  if (!date || !(date instanceof Date)) {
    return 'Data inválida'
  }
  return date.toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function capitalizeWords(text) {
  if (!text) return ''
  return text.replace(/\b\w/g, char => char.toUpperCase())
}

function playOutro(videoSelecionado) {
  router.replace({
    path: '/video-player',
    query: {
      id: videoSelecionado.id,
      titulo: videoSelecionado.titulo,
      descricao: videoSelecionado.descricao,
      url: videoSelecionado.url,
      temaId: videoSelecionado.temaId,
      duracao: videoSelecionado.duracao,
      createdAt: videoSelecionado.createdAt.toISOString()
    }
  })
}

function likeVideo() {
  alert('Vídeo curtido!')
}

function dislikeVideo() {
  alert('Vídeo não curtido!')
}

onMounted(async () => {
  onAuthStateChanged(auth, async (authUser) => {
    await loadUserData(authUser)
    await loadVideoData()
  })
})
</script>

<style lang="scss" scoped>
.q-page {
  background: #ECEFF1; // Light gray background for a clean, academic feel
}

.video-container {
  background: #000;
  border-radius: 16px;
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
  }
}

.video-info {
  padding: 0 12px;
}

.text-h4,
.text-h5,
.text-subtitle1,
.text-subtitle2 {
  font-family: 'Inter', sans-serif; // Modern, clean font
}

.text-green {
  color: #024a06; // Primary green for headers and key elements
}

.action-buttons {
  display: flex;
  align-items: center;
  gap: 12px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  padding-bottom: 20px;

  .q-btn {
    transition: background-color 0.3s ease, color 0.3s ease;

    &:hover {
      background-color: rgba(46, 125, 50, 0.1); // Subtle green hover effect
    }
  }
}

.comments-section {
  margin-top: 40px;

  .comment-input {
    display: flex;
    align-items: center;
    background: #FFFFFF;
    border-radius: 12px;
    padding: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  }

  .comment-list {
    .comment-item {
      border-radius: 12px;
      transition: transform 0.3s ease;

      &:hover {
        transform: translateX(2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
      }

      .comment-content {
        flex: 1;
      }
    }
  }

  .response-input {
    display: flex;
    align-items: center;
    padding-left: 20px;
    border-left: 3px solid #4DB6AC; // Teal accent for responses
    background: #F5F7FA;
    border-radius: 8px;
    padding: 8px;
  }

  .responses-list {
    .response-item {
      display: flex;
      padding: 10px;
      border-radius: 8px;

      &:hover {
        background-color: rgba(46, 125, 50, 0.05);
      }

      .response-content {
        flex: 1;
      }
    }
  }

  .nested-responses {
    padding-left: 20px;
    border-left: 2px solid #B0BEC5; // Soft gray for nested responses
  }

  .comment-actions,
  .response-actions {
    display: flex;
    gap: 12px;

    .q-btn {
      transition: color 0.3s ease;

      &:hover {
        color: #2E7D32;
      }
    }
  }
}

.related-videos {
  .related-video-item {
    cursor: pointer;
    border-radius: 12px;
    transition: transform 0.3s ease, box-shadow 0.3s ease;

    &:hover {
      transform: translateY(-4px);
      box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);

      .text-subtitle1 {
        color: #014c05;
      }
    }
  }
}

@media (max-width: $breakpoint-sm) {
  .video-info {
    padding: 0;
  }

  .action-buttons {
    justify-content: space-between;
    flex-wrap: wrap;
  }

  .comment-input {
    flex-direction: column;
    align-items: flex-start;

    .q-avatar {
      margin-bottom: 8px;
    }
  }

  .related-videos {
    margin-top: 24px;
  }
}
</style>
