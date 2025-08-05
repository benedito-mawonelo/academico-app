<template>
  <div class="tests-layout">
    <q-page class="main-content">
      <div class="hero-section">
        <div class="hero-content">
          <h1 class="hero-title">
            <span class="hero-highlight">Testes Práticos</span>
            <span class="hero-subtitle">Teste seus conhecimentos</span>
          </h1>
        </div>
      </div>

      <div class="tests-container" v-if="!currentTest">
        <div class="section-header">
          <q-icon name="assignment" color="primary" size="md" class="q-mr-sm" />
          <h2 class="section-title">Seus Testes</h2>
        </div>
        <q-inner-loading :showing="loading">
          <q-spinner-gears size="50px" color="primary" />
        </q-inner-loading>
        <div v-if="!loading && tests.length === 0" class="empty-state text-center q-pa-md">
          <q-icon name="assignment" size="lg" color="grey-6" />
          <div class="empty-title q-mt-md">Nenhum teste disponível</div>
          <div class="empty-subtitle q-mt-sm">Nenhum teste foi encontrado. Tente novamente mais tarde.</div>
        </div>
        <div class="tests-grid" v-else-if="!loading">
          <q-card
            v-for="test in tests"
            :key="test.id"
            class="test-card"
            @click="startTest(test)"
          >
            <q-card-section>
              <div class="test-title">{{ test.title }}</div>
              <q-linear-progress
                :value="test.progress"
                color="primary"
                class="q-mt-sm"
              />
              <div class="test-info">
                <span>{{ test.questions.length }} questões</span>
                <span>{{ test.duration }} min</span>
                <span v-if="test.completed" class="completed-indicator">
                  <q-icon name="check_circle" color="positive" size="sm" />
                  Concluído
                </span>
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <div class="quiz-container" v-else>
        <div class="section-header">
          <q-icon name="assignment" color="primary" size="md" class="q-mr-sm" />
          <h2 class="section-title">{{ currentTest?.title || 'Teste' }}</h2>
          <q-btn flat round icon="close" @click="endTest" />
        </div>
        <div class="quiz-content">
          <q-card class="question-card" v-if="currentQuestion">
            <q-card-section>
              <div class="question-text">
                <span v-if="isLatex(currentQuestion.texto)" v-html="renderKatex(currentQuestion.texto)"></span>
                <span v-else>{{ currentQuestion.texto }}</span>
              </div>
              <q-list class="options-list">
                <q-item
                  v-for="(option, index) in currentQuestion.opcoes"
                  :key="index"
                  clickable
                  v-ripple
                  :class="{ 'selected-option': selectedOption === index, 'correct-option': showResult && option === currentQuestion.respostaCorreta, 'wrong-option': showResult && selectedOption === index && option !== currentQuestion.respostaCorreta }"
                  @click="selectOption(index)"
                  :disable="showResult"
                >
                  <q-item-section>
                    <q-item-label>
                      <span v-if="isLatex(option)" v-html="renderKatex(option)"></span>
                      <span v-else>{{ option }}</span>
                    </q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
              <div v-if="showResult && selectedOption !== null && currentQuestion.opcoes[selectedOption] !== currentQuestion.respostaCorreta" class="explanation">
                <strong>Explicação:</strong>
                <span v-if="isLatex(currentQuestion.explicacao)" v-html="renderKatex(currentQuestion.explicacao)"></span>
                <span v-else>{{ currentQuestion.explicacao }}</span>
              </div>
            </q-card-section>
            <q-card-actions align="right" class="quiz-actions">
              <q-btn
                v-if="!showResult"
                :disable="selectedOption === null"
                color="primary"
                label="Confirmar"
                @click="submitAnswer"
              />
              <q-btn
                v-if="showResult"
                flat
                color="primary"
                :label="currentQuestionIndex < currentTest.questions.length - 1 ? 'Próxima' : 'Finalizar'"
                @click="nextQuestion"
              />
            </q-card-actions>
          </q-card>
          <div v-else class="empty-state text-center q-pa-md">
            <q-icon name="warning" size="lg" color="grey-6" />
            <div class="empty-title q-mt-md">Nenhuma questão carregada</div>
            <div class="empty-subtitle q-mt-sm">Não foi possível carregar as questões. Tente novamente.</div>
          </div>
        </div>
      </div>

      <q-dialog v-model="showSuccessDialog">
        <q-card>
          <q-card-section>
            <div class="text-h6">Parabéns!</div>
            <div>Resposta correta!</div>
          </q-card-section>
          <q-card-actions align="right">
            <q-btn flat label="OK" color="primary" v-close-popup />
          </q-card-actions>
        </q-card>
      </q-dialog>

      <q-dialog v-model="showResultDialog">
        <q-card>
          <q-card-section>
            <div class="text-h6">Resultado do Teste</div>
            <div>Pontuação: {{ score }} / {{ currentTest?.questions.length }}</div>
            <div>Percentagem: {{ Math.round((score / currentTest?.questions.length) * 100) }}%</div>
          </q-card-section>
          <q-card-actions align="right">
            <q-btn flat label="Voltar aos testes" color="primary" @click="endTest" v-close-popup />
          </q-card-actions>
        </q-card>
      </q-dialog>
    </q-page>

    <q-footer class="bottom-menu">
      <q-tabs
        v-model="activeTab"
        dense
        class="text-grey-8"
        active-color="primary"
        indicator-color="primary"
      >
        <q-tab name="videos" icon="ondemand_video" label="Vídeos" @click="goTo('videos')" />
        <q-tab name="favorites" icon="favorite" label="Favoritos" @click="goTo('favorites')" />
        <q-tab name="notes" icon="edit_note" label="Notas" @click="goTo('notes')" />
        <q-tab name="doubts" icon="help" label="Dúvidas" @click="goTo('doubts')" />
        <q-tab name="tests" icon="assignment" label="Testes" @click="goTo('tests')" />
      </q-tabs>
    </q-footer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useTestStore } from '../../stores/modules/testsQuizz'
