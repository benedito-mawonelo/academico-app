<template>
  <q-page class="bg-grey-1">
    <!-- Banner Superior -->
    <div class="banner-academico q-pa-md text-white text-center">
      <div class="text-h5 text-weight-bold">Loja Acadêmica</div>
      <div class="text-subtitle1 q-mt-sm">
        Materiais de qualidade para seu sucesso acadêmico
      </div>
    </div>

    <!-- Categorias -->
    <div class="q-px-md q-pt-md">
      <div class="text-subtitle1 text-weight-bold q-mb-sm">Categorias</div>
      <div class="row q-col-gutter-sm">
        <q-btn
          v-for="cat in categorias"
          :key="cat.id"
          unelevated
          :color="cat.ativa ? 'primary' : 'grey-4'"
          :text-color="cat.ativa ? 'white' : 'dark'"
          class="col-6 col-sm-3"
          @click="selecionarCategoria(cat.id)"
        >
          <q-icon :name="cat.icone" class="q-mr-sm" />
          {{ cat.nome }}
        </q-btn>
      </div>
    </div>

    <!-- Produtos em Destaque -->
    <div class="q-pa-md">
      <div class="text-subtitle1 text-weight-bold q-mb-sm">Produtos em Destaque</div>
      <div class="row q-col-gutter-md">
        <div
          class="col-12 col-sm-6 col-md-4"
          v-for="item in produtosFiltrados"
          :key="item.id"
        >
          <q-card bordered class="product-card">
            <q-img :src="item.img" :ratio="16/9" basic>
              <div class="absolute-bottom text-subtitle2 text-center">
                {{ item.nome }}
              </div>
            </q-img>

            <q-card-section class="q-pt-sm">
              <div class="text-caption text-grey-7 ellipsis-2-lines">
                {{ item.descricao }}
              </div>
              <div class="text-h6 text-primary q-mt-sm text-weight-bold">
                {{ formatarPreco(item.preco) }}
              </div>
            </q-card-section>

            <q-card-actions class="q-px-md q-pb-md">
              <q-btn
                unelevated
                color="primary"
                label="Comprar"
                class="full-width"
                @click="verDetalhes(item)"
              />
            </q-card-actions>
          </q-card>
        </div>
      </div>
    </div>

    <!-- Banner de Promoção -->
    <div class="promo-banner q-mt-xl q-pa-md text-center">
      <div class="text-h6 text-weight-bold q-mb-sm">Precisa de mais itens?</div>
      <div class="text-subtitle2 q-mb-md">
        Visite nosso outro aplicativo para eletrônicos, celulares e muito mais!
      </div>
      <q-btn
        color="secondary"
        glossy
        label="Baixe o Compra Fácil"
        icon-right="arrow_forward"
        class="animated-btn"
        @click="irParaCompraFacil"
      />
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed } from 'vue'

// Estado das categorias
const categoriaAtiva = ref(1)

const categorias = ref([
  { id: 1, nome: 'Manuais', icone: 'menu_book', ativa: true },
  { id: 2, nome: 'Informática', icone: 'computer', ativa: false },
  { id: 3, nome: 'Biologia', icone: 'biotech', ativa: false },
  { id: 4, nome: 'Química', icone: 'science', ativa: false },
  { id: 5, nome: 'Matemática', icone: 'calculate', ativa: false },
  { id: 6, nome: 'Engenharia', icone: 'engineering', ativa: false },
  { id: 7, nome: 'Artes', icone: 'palette', ativa: false },
  { id: 8, nome: 'Outros', icone: 'category', ativa: false }
])

const produtos = ref([
  {
    id: 1,
    nome: 'Manual de Matemática 12ª Classe',
    descricao: 'Manual completo conforme o currículo nacional, com exercícios resolvidos e teoria detalhada.',
    preco: 1250,
    img: 'https://cdn.quasar.dev/img/mat1.jpg',
    categoria: 1
  },
  {
    id: 2,
    nome: 'Kit de Física Aplicada',
    descricao: 'Conjunto completo para experimentos de física, incluindo materiais e manual de instruções.',
    preco: 8999,
    img: 'https://cdn.quasar.dev/img/fisica.jpg',
    categoria: 5
  },
  {
    id: 3,
    nome: 'Microscópio Digital',
    descricao: 'Microscópio com câmera HD e conexão USB para computador, ideal para biologia.',
    preco: 12499,
    img: 'https://cdn.quasar.dev/img/material1.jpg',
    categoria: 3
  },
  {
    id: 4,
    nome: 'Kit de Química Básica',
    descricao: 'Contém reagentes e equipamentos seguros para experimentos químicos iniciais.',
    preco: 7599,
    img: 'https://cdn.quasar.dev/img/material2.jpg',
    categoria: 4
  },
  {
    id: 5,
    nome: 'Calculadora Científica',
    descricao: 'Modelo avançado com funções para engenharia, matemática e estatística.',
    preco: 3499,
    img: 'https://cdn.quasar.dev/img/material3.jpg',
    categoria: 2
  },
  {
    id: 6,
    nome: 'Livro de Anatomia',
    descricao: 'Atlas de anatomia humana com ilustrações detalhadas e explicações claras.',
    preco: 6899,
    img: 'https://cdn.quasar.dev/img/material4.jpg',
    categoria: 3
  }
])

// Computed
const produtosFiltrados = computed(() => {
  return categoriaAtiva.value === 0
    ? produtos.value
    : produtos.value.filter(p => p.categoria === categoriaAtiva.value)
})

// Métodos
function selecionarCategoria(id) {
  categorias.value.forEach(cat => cat.ativa = cat.id === id)
  categoriaAtiva.value = id
}

function verDetalhes(item) {
  // Navegação futura para página de detalhes
  alert(`Detalhes de: ${item.nome}`)
}

function formatarPreco(valor) {
  return `${(valor / 100).toFixed(2)} MZN`
}

function irParaCompraFacil() {
  // Lógica para redirecionar para o outro app
  alert('Redirecionando para o Compra Fácil...')
}
</script>

<style lang="scss" scoped>
.banner-academico {
  background: linear-gradient(135deg, #1976D2 0%, #2196F3 100%);
  padding-top: 24px;
  padding-bottom: 24px;
}

.product-card {
  border-radius: 12px;
  transition: transform 0.3s;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 20px rgba(0,0,0,0.1);
  }
}

.promo-banner {
  background-color: #f8f9fa;
  border-top: 1px solid #e0e0e0;
  padding-top: 32px;
  padding-bottom: 32px;
}

.animated-btn {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
}

.ellipsis-2-lines {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
