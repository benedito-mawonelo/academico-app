<template>
    <app-header @navigate="goTo" />

  <q-page class="admin-dashboard">
    <!-- App Bar -->
    <!-- <q-header class="header-modern">
      <q-toolbar class="header-content">
        <q-btn flat round dense icon="menu" class="q-mr-sm animate__animated animate__fadeIn">
          <q-tooltip>Abrir Menu</q-tooltip>
        </q-btn>
        <q-toolbar-title class="text-weight-bold animate__animated animate__fadeInDown">
          <q-icon name="quiz" size="md" class="q-mr-sm" />
          Painel Admin - Quiz e Vídeos
        </q-toolbar-title>
        <q-space />
        <q-btn flat round dense icon="notifications" class="q-mr-xs animate__animated animate__fadeIn">
          <q-badge color="red" floating rounded>3</q-badge>
          <q-tooltip>Notificações</q-tooltip>
        </q-btn>
        <q-btn flat round dense class="animate__animated animate__fadeIn">
          <q-avatar size="32px">
            <img src="https://cdn.quasar.dev/img/avatar.png" alt="Avatar">
          </q-avatar>
          <q-tooltip>Perfil</q-tooltip>
        </q-btn>
      </q-toolbar>
    </q-header> -->

    <!-- Tabs -->
    <q-tabs
      v-model="tab"
      class="tabs-modern text-primary shadow-2"
      active-color="primary"
      indicator-color="accent"
      align="center"
      dense
    >
      <q-tab
        v-for="tabItem in tabs"
        :key="tabItem.name"
        :name="tabItem.name"
        :icon="tabItem.icon"
        :label="tabItem.label"
        class="tab-item"
      />
    </q-tabs>

    <!-- Tab Panels -->
    <q-tab-panels v-model="tab" animated class="tab-panels">
      <!-- Standard Tabs -->
      <q-tab-panel v-for="tabItem in tabs.filter(t => t.name !== 'tudo')" :key="tabItem.name" :name="tabItem.name" class="tab-panel">
        <div class="row justify-between items-center q-mb-md">
          <h2 class="text-h5 text-weight-bold animate__animated animate__fadeInDown">{{ tabItem.label }}</h2>
          <q-btn
            unelevated
            color="primary"
            icon="add"
            label="Adicionar"
            @click="editItem(tabItem.name)"
            class="add-btn"
          />
        </div>

        <div v-if="getItems(tabItem.name).length === 0 && !loading" class="empty-state text-center q-pa-md">
          <q-icon :name="tabItem.icon" size="lg" color="grey-6" />
          <div class="empty-title q-mt-md">Nenhum item disponível</div>
          <div class="empty-subtitle q-mt-sm">Adicione um novo item ou verifique a conexão com o banco de dados.</div>
        </div>

        <crud-table
          v-else
          :items="getItems(tabItem.name)"
          :columns="getColumns(tabItem.name)"
          :loading="loading"
          @edit="editItem(tabItem.name, $event)"
          @delete="deleteItem(tabItem.name, $event)"
          :extra-actions="tabItem.name === 'videoAulas' ? videoActions : tabItem.name === 'perguntas' ? perguntaActions : null"
          class="crud-table animate__animated animate__fadeInUp"
          v-intersection="onTableIntersection"
        />
      </q-tab-panel>

      <!-- Tudo Tab -->
      <q-tab-panel name="tudo" class="tab-panel">
        <h2 class="text-h5 text-weight-bold animate__animated animate__fadeInDown q-mb-md">Adicionar Tudo</h2>
        <q-card class="form-card animate__animated animate__fadeInUp">
          <q-card-section>
            <q-form @submit.prevent="saveAllItems" class="q-gutter-md">
              <!-- Curso -->
              <q-expansion-item
                label="Curso"
                icon="school"
                header-class="bg-grey-2"
                default-opened
              >
                <q-card>
                  <q-card-section>
                    <q-input
                      v-model="allItems.curso.nome"
                      label="Nome do Curso"
                      filled
                      dense
                      :rules="[val => !!val || 'Campo obrigatório']"
                    />
                  </q-card-section>
                </q-card>
              </q-expansion-item>

              <!-- Cadeira -->
              <q-expansion-item
                label="Cadeira"
                icon="menu_book"
                header-class="bg-grey-2"
              >
                <q-card>
                  <q-card-section>
                    <q-input
                      v-model="allItems.cadeira.nome"
                      label="Nome da Cadeira"
                      filled
                      dense
                      :rules="[val => !!val || 'Campo obrigatório']"
                    />
                  </q-card-section>
                </q-card>
              </q-expansion-item>

              <!-- Módulo -->
              <q-expansion-item
                label="Módulo"
                icon="view_module"
                header-class="bg-grey-2"
              >
                <q-card>
                  <q-card-section>
                    <q-input
                      v-model="allItems.modulo.nome"
                      label="Nome do Módulo"
                      filled
                      dense
                      :rules="[val => !!val || 'Campo obrigatório']"
                    />
                  </q-card-section>
                </q-card>
              </q-expansion-item>

              <!-- Tema -->
              <q-expansion-item
                label="Tema"
                icon="topic"
                header-class="bg-grey-2"
              >
                <q-card>
                  <q-card-section>
                    <q-input
                      v-model="allItems.tema.nome"
                      label="Nome do Tema"
                      filled
                      dense
                      :rules="[val => !!val || 'Campo obrigatório']"
                    />
                  </q-card-section>
                </q-card>
              </q-expansion-item>

              <!-- Videoaula -->
              <q-expansion-item
                label="Videoaula"
                icon="ondemand_video"
                header-class="bg-grey-2"
              >
                <q-card>
                  <q-card-section>
                    <q-input
                      v-model="allItems.videoaula.titulo"
                      label="Título da Aula"
                      filled
                      dense
                      :rules="[val => !!val || 'Campo obrigatório']"
                    />
                    <q-input
                      v-model="allItems.videoaula.descricao"
                      label="Descrição"
                      filled
                      dense
                      type="textarea"
                      rows="3"
                    />
                    <div class="row q-gutter-sm">
                      <q-input
                        v-model.number="allItems.videoaula.duracao"
                        label="Duração (minutos)"
                        filled
                        dense
                        type="number"
                        style="width: 150px"
                        :rules="[val => val > 0 || 'Duração inválida']"
                      />
                      <q-input
                        v-model.number="allItems.videoaula.ordem"
                        label="Ordem de Exibição"
                        filled
                        dense
                        type="number"
                        style="width: 150px"
                      />
                    </div>
                    <q-file
                      v-model="allItems.videoaula.file"
                      label="Upload do Vídeo"
                      filled
                      dense
                      accept="video/*"
                      class="q-mt-md"
                      @update:model-value="handleVideoUpload('videoaula')"
                    >
                      <template v-slot:prepend>
                        <q-icon name="attach_file" />
                      </template>
                    </q-file>
                    <q-input
                      v-model="allItems.videoaula.url"
                      label="URL do Vídeo (AWS)"
                      filled
                      dense
                      class="q-mt-md"
                      hint="Ou insira a URL diretamente"
                    />
                    <div v-if="allItems.videoaula.url" class="q-mt-md">
                      <q-video :src="allItems.videoaula.url" class="video-preview" />
                    </div>
                  </q-card-section>
                </q-card>
              </q-expansion-item>

              <!-- Pergunta -->
              <q-expansion-item
                label="Pergunta"
                icon="quiz"
                header-class="bg-grey-2"
              >
                <q-card>
                  <q-card-section>
                    <q-input
                      v-model="allItems.pergunta.texto"
                      label="Texto da Pergunta (Suporta LaTeX)"
                      filled
                      dense
                      :rules="[val => !!val || 'Campo obrigatório']"
                      @input="renderMathPreview('pergunta-texto')"
                    />
                    <div class="math-preview q-mt-sm" :id="'pergunta-texto-preview'"></div>
                    <q-file
                      v-model="allItems.pergunta.imagem"
                      label="Imagem da Pergunta (Opcional)"
                      filled
                      dense
                      accept="image/*"
                      clearable
                      @update:model-value="handlePerguntaImageUpload('pergunta')"
                    >
                      <template v-slot:prepend>
                        <q-icon name="image" />
                      </template>
                    </q-file>
                    <div v-if="allItems.pergunta.imagemUrl" class="q-mt-sm">
                      <q-img
                        :src="allItems.pergunta.imagemUrl"
                        class="image-preview"
                      />
                      <q-btn
                        flat
                        dense
                        icon="delete"
                        color="negative"
                        size="sm"
                        class="q-ml-sm"
                        @click="allItems.pergunta.imagemUrl = null; allItems.pergunta.imagem = null"
                      />
                    </div>
                    <div class="text-caption text-weight-medium q-mb-xs q-mt-md">Opções de Resposta</div>
                    <div class="q-gutter-sm">
                      <div v-for="(option, index) in allItems.pergunta.opcoes" :key="index" class="row items-center q-mb-sm">
                        <q-input
                          v-model="allItems.pergunta.opcoes[index]"
                          :label="`Opção ${index + 1} (Suporta LaTeX)`"
                          filled
                          dense
                          :rules="[val => !!val || 'Campo obrigatório']"
                          @input="renderMathPreview(`pergunta-opcao-${index}`)"
                          style="flex: 1"
                        />
                        <div class="math-preview q-ml-sm" :id="`pergunta-opcao-${index}-preview`"></div>
                        <q-radio
                          v-model="allItems.pergunta.respostaCorreta"
                          :val="index"
                          dense
                          label="Correta"
                          class="q-ml-sm"
                        />
                      </div>
                    </div>
                    <q-input
                      v-model="allItems.pergunta.explicacao"
                      label="Explicação da Resposta Correta (Suporta LaTeX)"
                      filled
                      dense
                      type="textarea"
                      rows="4"
                      :rules="[val => !!val || 'Campo obrigatório']"
                      @input="renderMathPreview('pergunta-explicacao')"
                    />
                    <div class="math-preview q-mt-sm" :id="'pergunta-explicacao-preview'"></div>
                    <q-toggle
                      v-model="allItems.pergunta.hasGraph"
                      label="Adicionar Gráfico"
                      color="primary"
                      class="q-mt-md"
                    />
                    <q-input
                      v-if="allItems.pergunta.hasGraph"
                      v-model="allItems.pergunta.graphData"
                      label="Dados do Gráfico (JSON Plotly)"
                      filled
                      dense
                      type="textarea"
                      rows="6"
                      :rules="[val => isValidJson(val) || 'JSON inválido']"
                      @input="renderGraphPreview('pergunta-graph')"
                    />
                    <q-btn
                      flat
                      dense
                      icon="help"
                      color="primary"
                      size="sm"
                      class="q-mb-sm"
                      @click="showGraphHelp"
                    >
                      <q-tooltip>Exemplo de JSON Plotly</q-tooltip>
                    </q-btn>
                    <div v-if="allItems.pergunta.hasGraph" class="graph-preview q-mt-sm" :id="'pergunta-graph-preview'"></div>
                  </q-card-section>
                </q-card>
              </q-expansion-item>

              <div class="row justify-end q-gutter-sm q-mt-lg">
                <q-btn
                  label="Cancelar"
                  color="grey"
                  flat
                  class="action-btn"
                  @click="resetAllItems"
                />
                <q-btn
                  label="Salvar Tudo"
                  type="submit"
                  color="primary"
                  :loading="saving"
                  class="action-btn"
                />
              </div>
            </q-form>
          </q-card-section>
        </q-card>
      </q-tab-panel>
    </q-tab-panels>

    <!-- Edit Dialog -->
    <q-dialog v-model="dialogVisible" persistent :maximized="$q.screen.lt.sm">
      <q-card class="edit-dialog animate__animated animate__zoomIn">
        <q-bar class="bg-primary text-white">
          <q-icon :name="currentTab.icon" />
          <div class="text-weight-medium">
            {{ editedItem.id ? 'Editar' : 'Adicionar' }} {{ currentTab.label }}
          </div>
          <q-space />
          <q-btn dense flat icon="close" v-close-popup>
            <q-tooltip>Fechar</q-tooltip>
          </q-btn>
        </q-bar>

        <q-card-section class="scroll q-pa-md">
          <q-form @submit.prevent="saveItem" class="q-gutter-md">
            <!-- Video Lessons Fields -->
            <template v-if="currentTab.name === 'videoAulas'">
              <q-input
                v-model="editedItem.titulo"
                label="Título da Aula"
                filled
                dense
                :rules="[val => !!val || 'Campo obrigatório']"
              />
              <q-select
                v-model="editedItem.temaId"
                :options="temasOptions"
                label="Tema Relacionado"
                filled
                dense
                emit-value
                map-options
                :rules="[val => !!val || 'Selecione um tema']"
              />
              <q-input
                v-model="editedItem.descricao"
                label="Descrição"
                filled
                dense
                type="textarea"
                rows="3"
              />
              <div class="row q-gutter-sm">
                <q-input
                  v-model.number="editedItem.duracao"
                  label="Duração (minutos)"
                  filled
                  dense
                  type="number"
                  style="width: 150px"
                  :rules="[val => val > 0 || 'Duração inválida']"
                />
                <q-input
                  v-model.number="editedItem.ordem"
                  label="Ordem de Exibição"
                  filled
                  dense
                  type="number"
                  style="width: 150px"
                />
              </div>
              <q-file
                v-model="videoFile"
                label="Upload do Vídeo"
                filled
                dense
                accept="video/*"
                class="q-mt-md"
                @update:model-value="handleVideoUpload('videoaula')"
              >
                <template v-slot:prepend>
                  <q-icon name="attach_file" />
                </template>
              </q-file>
              <q-input
                v-model="editedItem.url"
                label="URL do Vídeo (AWS)"
                filled
                dense
                class="q-mt-md"
                hint="Ou insira a URL diretamente"
              />
              <div v-if="editedItem.url" class="q-mt-md">
                <q-video :src="editedItem.url" class="video-preview" />
              </div>
            </template>

            <!-- Questions Fields -->
            <template v-else-if="currentTab.name === 'perguntas'">
              <q-input
                v-model="editedItem.texto"
                label="Texto da Pergunta (Suporta LaTeX)"
                filled
                dense
                :rules="[val => !!val || 'Campo obrigatório']"
                @input="renderMathPreview('edit-pergunta-texto')"
              />
              <div class="math-preview q-mt-sm" :id="'edit-pergunta-texto-preview'"></div>
              <q-file
                v-model="perguntaImagem"
                label="Imagem da Pergunta (Opcional)"
                filled
                dense
                accept="image/*"
                clearable
                @update:model-value="handlePerguntaImageUpload('pergunta')"
              >
                <template v-slot:prepend>
                  <q-icon name="image" />
                </template>
              </q-file>
              <div v-if="editedItem.imagemUrl" class="q-mt-sm">
                <q-img
                  :src="editedItem.imagemUrl"
                  class="image-preview"
                />
                <q-btn
                  flat
                  dense
                  icon="delete"
                  color="negative"
                  size="sm"
                  class="q-ml-sm"
                  @click="editedItem.imagemUrl = null; perguntaImagem.value = null"
                />
              </div>
              <q-select
                v-model="editedItem.temaId"
                :options="temasOptions"
                label="Tema"
                filled
                dense
                emit-value
                map-options
                :rules="[val => !!val || 'Selecione um tema']"
              />
              <div class="text-caption text-weight-medium q-mb-xs">Opções de Resposta</div>
              <div class="q-gutter-sm">
                <div v-for="(option, index) in editedItem.opcoes" :key="index" class="row items-center q-mb-sm">
                  <q-input
                    v-model="editedItem.opcoes[index]"
                    :label="`Opção ${index + 1} (Suporta LaTeX)`"
                    filled
                    dense
                    :rules="[val => !!val || 'Campo obrigatório']"
                    @input="renderMathPreview(`edit-pergunta-opcao-${index}`)"
                    style="flex: 1"
                  />
                  <div class="math-preview q-ml-sm" :id="`edit-pergunta-opcao-${index}-preview`"></div>
                  <q-radio
                    v-model="editedItem.respostaCorreta"
                    :val="index"
                    dense
                    label="Correta"
                    class="q-ml-sm"
                  />
                </div>
              </div>
              <q-input
                v-model="editedItem.explicacao"
                label="Explicação da Resposta Correta (Suporta LaTeX)"
                filled
                dense
                type="textarea"
                rows="4"
                :rules="[val => !!val || 'Campo obrigatório']"
                @input="renderMathPreview('edit-pergunta-explicacao')"
              />
              <div class="math-preview q-mt-sm" :id="'edit-pergunta-explicacao-preview'"></div>
              <q-toggle
                v-model="editedItem.hasGraph"
                label="Adicionar Gráfico"
                color="primary"
                class="q-mt-md"
              />
              <q-input
                v-if="editedItem.hasGraph"
                v-model="editedItem.graphData"
                label="Dados do Gráfico (JSON Plotly)"
                filled
                dense
                type="textarea"
                rows="6"
                :rules="[val => isValidJson(val) || 'JSON inválido']"
                @input="renderGraphPreview('edit-pergunta-graph')"
              />
              <q-btn
                flat
                dense
                icon="help"
                color="primary"
                size="sm"
                class="q-mb-sm"
                @click="showGraphHelp"
              >
                <q-tooltip>Exemplo de JSON Plotly</q-tooltip>
              </q-btn>
              <div v-if="editedItem.hasGraph" class="graph-preview q-mt-sm" :id="'edit-pergunta-graph-preview'"></div>
            </template>

            <!-- Generic Fields -->
            <template v-else>
              <q-input
                v-model="editedItem.nome"
                :label="`Nome do ${currentTab.label}`"
                filled
                dense
                :rules="[val => !!val || 'Campo obrigatório']"
              />
              <q-select
                v-if="hasParentReference(currentTab.name)"
                v-model="editedItem[parentReferenceField(currentTab.name)]"
                :options="getParentOptions(currentTab.name)"
                :label="parentReferenceLabel(currentTab.name)"
                filled
                dense
                emit-value
                map-options
                :rules="[val => !!val || 'Selecione um item']"
              />
            </template>

            <div class="row justify-end q-gutter-sm q-mt-lg">
              <q-btn
                label="Cancelar"
                color="grey"
                v-close-popup
                flat
                class="action-btn"
              />
              <q-btn
                label="Salvar"
                type="submit"
                color="primary"
                :loading="saving"
                class="action-btn"
              />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Video Preview Dialog -->
    <q-dialog v-model="videoDialogVisible" :maximized="$q.screen.lt.sm">
      <q-card class="video-dialog animate__animated animate__zoomIn">
        <q-bar class="bg-primary text-white">
          <div class="text-weight-medium">{{ currentVideo?.titulo }}</div>
          <q-space />
          <q-btn dense flat icon="close" v-close-popup>
            <q-tooltip>Fechar</q-tooltip>
          </q-btn>
        </q-bar>
        <q-card-section class="row justify-center">
          <q-video :src="currentVideo?.url" class="video-preview" />
        </q-card-section>
        <q-card-section>
          <div class="text-h6">{{ currentVideo?.titulo }}</div>
          <div class="text-caption text-grey-7 q-mt-sm">{{ currentVideo?.descricao }}</div>
          <div class="text-caption q-mt-md">
            <q-icon name="schedule" size="sm" class="q-mr-xs" />
            Duração: {{ currentVideo?.duracao }} minutos
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Question Preview Dialog -->
    <q-dialog v-model="perguntaDialogVisible" :maximized="$q.screen.lt.sm">
      <q-card class="question-dialog animate__animated animate__zoomIn">
        <q-bar class="bg-primary text-white">
          <div class="text-weight-medium">Detalhes da Pergunta</div>
          <q-space />
          <q-btn dense flat icon="close" v-close-popup>
            <q-tooltip>Fechar</q-tooltip>
          </q-btn>
        </q-bar>
        <q-card-section>
          <div class="text-h6 math-content">Pergunta: <span :id="'preview-pergunta-texto'">{{ currentPergunta?.texto }}</span></div>
          <div v-if="currentPergunta?.imagemUrl" class="q-mt-sm">
            <q-img :src="currentPergunta.imagemUrl" class="image-preview" />
          </div>
          <div v-if="currentPergunta?.hasGraph && currentPergunta?.graphData" class="q-mt-sm">
            <div class="graph-preview" :id="'preview-pergunta-graph'"></div>
          </div>
          <div class="text-caption text-weight-medium q-mt-sm">Opções:</div>
          <div v-for="(opcao, index) in currentPergunta?.opcoes" :key="index" class="q-ml-sm math-content">
            {{ index + 1 }}. <span :id="`preview-pergunta-opcao-${index}`">{{ opcao }}</span>
            <span v-if="currentPergunta.respostaCorreta === index" class="text-positive">
              (Correta)
            </span>
          </div>
          <div class="text-caption text-weight-medium q-mt-sm">Explicação:</div>
          <div class="q-ml-sm math-content" :id="'preview-pergunta-explicacao'">{{ currentPergunta?.explicacao }}</div>
          <div class="text-caption q-mt-sm">
            Tema: {{ (temas.value && Array.isArray(temas.value) && temas.value.find(t => t.id === currentPergunta?.temaId)?.nome) || currentPergunta?.temaId || 'Tema não encontrado' }}
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Delete Confirmation Dialog -->
    <q-dialog v-model="confirmDeleteVisible">
      <q-card class="confirm-dialog animate__animated animate__zoomIn">
        <q-card-section>
          <div class="text-h6">Confirmar Exclusão</div>
        </q-card-section>
        <q-card-section>
          Tem certeza que deseja excluir este item?
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancelar" color="grey" v-close-popup class="action-btn" />
          <q-btn flat label="Excluir" color="negative" @click="confirmDelete" v-close-popup class="action-btn" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
  <app-footer />
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useQuasar } from 'quasar'
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, orderBy } from 'firebase/firestore'
import { db } from 'boot/firebase'
import { uploadFile } from '/services/uploadService'
import CrudTable from 'src/components/CrudTable.vue'
import AppHeader from 'components/AppHeader.vue';
// import AppFooter from 'components/AppFooter.vue';