import { firebaseAuth } from '../../boot/firebase'
import katex from 'katex'

const router = useRouter()
const $q = useQuasar()
const testStore = useTestStore()

const activeTab = ref('tests')
const currentTest = ref(null)
const currentQuestionIndex = ref(0)
const selectedOption = ref(null)
const showResult = ref(false)
const showSuccessDialog = ref(false)
const showResultDialog = ref(false)
const score = ref(0)
const loading = ref(false)

const tests = computed(() => testStore.tests)
const currentQuestion = computed(() => {
  const question = currentTest.value ? currentTest.value.questions[currentQuestionIndex.value] : null
  console.log('Questão atual:', question)
  if (question && question.opcoes) {
    console.log('Opções da questão:', question.opcoes)
    question.opcoes.forEach((opt, index) => {
      console.log(`Opção ${index}: "${opt}", isLatex: ${isLatex(opt)}`)
    })
  }
  return question
})

const isLatex = (text) => {
  if (!text || typeof text !== 'string') {
    console.warn('Texto inválido para isLatex:', text)
    return false
  }
  // Detecta comandos LaTeX comuns, delimitadores, ou símbolos matemáticos
  return /\\[\w]+(?:{[^{}]*})*|\$.*\$|\\\[.*\\\]|[_^]/.test(text)
}

const renderKatex = (text) => {
  if (!text || typeof text !== 'string') {
    console.warn('Texto inválido para renderKatex:', text)
    return text || ''
  }
  try {
    // Normaliza barras invertidas para garantir consistência
    const normalizedText = text.replace(/\\+/g, '\\')
    console.log(`Renderizando KaTeX: "${normalizedText}"`)
    return katex.renderToString(normalizedText, {
      throwOnError: false,
      displayMode: false,
      strict: false,
    })
  } catch (error) {
    console.error('Erro ao renderizar KaTeX:', error.message, 'Texto:', text)
    return text // Fallback para texto simples se houver erro
  }
}

