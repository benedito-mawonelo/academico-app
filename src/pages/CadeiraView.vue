<template>
  <div class="app-layout">
    <!-- Header Modernizado -->
    <header class="app-header">
      <div class="header-content">
        <div class="user-profile">
          <q-avatar size="52px" class="profile-avatar glow-on-hover">
            <template v-if="user.avatar">
              <img :src="user.avatar">
            </template>
            <q-icon v-else name="person" color="white" />
          </q-avatar>
          <div class="user-info">
            <div class="user-name">
              <span class="name-text">{{ capitalizeWords(user.name + " " + user.apelido) }}</span>
              <q-icon
                v-if="user.isPro"
                name="verified"
                size="18px"
                color="accent"
                class="q-ml-xs"
              />
              <q-badge
                rounded
                :color="user.isPro ? 'accent' : 'grey-6'"
                class="plan-badge q-ml-xs"
                text-color="white"
              >
                {{ user.isPro ? 'PRO' : 'BÁSICO' }}
              </q-badge>
            </div>
            <div class="user-details">
              <q-chip dense size="sm" color="primary" text-color="white" icon="school" class="q-mr-xs">
                {{ capitalizeWords(user.curso) }}
              </q-chip>
              <q-chip dense size="sm" color="secondary" text-color="white" icon="apartment" class="q-mr-xs">
                {{ user.instituicao?.toUpperCase() }}
              </q-chip>
            </div>
          </div>
        </div>

        <div class="header-actions">
        </div>
      </div>
    </header>

    <!-- Page Content -->
    <q-page class="cadeira-page">
      <!-- Header Section -->
      <div class="header-section">
        <div class="header-overlay"></div>
        <div class="header-content">
          <h1 class="header-title animate__animated animate__fadeInDown">{{ cadeira.nome }}</h1>
        </div>
      </div>

    <!-- Tabs -->
    <q-tabs
      v-model="tab"
      class="tabs-modern text-primary"
      active-color="primary"
      indicator-color="accent"
      align="center"
      dense
    >
      <q-tab name="modulos" label="Módulos" icon="view_module" class="tab-item" />
    </q-tabs>

    <q-tab-panels v-model="tab" animated class="tab-panels">
      <!-- Módulos Tab -->
      <q-tab-panel name="modulos" class="tab-panel">
        <div v-if="loading" class="loading-container">
          <q-spinner-orbit color="primary" size="lg" />
          <div class="loading-text">Carregando módulos...</div>
        </div>
        <div v-else-if="modulos.length === 0" class="empty-state text-center q-pa-xl">
          <q-icon name="view_module" size="lg" color="grey-6" />
          <div class="empty-title q-mt-md">Nenhum módulo disponível</div>
          <div class="empty-subtitle q-mt-sm">Volte mais tarde para novos conteúdos</div>
        </div>
        <div v-else class="modulos-container">
          <!-- Módulos com Temas -->
          <div v-for="modulo in modulos" :key="modulo.id" class="modulo-section q-mb-lg">
            <div class="modulo-header-title">
              <q-icon name="view_module" color="primary" size="md" class="q-mr-md" />
              <div class="modulo-header-content">
                <h3 class="modulo-name">{{ modulo.nome }}</h3>
                <p class="modulo-desc">{{ modulo.descricao }}</p>
              </div>
              <q-btn
                v-if="canSeeTests(modulo)"
                color="primary"
                unelevated
                icon="assignment"
                label="Ver Testes"
                @click="goToTests()"
                size="sm"
                class="modulo-test-btn"
              />
            </div>

            <!-- Temas dentro do Módulo -->
            <div class="temas-grid">
              <div
                v-for="(tema, temaIndex) in getTemasDoModulo(modulo.id)"
                :key="tema.id"
                class="tema-card"
                :class="{
                  'tema-free': isTemaGratuito(temaIndex),
                  'tema-locked': !isTemaGratuito(temaIndex) && !hasAccessToTema(tema.id, modulo.id),
                  'tema-paid-access': !isTemaGratuito(temaIndex) && hasAccessToTema(tema.id, modulo.id)
                }"
                @click="handleTemaClick(tema, temaIndex, modulo.id)"
              >
                <div class="tema-overlay" v-if="!isTemaGratuito(temaIndex) && !hasAccessToTema(tema.id, modulo.id)">
                  <q-icon name="lock" size="lg" color="white" />
                  <p class="lock-text">Acesso Pago</p>
                </div>

                <div class="tema-content">
                  <div class="tema-icon">
                    <q-icon name="school" size="lg" />
                  </div>
                  <h4 class="tema-name">{{ tema.nome }}</h4>
                  <p class="tema-info">{{ tema.descricao || 'Sem descrição' }}</p>
                  
                  <div class="tema-badge-container">
                    <q-badge v-if="isTemaGratuito(temaIndex)" color="positive" text-color="white" class="q-mt-sm">
                      <q-icon name="free_cancellation" size="xs" class="q-mr-xs" />
                      Grátis
                    </q-badge>
                    <q-badge v-else-if="hasAccessToTema(tema.id)" color="info" text-color="white" class="q-mt-sm">
                      <q-icon name="verified" size="xs" class="q-mr-xs" />
                      Acesso Liberado
                    </q-badge>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </q-tab-panel>
    </q-tab-panels>
    </q-page>

    <!-- Footer com 3 Ícones -->
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
          <q-badge v-if="unreadNotifications.length" color="red" floating rounded>
            {{ unreadNotifications.length }}
          </q-badge>
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
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { collection, getDocs, query, orderBy, where, doc, onSnapshot, getDoc, setDoc } from 'firebase/firestore'
import { db } from 'boot/firebase'
import { useQuasar } from 'quasar'
import { onAuthStateChanged } from 'firebase/auth'
import { firebaseAuth } from 'boot/firebase'

