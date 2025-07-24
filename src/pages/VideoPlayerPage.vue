<template>
  <q-page class="q-pa-lg">
    <div class="row q-col-gutter-xl">
      <!-- Player e informações -->
      <div class="col-12 col-lg-8">
        <!-- Player de vídeo -->
        <div class="video-container shadow-3 rounded-borders q-mb-lg">
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
          <h1 class="text-h4 text-weight-bold q-mb-sm">{{ video.titulo }}</h1>
          <div class="text-subtitle1 text-grey-7 q-mb-md">{{ video.descricao }}</div>

          <!-- Estatísticas e ações -->
          <div class="row items-center q-mb-lg">
            <div class="col-auto q-pr-md">
              <span class="text-subtitle2">1.2M visualizações</span>
              <span class="text-grey-7 q-mx-sm">•</span>
              <span class="text-subtitle2">{{ formatDate(video.data) }}</span>
            </div>
            <div class="col-auto q-ml-auto">
              <q-btn-group flat rounded>
                <q-btn color="grey-7" icon="thumb_up" label="24K" dense />
                <q-btn color="grey-7" icon="thumb_down" dense />
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
              size="sm"
              class="q-mr-sm"
            >
              <q-tooltip>{{ btn.label }}</q-tooltip>
            </q-btn>
            <q-btn
              flat
              round
              icon="more_vert"
              color="grey-7"
              size="sm"
            />
          </div>

          <!-- Comentários -->
          <div class="comments-section">
            <div class="text-h5 text-weight-bold q-mb-md">Comentários ({{ comentarios.length }})</div>

            <div class="comment-input q-mb-lg">
              <q-avatar size="40px" class="q-mr-sm">
                <img src="https://randomuser.me/api/portraits/men/32.jpg">
              </q-avatar>
              <q-input
                v-model="novoComentario"
                placeholder="Adicione um comentário ou dùvida..."
                outlined
                dense
                class="full-width"
              />
            </div>

            <q-btn
              color="primary"
              label="Comentar"
              class="q-mb-xl"
              @click="adicionarComentario"
              :disable="!novoComentario.trim()"
            />

            <div class="comment-list">
              <div
                v-for="(coment, index) in comentarios"
                :key="index"
                class="comment-item q-mb-md"
              >
                <q-avatar size="40px" class="q-mr-sm">
                  <img :src="`https://randomuser.me/api/portraits/${index % 2 === 0 ? 'men' : 'women'}/${index + 20}.jpg`">
                </q-avatar>
                <div class="comment-content">
                  <div class="text-subtitle1 text-weight-bold">Usuário {{ index + 1 }}</div>
                  <div class="text-body2 q-mb-xs">{{ coment }}</div>
                  <div class="text-caption text-grey-7">há {{ index + 1 }} hora{{ index > 0 ? 's' : '' }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Vídeos relacionados -->
      <div class="col-12 col-lg-4">
        <div class="related-videos">
          <div class="text-h5 text-weight-bold q-mb-md">Vídeos relacionados</div>

          <div
            v-for="item in relacionados"
            :key="item.id"
            class="related-video-item q-mb-md"
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
            <div class="video-details q-mt-sm">
              <div class="text-subtitle1 text-weight-bold">{{ item.titulo }}</div>
              <div class="text-caption text-grey-7">Canal {{ item.id }}</div>
              <div class="text-caption">123K visualizações • há 1 semana</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

// Dados do vídeo
const video = ref({
  titulo: route.query.titulo || 'Introdução ao Desenvolvimento Web Moderno',
  descricao: route.query.descricao || 'Aprenda os fundamentos do desenvolvimento web com as tecnologias mais recentes do mercado.',
  url: route.query.url || 'https://www.youtube.com/watch?v=i-qT5n_5Mys',
  data: new Date(2023, 5, 15)
})

const embedUrl = computed(() => {
  const videoId = getVideoId(video.value.url)
  return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`
})

const actionButtons = [
  { icon: 'bookmark', color: 'grey-7', label: 'Salvar' },
  { icon: 'share', color: 'grey-7', label: 'Compartilhar' },
  { icon: 'download', color: 'grey-7', label: 'Download' },
  { icon: 'playlist_add', color: 'grey-7', label: 'Adicionar à lista' }
]

const novoComentario = ref('')
const comentarios = ref([
  'Ótimo conteúdo, muito bem explicado!',
  'Alguém pode me dizer em que minuto fala sobre componentes?',
  'Estou aprendendo muito com esta série de vídeos!'
])

// Vídeos relacionados
const relacionados = ref([
  {
    id: 1,
    titulo: 'Desenvolvimento Front-end com Vue.js',
    descricao: 'Aprenda Vue.js do zero',
    url: 'https://www.youtube.com/watch?v=FXpIoQ_rT_c'
  },
  {
    id: 2,
    titulo: 'CSS Moderno com Tailwind',
    descricao: 'Domine o Tailwind CSS',
    url: 'https://www.youtube.com/watch?v=UBOj6rqRUME'
  },
  {
    id: 3,
    titulo: 'API REST com Node.js',
    descricao: 'Crie sua primeira API',
    url: 'https://www.youtube.com/watch?v=0oXYLzuucwE'
  },
  {
    id: 4,
    titulo: 'Testes Automatizados em JavaScript',
    descricao: 'Introdução aos testes',
    url: 'https://www.youtube.com/watch?v=r9HdJ8P6GQI'
  }
])

function getVideoId(url) {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
  const match = url.match(regExp)
  return (match && match[2].length === 11) ? match[2] : 'i-qT5n_5Mys'
}

function formatDate(date) {
  return date.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })
}

function adicionarComentario() {
  if (novoComentario.value.trim()) {
    comentarios.value.unshift(novoComentario.value.trim())
    novoComentario.value = ''
  }
}

function playOutro(videoSelecionado) {
  router.replace({
    path: '/video-player',
    query: {
      titulo: videoSelecionado.titulo,
      descricao: videoSelecionado.descricao,
      url: videoSelecionado.url
    }
  })
}
</script>

<style lang="scss" scoped>
.video-container {
  background: #000;
  border-radius: 12px;
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 20px rgba(0,0,0,0.15);
  }
}

.video-info {
  padding: 0 8px;
}

.action-buttons {
  display: flex;
  align-items: center;
  gap: 8px;
  border-bottom: 1px solid rgba(0,0,0,0.1);
  padding-bottom: 16px;
}

.comments-section {
  margin-top: 32px;

  .comment-input {
    display: flex;
    align-items: center;
  }

  .comment-list {
    .comment-item {
      display: flex;
      padding: 12px;
      border-radius: 8px;
      transition: background-color 0.2s ease;

      &:hover {
        background-color: rgba(0,0,0,0.03);
      }

      .comment-content {
        flex: 1;
      }
    }
  }
}

.related-videos {
  .related-video-item {
    display: flex;
    flex-direction: column;
    cursor: pointer;
    transition: transform 0.3s ease;

    &:hover {
      transform: translateX(4px);

      .video-details .text-subtitle1 {
        color: var(--q-primary);
      }
    }

    .video-details {
      padding: 0 4px;
    }
  }
}

@media (max-width: $breakpoint-sm) {
  .video-info {
    padding: 0;
  }

  .action-buttons {
    justify-content: space-between;
  }
}
</style>
