<template>
  <q-page class="q-pa-md">
    <div class="row items-center justify-between q-mb-md">
      <div class="text-h5">Painel do Professor</div>
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
              <div v-if="(d.respostas?.length||0)>0" class="q-mt-xs">
                <q-chip dense color="positive" text-color="white">{{ d.respostas.length }} resposta(s)</q-chip>
              </div>
              <div class="row q-gutter-sm q-mt-sm">
                <q-input v-model="respostasDraft[d.id]" outlined dense autogrow placeholder="Responder..." class="col" />
                <q-btn color="primary" label="Enviar" dense @click="responder(d)" :disable="!respostasDraft[d.id]" />
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
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { useForumStore } from 'src/stores/modules/forumService'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { collection, onSnapshot, query, where, orderBy, doc, updateDoc, arrayUnion, getDoc, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from 'boot/firebase'

const $q = useQuasar()
const forum = useForumStore()
const tab = ref('aulas')
const auth = getAuth()
const uid = ref(null)

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

// Dúvidas
const duvidas = ref([])
const duvidaFilter = ref('')
const respostasDraft = ref({})
const videoTitles = ref({})
const filteredDuvidas = computed(() => {
  const f = duvidaFilter.value.trim().toLowerCase()
  if (!f) return duvidas.value
  return duvidas.value.filter(d => (d.texto||'').toLowerCase().includes(f) || (videoTitles.value[d.videoId]||'').toLowerCase().includes(f))
})

function formatDate(dt){
  const d = dt instanceof Date ? dt : dt?.toDate?.() || new Date(dt)
  return d ? d.toLocaleString('pt-PT') : ''
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