const $q = useQuasar()
const router = useRouter()
const route = useRoute()

const tab = ref('modulos') // Default to modules
const userPurchasedModules = ref(new Set()) // Módulos que o usuário desbloqueou
const cadeiraId = route.params.id
const cadeira = ref({ nome: 'Carregando...' })
const modulos = ref([])
const temas = ref([])
const loading = ref(false)

// User and notifications data
const user = ref({
  name: '',
  isPro: true,
  avatar: ''
})
const notifications = ref([])
let unsubNotifications = null

const unreadNotifications = computed(() => {
  return notifications.value.filter(n => !n.read)
})

function canSeeTests(modulo) {
  // Regra: testes só aparecem se o módulo for gratuito ou se o estudante tiver comprado o módulo
  // Consideramos módulo gratuito se qualquer tema do módulo for gratuito (temaIndex === 0)
  const hasFreeTema = getTemasDoModulo(modulo.id).length > 0 // pelo menos um tema existe (o primeiro é grátis)
  const hasPaidAccess = userPurchasedModules.value.has(modulo.id)
  return hasFreeTema || hasPaidAccess
}

function goToTests() {
  router.push(`/cadeiras/${cadeiraId}/tests`)
}

const goTo = (page) => {
  router.push(`/${page}`)
}

function capitalizeWords(text) {
  if (!text) return ''
  return text.replace(/\b\w/g, (char) => char.toUpperCase())
}

