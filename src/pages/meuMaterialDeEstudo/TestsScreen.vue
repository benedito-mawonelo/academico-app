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
        <div class="tests-grid">
          <div
            v-for="test in tests"
            :key="test.id"
            class="test-card"
            @click="startTest(test)"
          >
            <div class="test-title">{{ test.title }}</div>
            <q-progress
              :percentage="test.progress"
              color="primary"
              height="4px"
              class="q-mt-sm"
            />
            <div class="test-info">
              <span>{{ test.questions.length }} questões</span>
              <span>{{ test.duration }} min</span>
            </div>
          </div>
        </div>
      </div>

      <div class="quiz-container" v-else>
        <div class="section-header">
          <q-icon name="assignment" color="primary" size="md" class="q-mr-sm" />
          <h2 class="section-title">{{ currentTest.title }}</h2>
          <q-btn flat round icon="close" @click="currentTest = null" />
        </div>
        <div class="quiz-content">
          <div class="question-card">
            <div class="question-text">
              {{ currentQuestion.question }}
            </div>
            <q-list class="options-list">
              <q-item
                v-for="(option, index) in currentQuestion.options"
                :key="index"
                clickable
                v-ripple
                :class="{ 'selected-option': selectedOption === index }"
                @click="selectOption(index)"
              >
                <q-item-section>
                  <q-item-label>{{ option }}</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
            <div class="quiz-actions">
              <q-btn
                :disable="selectedOption === null"
                color="primary"
                label="Confirmar"
                @click="submitAnswer"
              />
              <q-btn
                flat
                color="primary"
                :label="currentQuestionIndex < currentTest.questions.length - 1 ? 'Próxima' : 'Finalizar'"
                @click="nextQuestion"
                :disable="selectedOption === null"
              />
            </div>
          </div>
        </div>
      </div>
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
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const activeTab = ref('tests')

const tests = ref([
  {
    id: 1,
    title: 'Teste de Matemática',
    progress: 75,
    duration: 30,
    questions: [
      { question: 'Qual é a solução de x² - 4 = 0?', options: ['x = 2, -2', 'x = 4', 'x = 0', 'x = 1'], correct: 0 },
      { question: 'O que é uma derivada?', options: ['Área', 'Taxa de variação', 'Volume', 'Soma'], correct: 1 },
    ],
  },
  {
    id: 2,
    title: 'Teste de Física',
    progress: 20,
    duration: 45,
    questions: [
      { question: 'Qual é a primeira lei de Newton?', options: ['Inércia', 'Ação-Reação', 'Força', 'Energia'], correct: 0 },
      { question: 'O que é energia cinética?', options: ['Energia estática', 'Energia de movimento', 'Energia potencial', 'Energia térmica'], correct: 1 },
    ],
  },
])

const currentTest = ref(null)
const currentQuestionIndex = ref(0)
const selectedOption = ref(null)

const currentQuestion = computed(() => {
  return currentTest.value ? currentTest.value.questions[currentQuestionIndex.value] : null
})

const goTo = (page) => router.push(`/${page}`)
const startTest = (test) => {
  currentTest.value = test
  currentQuestionIndex.value = 0
  selectedOption.value = null
}
const selectOption = (index) => {
  selectedOption.value = index
}
const submitAnswer = () => {
  // Simula verificação da resposta (substituir por lógica real com backend)
  if (selectedOption.value === currentQuestion.value.correct) {
    // Resposta correta
  }
  nextQuestion()
}
const nextQuestion = () => {
  if (currentQuestionIndex.value < currentTest.value.questions.length - 1) {
    currentQuestionIndex.value++
    selectedOption.value = null
  } else {
    // Finalizar teste
    currentTest.value = null
    currentQuestionIndex.value = 0
    selectedOption.value = null
  }
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
    background: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiPjxkZWZzPjxwYXR0ZXJuIGlkPSJwYXR0ZXJuIiB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiIHBhdHRlcm5UcmFuc2Zvcm09InJvdGF0ZSg0NSkiPjxyZWN0IHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3QgZmlsbD0idXJsKCNwYXR0ZXJuKSIgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIvPjwvc3ZnPg==');
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
  }

  .options-list {
    margin-bottom: 16px;
  }

  .selected-option {
    background: rgba(25, 118, 210, 0.1);
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

@media (max-width: 600px) {
  .hero-title { font-size: 2rem; }
  .hero-subtitle { font-size: 1.2rem; }
  .section-title { font-size: 1.5rem; }
  .tests-grid { grid-template-columns: 1fr; }
  .quiz-actions { flex-direction: column; }
}
</style>
