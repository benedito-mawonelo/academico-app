<template>
  <q-page class="q-pa-md">
    <!-- Header do Professor -->
    <div class="q-pa-md q-mb-md bg-grey-1 rounded-borders">
      <div class="row items-center justify-between">
        <div class="row items-center q-gutter-sm">
          <q-avatar size="48px">
            <img v-if="profile.photoURL" :src="profile.photoURL" alt="" />
            <q-icon v-else name="account_circle" size="48px" />
          </q-avatar>
          <div>
            <div class="text-h6">{{ profile.displayName || 'Professor' }}</div>
            <div class="text-caption text-grey-7">{{ profile.email || '—' }}</div>
          </div>
        </div>
        <div class="row items-center q-gutter-sm">
          <q-btn color="primary" flat round dense icon="more_vert">
            <q-menu anchor="bottom right" self="top right">
              <q-list style="min-width: 180px">
                <q-item clickable v-close-popup @click="openProfileDialog">
                  <q-item-section avatar><q-icon name="person" /></q-item-section>
                  <q-item-section>
                    <q-item-label>Perfil</q-item-label>
                    <q-item-label caption>{{ profile.displayName || 'Professor' }}</q-item-label>
                  </q-item-section>
                </q-item>
                <q-separator />
                <q-item clickable v-close-popup @click="logout">
                  <q-item-section avatar><q-icon name="logout" /></q-item-section>
                  <q-item-section>Sair</q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-btn>
        </div>
      </div>
    </div>
    <div class="row items-center justify-between q-mb-md">
      <div class="text-h5"></div>
      <q-btn color="primary" icon="add" label="Agendar Aula" @click="openScheduleDialog" />
    </div>

    <q-tabs v-model="tab" class="text-primary" active-color="primary" indicator-color="primary" align="left" dense>
      <q-tab name="aulas" label="Aulas ao Vivo" icon="sensors" />
      <q-tab name="duvidas" label="Dúvidas" icon="help" />
    </q-tabs>
    <q-separator class="q-mb-md" />

    <q-tab-panels v-model="tab" animated>
      <!-- Aulas -->
      <q-tab-panel name="aulas">
        <q-table :rows="classes" :columns="classCols" row-key="id" flat bordered :loading="loadingClasses">
          <template #body-cell-status="props">
            <q-td :props="props">
              <q-chip :color="statusColor(props.row.status)" text-color="white" dense>{{ props.row.status }}</q-chip>
            </q-td>
          </template>
          <template #body-cell-actions="props">
            <q-td :props="props">
              <q-btn flat dense icon="open_in_new" color="primary" @click="openLive(props.row)" v-if="props.row.liveUrl" />
              <q-btn flat dense icon="play_arrow" color="green" @click="startClass(props.row)" v-if="props.row.status==='scheduled'" />
              <q-btn flat dense icon="stop" color="negative" @click="endClass(props.row)" v-if="props.row.status==='live'" />
            </q-td>
          </template>
        </q-table>
      </q-tab-panel>

      <!-- Dúvidas -->
      <q-tab-panel name="duvidas">
        <q-input dense outlined v-model="duvidaFilter" placeholder="Filtrar por texto ou vídeo" class="q-mb-sm" />
        <q-list bordered class="rounded-borders">
          <q-item v-for="d in filteredDuvidas" :key="d.id" class="q-my-xs">
            <q-item-section>
              <q-item-label class="text-weight-medium">{{ d.texto }}</q-item-label>
              <q-item-label caption>
                Vídeo: {{ videoTitles[d.videoId] || '—' }} • {{ formatDate(d.createdAt) }}
              </q-item-label>
              <div v-if="(d.respostas?.length||0)>0" class="q-mt-xs row items-center q-gutter-xs">
                <q-chip dense color="positive" text-color="white">{{ d.respostas.length }} resposta(s)</q-chip>
                <q-btn flat dense size="sm" :icon="expanded[d.id] ? 'expand_less' : 'expand_more'" :label="expanded[d.id] ? 'Esconder respostas' : 'Ver respostas'" @click="toggleExpand(d.id)" />
              </div>
              <q-slide-transition>
                <div v-show="expanded[d.id]" class="q-mt-sm">
                  <q-list bordered separator class="bg-grey-1">
                    <q-item v-for="(r,idx) in (d.respostas||[])" :key="r.id || idx">
                      <q-item-section avatar>
                        <q-avatar size="32px">
                          <img v-if="r.userPhoto" :src="r.userPhoto" alt="" />
                          <q-icon v-else name="person" />
                        </q-avatar>
                      </q-item-section>
                      <q-item-section>
                        <q-item-label>
                          <span class="text-weight-medium">{{ r.userName || 'Usuário' }}</span>
                          <span class="text-caption text-grey-7"> • {{ formatDate(r.createdAt) }}</span>
                        </q-item-label>
                        <q-item-label caption>{{ r.texto }}</q-item-label>
                      </q-item-section>
                    </q-item>
                  </q-list>
                </div>
              </q-slide-transition>
              <div class="row q-gutter-sm q-mt-sm">
                <q-input v-model="respostasDraft[d.id]" outlined dense autogrow placeholder="Responder..." class="col">
                  <template #after>
                    <q-btn round dense flat icon="send" color="primary" @click="responder(d)" :disable="!(respostasDraft[d.id]||'').trim()" />
                  </template>
                </q-input>
                <q-btn color="secondary" label="Ver vídeo" dense @click="abrirVideo(d)" :disable="!d.videoId" />
              </div>
            </q-item-section>
          </q-item>
        </q-list>
      </q-tab-panel>
    </q-tab-panels>

    <!-- Dialog agendar aula -->
    <q-dialog v-model="showSchedule" persistent>
      <q-card style="min-width:520px">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">Agendar Nova Aula</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>
        <q-card-section>
          <q-form @submit.prevent="submitSchedule" class="q-gutter-sm">
            <q-input v-model="form.title" label="Título *" outlined :rules="[v=>!!v||'Obrigatório']" />
            <q-input v-model="form.subject" label="Matéria *" outlined :rules="[v=>!!v||'Obrigatório']" />
            <q-input v-model="form.description" label="Descrição" outlined type="textarea" rows="3" />
            <q-input v-model="form.scheduledFor" label="Data e Hora *" outlined type="datetime-local" :rules="[v=>!!v||'Obrigatório']" />
            <q-input v-model.number="form.duration" label="Duração (min)" outlined type="number" min="15" max="180" />
            <q-input v-model="form.liveUrl" label="Link da Aula (YouTube/Zoom/Meet)" outlined type="url" />
            <div class="row justify-end q-gutter-sm q-mt-sm">
              <q-btn flat label="Cancelar" v-close-popup />
              <q-btn color="primary" label="Agendar" type="submit" :loading="savingClass" />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>
  <!-- Dialog Perfil -->
  <q-dialog v-model="showProfile">
    <q-card style="min-width:460px">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">Perfil do Professor</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>
      <q-card-section>
        <div class="row items-center q-gutter-md">
          <q-avatar size="72px">
            <img v-if="profile.photoURL" :src="profile.photoURL" alt="" />
            <q-icon v-else name="account_circle" size="72px" />
          </q-avatar>
          <div>
            <div class="text-subtitle1">{{ profile.displayName || 'Professor' }}</div>
            <div class="text-caption text-grey-7">{{ profile.email || '—' }}</div>
          </div>
        </div>
      </q-card-section>
      <q-separator />
      <q-card-actions align="right">
        <q-btn flat label="Fechar" v-close-popup />
        <q-btn color="primary" label="Editar perfil" @click="openEditProfile" />
      </q-card-actions>
    </q-card>
  </q-dialog>

  <!-- Dialog Editar Perfil (inline) -->
  <q-dialog v-model="showEdit">
    <q-card style="min-width:520px">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">Editar Perfil (Professor)</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>
      <q-card-section>
        <q-form class="q-gutter-md" @submit.prevent="saveProfile">
          <div class="row items-center q-gutter-md">
            <q-avatar size="72px">
              <img v-if="editForm.photoURL" :src="editForm.photoURL" alt="" />
              <q-icon v-else name="account_circle" size="72px" />
            </q-avatar>
            <div class="column col">
              <q-input v-model="editForm.displayName" label="Nome" outlined :rules="[v=>!!v||'Obrigatório']" />
              <div class="row items-center q-gutter-sm">
                <q-file accept="image/*" outlined dense label="Selecionar foto" @update:model-value="onPhotoSelected" :disable="uploadingPhoto"/>
                <q-btn flat dense :loading="uploadingPhoto" :disable="uploadingPhoto" icon="cloud_upload" label="Upload" @click="triggerUploadClick" v-show="false" />
              </div>
              <div v-if="uploadingPhoto" class="text-caption text-grey-7 q-mt-xs">Enviando foto...</div>
            </div>
          </div>
        </q-form>
      </q-card-section>
      <q-separator />
      <q-card-actions align="right">
        <q-btn flat label="Cancelar" v-close-popup />
        <q-btn color="primary" label="Guardar" :loading="savingProfile" @click="saveProfile" />
      </q-card-actions>
    </q-card>
  </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { useForumStore } from 'src/stores/modules/forumService'