// Initialize MathJax and Plotly
const MathJax = window.MathJax
const Plotly = window.Plotly

const $q = useQuasar()

// Tab configuration
const tabs = [
  { name: 'cursos', label: 'Curso', icon: 'school' },
  { name: 'cadeiras', label: 'Cadeira', icon: 'menu_book' },
  { name: 'modulos', label: 'Módulo', icon: 'view_module' },
  { name: 'temas', label: 'Tema', icon: 'topic' },
  { name: 'videoAulas', label: 'Videoaula', icon: 'ondemand_video' },
  { name: 'perguntas', label: 'Pergunta', icon: 'quiz' },
  { name: 'tudo', label: 'Tudo', icon: 'add_circle' }
]

// Reactive state
const tab = ref('cursos')
const loading = ref(false)
const saving = ref(false)
const dialogVisible = ref(false)
const confirmDeleteVisible = ref(false)
const videoDialogVisible = ref(false)
const perguntaDialogVisible = ref(false)
const videoFile = ref(null)
const perguntaImagem = ref(null)
const currentVideo = ref(null)
const currentPergunta = ref(null)
const cursos = ref([])
const cadeiras = ref([])
const modulos = ref([])
const temas = ref([])
const videoAulas = ref([])
const perguntas = ref([])
const editedItem = ref(null)
const itemToDelete = ref(null)
const tableVisible = ref(false)
const dataLoaded = ref(false)
const allItems = ref({
  curso: { nome: '' },
  cadeira: { nome: '', cursoId: '' },
  modulo: { nome: '', cadeiraId: '' },
  tema: { nome: '', moduloId: '' },
  videoaula: { titulo: '', temaId: '', descricao: '', duracao: 0, ordem: 0, url: '', file: null },
  pergunta: {
    texto: '',
    temaId: '',
    opcoes: ['', '', '', ''],
    respostaCorreta: null,
    imagem: null,
    imagemUrl: null,
    explicacao: '',
    hasGraph: false,
    graphData: ''
  }
})

