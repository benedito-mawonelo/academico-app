<template>
  <q-card class="digital-notebook">
    <!-- Barra de ferramentas superior -->
    <div class="toolbar row items-center q-pa-sm">
      <div class="tool-section">
        <q-btn-toggle
          v-model="modo"
          toggle-color="primary"
          :options="[
            {value: 'desenho', icon: 'edit', label: 'Caneta'},
            {value: 'borracha', icon: 'backspace', label: 'Borracha'}
          ]"
          dense
        />
      </div>

      <q-separator vertical inset class="q-mx-sm" />

      <div class="tool-section" :class="{disabled: modo === 'borracha'}">
        <q-select
          v-model="corAtual"
          :options="coresDisponiveis"
          label="Cor"
          emit-value
          map-options
          dense
          outlined
          style="width: 120px"
        />
        <q-slider
          v-model="tamanhoPincel"
          :min="1"
          :max="20"
          label
          label-always
          :label-value="`Tamanho: ${tamanhoPincel}`"
          class="q-ml-md"
          style="width: 150px"
        />
      </div>

      <q-separator vertical inset class="q-mx-sm" />

      <div class="tool-section">
        <q-btn
          icon="add_box"
          label="Texto"
          color="orange"
          dense
          @click="adicionarCaixa"
        />
        <q-btn
          icon="image"
          label="Imagem"
          color="teal"
          dense
          class="q-ml-sm"
          @click="adicionarImagem"
        />
      </div>

      <q-space />

      <div class="tool-section">
        <q-btn
          icon="save"
          label="Salvar"
          color="positive"
          dense
          @click="salvarImagem"
        />
        <q-btn
          icon="note_add"
          label="Nova Folha"
          color="primary"
          dense
          class="q-ml-sm"
          @click="novaFolha"
        />
      </div>
    </div>

    <!-- Abas das folhas -->
    <q-tabs
      v-model="folhaAtual"
      dense
      class="tabs"
      active-color="primary"
      indicator-color="primary"
      narrow-indicator
    >
      <q-tab
        v-for="(folha, i) in folhas"
        :key="i"
        :name="i"
        :label="`Folha ${i + 1}`"
      >
        <q-btn
          v-if="folhas.length > 1"
          icon="close"
          size="xs"
          flat
          dense
          round
          @click.stop="removerFolha(i)"
          class="tab-close-btn"
        />
      </q-tab>
      <q-btn
        icon="add"
        flat
        dense
        round
        @click="novaFolha"
        class="add-tab-btn"
      />
    </q-tabs>

    <!-- Área de desenho -->
    <div class="drawing-area">
      <canvas
        ref="canvas"
        class="drawing-canvas"
        @mousedown="startDesenho"
        @mousemove="desenhar"
        @mouseup="pararDesenho"
        @mouseleave="pararDesenho"
        @touchstart.prevent="startDesenhoTouch"
        @touchmove.prevent="desenharTouch"
        @touchend.prevent="pararDesenho"
      ></canvas>

      <!-- Elementos sobrepostos -->
      <div
        v-for="(caixa, index) in folhas[folhaAtual].elementos"
        :key="'text-'+index"
        v-show="caixa.tipo === 'texto'"
        class="text-box"
        :style="{
          top: caixa.y + 'px',
          left: caixa.x + 'px',
          width: caixa.width + 'px',
          height: caixa.height + 'px',
          'z-index': caixa.zIndex,
          'font-size': caixa.fontSize + 'px',
          color: caixa.color
        }"
        contenteditable="true"
        @input="updateTexto(index, $event)"
        @mousedown.stop.prevent="iniciarDragElemento(index, $event, 'texto')"
        @focus="bringToFront(index)"
      >{{ caixa.texto }}</div>

      <div
        v-for="(img, index) in folhas[folhaAtual].elementos"
        :key="'img-'+index"
        v-show="img.tipo === 'imagem'"
        class="image-box"
        :style="{
          top: img.y + 'px',
          left: img.x + 'px',
          width: img.width + 'px',
          height: img.height + 'px',
          'z-index': img.zIndex
        }"
        @mousedown.stop.prevent="iniciarDragElemento(index, $event, 'imagem')"
      >
        <img :src="img.src" class="image-content" />
        <q-btn
          icon="close"
          size="xs"
          round
          dense
          flat
          class="remove-element-btn"
          @click.stop="removerElemento(index)"
        />
      </div>
    </div>
  </q-card>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue'

