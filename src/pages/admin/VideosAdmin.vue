<template>
  <div>
    <q-btn label="Adicionar vídeo" color="primary" @click="showForm = true" />

    <q-dialog v-model="showForm" persistent>
      <q-card style="min-width: 400px">
        <q-card-section>
          <div class="text-h6">{{ editVideo.id ? 'Editar vídeo' : 'Novo vídeo' }}</div>
        </q-card-section>

        <q-card-section>
          <q-input v-model="editVideo.title" label="Título" />
          <q-input v-model="editVideo.description" label="Descrição" type="textarea" />
          <q-uploader
            label="Upload do vídeo"
            url=""
            @added="onFileAdded"
            :hide-upload-btn="true"
            :auto-upload="false"
          />
          <!-- Use função customizada para upload no Firebase Storage -->
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" v-close-popup />
          <q-btn label="Salvar" color="primary" @click="saveVideo" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-table
      :columns="columns"
      :data="videos"
      row-key="id"
      :loading="loading"
    >
      <template v-slot:body-cell-actions="props">
        <q-btn dense flat icon="edit" @click="editVideoRow(props.row)" />
        <q-btn dense flat icon="delete" color="negative" @click="deleteVideo(props.row.id)" />
      </template>
    </q-table>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore'
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage'
import { db, storage } from 'src/boot/firebase' // ajuste conforme seu arquivo firebase.js
import { uid } from 'quasar'

const videosCollection = collection(db, 'videos')
const videos = ref([])
const loading = ref(false)
const showForm = ref(false)
const editVideo = ref({
  id: '',
  title: '',
  description: '',
  videoUrl: ''
})
const selectedFile = ref(null)

const columns = [
  { name: 'title', label: 'Título', field: 'title' },
  { name: 'description', label: 'Descrição', field: 'description' },
  { name: 'actions', label: 'Ações', field: 'actions', sortable: false }
]

async function loadVideos() {
  loading.value = true
  videos.value = []
  const querySnapshot = await getDocs(videosCollection)
  querySnapshot.forEach(doc => {
    videos.value.push({ id: doc.id, ...doc.data() })
  })
  loading.value = false
}

function onFileAdded(files) {
  selectedFile.value = files[0]
}

async function saveVideo() {
  if (!editVideo.value.title) {
    alert('Informe o título')
    return
  }

  let videoUrl = editVideo.value.videoUrl

  if (selectedFile.value) {
    // Upload do vídeo no Storage
    const videoRef = storageRef(storage, 'videos/' + uid())
    await uploadBytes(videoRef, selectedFile.value)
    videoUrl = await getDownloadURL(videoRef)
  }

  if (editVideo.value.id) {
    // Atualizar vídeo existente
    const docRef = doc(db, 'videos', editVideo.value.id)
    await updateDoc(docRef, {
      title: editVideo.value.title,
      description: editVideo.value.description,
      videoUrl
    })
  } else {
    // Criar novo vídeo
    await addDoc(videosCollection, {
      title: editVideo.value.title,
      description: editVideo.value.description,
      videoUrl
    })
  }

  showForm.value = false
  selectedFile.value = null
  editVideo.value = { id: '', title: '', description: '', videoUrl: '' }
  await loadVideos()
}

function editVideoRow(row) {
  editVideo.value = { ...row }
  showForm.value = true
}

async function deleteVideo(id) {
  if (confirm('Deseja realmente excluir este vídeo?')) {
    await deleteDoc(doc(db, 'videos', id))
    await loadVideos()
  }
}

onMounted(loadVideos)
</script>