// Load data on mount
onMounted(async () => {
  console.log('Checking MathJax and Plotly availability...')
  console.log('MathJax:', !!MathJax)
  console.log('Plotly:', !!Plotly)
  await loadAllData()
  dataLoaded.value = true
  // Configure MathJax
  if (MathJax) {
    console.log('Initializing MathJax...')
    MathJax.typesetPromise().catch(err => console.error('MathJax initial error:', err))
  } else {
    console.error('MathJax not loaded')
    showError('MathJax não carregado. Verifique o CDN.', new Error('MathJax not found'))
  }
})

async function loadAllData() {
  loading.value = true
  try {
    await Promise.all([
      loadCursos(),
      loadCadeiras(),
      loadModulos(),
      loadTemas(),
      loadVideoAulas(),
      loadPerguntas()
    ])
    console.log('All data loaded:', { cursos: cursos.value, temas: temas.value, perguntas: perguntas.value })
  } catch (error) {
    showError('Erro ao carregar dados', error)
  } finally {
    loading.value = false
  }
}

async function loadCursos() {
  const q = query(collection(db, 'cursos'), orderBy('nome'))
  const snapshot = await getDocs(q)
  cursos.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  if (cursos.value.length === 0) {
    showNotification('Nenhum curso encontrado.', 'warning', 'info')
  }
}

