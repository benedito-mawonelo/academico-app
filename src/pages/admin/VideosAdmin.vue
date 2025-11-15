<template>
  <div class="q-pa-md">
    <q-btn label="Adicionar vídeo" color="primary" @click="openNewVideoForm" />

    <q-dialog v-model="showForm" persistent>
      <q-card style="min-width: 400px">
        <q-card-section>
          <div class="text-h6">
            {{ editVideo.id ? 'Editar vídeo' : 'Nova videoaula' }}
          </div>
        </q-card-section>

        <q-card-section class="q-gutter-md">
          <q-input v-model="editVideo.title" label="Título" filled />
          <q-input v-model="editVideo.description" label="Descrição" type="textarea" filled />

          <!-- Escolha da origem do vídeo -->
          <div class="row q-gutter-sm items-center">
            <q-radio v-model="sourceType" val="upload" label="Subir do computador" />
            <q-radio v-model="sourceType" val="link" label="Link (AWS / externo)" />
          </div>

          <!-- opcional: tema e duração para integrar melhor com o player -->
          <!--
          <q-input v-model="editVideo.temaId" label="ID do Tema (temaId)" filled />
          <q-input v-model.number="editVideo.duracao" label="Duração (minutos)" type="number" filled />
          -->

          <!-- Modo upload: q-uploader -->
          <q-uploader
            v-if="sourceType === 'upload'"
            label="Upload do vídeo"
            accept="video/*"
            url=""
            @added="onFileAdded"
            :hide-upload-btn="true"
            :auto-upload="false"
          />

          <!-- Modo link: input para URL externa (AWS) -->
          <q-input
            v-if="sourceType === 'link'"
            v-model="editVideo.videoUrl"
            label="URL do vídeo (AWS ou outro servidor)"
            filled
          />

          <div v-if="editVideo.videoUrl && sourceType === 'upload'" class="text-caption text-grey-7">
            URL atual: {{ editVideo.videoUrl }}
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" v-close-popup />
          <q-btn label="Salvar" color="primary" :loading="saving" @click="saveVideo" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-table
      class="q-mt-lg"
      :columns="columns"
      :data="videos"
      row-key="id"
      :loading="loading"
      title="Videoaulas (coleção videoaulas)"
    >
      <template v-slot:body-cell-actions="props">
        <q-td :props="props">
          <q-btn dense flat icon="play_arrow" color="green" @click="openPlayer(props.row)" />
          <q-btn dense flat icon="edit" @click="editVideoRow(props.row)" />
          <q-btn dense flat icon="delete" color="negative" @click="deleteVideo(props.row.id)" />
        </q-td>
      </template>
    </q-table>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore'
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage'
import { db, storage } from 'src/boot/firebase'
import { uid } from 'quasar'

const router = useRouter()

// Usamos a colecção `videoaulas` para integrar com o player principal
const videosCollection = collection(db, 'videoaulas')

const videos = ref([])
const loading = ref(false)
const saving = ref(false)
const showForm = ref(false)

const editVideo = ref({
  id: '',
  title: '',
  description: '',
  videoUrl: '',
  temaId: '',
  duracao: 0
})
const selectedFile = ref(null)

// 'upload' = subir arquivo do PC; 'link' = usar URL manual (ex.: AWS)
const sourceType = ref('upload')

const columns = [
  { name: 'titulo', label: 'Título', field: row => row.titulo || row.title || '', align: 'left' },
  { name: 'descricao', label: 'Descrição', field: row => row.descricao || row.description || '', align: 'left' },
  { name: 'actions', label: 'Ações', field: 'actions', sortable: false, align: 'right' }
]

async function loadVideos () {
  loading.value = true
  videos.value = []
  const querySnapshot = await getDocs(videosCollection)
  querySnapshot.forEach(d => {
    const data = d.data()
    videos.value.push({ id: d.id, ...data })
  })
  loading.value = false
}

function onFileAdded (files) {
  selectedFile.value = files[0] || null
}

function openNewVideoForm () {
  editVideo.value = { id: '', title: '', description: '', videoUrl: '', temaId: '', duracao: 0 }
  selectedFile.value = null
  sourceType.value = 'upload'
  showForm.value = true
}

async function saveVideo () {
  if (!editVideo.value.title) {
    alert('Informe o título')
    return
  }

  saving.value = true
  try {
    let videoUrl = editVideo.value.videoUrl

    if (sourceType.value === 'upload' && selectedFile.value) {
      // Upload do vídeo para Firebase Storage (pasta videoaulas/)
      const idAleatorio = uid()
      const videoRef = storageRef(storage, 'videoaulas/' + idAleatorio)
      await uploadBytes(videoRef, selectedFile.value)
      videoUrl = await getDownloadURL(videoRef) // URL HTTP para o player
    } else if (sourceType.value === 'link') {
      if (!videoUrl) {
        alert('Informe a URL do vídeo (AWS ou outro servidor)')
        return
      }
    }

    if (editVideo.value.id) {
      // Atualizar vídeo existente em `videoaulas`
      const docRef = doc(db, 'videoaulas', editVideo.value.id)
      await updateDoc(docRef, {
        titulo: editVideo.value.title,
        descricao: editVideo.value.description,
        url: videoUrl,
        temaId: editVideo.value.temaId || null,
        duracao: Number(editVideo.value.duracao) || 0
      })
    } else {
      // Criar nova videoaula em `videoaulas`
      await addDoc(videosCollection, {
        titulo: editVideo.value.title,
        descricao: editVideo.value.description,
        url: videoUrl,
        temaId: editVideo.value.temaId || null,
        duracao: Number(editVideo.value.duracao) || 0,
        createdAt: new Date()
      })
    }

    showForm.value = false
    selectedFile.value = null
    editVideo.value = { id: '', title: '', description: '', videoUrl: '', temaId: '', duracao: 0 }
    sourceType.value = 'upload'
    await loadVideos()
  } catch (e) {
    console.error('Erro ao salvar vídeo:', e)
    alert('Erro ao salvar vídeo. Veja o console para detalhes.')
  } finally {
    saving.value = false
  }
}

function editVideoRow (row) {
  editVideo.value = {
    id: row.id,
    title: row.titulo || row.title || '',
    description: row.descricao || row.description || '',
    videoUrl: row.url || row.videoUrl || '',
    temaId: row.temaId || '',
    duracao: row.duracao || 0
  }
  selectedFile.value = null
  sourceType.value = editVideo.value.videoUrl ? 'link' : 'upload'
  showForm.value = true
}

async function deleteVideo (id) {
  if (confirm('Deseja realmente excluir esta videoaula?')) {
    await deleteDoc(doc(db, 'videoaulas', id))
    await loadVideos()
  }
}

function openPlayer (row) {
  // Navega para o player oficial usando o id do documento em `videoaulas`
  router.push({
    path: '/video-player',
    query: {
      id: row.id,
      titulo: row.titulo || row.title || '',
      descricao: row.descricao || row.description || '',
      url: row.url || row.videoUrl || '',
      temaId: row.temaId || '',
      duracao: row.duracao || 0
    }
  })
}

onMounted(loadVideos)
</script>