import { getAuth, onAuthStateChanged, signOut, updateProfile } from 'firebase/auth'
import { collection, onSnapshot, query, where, orderBy, doc, updateDoc, arrayUnion, getDoc, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from 'boot/firebase'
import { uploadFile } from '../../../services/uploadService'

const $q = useQuasar()
const forum = useForumStore()
const tab = ref('aulas')
const auth = getAuth()
const uid = ref(null)
const profile = ref({ displayName: '', email: '', photoURL: '' })
const showProfile = ref(false)
const showEdit = ref(false)
const editForm = ref({ displayName: '', photoURL: '' })
const savingProfile = ref(false)
const uploadingPhoto = ref(false)

// Aulas do professor
const classes = ref([])
const loadingClasses = ref(false)
const classCols = [
  { name: 'title', label: 'Título', field: 'title', align: 'left' },
  { name: 'subject', label: 'Matéria', field: 'subject', align: 'left' },
  { name: 'scheduledFor', label: 'Agendada para', field: r => formatDate(r.scheduledFor), align: 'left' },
  { name: 'status', label: 'Status', field: 'status', align: 'left' },
  { name: 'actions', label: 'Ações', field: 'id', align: 'right' }
]

function statusColor(s) {
  return s==='live' ? 'red' : s==='scheduled' ? 'grey-7' : 'green'
}

// Dialog agendar
const showSchedule = ref(false)
const savingClass = ref(false)
const form = ref({ title:'', subject:'', description:'', scheduledFor:'', duration:60, liveUrl:'' })
function openScheduleDialog() { showSchedule.value = true }
async function submitSchedule() {
  if (!uid.value) return
  try {
    savingClass.value = true
    await forum.createLiveClass({
      title: form.value.title,
      subject: form.value.subject,
      description: form.value.description,
      scheduledFor: new Date(form.value.scheduledFor),
      duration: Number(form.value.duration)||60,
      icon: 'school',
      liveUrl: form.value.liveUrl
    })
    $q.notify({ type:'positive', message:'Aula agendada' })
    showSchedule.value = false
    form.value = { title:'', subject:'', description:'', scheduledFor:'', duration:60, liveUrl:'' }
  } catch(e){
    $q.notify({ type:'negative', message:'Erro ao agendar', caption: e?.message })
  } finally { savingClass.value = false }
}

async function startClass(row) {
  try { await forum.startLiveClass(row.id); $q.notify({type:'positive', message:'Aula iniciada'}) } catch(e){ $q.notify({type:'negative', message:'Falha ao iniciar', caption:e?.message}) }
}
async function endClass(row) {
  try { await forum.endLiveClass(row.id, row.liveUrl||null); $q.notify({type:'positive', message:'Aula encerrada'}) } catch(e){ $q.notify({type:'negative', message:'Falha ao encerrar', caption:e?.message}) }
}

function openLive(row) {
  if (row.liveUrl) {
    window.open(String(row.liveUrl), '_blank')
  } else {
    $q.notify({ type:'warning', message:'Esta aula não possui link configurado' })
  }
}

function openProfileDialog(){
  showProfile.value = true
}

function openEditProfile(){
  // Preenche o formulário com dados atuais e abre o diálogo de edição
  editForm.value = { displayName: profile.value.displayName || '', photoURL: profile.value.photoURL || '' }
  showEdit.value = true
}

async function logout(){
  try{
    await signOut(auth)
    $q.notify({ type:'positive', message:'Sessão terminada' })
    // Redirecionar para login se necessário
    window.location.hash = '#/login'
  }catch(e){
    $q.notify({ type:'negative', message:'Falha ao sair', caption:e?.message })
  }
}

// Substituímos a navegação por edição inline
async function saveProfile(){
  const user = auth.currentUser
  if (!user) return
  try{
    savingProfile.value = true
    await updateProfile(user, {
      displayName: editForm.value.displayName || null,
      photoURL: editForm.value.photoURL || null
    })
    // atualiza estado local
    profile.value.displayName = editForm.value.displayName
    profile.value.photoURL = editForm.value.photoURL
    $q.notify({ type:'positive', message:'Perfil atualizado' })
    showEdit.value = false
    showProfile.value = false
  }catch(e){
    $q.notify({ type:'negative', message:'Falha ao atualizar perfil', caption: e?.message })
  }finally{
    savingProfile.value = false
  }
}

async function onPhotoSelected(files){
  const file = Array.isArray(files) ? files[0] : files
  if (!file) return
  try{
    uploadingPhoto.value = true
    const url = await uploadFile(file, `profile_photos/${uid.value || 'anonymous'}`)
    editForm.value.photoURL = url
    $q.notify({ type:'positive', message:'Foto enviada com sucesso' })
  }catch(e){
    $q.notify({ type:'negative', message:'Falha no upload da foto', caption: e?.message })
  }finally{
    uploadingPhoto.value = false
  }
}

function abrirVideo(d){
  if (!d?.videoId){
    $q.notify({ type:'warning', message:'Esta dúvida não está vinculada a um vídeo' })
    return
  }
  // Navega para o player usando o padrão já utilizado nas notificações
  // Se existir rota nomeada, pode-se adaptar para this.$router.push({ name:'video-player', params:{ id:d.videoId } })
  // Aqui usamos path + query para compatibilidade imediata
  window.open(`/#/video-player?id=${encodeURIComponent(d.videoId)}`, '_blank')
}

// Dúvidas
const duvidas = ref([])
const duvidaFilter = ref('')
const respostasDraft = ref({})
const videoTitles = ref({})
const expanded = ref({})
const filteredDuvidas = computed(() => {
  const f = duvidaFilter.value.trim().toLowerCase()
  if (!f) return duvidas.value
  return duvidas.value.filter(d => (d.texto||'').toLowerCase().includes(f) || (videoTitles.value[d.videoId]||'').toLowerCase().includes(f))
})

function formatDate(dt){
  const d = dt instanceof Date ? dt : dt?.toDate?.() || new Date(dt)
  return d ? d.toLocaleString('pt-PT') : ''
}

function toggleExpand(id){
  expanded.value[id] = !expanded.value[id]
}

async function responder(d) {
  const texto = (respostasDraft.value[d.id]||'').trim()
  if (!texto) return
  try {
    const u = auth.currentUser
    const update = {
      id: `${Date.now()}-${u.uid}`,
      userId: u.uid,
      userName: 'Professor',
      userPhoto: u.photoURL || null,
      texto,
      createdAt: new Date(),
      respostas: []
    }
    await updateDoc(doc(db,'duvidas', d.id), { respostas: arrayUnion(update) })
    // Notificar o autor da dúvida
    try {
      await addDoc(collection(db,'notifications'), {
        userId: d.userId,
        type: 'duvida_respondida',
        title: 'Dúvida respondida',
        message: 'Sua dúvida foi respondida pelo professor.',
        icon: 'chat',
        color: 'primary',
        videoId: d.videoId || null,
        duvidaId: d.id,
        linkPath: '/video-player',
        linkQuery: d.videoId ? { id: d.videoId } : {},
        read: false,
        createdAt: serverTimestamp()
      })
    } catch (e) { console.error('Falha ao criar notificação:', e) }

    respostasDraft.value[d.id] = ''
    $q.notify({ type:'positive', message:'Resposta enviada' })
  } catch(e){ $q.notify({ type:'negative', message:'Falha ao responder', caption:e?.message }) }
}

onMounted(() => {
  onAuthStateChanged(auth, (user) => {
    uid.value = user?.uid || null
    if (!uid.value) return
    profile.value = { displayName: user?.displayName || '', email: user?.email || '', photoURL: user?.photoURL || '' }

    // Aulas do professor
    loadingClasses.value = true
    const qClasses = query(collection(db,'live_classes'), where('instructorId','==', uid.value))
    onSnapshot(qClasses, (snap)=>{
      const rows = snap.docs.map(d=>({ id:d.id, ...d.data(), scheduledFor: d.data().scheduledFor?.toDate?.() || new Date(d.data().scheduledFor) }))
      // ordenar por data desc no cliente
      classes.value = rows.sort((a,b) => (b.scheduledFor?.getTime?.()||0) - (a.scheduledFor?.getTime?.()||0))
      loadingClasses.value = false
    }, (err)=>{
      console.error('Erro ao carregar aulas do professor:', err)
      $q.notify({ type:'negative', message:'Erro ao carregar aulas', caption: err?.message })
      loadingClasses.value = false
    })

    // Dúvidas (todas; opcional: filtrar por tema/videos do professor)
    const qDuvidas = query(collection(db,'duvidas'), orderBy('createdAt','desc'))
    onSnapshot(qDuvidas, async (snap)=>{
      duvidas.value = snap.docs.map(d=>({ id:d.id, ...d.data(), createdAt: d.data().createdAt?.toDate?.() || new Date(d.data().createdAt) }))
      // carregar títulos dos vídeos relacionados
      const ids = [...new Set(duvidas.value.map(x=>x.videoId).filter(Boolean))]
      const map = {}
      for (const vid of ids){
        const vs = await getDoc(doc(db,'videoaulas', vid))
        if (vs.exists()) map[vid] = vs.data().titulo || 'Vídeo'
      }
      videoTitles.value = map
    })
  })
})
</script>

<style scoped>
.rounded-borders{ border-radius: 8px; }
</style>