async function loadCadeiras() {
  const q = query(collection(db, 'cadeiras'), orderBy('nome'))
  const snapshot = await getDocs(q)
  cadeiras.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  if (cadeiras.value.length === 0) {
    showNotification('Nenhuma cadeira encontrada.', 'warning', 'info')
  }
}

async function loadModulos() {
  const q = query(collection(db, 'modulos'), orderBy('nome'))
  const snapshot = await getDocs(q)
  modulos.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  if (modulos.value.length === 0) {
    showNotification('Nenhum módulo encontrado.', 'warning', 'info')
  }
}

async function loadTemas() {
  console.log('Loading temas...')
  const q = query(collection(db, 'temas'), orderBy('nome'))
  const snapshot = await getDocs(q)
  temas.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  console.log('Temas loaded:', temas.value)
  if (temas.value.length === 0) {
    showNotification('Nenhum tema encontrado.', 'warning', 'info')
  }
}

async function loadVideoAulas() {
  const q = query(collection(db, 'videoaulas'), orderBy('titulo'))
  const snapshot = await getDocs(q)
  videoAulas.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  if (videoAulas.value.length === 0) {
    showNotification('Nenhuma videoaula encontrada.', 'warning', 'info')
  }
}

async function loadPerguntas() {
  const q = query(collection(db, 'perguntas'), orderBy('texto'))
  const snapshot = await getDocs(q)
  perguntas.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  if (perguntas.value.length === 0) {
    showNotification('Nenhuma pergunta encontrada.', 'warning', 'info')
  }
}

// Computed properties
const currentTab = computed(() => tabs.find(t => t.name === tab.value))
const temasOptions = computed(() => temas.value.map(t => ({ label: t.nome, value: t.id })))
const cursosOptions = computed(() => cursos.value.map(c => ({ label: c.nome, value: c.id })))
const cadeirasOptions = computed(() => cadeiras.value.map(c => ({ label: c.nome, value: c.id })))
const modulosOptions = computed(() => modulos.value.map(m => ({ label: m.nome, value: m.id })))

// File handling
async function handlePerguntaImageUpload(type) {
  const file = type === 'pergunta' ? allItems.value.pergunta.imagem : perguntaImagem.value
  const target = type === 'pergunta' ? allItems.value.pergunta : editedItem.value
  if (!file) return
  try {
    loading.value = true
    showNotification('Enviando imagem...', 'info', 'cloud_upload')
    const imageUrl = await uploadFile(file, 'perguntas')
    target.imagemUrl = imageUrl
    showNotification('Imagem enviada com sucesso!', 'positive', 'check_circle')
  } catch (error) {
    showError('Erro ao enviar imagem', error)
  } finally {
    loading.value = false
  }
}