async function loadData() {
  loading.value = true
  try {
    // Load cadeira pelo ID do documento vindo da rota
    const cadeiraDocRef = doc(db, 'cadeiras', cadeiraId)
    const cadeiraDoc = await getDoc(cadeiraDocRef)

    if (cadeiraDoc.exists()) {
      cadeira.value = { id: cadeiraDoc.id, ...cadeiraDoc.data() }
    } else {
      cadeira.value = { nome: 'Cadeira desconhecida' }
      $q.notify({
        type: 'negative',
        message: 'Cadeira não encontrada',
        position: 'top-right'
      })
      return
    }

    // Load modulos
    const modulosQuery = query(collection(db, 'modulos'), where('cadeiraId', '==', cadeiraId), orderBy('nome'))
    const modulosSnapshot = await getDocs(modulosQuery)
    modulos.value = modulosSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))

    // Load temas
    const modulosIds = modulos.value.map(modulo => modulo.id)
    const temasQuery = modulosIds.length
      ? query(collection(db, 'temas'), where('moduloId', 'in', modulosIds), orderBy('nome'))
      : query(collection(db, 'temas'), where('moduloId', '==', 'none'))
    const temasSnapshot = await getDocs(temasQuery)
    temas.value = temasSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))

    if (modulos.value.length === 0) {
      $q.notify({
        message: 'Nenhum conteúdo encontrado para esta cadeira.',
        color: 'warning',
        icon: 'info',
        position: 'top-right'
      })
    }
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Erro ao carregar dados',
      caption: error?.message || '',
      position: 'top-right'
    })
  } finally {
    loading.value = false
  }
}

// Funções para verificar acesso aos temas
function getTemasDoModulo(moduloId) {
  return temas.value.filter(tema => tema.moduloId === moduloId)
}

function isTemaGratuito(temaIndex) {
  return temaIndex === 0 // Primeiro tema de cada módulo é gratuito
}

function hasAccessToTema(temaId, moduloId) {
  // Primeiro tema é sempre acessível (gratuito)
  // Outros temas só são acessíveis se o módulo foi desbloqueado
  return userPurchasedModules.value.has(moduloId)
}

async function handleTemaClick(tema, temaIndex, moduloId) {
  // Primeiro tema é sempre gratuito
  const temAcesso = isTemaGratuito(temaIndex) || hasAccessToTema(tema.id, moduloId)

  if (!temAcesso) {
    // Buscar nome do módulo para exibir na mensagem
    const modulo = modulos.value.find(m => m.id === moduloId)
    const nomeModulo = modulo ? modulo.nome : 'este módulo'
    const valorSimulado = modulo?.preco || 1000 // valor apenas ilustrativo

    // PASSO 1: escolher método de pagamento (simulado)
    $q.dialog({
      title: 'Simular pagamento',
      message:
        'Para acessar todos os temas de "' + nomeModulo + '", ' +
        'escolha o método de pagamento a simular.',
      options: {
        type: 'radio',
        model: 'MPESA',
        items: [
          { label: 'M-Pesa', value: 'MPESA', color: 'primary' },
          { label: 'Emola', value: 'EMOLA', color: 'secondary' }
        ]
      },
      cancel: true,
      persistent: true,
      class: 'dialog-modern'
    }).onOk((metodoEscolhido) => {
      // PASSO 2: formulário simples com número do telemóvel
      $q.dialog({
        title: 'Dados do pagamento',
        message:
          'Simulação de pagamento via ' + metodoEscolhido + '.\\n' +
          'Valor: ' + valorSimulado + ' MT.\\n\\n' +
          'Informe o número de telefone para concluir.',
        prompt: {
          model: '',
          type: 'tel',
          label: 'Número de telefone',
          isValid: (val) => !!val && String(val).length >= 8,
          filled: true
        },
        cancel: true,
        ok: {
          label: 'Confirmar pagamento',
          color: 'primary',
          unelevated: true
        },
        class: 'dialog-modern'
      }).onOk(async (numeroTelefone) => {
        const authUser = firebaseAuth.currentUser
        if (!authUser) {
          $q.notify({
            type: 'negative',
            message: 'Faça login para desbloquear o módulo',
            position: 'top-right'
          })
          return
        }

        try {
          const purchaseId = `${authUser.uid}_${moduloId}`
          await setDoc(doc(collection(db, 'userPurchases'), purchaseId), {
            userId: authUser.uid,
            moduloId,
            moduloNome: nomeModulo,
            createdAt: new Date(),
            simulatedPaymentMethod: metodoEscolhido,
            simulatedPhone: numeroTelefone,
            simulatedAmount: valorSimulado,
            simulated: true
          }, { merge: true })

          // Atualiza o conjunto local de módulos comprados
          userPurchasedModules.value = new Set([...userPurchasedModules.value, moduloId])

          $q.notify({
            type: 'positive',
            message: `Módulo "${nomeModulo}" desbloqueado (pagamento simulado).`,
            position: 'top-right'
          })
        } catch (e) {
          console.error('Erro ao simular compra de módulo:', e)
          $q.notify({
            type: 'negative',
            message: 'Erro ao desbloquear módulo',
            position: 'top-right'
          })
        }
      })
    })
    return
  }

  // Carregar vídeos do tema
  try {
    const videosQuery = query(collection(db, 'videoaulas'), where('temaId', '==', tema.id), orderBy('titulo'))
    const videosSnapshot = await getDocs(videosQuery)
    const videosDoTema = videosSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))

    if (videosDoTema.length === 0) {
      $q.notify({
        type: 'warning',
        message: 'Nenhum vídeo disponível para este tema',
        position: 'top-right'
      })
      return
    }

    // Pegar primeiro vídeo
    const primeiroVideo = videosDoTema[0]
    const embedUrl = getEmbedUrl(primeiroVideo.url)

    // Navegar para o vídeo player com os parâmetros
    router.push({
      path: '/video-player',
      query: {
        id: primeiroVideo.id,
        titulo: primeiroVideo.titulo,
        descricao: primeiroVideo.descricao,
        url: embedUrl,
        temaId: tema.id,
        nomeTema: tema.nome,
        duracao: primeiroVideo.duracao || 0
      }
    })
  } catch (error) {
    console.error('Erro ao carregar vídeos do tema:', error)
    $q.notify({
      type: 'negative',
      message: 'Erro ao carregar vídeos',
      position: 'top-right'
    })
  }
}