onMounted(async () => {
  if (!firebaseAuth.currentUser) {
    $q.notify({
      type: 'warning',
      message: 'Por favor, faça login para ver seu progresso.',
      position: 'top',
    })
    return
  }
  loading.value = true
  try {
    await testStore.loadTests()
    if (testStore.tests.length === 0) {
      $q.notify({
        type: 'warning',
        message: 'Nenhum teste encontrado.',
        position: 'top',
      })
    }
  } catch (error) {
    console.error('Erro ao carregar testes:', error)
    $q.notify({
      type: 'negative',
      message: 'Erro ao carregar testes.',
      caption: error.message,
      position: 'top',
    })
  } finally {
    loading.value = false
  }
})

const goTo = (page) => router.push(`/${page}`)
const startTest = async (test) => {
  if (!firebaseAuth.currentUser) {
    $q.notify({
      type: 'warning',
      message: 'Por favor, faça login para iniciar o teste.',
      position: 'top',
    })
    return
  }
  loading.value = true
  try {
    console.log('Iniciando teste:', test.id)
    await testStore.loadTestQuestions(test.id)
    const progressData = await testStore.loadUserProgress(test.id)
    currentTest.value = testStore.tests.find(t => t.id === test.id)
    if (!currentTest.value) {
      throw new Error('Teste não encontrado após carregamento')
    }
    console.log('Teste carregado:', currentTest.value)
    if (progressData.completed) {
      currentQuestionIndex.value = currentTest.value.questions.length - 1
      score.value = progressData.score || 0
      showResultDialog.value = true
    } else {
      const lastAnsweredIndex = Math.max(
        -1,
        ...progressData.answeredQuestions.map(id =>
          currentTest.value.questions.findIndex(q => q.id === id)
        )
      )
      currentQuestionIndex.value = lastAnsweredIndex + 1 < currentTest.value.questions.length
        ? lastAnsweredIndex + 1
        : 0
      selectedOption.value = null
      showResult.value = false
      score.value = progressData.score || 0
    }
  } catch (error) {
    console.error('Erro ao iniciar teste:', error)
    $q.notify({
      type: 'negative',
      message: 'Erro ao carregar perguntas do teste.',
      caption: error.message,
      position: 'top',
    })
  } finally {
    loading.value = false
  }
}
const selectOption = (index) => {
  if (!showResult.value) {
    selectedOption.value = index
  }
}
const submitAnswer = async () => {
  if (selectedOption.value === null) return

  showResult.value = true
  const isCorrect = currentQuestion.value.opcoes[selectedOption.value] === currentQuestion.value.respostaCorreta
  if (isCorrect) {
    score.value++
    showSuccessDialog.value = true
  }
  try {
    await testStore.saveUserProgress(
      currentTest.value.id,
      currentQuestion.value.id,
      false,
      score.value
    )
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Erro ao salvar progresso.',
      caption: error.message,
      position: 'top',
    })
  }
}
const nextQuestion = async () => {
  if (currentQuestionIndex.value < currentTest.value.questions.length - 1) {
    currentQuestionIndex.value++
    selectedOption.value = null
    showResult.value = false
  } else {
    try {
      await testStore.saveUserProgress(
        currentTest.value.id,
        null,
        true,
        score.value
      )
      showResultDialog.value = true
    } catch (error) {
      $q.notify({
        type: 'negative',
        message: 'Erro ao salvar conclusão do teste.',
        caption: error.message,
        position: 'top',
      })
    }
  }
}
const endTest = async () => {
  if (currentTest.value && currentQuestionIndex.value < currentTest.value.questions.length - 1) {
    try {
      await testStore.saveUserProgress(
        currentTest.value.id,
        null,
        false,
        score.value
      )
    } catch (error) {
      $q.notify({
        type: 'negative',
        message: 'Erro ao salvar progresso ao sair.',
        caption: error.message,
        position: 'top',
      })
    }
  }
  currentTest.value = null
  currentQuestionIndex.value = 0
  selectedOption.value = null
  showResult.value = false
  showResultDialog.value = false
}
</script>