async function handleVideoUpload(type) {
  const file = type === 'videoaula' ? allItems.value.videoaula.file : videoFile.value
  const target = type === 'videoaula' ? allItems.value.videoaula : editedItem.value
  if (!file) return
  try {
    loading.value = true
    showNotification('Enviando vídeo...', 'info', 'cloud_upload')
    const videoUrl = await uploadFile(file, 'videoaulas')
    target.url = videoUrl
    showNotification('Vídeo enviado com sucesso!', 'positive', 'check_circle')
  } catch (error) {
    showError('Erro ao enviar vídeo', error)
  } finally {
    loading.value = false
  }
}

// MathJax rendering
function renderMathPreview(elementId) {
  nextTick(() => {
    const previewId = `${elementId}-preview`
    const inputValue = getInputValue(elementId)
    console.log(`Rendering MathJax for ${previewId} with value:`, inputValue)
    if (inputValue && MathJax) {
      const previewElement = document.getElementById(previewId)
      if (previewElement) {
        previewElement.innerHTML = `\\[${inputValue}\\]`
        MathJax.typesetPromise([previewElement])
          .then(() => console.log(`MathJax rendered for ${previewId}`))
          .catch(err => {
            console.error(`MathJax error for ${previewId}:`, err)
            showError('Erro ao renderizar LaTeX', err)
          })
      } else {
        console.warn(`Preview element ${previewId} not found`)
      }
    } else if (!MathJax) {
      console.error('MathJax not available')
      showError('MathJax não carregado', new Error('MathJax not found'))
    }
  })
}

function getInputValue(inputId) {
  console.log(`Getting input value for ${inputId}`)
  if (inputId.includes('pergunta-texto')) return allItems.value.pergunta.texto
  if (inputId.includes('pergunta-explicacao')) return allItems.value.pergunta.explicacao
  if (inputId.includes('pergunta-opcao-')) {
    const index = parseInt(inputId.split('-')[2])
    return allItems.value.pergunta.opcoes[index] || ''
  }
  if (inputId.includes('edit-pergunta-texto')) return editedItem.value.texto
  if (inputId.includes('edit-pergunta-explicacao')) return editedItem.value.explicacao
  if (inputId.includes('edit-pergunta-opcao-')) {
    const index = parseInt(inputId.split('-')[3])
    return editedItem.value.opcoes[index] || ''
  }
  return ''
}

// Plotly rendering
function renderGraphPreview(elementId) {
  nextTick(() => {
    const previewId = `${elementId}-preview`
    const graphData = getGraphData(elementId)
    console.log(`Rendering Plotly for ${previewId} with data:`, graphData)
    if (graphData && Plotly && isValidJson(graphData)) {
      try {
        const parsedData = JSON.parse(graphData)
        const previewElement = document.getElementById(previewId)
        if (previewElement) {
          Plotly.newPlot(previewId, parsedData.data || [], parsedData.layout || {}, { responsive: true })
            .then(() => console.log(`Plotly rendered for ${previewId}`))
            .catch(err => {
              console.error(`Plotly error for ${previewId}:`, err)
              showError('Erro ao renderizar gráfico', err)
            })
        } else {
          console.warn(`Graph preview element ${previewId} not found`)
        }
      } catch (err) {
        console.error('Plotly parse error:', err)
        showError('JSON do gráfico inválido', err)
      }
    } else if (!Plotly) {
      console.error('Plotly not available')
      showError('Plotly não carregado', new Error('Plotly not found'))
    }
  })
}

function getGraphData(inputId) {
  console.log(`Getting graph data for ${inputId}`)
  if (inputId.includes('pergunta-graph')) return allItems.value.pergunta.graphData
  if (inputId.includes('edit-pergunta-graph')) return editedItem.value.graphData
  return ''
}

function isValidJson(str) {
  if (!str) return true // Allow empty input
  try {
    JSON.parse(str)
    return true
  } catch {
    return false
  }
}

function showGraphHelp() {
  $q.notify({
    message: `Exemplo de JSON Plotly:
{
  "data": [
    {
      "x": [1, 2, 3, 4],
      "y": [10, 15, 13, 17],
      "type": "scatter",
      "mode": "lines+markers",
      "name": "Dados"
    }
  ],
  "layout": {
    "title": "Gráfico Exemplo",
    "xaxis": { "title": "X" },
    "yaxis": { "title": "Y" }
  }
}`,
    color: 'info',
    position: 'top',
    timeout: 10000,
    multiLine: true
  })
}

// Render preview dialog content
function renderPreviewContent() {
  nextTick(() => {
    console.log('Rendering preview content for currentPergunta:', currentPergunta.value)
    if (currentPergunta.value && MathJax) {
      // Render question text
      const textoElement = document.getElementById('preview-pergunta-texto')
      if (textoElement && currentPergunta.value.texto) {
        textoElement.innerHTML = `\\[${currentPergunta.value.texto}\\]`
      } else {
        console.warn('Question text element not found or no text')
      }
      // Render options
      currentPergunta.value.opcoes?.forEach((opcao, index) => {
        const opcaoElement = document.getElementById(`preview-pergunta-opcao-${index}`)
        if (opcaoElement && opcao) {
          opcaoElement.innerHTML = `\\[${opcao}\\]`
        } else {
          console.warn(`Option element preview-pergunta-opcao-${index} not found or no option`)
        }
      })
      // Render explanation
      const explicacaoElement = document.getElementById('preview-pergunta-explicacao')
      if (explicacaoElement && currentPergunta.value.explicacao) {
        explicacaoElement.innerHTML = `\\[${currentPergunta.value.explicacao}\\]`
      } else {
        console.warn('Explanation element not found or no explanation')
      }
      MathJax.typesetPromise()
        .then(() => console.log('MathJax rendered for preview dialog'))
        .catch(err => {
          console.error('MathJax error in preview dialog:', err)
          showError('Erro ao renderizar LaTeX no diálogo', err)
        })
    } else {
      console.warn('MathJax not available or currentPergunta is null')
    }
    if (currentPergunta.value?.hasGraph && currentPergunta.value?.graphData && Plotly) {
      try {
        const parsedData = JSON.parse(currentPergunta.value.graphData)
        const graphElement = document.getElementById('preview-pergunta-graph')
        if (graphElement) {
          Plotly.newPlot('preview-pergunta-graph', parsedData.data || [], parsedData.layout || {}, { responsive: true })
            .then(() => console.log('Plotly rendered for preview-pergunta-graph'))
            .catch(err => {
              console.error('Plotly error in preview dialog:', err)
              showError('Erro ao renderizar gráfico no diálogo', err)
            })
        } else {
          console.warn('Graph element preview-pergunta-graph not found')
        }
      } catch (err) {
        console.error('Plotly parse error in preview dialog:', err)
        showError('JSON do gráfico inválido no diálogo', err)
      }
    } else {
      console.warn('Plotly not available, no graph data, or hasGraph is false')
    }
  })
}