function getEmbedUrl(url) {
  return url.includes('youtube.com') ? url.replace('watch?v=', 'embed/') : url
}


async function loadUserPurchases(authUser) {
  try {
    const snap = await getDocs(query(collection(db, 'userPurchases'), where('userId', '==', authUser.uid)))
    const ids = new Set()
    snap.docs.forEach(d => {
      const data = d.data()
      if (data.moduloId) ids.add(data.moduloId)
    })
    userPurchasedModules.value = ids
  } catch (e) {
    console.error('Erro ao carregar módulos comprados:', e)
    userPurchasedModules.value = new Set()
  }
}

onMounted(() => {
  onAuthStateChanged(firebaseAuth, async (authUser) => {
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
          avatar: data.image || '',
          provincia: data.provincia || '',
          telefone: data.telefone || '',
          email: data.email || '',
          isLoaded: true
        }
      } else {
        console.error('Documento do usuário não encontrado.')
      }

      // Subscrever notificações em tempo real
      if (unsubNotifications) unsubNotifications()
      const qn = query(
        collection(db, 'notifications'),
        where('userId', '==', authUser.uid),
        orderBy('createdAt', 'desc')
      )
      unsubNotifications = onSnapshot(qn, (snap) => {
        notifications.value = snap.docs.map(d => ({
          id: d.id,
          ...d.data(),
          time: d.data().createdAt?.toDate ? d.data().createdAt.toDate() : new Date(),
          read: !!d.data().read
        }))
      })

      // Carregar módulos já comprados (simulação de pagamentos reais)
      await loadUserPurchases(authUser)
    } else {
      notifications.value = []
      if (unsubNotifications) unsubNotifications()
      unsubNotifications = null
    }
  })

  loadData()
})

</script>

<style lang="scss" scoped>
.cadeira-page {
  background: linear-gradient(180deg, #f5f7fa 0%, #ffffff 100%);
  min-height: 100vh;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(circle, rgba(0,0,0,0.03) 2px, transparent 2px);
    background-size: 30px 30px;
    opacity: 0.5;
    z-index: 0;
  }
}