<style lang="scss" scoped>
.tests-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #f8f9fa;
}

.hero-section {
  background: linear-gradient(135deg, #2E7D32 0%, #66BB6A 100%);
  color: white;
  padding: 60px 24px 40px;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiPjxkZWZzPjxwYXR0ZXJuIGlkPSJwYXR0ZXJuIiB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiIHBhdHRlcm5UcmFuc2Zvcm09InJvdGF0ZSg0NSkiPjxyZWN0IHdpZHRoPSIyMCIgaGVpZ2h0PSI2MCIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3QgZmlsbD0idXJsKCNwYXR0ZXJuKSIgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIvPjwvc3ZnPg==');
  }

  .hero-content {
    max-width: 1200px;
    margin: 0 auto;
  }

  .hero-title {
    font-size: 2.5rem;
    font-weight: 700;
    line-height: 1.2;

    .hero-highlight { display: block; }
    .hero-subtitle { font-size: 1.5rem; font-weight: 400; opacity: 0.9; }
  }
}

.tests-container, .quiz-container {
  padding: 40px 24px;
  max-width: 1200px;
  margin: 0 auto;
}

.section-header {
  display: flex;
  align-items: center;
  margin-bottom: 16px;

  .section-title {
    font-size: 1.8rem;
    font-weight: 700;
    color: #333;
    flex-grow: 1;
  }
}

.tests-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 16px;
}

.test-card {
  background: white;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: transform 0.3s ease;

  &:hover {
    transform: translateY(-5px);
  }

  .test-title {
    font-size: 1.1rem;
    font-weight: 600;
    margin-bottom: 8px;
  }

  .test-info {
    font-size: 0.9rem;
    color: #666;
    display: flex;
    justify-content: space-between;
    margin-top: 8px;
  }

  .completed-indicator {
    color: #2E7D32;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 4px;
  }
}

.quiz-content {
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  padding: 24px;
}

.question-card {
  .question-text {
    font-size: 1.2rem;
    font-weight: 600;
    margin-bottom: 16px;
    line-height: 1.6;

    :deep(.katex) {
      font-size: 1.2em;
    }
  }

  .options-list {
    margin-bottom: 16px;

    :deep(.katex) {
      font-size: 1.1em;
    }
  }

  .selected-option {
    background: rgba(25, 118, 210, 0.1);
  }

  .correct-option {
    background: rgba(46, 125, 50, 0.2);
    border: 2px solid #2E7D32;
  }

  .wrong-option {
    background: rgba(211, 47, 47, 0.2);
    border: 2px solid #D32F2F;
  }

  .explanation {
    margin-top: 16px;
    padding: 16px;
    background: #f5f5f5;
    border-radius: 8px;

    :deep(.katex) {
      font-size: 1.1em;
    }
  }

  .quiz-actions {
    display: flex;
    gap: 16px;
    justify-content: flex-end;
  }
}

.bottom-menu {
  background: white;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
  position: sticky;
  bottom: 0;
  z-index: 1000;

  .q-tabs {
    justify-content: space-around;
  }
}

.empty-state {
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  max-width: 400px;
  margin: 0 auto;
  padding: 24px;

  .empty-title {
    font-size: 1.2rem;
    font-weight: 600;
    color: var(--q-dark);
  }

  .empty-subtitle {
    color: var(--q-grey-7);
    font-size: 0.9rem;
  }
}

@media (max-width: 600px) {
  .hero-title { font-size: 2rem; }
  .hero-subtitle { font-size: 1.2rem; }
  .section-title { font-size: 1.5rem; }
  .tests-grid { grid-template-columns: 1fr; }
  .quiz-actions { flex-direction: column; }
}
</style>