// CRUD operations
function editItem(tabName, item = null) {
  if (item) {
    editedItem.value = tabName === 'perguntas'
      ? {
          ...item,
          opcoes: [...(item.opcoes || ['', '', '', ''])],
          imagemUrl: item.imagemUrl || null,
          respostaCorreta: item.opcoes ? item.opcoes.indexOf(item.respostaCorreta) : null,
          explicacao: item.explicacao || '',
          hasGraph: !!item.graphData,
          graphData: item.graphData || ''
        }
      : tabName === 'videoAulas'
      ? { ...item, duracao: Number(item.duracao) || 0, ordem: Number(item.ordem) || 0 }
      : { ...item }
  } else {
    editedItem.value = tabName === 'perguntas'
      ? {
          id: '',
          texto: '',
          temaId: '',
          opcoes: ['', '', '', ''],
          respostaCorreta: null,
          imagemUrl: null,
          explicacao: '',
          hasGraph: false,
          graphData: ''
        }
      : tabName === 'videoAulas'
      ? {
          id: '',
          titulo: '',
          temaId: '',
          descricao: '',
          duracao: 0,
          ordem: 0,
          url: ''
        }
      : {
          id: '',
          nome: '',
          ...(hasParentReference(tabName) ? { [parentReferenceField(tabName)]: '' } : {})
        }
  }
  tab.value = tabName
  dialogVisible.value = true
  nextTick(() => {
    if (tabName === 'perguntas') {
      renderMathPreview('edit-pergunta-texto')
      renderMathPreview('edit-pergunta-explicacao')
      editedItem.value.opcoes.forEach((_, index) => renderMathPreview(`edit-pergunta-opcao-${index}`))
      if (editedItem.value.hasGraph) renderGraphPreview('edit-pergunta-graph')
    }
  })
}

async function saveItem() {
  saving.value = true
  try {
    const collectionName = currentTab.value.name === 'videoAulas' ? 'videoaulas' : currentTab.value.name
    let dataToSave = { ...editedItem.value }
    if (collectionName === 'perguntas') {
      if (dataToSave.respostaCorreta === null) {
        showError('Selecione uma resposta correta', new Error('Campo obrigatório'))
        return
      }
      if (!dataToSave.explicacao) {
        showError('Forneça uma explicação', new Error('Campo obrigatório'))
        return
      }
      dataToSave.respostaCorreta = dataToSave.opcoes[dataToSave.respostaCorreta]
      if (!dataToSave.hasGraph) {
        dataToSave.graphData = ''
      } else if (!isValidJson(dataToSave.graphData)) {
        showError('JSON do gráfico inválido', new Error('JSON inválido'))
        return
      }
    }
    if (editedItem.value.id) {
      const { id, ...data } = dataToSave
      await updateDoc(doc(db, collectionName, id), data)
      const items = getItems(collectionName)
      const index = items.findIndex(item => item.id === id)
      if (index !== -1) {
        items[index] = { id, ...data }
        items.sort((a, b) => a[collectionName === 'videoaulas' ? 'titulo' : collectionName === 'perguntas' ? 'texto' : 'nome'].localeCompare(b[collectionName === 'videoaulas' ? 'titulo' : collectionName === 'perguntas' ? 'texto' : 'nome']))
      }
      showNotification('Item atualizado com sucesso!', 'positive', 'check_circle')
    } else {
      const docRef = await addDoc(collection(db, collectionName), dataToSave)
      dataToSave.id = docRef.id
      await updateDoc(docRef, { id: docRef.id })
      const items = getItems(collectionName)
      items.push(dataToSave)
      items.sort((a, b) => a[collectionName === 'videoaulas' ? 'titulo' : collectionName === 'perguntas' ? 'texto' : 'nome'].localeCompare(b[collectionName === 'videoaulas' ? 'titulo' : collectionName === 'perguntas' ? 'texto' : 'nome']))
      showNotification('Item criado com sucesso!', 'positive', 'check_circle')
    }
    await loadCollection(collectionName)
    dialogVisible.value = false
    videoFile.value = null
    perguntaImagem.value = null
  } catch (error) {
    showError('Erro ao salvar', error)
  } finally {
    saving.value = false
  }
}

async function saveAllItems() {
  saving.value = true
  try {
    // Validate required fields
    if (!allItems.value.curso.nome) {
      showError('Nome do curso é obrigatório', new Error('Campo obrigatório'))
      return
    }
    if (!allItems.value.cadeira.nome) {
      showError('Nome da cadeira é obrigatório', new Error('Campo obrigatório'))
      return
    }
    if (!allItems.value.modulo.nome) {
      showError('Nome do módulo é obrigatório', new Error('Campo obrigatório'))
      return
    }
    if (!allItems.value.tema.nome) {
      showError('Nome do tema é obrigatório', new Error('Campo obrigatório'))
      return
    }
    if (allItems.value.videoaula.titulo && (!allItems.value.videoaula.url || allItems.value.videoaula.duracao <= 0)) {
      showError('Videoaula requer URL válida e duração maior que 0', new Error('Campo obrigatório'))
      return
    }
    if (allItems.value.pergunta.texto) {
      if (!allItems.value.pergunta.opcoes.every(o => o)) {
        showError('Todas as opções devem ser preenchidas', new Error('Campo obrigatório'))
        return
      }
      if (allItems.value.pergunta.respostaCorreta === null) {
        showError('Selecione uma resposta correta', new Error('Campo obrigatório'))
        return
      }
      if (!allItems.value.pergunta.explicacao) {
        showError('Forneça uma explicação', new Error('Campo obrigatório'))
        return
      }
      if (allItems.value.pergunta.hasGraph && !isValidJson(allItems.value.pergunta.graphData)) {
        showError('JSON do gráfico inválido', new Error('JSON inválido'))
        return
      }
    }

    // Save Curso
    let cursoId
    const cursoDoc = await addDoc(collection(db, 'cursos'), { nome: allItems.value.curso.nome })
    cursoId = cursoDoc.id
    await updateDoc(cursoDoc, { id: cursoId })
    cursos.value.push({ id: cursoId, nome: allItems.value.curso.nome })
    cursos.value.sort((a, b) => a.nome.localeCompare(b.nome))

    // Save Cadeira
    let cadeiraId
    const cadeiraDoc = await addDoc(collection(db, 'cadeiras'), { nome: allItems.value.cadeira.nome, cursoId })
    cadeiraId = cadeiraDoc.id
    await updateDoc(cadeiraDoc, { id: cadeiraId })
    cadeiras.value.push({ id: cadeiraId, nome: allItems.value.cadeira.nome, cursoId })
    cadeiras.value.sort((a, b) => a.nome.localeCompare(b.nome))

    // Save Módulo
    let moduloId
    const moduloDoc = await addDoc(collection(db, 'modulos'), { nome: allItems.value.modulo.nome, cadeiraId })
    moduloId = moduloDoc.id
    await updateDoc(moduloDoc, { id: moduloId })
    modulos.value.push({ id: moduloId, nome: allItems.value.modulo.nome, cadeiraId })
    modulos.value.sort((a, b) => a.nome.localeCompare(b.nome))

    // Save Tema
    let temaId
    const temaDoc = await addDoc(collection(db, 'temas'), { nome: allItems.value.tema.nome, moduloId })
    temaId = temaDoc.id
    await updateDoc(temaDoc, { id: temaId })
    temas.value.push({ id: temaId, nome: allItems.value.tema.nome, moduloId })
    temas.value.sort((a, b) => a.nome.localeCompare(b.nome))

    // Save Videoaula (if provided)
    if (allItems.value.videoaula.titulo) {
      const videoData = {
        titulo: allItems.value.videoaula.titulo,
        temaId,
        descricao: allItems.value.videoaula.descricao,
        duracao: allItems.value.videoaula.duracao,
        ordem: allItems.value.videoaula.ordem,
        url: allItems.value.videoaula.url
      }
      const videoDoc = await addDoc(collection(db, 'videoaulas'), videoData)
      videoData.id = videoDoc.id
      await updateDoc(videoDoc, { id: videoData.id })
      videoAulas.value.push(videoData)
      videoAulas.value.sort((a, b) => a.titulo.localeCompare(b.titulo))
    }

    // Save Pergunta (if provided)
    if (allItems.value.pergunta.texto) {
      const perguntaData = {
        texto: allItems.value.pergunta.texto,
        temaId,
        opcoes: allItems.value.pergunta.opcoes,
        respostaCorreta: allItems.value.pergunta.opcoes[allItems.value.pergunta.respostaCorreta],
        imagemUrl: allItems.value.pergunta.imagemUrl || null,
        explicacao: allItems.value.pergunta.explicacao,
        hasGraph: allItems.value.pergunta.hasGraph,
        graphData: allItems.value.pergunta.hasGraph ? allItems.value.pergunta.graphData : ''
      }
      const perguntaDoc = await addDoc(collection(db, 'perguntas'), perguntaData)
      perguntaData.id = perguntaDoc.id
      await updateDoc(perguntaDoc, { id: perguntaData.id })
      perguntas.value.push(perguntaData)
      perguntas.value.sort((a, b) => a.texto.localeCompare(b.texto))
    }

    showNotification('Todos os itens salvos com sucesso!', 'positive', 'check_circle')
    resetAllItems()
  } catch (error) {
    showError('Erro ao salvar tudo', error)
  } finally {
    saving.value = false
  }
}