.header-section {
  position: relative;
  padding: 16px 24px;
  background: linear-gradient(135deg, var(--q-primary) 0%, var(--q-secondary) 100%);
  color: #ffffff;
  text-align: center;
  z-index: 1;

  .header-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.3);
    z-index: 1;
  }

  .header-content {
    position: relative;
    z-index: 2;
    max-width: 800px;
    margin: 0 auto;
  }

  .header-title {
    font-size: 1.5rem;
    font-weight: 800;
    margin-bottom: 0;
    text-shadow: 0 2px 6px rgba(0,0,0,0.2);
    animation-duration: 0.8s;
  }

  .header-subtitle {
    font-size: 1.1rem;
    opacity: 0.9;
    max-width: 600px;
    margin: 0 auto;
    animation-duration: 0.8s;
  }

  .header-wave {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 60px;
    background: url('data:image/svg+xml;utf8,<svg viewBox="0 0 1200 120" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg"><path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113.64,28.06,1200,39.85V0Z" fill="white"/></svg>');
    background-size: cover;
    z-index: 2;
  }
}

.tabs-modern {
  background: #ffffff;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  border-radius: 12px;
  margin: 0 16px;
  overflow: hidden;

  .tab-item {
    font-weight: 500;
    padding: 12px 24px;
    transition: all 0.3s ease;

    &:hover {
      background: rgba(0,0,0,0.05);
    }
  }
}

.tab-panels {
  background: transparent;
  padding: 24px 16px;
}

.tab-panel {
  max-width: 1200px;
  margin: 0 auto;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 0;
  background: rgba(255,255,255,0.9);
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);

  .loading-text {
    margin-top: 16px;
    color: var(--q-dark);
    font-size: 1.1rem;
    font-weight: 500;
  }
}

.empty-state {
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  max-width: 400px;
  margin: 0 auto;
  padding: 32px;

  .empty-title {
    font-size: 1.3rem;
    font-weight: 600;
    color: var(--q-dark);
  }

  .empty-subtitle {
    color: var(--q-grey-7);
    font-size: 0.95rem;
  }
}

.video-section {
  .featured-video {
    max-width: 800px;
    margin: 0 auto 32px;

    .video-player {
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 6px 16px rgba(0,0,0,0.15);
      animation-duration: 0.8s;
    }

    .video-info {
      margin-top: 16px;
      text-align: center;

      .video-title {
        font-size: 1.4rem;
        font-weight: 600;
        color: var(--q-dark);
      }

      .video-description {
        font-size: 0.95rem;
        color: var(--q-grey-8);
        margin-top: 8px;
      }
    }
  }

  .video-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 20px;
  }

  .video-card {
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 6px 16px rgba(0,0,0,0.1);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    animation-duration: 0.6s;

    &:hover {
      transform: translateY(-8px);
      box-shadow: 0 12px 24px rgba(0,0,0,0.15);

      .video-card-title {
        color: var(--q-primary);
      }
    }

    .video-thumbnail {
      transition: transform 0.3s ease;

      &:hover {
        transform: scale(1.05);
      }
    }

    .q-card__section {
      padding: 16px;

      .video-card-title {
        font-size: 1.2rem;
        font-weight: 600;
        color: var(--q-dark);
        transition: color 0.3s ease;
      }

      .video-card-description {
        font-size: 0.9rem;
        color: var(--q-grey-8);
        margin-top: 8px;
      }
    }
  }
}

.modulos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;

  .modulo-card {
    border-radius: 12px;
    box-shadow: 0 6px 16px rgba(0,0,0,0.1);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    animation-duration: 0.6s;

    &:hover {
      transform: translateY(-8px);
      box-shadow: 0 12px 24px rgba(0,0,0,0.15);

      .modulo-title {
        color: var(--q-primary);
      }
    }

    .modulo-header {
      display: flex;
      justify-content: center;
      padding: 16px;
    }

    .q-card__section {
      padding: 0 16px 16px;

      .modulo-title {
        font-size: 1.2rem;
        font-weight: 600;
        color: var(--q-dark);
        transition: color 0.3s ease;
      }

      .modulo-description {
        font-size: 0.9rem;
        color: var(--q-grey-8);
        margin-top: 8px;
      }
    }

    .q-card__actions {
      padding: 12px 16px;
      justify-content: center;

      .q-btn {
        border-radius: 50px;
        padding: 8px 16px;
      }
    }
  }
}