const canvas = ref(null)
let ctx
const modo = ref('desenho')
const corAtual = ref('#000000')
const tamanhoPincel = ref(3)
const zIndexCounter = ref(0)

const coresDisponiveis = [
  { label: 'Preto', value: '#000000' },
  { label: 'Vermelho', value: '#ff0000' },
  { label: 'Azul', value: '#0000ff' },
  { label: 'Verde', value: '#00aa00' },
  { label: 'Amarelo', value: '#ffaa00' },
  { label: 'Roxo', value: '#800080' },
  { label: 'Rosa', value: '#ff69b4' }
]

const desenhando = ref(false)
const folhas = reactive([
  {
    desenhoData: null,
    elementos: []
  }
])
const folhaAtual = ref(0)

onMounted(() => {
  ctx = canvas.value.getContext('2d')
  redraw()
  resizeCanvas()
  window.addEventListener('resize', resizeCanvas)
})

watch(folhaAtual, () => {
  redraw()
})

watch(tamanhoPincel, (newSize) => {
  ctx.lineWidth = newSize
})

function resizeCanvas() {
  const container = canvas.value.parentElement
  canvas.value.width = container.clientWidth
  canvas.value.height = container.clientHeight
  redraw()
}

function redraw() {
  ctx.clearRect(0, 0, canvas.value.width, canvas.value.height)

  const data = folhas[folhaAtual.value].desenhoData
  if (data) {
    ctx.putImageData(data, 0, 0)
  }
}

function startDesenho(e) {
  if (modo.value === 'texto') return

  desenhando.value = true
  ctx.beginPath()
  const pos = getPos(e)
  ctx.moveTo(pos.x, pos.y)
  ctx.strokeStyle = modo.value === 'desenho' ? corAtual.value : '#fff'
  ctx.lineWidth = modo.value === 'borracha' ? tamanhoPincel.value * 3 : tamanhoPincel.value
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
}

function desenhar(e) {
  if (!desenhando.value || modo.value === 'texto') return

  const pos = getPos(e)
  ctx.lineTo(pos.x, pos.y)
  ctx.stroke()
}

function pararDesenho() {
  if (!desenhando.value) return

  desenhando.value = false
  ctx.closePath()
  folhas[folhaAtual.value].desenhoData = ctx.getImageData(0, 0, canvas.value.width, canvas.value.height)
}

function startDesenhoTouch(e) {
  const touch = e.touches[0]
  startDesenho({ clientX: touch.clientX, clientY: touch.clientY })
}

function desenharTouch(e) {
  const touch = e.touches[0]
  desenhar({ clientX: touch.clientX, clientY: touch.clientY })
}

function getPos(e) {
  const rect = canvas.value.getBoundingClientRect()
  return {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top
  }
}

function salvarImagem() {
  // Criar um canvas temporário para incluir todos os elementos
  const tempCanvas = document.createElement('canvas')
  tempCanvas.width = canvas.value.width
  tempCanvas.height = canvas.value.height
  const tempCtx = tempCanvas.getContext('2d')

  // Desenhar o conteúdo do canvas principal
  const data = folhas[folhaAtual.value].desenhoData
  if (data) {
    tempCtx.putImageData(data, 0, 0)
  }

  // Converter para imagem e baixar
  const dataUrl = tempCanvas.toDataURL('image/png')
  const link = document.createElement('a')
  link.download = `caderno-${folhaAtual.value + 1}-${new Date().toISOString().slice(0,10)}.png`
  link.href = dataUrl
  link.click()
}

function novaFolha() {
  folhas.push({
    desenhoData: null,
    elementos: []
  })
  folhaAtual.value = folhas.length - 1
}

function removerFolha(index) {
  if (folhas.length <= 1) return

  folhas.splice(index, 1)
  if (folhaAtual.value >= index) {
    folhaAtual.value = Math.max(0, folhaAtual.value - 1)
  }
}