function resetAllItems() {
  allItems.value = {
    curso: { nome: '' },
    cadeira: { nome: '', cursoId: '' },
    modulo: { nome: '', cadeiraId: '' },
    tema: { nome: '', moduloId: '' },
    videoaula: { titulo: '', temaId: '', descricao: '', duracao: 0, ordem: 0, url: '', file: null },
    pergunta: {
      texto: '',
      temaId: '',
      opcoes: ['', '', '', ''],
      respostaCorreta: null,
      imagem: null,
      imagemUrl: null,
      explicacao: '',
      hasGraph: false,
      graphData: ''
    }
  }
}

async function loadCollection(collectionName) {
  loading.value = true
  try {
    const loadFn = {
      cursos: loadCursos,
      cadeiras: loadCadeiras,
      modulos: loadModulos,
      temas: loadTemas,
      videoaulas: loadVideoAulas,
      perguntas: loadPerguntas
    }[collectionName]
    await loadFn()
  } catch (error) {
    showError(`Erro ao carregar ${collectionName}`, error)
  } finally {
    loading.value = false
  }
}

function deleteItem(tabName, id) {
  itemToDelete.value = { tabName, id }
  confirmDeleteVisible.value = true
}

async function confirmDelete() {
  const { tabName, id } = itemToDelete.value
  loading.value = true
  try {
    const collectionName = tabName === 'videoAulas' ? 'videoaulas' : tabName
    await deleteDoc(doc(db, collectionName, id))
    const items = getItems(tabName)
    const index = items.findIndex(item => item.id === id)
    if (index !== -1) {
      items.splice(index, 1)
    }
    showNotification('Item excluído com sucesso!', 'positive', 'check_circle')
    await loadCollection(collectionName)
  } catch (error) {
    showError('Erro ao excluir', error)
  } finally {
    loading.value = false
    confirmDeleteVisible.value = false
  }
}

// Extra actions
const perguntaActions = [
  {
    icon: 'visibility',
    color: 'primary',
    async handler(item) {
      console.log('Previewing pergunta:', item)
      if (!dataLoaded.value) {
        showNotification('Aguarde o carregamento dos dados...', 'warning', 'info')
        return
      }
      try {
        if (!temas.value.length) {
          console.log('No temas loaded, fetching...')
          await loadTemas()
        }
        currentPergunta.value = {
          ...item,
          respostaCorreta: item.opcoes ? item.opcoes.indexOf(item.respostaCorreta) : null
        }
        perguntaDialogVisible.value = true
        renderPreviewContent()
      } catch (error) {
        console.error('Error in perguntaActions handler:', error)
        showError('Erro ao carregar temas para visualização', error)
      }
    },
    tooltip: 'Visualizar pergunta'
  }
]

const videoActions = [
  {
    icon: 'play_circle',
    color: 'primary',
    handler: (item) => {
      currentVideo.value = item
      videoDialogVisible.value = true
    },
    tooltip: 'Assistir vídeo'
  }
]

// Helpers
function hasParentReference(tabName) {
  return ['cadeiras', 'modulos', 'temas', 'videoAulas', 'perguntas'].includes(tabName)
}

function parentReferenceField(tabName) {
  return {
    cadeiras: 'cursoId',
    modulos: 'cadeiraId',
    temas: 'moduloId',
    videoAulas: 'temaId',
    perguntas: 'temaId'
  }[tabName]
}

function parentReferenceLabel(tabName) {
  return {
    cadeiras: 'Curso',
    modulos: 'Cadeira',
    temas: 'Módulo',
    videoAulas: 'Tema',
    perguntas: 'Tema'
  }[tabName]
}

function getParentOptions(tabName) {
  return {
    cadeiras: cursosOptions.value,
    modulos: cadeirasOptions.value,
    temas: modulosOptions.value,
    videoAulas: temasOptions.value,
    perguntas: temasOptions.value
  }[tabName] || []
}

function getItems(tabName) {
  return {
    cursos: cursos.value,
    cadeiras: cadeiras.value,
    modulos: modulos.value,
    temas: temas.value,
    videoAulas: videoAulas.value,
    perguntas: perguntas.value
  }[tabName] || []
}