.resumos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;

  .resumo-card {
    border-radius: 12px;
    box-shadow: 0 6px 16px rgba(0,0,0,0.1);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    animation-duration: 0.6s;

    &:hover {
      transform: translateY(-8px);
      box-shadow: 0 12px 24px rgba(0,0,0,0.15);

      .resumo-title {
        color: var(--q-primary);
      }
    }

    .resumo-header {
      display: flex;
      justify-content: center;
      padding: 16px;
    }

    .q-card__section {
      padding: 0 16px 16px;

      .resumo-title {
        font-size: 1.2rem;
        font-weight: 600;
        color: var(--q-dark);
        transition: color 0.3s ease;
      }

      .resumo-description {
        font-size: 0.9rem;
        color: var(--q-grey-8);
        margin-top: 8px;
      }
    }

    .q-card__actions {
      padding: 12px 16px;
      justify-content: center;

      .q-btn {
        border-radius: 50px;
        padding: 8px 16px;
      }
    }
  }
}

.anotacao-input {
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  animation-duration: 0.6s;

  :deep(.q-field__control) {
    border-radius: 12px;
  }
}

.anotacao-btn {
  border-radius: 50px;
  padding: 10px 24px;
  font-weight: 500;
  transition: all 0.3s ease;

  &:hover {
    transform: scale(1.05);
    box-shadow: 0 6px 16px rgba(0,0,0,0.2);
  }
}

// Módulos Container
.modulos-container {
  max-width: 1200px;
  margin: 0 auto;
}

.modulo-section {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
  }

  .modulo-header-title {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20px;
    padding-bottom: 16px;
    border-bottom: 2px solid rgba(0, 0, 0, 0.05);
  }

  .modulo-header-content {
    flex: 1;
  }

  .modulo-name {
    margin: 0;
    font-size: 1.4rem;
    font-weight: 700;
    color: var(--q-dark);
  }

  .modulo-desc {
    margin: 8px 0 0 0;
    font-size: 0.95rem;
    color: var(--q-grey-8);
    line-height: 1.5;
  }
}

.temas-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 16px;
}

.tema-card {
  position: relative;
  border-radius: 12px;
  background: #f8f9fa;
  border: 2px solid rgba(0, 0, 0, 0.08);
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;

  &.tema-free {
    background: linear-gradient(135deg, rgba(76, 175, 80, 0.1) 0%, rgba(76, 175, 80, 0.05) 100%);
    border-color: rgba(76, 175, 80, 0.3);

    &:hover {
      transform: translateY(-6px);
      box-shadow: 0 8px 20px rgba(76, 175, 80, 0.2);
      border-color: rgba(76, 175, 80, 0.5);
    }
  }

  &.tema-paid-access {
    background: linear-gradient(135deg, rgba(33, 150, 243, 0.1) 0%, rgba(33, 150, 243, 0.05) 100%);
    border-color: rgba(33, 150, 243, 0.3);

    &:hover {
      transform: translateY(-6px);
      box-shadow: 0 8px 20px rgba(33, 150, 243, 0.2);
      border-color: rgba(33, 150, 243, 0.5);
    }
  }

  &.tema-locked {
    background: linear-gradient(135deg, rgba(0, 0, 0, 0.05) 0%, rgba(0, 0, 0, 0.02) 100%);
    border-color: rgba(0, 0, 0, 0.15);
    cursor: not-allowed;
    opacity: 0.7;

    &:hover {
      transform: none;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
  }

  .tema-overlay {
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    z-index: 10;
    border-radius: 10px;

    .lock-text {
      color: white;
      font-weight: 600;
      margin-top: 12px;
      font-size: 0.9rem;
    }
  }

  .tema-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;

    .tema-icon {
      width: 60px;
      height: 60px;
      border-radius: 12px;
      background: rgba(0, 0, 0, 0.05);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--q-primary);
      margin-bottom: 12px;
      transition: all 0.3s ease;

      .q-icon {
        font-size: 1.8rem;
      }
    }

    .tema-name {
      font-size: 1.1rem;
      font-weight: 600;
      color: var(--q-dark);
      margin-bottom: 8px;
      line-height: 1.4;
    }

    .tema-info {
      font-size: 0.85rem;
      color: var(--q-grey-8);
      margin-bottom: 12px;
      line-height: 1.4;
      min-height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .tema-badge-container {
      width: 100%;
      display: flex;
      justify-content: center;
    }
  }
}