function adicionarCaixa() {
  zIndexCounter.value++
  folhas[folhaAtual.value].elementos.push({
    tipo: 'texto',
    x: 50,
    y: 50,
    width: 200,
    height: 100,
    texto: 'Clique para editar...',
    color: corAtual.value,
    fontSize: 16,
    zIndex: zIndexCounter.value
  })
}

function adicionarImagem() {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'
  input.onchange = (e) => {
    const file = e.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      zIndexCounter.value++
      folhas[folhaAtual.value].elementos.push({
        tipo: 'imagem',
        x: 100,
        y: 100,
        width: 200,
        height: 150,
        src: event.target.result,
        zIndex: zIndexCounter.value
      })
    }
    reader.readAsDataURL(file)
  }
  input.click()
}

function removerElemento(index) {
  folhas[folhaAtual.value].elementos.splice(index, 1)
}

function updateTexto(index, event) {
  folhas[folhaAtual.value].elementos[index].texto = event.target.innerText
}

function bringToFront(index) {
  zIndexCounter.value++
  folhas[folhaAtual.value].elementos[index].zIndex = zIndexCounter.value
}

let elementoArrastado = null
let offsetX = 0
let offsetY = 0
// let tipoElementoArrastado = null

function iniciarDragElemento(index, event) {
  elementoArrastado = index
  // tipoElementoArrastado = tipo
  const elemento = folhas[folhaAtual.value].elementos[index]
  offsetX = event.clientX - elemento.x
  offsetY = event.clientY - elemento.y

  // Trazer para frente ao começar a arrastar
  bringToFront(index)

  window.addEventListener('mousemove', moverElemento)
  window.addEventListener('mouseup', pararDragElemento)
}

function moverElemento(event) {
  if (elementoArrastado === null) return

  const elemento = folhas[folhaAtual.value].elementos[elementoArrastado]
  elemento.x = event.clientX - offsetX
  elemento.y = event.clientY - offsetY
}

function pararDragElemento() {
  elementoArrastado = null
  // tipoElementoArrastado = null
  window.removeEventListener('mousemove', moverElemento)
  window.removeEventListener('mouseup', pararDragElemento)
}
</script>

<style lang="scss" scoped>
.digital-notebook {
  display: flex;
  flex-direction: column;
  height: 800px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);

  .toolbar {
    background: #f5f5f5;
    border-bottom: 1px solid #e0e0e0;

    .tool-section {
      display: flex;
      align-items: center;

      &.disabled {
        opacity: 0.5;
        pointer-events: none;
      }
    }
  }

  .tabs {
    background: #f9f9f9;
    border-bottom: 1px solid #e0e0e0;

    .tab-close-btn {
      margin-left: 8px;
      opacity: 0;
      transition: opacity 0.2s;
    }

    .q-tab:hover .tab-close-btn {
      opacity: 1;
    }

    .add-tab-btn {
      margin-left: 8px;
      color: #666;
    }
  }

  .drawing-area {
    position: relative;
    flex-grow: 1;
    background: white;
    overflow: hidden;

    .drawing-canvas {
      display: block;
      background: white;
      width: 100%;
      height: 100%;
      touch-action: none;
    }

    .text-box {
      position: absolute;
      border: 1px dashed #aaa;
      padding: 8px;
      background: rgba(255,255,255,0.9);
      resize: both;
      overflow: hidden;
      cursor: move;
      min-width: 100px;
      min-height: 50px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      border-radius: 4px;

      &:focus {
        border: 1px solid var(--q-primary);
        outline: none;
      }
    }

    .image-box {
      position: absolute;
      border: 1px solid #ddd;
      cursor: move;
      background: #f5f5f5;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      border-radius: 4px;

      .image-content {
        width: 100%;
        height: 100%;
        object-fit: contain;
      }

      .remove-element-btn {
        position: absolute;
        top: 4px;
        right: 4px;
        background: rgba(0,0,0,0.5);
        color: white;
      }
    }
  }
}

@media (max-width: 600px) {
  .digital-notebook {
    height: 600px;

    .toolbar {
      flex-wrap: wrap;
      padding: 8px;

      .tool-section {
        margin-bottom: 8px;
      }
    }
  }
}
</style>