function getColumns(tabName) {
  const baseColumns = {
    cursos: [
      { name: 'nome', label: 'Nome', field: 'nome', align: 'left', sortable: true }
    ],
    cadeiras: [
      { name: 'nome', label: 'Nome', field: 'nome', align: 'left', sortable: true },
      {
        name: 'cursoId',
        label: 'Curso',
        field: 'cursoId',
        format: val => cursos.value.find(c => c.id === val)?.nome || val,
        sortable: true
      }
    ],
    modulos: [
      { name: 'nome', label: 'Nome', field: 'nome', align: 'left', sortable: true },
      {
        name: 'cadeiraId',
        label: 'Cadeira',
        field: 'cadeiraId',
        format: val => cadeiras.value.find(c => c.id === val)?.nome || val,
        sortable: true
      }
    ],
    temas: [
      { name: 'nome', label: 'Nome', field: 'nome', align: 'left', sortable: true },
      {
        name: 'moduloId',
        label: 'Módulo',
        field: 'moduloId',
        format: val => modulos.value.find(m => m.id === val)?.nome || val,
        sortable: true
      }
    ],
    videoAulas: [
      { name: 'titulo', label: 'Título', field: 'titulo', align: 'left', sortable: true },
      {
        name: 'temaId',
        label: 'Tema',
        field: 'temaId',
        format: val => temas.value.find(t => t.id === val)?.nome || val,
        sortable: true
      },
      { name: 'duracao', label: 'Duração (min)', field: 'duracao', align: 'center', sortable: true },
      { name: 'dataPublicacao', label: 'Publicação', field: 'dataPublicacao', align: 'center', sortable: true }
    ],
    perguntas: [
      { name: 'texto', label: 'Pergunta', field: 'texto', align: 'left', sortable: true },
      {
        name: 'imagem',
        label: 'Tem Imagem',
        field: 'imagemUrl',
        align: 'center',
        format: val => val ? '✔️' : '❌',
        sortable: true
      },
      {
        name: 'hasGraph',
        label: 'Tem Gráfico',
        field: 'hasGraph',
        align: 'center',
        format: val => val ? '✔️' : '❌',
        sortable: true
      },
      {
        name: 'temaId',
        label: 'Tema',
        field: 'temaId',
        format: val => temas.value.find(t => t.id === val)?.nome || val,
        sortable: true
      },
      {
        name: 'explicacao',
        label: 'Explicação',
        field: 'explicacao',
        align: 'left',
        sortable: true,
        format: val => val ? val.substring(0, 50) + (val.length > 50 ? '...' : '') : ''
      }
    ]
  }
  return [...(baseColumns[tabName] || []), {
    name: 'actions',
    label: 'Ações',
    field: 'actions',
    align: 'right',
    sortable: false
  }]
}

function onTableIntersection(entry) {
  if (entry.isIntersecting && !tableVisible.value) {
    tableVisible.value = true
  }
}

function showNotification(message, color, icon = null) {
  $q.notify({
    message,
    color,
    icon,
    position: 'top',
    classes: 'notify-modern'
  })
}

function showError(message, error) {
  console.error(`${message}:`, error)
  $q.notify({
    type: 'negative',
    message,
    caption: error?.message || '',
    position: 'top',
    classes: 'notify-modern'
  })
}
</script>

<style lang="scss" scoped>
.admin-dashboard {
  background: linear-gradient(180deg, #f5f7fa 0%, #ffffff 100%);
  min-height: 100vh;
  position: relative;
  overflow: hidden;
  padding: 0;

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

.header-modern {
  background: linear-gradient(135deg, var(--q-primary) 0%, var(--q-secondary) 100%);
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
  position: sticky;
  top: 0;
  z-index: 1000;

  .header-content {
    max-width: 1200px;
    margin: 0 auto;
    padding: 8px 16px;
  }

  .q-toolbar-title {
    font-size: 1.3rem;
    display: flex;
    align-items: center;
    animation-duration: 0.6s;
  }

  .q-btn {
    transition: all 0.3s ease;

    &:hover {
      transform: scale(1.1);
      background: rgba(255,255,255,0.1);
    }
  }

  .q-badge {
    font-size: 10px;
    padding: 2px 6px;
  }
}

.tabs-modern {
  background: #ffffff;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  border-radius: 12px;
  margin: 8px 16px 0;
  overflow: hidden;
  z-index: 1;

  .tab-item {
    font-weight: 500;
    padding: 10px 20px;
    transition: all 0.3s ease;
    text-transform: capitalize;

    &:hover {
      background: rgba(0,0,0,0.05);
      transform: translateY(-2px);
    }
  }
}

.tab-panels {
  background: transparent;
  padding: 16px;
}

.tab-panel {
  max-width: 1200px;
  margin: 0 auto;
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

.crud-table {
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 6px 16px rgba(0,0,0,0.1);
  animation-duration: 0.8s;

  :deep(.q-table) {
    border-radius: 12px;
    overflow: hidden;

    th {
      background: var(--q-primary);
      color: #ffffff;
      font-weight: 600;
    }

    td {
      transition: all 0.3s ease;

      &:hover {
        background: rgba(0,0,0,0.03);
      }
    }
  }
}

.form-card {
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 6px 16px rgba(0,0,0,0.1);
  padding: 16px;
  animation-duration: 0.8s;

  .q-expansion-item {
    border-radius: 8px;
    margin-bottom: 8px;

    :deep(.q-expansion-item__container) {
      background: #ffffff;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
  }
}

.edit-dialog, .video-dialog, .question-dialog, .confirm-dialog {
  max-width: 800px;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.2);
  animation-duration: 0.5s;

  .q-bar {
    border-radius: 12px 12px 0 0;
  }

  .q-field {
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-2px);
    }
  }
}

.video-preview {
  max-width: 600px;
  border-radius: 12px;
  box-shadow: 0 6px 16px rgba(0,0,0,0.15);
  margin: 0 auto;
}

.image-preview {
  max-width: 300px;
  max-height: 200px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.math-preview {
  min-height: 40px;
  padding: 8px;
  background: #f5f7fa;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
}

.graph-preview {
  width: 100%;
  height: 300px;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
}

.math-content {
  font-family: 'Times New Roman', serif;
}

.add-btn, .action-btn {
  border-radius: 50px;
  padding: 8px 16px;
  font-weight: 500;
  transition: all 0.3s ease;

  &:hover {
    transform: scale(1.05);
    box-shadow: 0 6px 16px rgba(0,0,0,0.2);
  }
}

:deep(.notify-modern) {
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  padding: 12px;
  font-weight: 500;
}

@media (max-width: 768px) {
  .header-modern {
    .header-content {
      padding: 6px 12px;
    }

    .q-toolbar-title {
      font-size: 1.1rem;
    }
  }

  .tabs-modern {
    margin: 4px 8px 0;
    .tab-item {
      padding: 8px 12px;
      font-size: 0.85rem;
    }
  }

  .tab-panel {
    padding: 12px;
  }

  .crud-table, .form-card {
    :deep(.q-table) {
      font-size: 0.85rem;

      th, td {
        padding: 6px;
      }
    }
  }

  .edit-dialog, .video-dialog, .question-dialog, .confirm-dialog {
    max-width: 100%;
  }
}

@media (max-width: 480px) {
  .header-modern {
    .q-toolbar-title {
      font-size: 0.95rem;
    }
  }

  .add-btn, .action-btn {
    padding: 6px 12px;
    font-size: 0.8rem;
  }

  .video-preview {
    max-width: 100%;
  }

  .image-preview {
    max-width: 100%;
  }

  .graph-preview {
    height: 200px;
  }
}
</style>