/* Header Modernizado */
.app-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #f8f9fa;
}

.app-header {
  background: white;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  padding: 12px 24px;
  position: sticky;
  top: 0;
  z-index: 1000;
  transition: all 0.3s ease;

  .header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    max-width: 1400px;
    margin: 0 auto;
    width: 100%;
  }

  .user-profile {
    display: flex;
    align-items: center;
    gap: 16px;
    cursor: pointer;
    transition: transform 0.2s ease;

    &:hover {
      transform: translateX(5px);

      .profile-avatar {
        transform: scale(1.05);
        box-shadow: 0 0 0 3px rgba(25, 118, 210, 0.2);
      }
    }

    .profile-avatar {
      transition: all 0.3s ease;
      border: 2px solid white;
      box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);

      img {
        object-fit: cover;
      }
    }

    .user-info {
      display: flex;
      flex-direction: column;
      gap: 4px;

      .user-name {
        display: flex;
        align-items: center;
        gap: 6px;
        font-weight: 600;
        color: var(--q-dark);

        .name-text {
          font-size: 0.95rem;
        }

        .plan-badge {
          font-size: 0.7rem;
          padding: 2px 8px;
        }
      }

      .user-details {
        display: flex;
        gap: 6px;
        flex-wrap: wrap;
      }
    }
  }

  .header-actions {
    display: flex;
    align-items: center;
    gap: 12px;
  }
}

/* Footer com 3 Ícones */
.app-footer-compact {
  background: white;
  border-top: 1px solid rgba(0, 0, 0, 0.08);
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.08);
  padding: 12px 0;
  position: sticky;
  bottom: 0;
  z-index: 1001;
  margin-top: auto;

  .footer-icons-container {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 40px;
    max-width: 1400px;
    margin: 0 auto;
    width: 100%;

    .footer-icon-btn {
      position: relative;
      transition: all 0.3s ease;
      color: var(--q-grey-8);

      &:hover {
        transform: scale(1.2) translateY(-4px);
        color: var(--q-primary);
      }

      .q-badge {
        font-size: 0.7rem;
        padding: 0 4px;
      }
    }
  }
}

@media (max-width: 768px) {
  .header-section {
    padding: 30px 16px;

    .header-title {
      font-size: 1.8rem;
    }

    .header-subtitle {
      font-size: 1rem;
    }
  }

  .video-grid, .modulos-grid, .resumos-grid {
    grid-template-columns: 1fr;
  }

  .tabs-modern {
    margin: 0 8px;

    .tab-item {
      padding: 8px 16px;
    }
  }
}

@media (max-width: 480px) {
  .header-title {
    font-size: 1.5rem;
  }

  .header-subtitle {
    font-size: 0.9rem;
  }

  .video-card, .modulo-card, .resumo-card {
    .video-card-title, .modulo-title, .resumo-title {
      font-size: 1.1rem;
    }

    .video-card-description, .modulo-description, .resumo-description {
      font-size: 0.85rem;
    }
  }
}
</style>
