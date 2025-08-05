<template>
  <div class="app-layout">
    <app-header @navigate="goTo" />
    <q-page v-if="filteredCourses && filteredCourses.length" class="main-content">
      <div class="hero-section">
        <div class="hero-content">
          <h1 class="hero-title animate__animated animate__fadeInDown">
            <span class="hero-highlight">Loja Acadêmica</span>
            <span class="hero-subtitle">Turbine sua carreira com nossos cursos certificados!</span>
          </h1>
          <q-banner inline-actions rounded class="bg-green-10 text-white q-mb-lg animate__animated animate__fadeInUp">
            <template v-slot:avatar>
              <q-icon name="stars" size="sm" />
            </template>
            Promoção: Até 40% de desconto em cursos selecionados!
            <template v-slot:action>
              <q-btn flat color="white" label="Ver Ofertas" @click="filterCourses('discount')" />
            </template>
          </q-banner>
        </div>
      </div>

      <div class="courses-container">
        <!-- Filtros -->
        <div class="filters-section animate__animated animate__fadeIn">
          <q-input
            v-model="searchQuery"
            placeholder="Pesquisar cursos..."
            outlined
            dense
            rounded
            class="search-input"
            bg-color="white"
            @input="debounceFilter"
          >
            <template v-slot:prepend>
              <q-icon name="search" />
            </template>
          </q-input>
          <q-select
            v-model="categoryFilter"
            :options="categoryOptions"
            label="Categoria"
            outlined
            dense
            rounded
            bg-color="white"
            class="filter-select"
            @input="filterCourses"
          />
          <q-select
            v-model="levelFilter"
            :options="levelOptions"
            label="Nível"
            outlined
            dense
            rounded
            bg-color="white"
            class="filter-select"
            @input="filterCourses"
          />
          <q-select
            v-model="priceFilter"
            :options="priceOptions"
            label="Preço"
            outlined
            dense
            rounded
            bg-color="white"
            class="filter-select"
            @input="filterCourses"
          />
          <q-btn
            color="green"
            label="Limpar Filtros"
            rounded
            @click="clearFilters"
            class="clear-filters-btn"
          />
        </div>

        <!-- Cursos Mais Pedidos -->
        <div class="section-header">
          <q-icon name="trending_up" color="green" size="md" class="q-mr-sm" />
          <h2 class="section-title animate__animated animate__fadeInLeft">Cursos Mais Pedidos no Mercado</h2>
        </div>
        <div class="courses-grid">
          <q-card
            v-for="(course, index) in filteredCourses.filter(c => c.popular)"
            :key="course.id"
            class="course-card shadow-4 animate__animated animate__zoomIn"
            :style="{ animationDelay: `${index * 100}ms` }"
            flat
            bordered
            @click="viewCourse(course.id)"
          >
            <q-img
              :src="course.thumbnail"
              :ratio="16/9"
              class="course-image"
            >
              <div class="absolute-top-right q-pa-sm">
                <q-badge color="red" v-if="course.discount" rounded>
                  -{{ course.discount }}%
                </q-badge>
              </div>
            </q-img>
            <q-card-section>
              <div class="course-title text-weight-bold text-green">{{ course.title }}</div>
              <div class="course-description text-grey-8">{{ course.description }}</div>
              <div class="course-details q-mt-sm">
                <q-chip dense size="sm" color="green-2" text-color="green-10" icon="schedule">
                  {{ course.duration }} horas
                </q-chip>
                <q-chip dense size="sm" color="green-2" text-color="green-10" icon="school">
                  {{ course.level }}
                </q-chip>
              </div>
              <div class="course-price q-mt-md">
                <span v-if="course.discount" class="text-strike text-grey-7">
                  MZN {{ formatPrice(course.originalPrice) }}
                </span>
                <span class="text-weight-bold text-green-10">
                  MZN {{ formatPrice(course.currentPrice) }}
                </span>
              </div>
            </q-card-section>
            <q-card-actions align="between">
              <q-btn
                color="green"
                label="Comprar Agora"
                rounded
                @click.stop="buyCourse(course)"
                :loading="purchasingCourse === course.id"
                class="buy-btn"
              />
              <q-btn
                flat
                color="grey-8"
                icon="shopping_cart"
                round
                @click.stop="addToCart(course)"
              >
                <q-tooltip transition-show="scale" transition-hide="scale">Adicionar ao Carrinho</q-tooltip>
              </q-btn>
            </q-card-actions>
          </q-card>
        </div>

        <!-- Cursos de Especialização -->
        <div class="section-header q-mt-xl">
          <q-icon name="school" color="green" size="md" class="q-mr-sm" />
          <h2 class="section-title animate__animated animate__fadeInLeft">Cursos de Especialização</h2>
        </div>
        <div class="courses-grid">
          <q-card
            v-for="(course, index) in filteredCourses.filter(c => c.specialization)"
            :key="course.id"
            class="course-card shadow-4 animate__animated animate__zoomIn"
            :style="{ animationDelay: `${index * 100}ms` }"
            flat
            bordered
            @click="viewCourse(course.id)"
          >
            <q-img
              :src="course.thumbnail"
              :ratio="16/9"
              class="course-image"
            >
              <div class="absolute-top-right q-pa-sm">
                <q-badge color="red" v-if="course.discount" rounded>
                  -{{ course.discount }}%
                </q-badge>
              </div>
            </q-img>
            <q-card-section>
              <div class="course-title text-weight-bold text-green">{{ course.title }}</div>
              <div class="course-description text-grey-8">{{ course.description }}</div>
              <div class="course-details q-mt-sm">
                <q-chip dense size="sm" color="green-2" text-color="green-10" icon="schedule">
                  {{ course.duration }} horas
                </q-chip>
                <q-chip dense size="sm" color="green-2" text-color="green-10" icon="school">
                  {{ course.level }}
                </q-chip>
              </div>
              <div class="course-price q-mt-md">
                <span v-if="course.discount" class="text-strike text-grey-7">
                  MZN {{ formatPrice(course.originalPrice) }}
                </span>
                <span class="text-weight-bold text-green-10">
                  MZN {{ formatPrice(course.currentPrice) }}
                </span>
              </div>
            </q-card-section>
            <q-card-actions align="between">
              <q-btn
                color="green"
                label="Comprar Agora"
                rounded
                @click.stop="buyCourse(course)"
                :loading="purchasingCourse === course.id"
                class="buy-btn"
              />
              <q-btn
                flat
                color="grey-8"
                icon="shopping_cart"
                round
                @click.stop="addToCart(course)"
              >
                <q-tooltip transition-show="scale" transition-hide="scale">Adicionar ao Carrinho</q-tooltip>
              </q-btn>
            </q-card-actions>
          </q-card>
        </div>

        <!-- Outros Cursos -->
        <div class="section-header q-mt-xl">
          <q-icon name="library_books" color="green" size="md" class="q-mr-sm" />
          <h2 class="section-title animate__animated animate__fadeInLeft">Outros Cursos</h2>
        </div>
        <div class="courses-grid">
          <q-card
            v-for="(course, index) in filteredCourses.filter(c => !c.popular && !c.specialization)"
            :key="course.id"
            class="course-card shadow-4 animate__animated animate__zoomIn"
            :style="{ animationDelay: `${index * 100}ms` }"
            flat
            bordered
            @click="viewCourse(course.id)"
          >
            <q-img
              :src="course.thumbnail"
              :ratio="16/9"
              class="course-image"
            >
              <div class="absolute-top-right q-pa-sm">
                <q-badge color="red" v-if="course.discount" rounded>
                  -{{ course.discount }}%
                </q-badge>
              </div>
            </q-img>
            <q-card-section>
              <div class="course-title text-weight-bold text-green">{{ course.title }}</div>
              <div class="course-description text-grey-8">{{ course.description }}</div>
              <div class="course-details q-mt-sm">
                <q-chip dense size="sm" color="green-2" text-color="green-10" icon="schedule">
                  {{ course.duration }} horas
                </q-chip>
                <q-chip dense size="sm" color="green-2" text-color="green-10" icon="school">
                  {{ course.level }}
                </q-chip>
              </div>
              <div class="course-price q-mt-md">
                <span v-if="course.discount" class="text-strike text-grey-7">
                  MZN {{ formatPrice(course.originalPrice) }}
                </span>
                <span class="text-weight-bold text-green-10">
                  MZN {{ formatPrice(course.currentPrice) }}
                </span>
              </div>
            </q-card-section>
            <q-card-actions align="between">
              <q-btn
                color="green"
                label="Comprar Agora"
                rounded
                @click.stop="buyCourse(course)"
                :loading="purchasingCourse === course.id"
                class="buy-btn"
              />
              <q-btn
                flat
                color="grey-8"
                icon="shopping_cart"
                round
                @click.stop="addToCart(course)"
              >
                <q-tooltip transition-show="scale" transition-hide="scale">Adicionar ao Carrinho</q-tooltip>
              </q-btn>
            </q-card-actions>
          </q-card>
        </div>
      </div>
    </q-page>
    <q-page v-else class="main-content">
      <div class="text-center q-pa-md">Carregando cursos...</div>
    </q-page>
    <app-footer />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { collection, getDocs, addDoc } from 'firebase/firestore';
import { db, firebaseAuth } from 'boot/firebase';
import { debounce } from 'quasar';
import AppHeader from 'components/AppHeader.vue';
import AppFooter from 'components/AppFooter.vue';

const $q = useQuasar();
const router = useRouter();

const searchQuery = ref('');
const categoryFilter = ref(null);
const levelFilter = ref(null);
const priceFilter = ref(null);
const purchasingCourse = ref(null);

const courses = ref([]);

const categoryOptions = [
  'Todas',
  'Tecnologia',
  'Marketing',
  'Gestão',
  'Fotografia',
  'Idiomas'
];

const levelOptions = [
  'Todos',
  'Iniciante',
  'Intermediário',
  'Avançado'
];

const priceOptions = [
  'Todos',
  'Abaixo de MZN 4.000',
  'MZN 4.000 - MZN 8.000',
  'Acima de MZN 8.000'
];

const filteredCourses = computed(() => {
  let filtered = courses.value;
  if (searchQuery.value) {
    filtered = filtered.filter(course =>
      course.title?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      course.description?.toLowerCase().includes(searchQuery.value.toLowerCase())
    );
  }
  if (categoryFilter.value && categoryFilter.value !== 'Todas') {
    filtered = filtered.filter(course => course.category === categoryFilter.value);
  }
  if (levelFilter.value && levelFilter.value !== 'Todos') {
    filtered = filtered.filter(course => course.level === levelFilter.value);
  }
  if (priceFilter.value && priceFilter.value !== 'Todos') {
    if (priceFilter.value === 'Abaixo de MZN 4.000') {
      filtered = filtered.filter(course => course.currentPrice < 4000);
    } else if (priceFilter.value === 'MZN 4.000 - MZN 8.000') {
      filtered = filtered.filter(course => course.currentPrice >= 4000 && course.currentPrice <= 8000);
    } else {
      filtered = filtered.filter(course => course.currentPrice > 8000);
    }
  }
  return filtered;
});

onMounted(async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'cursos'));
    if (querySnapshot.empty) {
      const defaultCourses = [
        {
          id: 'course1',
          title: 'Desenvolvimento Web Full Stack',
          description: 'Domine HTML, CSS, JavaScript e Node.js para criar sites incríveis.',
          thumbnail: 'https://images.unsplash.com/photo-1516321310762-479e93c1e7a6?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
          duration: 50,
          level: 'Intermediário',
          category: 'Tecnologia',
          originalPrice: 6000,
          currentPrice: 4200,
          discount: 30,
          popular: true,
          specialization: false
        },
        {
          id: 'course2',
          title: 'Marketing Digital Estratégico',
          description: 'Aprenda SEO, redes sociais e anúncios pagos para alavancar negócios.',
          thumbnail: 'https://images.unsplash.com/photo-1551288049-b7f381c6e4c9?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
          duration: 35,
          level: 'Iniciante',
          category: 'Marketing',
          originalPrice: 4800,
          currentPrice: 4800,
          discount: 0,
          popular: true,
          specialization: false
        },
        {
          id: 'course3',
          title: 'Análise de Dados com Python',
          description: 'Explore dados com Pandas, NumPy e visualizações interativas.',
          thumbnail: 'https://images.unsplash.com/photo-1551288049-b7f381c6e4c9?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
          duration: 45,
          level: 'Intermediário',
          category: 'Tecnologia',
          originalPrice: 5600,
          currentPrice: 3920,
          discount: 30,
          popular: true,
          specialization: false
        },
        {
          id: 'course4',
          title: 'Gestão de Projetos PMP',
          description: 'Prepare-se para a certificação PMP com práticas avançadas.',
          thumbnail: 'https://images.unsplash.com/photo-1516321310762-479e93c1e7a6?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
          duration: 60,
          level: 'Avançado',
          category: 'Gestão',
          originalPrice: 7600,
          currentPrice: 6080,
          discount: 20,
          popular: false,
          specialization: true
        },
        {
          id: 'course5',
          title: 'Inteligência Artificial Avançada',
          description: 'Construa modelos de machine learning com TensorFlow e Keras.',
          thumbnail: 'https://images.unsplash.com/photo-1516321310762-479e93c1e7a6?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
          duration: 80,
          level: 'Avançado',
          category: 'Tecnologia',
          originalPrice: 9600,
          currentPrice: 7680,
          discount: 20,
          popular: false,
          specialization: true
        },
        {
          id: 'course6',
          title: 'Fotografia Digital',
          description: 'Aprenda técnicas de fotografia com câmeras profissionais e smartphones.',
          thumbnail: 'https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
          duration: 20,
          level: 'Iniciante',
          category: 'Fotografia',
          originalPrice: 2800,
          currentPrice: 2800,
          discount: 0,
          popular: false,
          specialization: false
        },
        {
          id: 'course7',
          title: 'Inglês para Negócios',
          description: 'Melhore sua comunicação em inglês para ambientes corporativos.',
          thumbnail: 'https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
          duration: 30,
          level: 'Intermediário',
          category: 'Idiomas',
          originalPrice: 3600,
          currentPrice: 2880,
          discount: 20,
          popular: false,
          specialization: false
        }
      ];
      for (const course of defaultCourses) {
        await addDoc(collection(db, 'cursos'), course);
      }
      courses.value = defaultCourses;
    } else {
      courses.value = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        originalPrice: doc.data().originalPrice || 0,
        currentPrice: doc.data().currentPrice || 0
      }));
    }
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Erro ao carregar cursos',
      caption: error?.message || '',
      position: 'top'
    });
    courses.value = [];
  }
});

const debounceFilter = debounce(() => filterCourses(), 300);

function filterCourses(filterType) {
  if (filterType === 'discount') {
    categoryFilter.value = null;
    levelFilter.value = null;
    priceFilter.value = null;
    searchQuery.value = '';
    courses.value = courses.value.filter(course => course.discount > 0);
  }
}

function clearFilters() {
  searchQuery.value = '';
  categoryFilter.value = null;
  levelFilter.value = null;
  priceFilter.value = null;
}

// function formatPrice(price) {
//   if (price == null) return 'N/A';
//   return price.toLocaleString('pt-MZ', { style: 'currency', currency: 'MZN' });
// }
function formatPrice(price) {
  if (price == null) return 'N/A';
  try {
    return price.toLocaleString('pt-MZ', { style: 'currency', currency: 'MZN' });
  } catch (error) {
    console.log(error)
    // Fallback formatting if pt-MZ is not supported
    return `MZN ${price.toFixed(2).replace('.', ',')}`;
  }
}

function viewCourse(courseId) {
  router.push({ path: 'curso-detalhes', query: { id: courseId } });
}

async function buyCourse(course) {
  purchasingCourse.value = course.id;
  try {
    const paymentResponse = await simulatePayment(course);

    if (paymentResponse.success) {
      await addDoc(collection(db, 'compras'), {
        userId: firebaseAuth.currentUser?.uid,
        courseId: course.id,
        courseTitle: course.title,
        price: course.currentPrice,
        purchaseDate: new Date(),
        status: 'completed'
      });

      await addDoc(collection(db, 'certificados'), {
        userId: firebaseAuth.currentUser?.uid,
        courseId: course.id,
        courseTitle: course.title,
        issuedDate: new Date(),
        certificateUrl: `https://example.com/certificates/${course.id}-${firebaseAuth.currentUser?.uid}.pdf`
      });

      $q.notify({
        message: `Compra de "${course.title}" realizada com sucesso! Certificado gerado.`,
        color: 'positive',
        position: 'top',
        icon: 'check_circle'
      });
    } else {
      throw new Error('Falha no pagamento.');
    }
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Erro ao processar a compra',
      caption: error?.message || '',
      position: 'top'
    });
  } finally {
    purchasingCourse.value = null;
  }
}

async function addToCart(course) {
  $q.notify({
    message: `Curso "${course.title}" adicionado ao carrinho!`,
    color: 'positive',
    position: 'top',
    icon: 'shopping_cart'
  });
}

async function simulatePayment(course) {
  console.log(course);
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({ success: true });
    }, 1500);
  });
}

function goTo(page) {
  router.push(`/${page}`);
}
</script>

<style lang="scss" scoped>
.app-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: linear-gradient(to bottom, #f0f4f8, #ffffff);
}

.main-content {
  flex: 1;
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding: 0;
}

.hero-section {
  background: linear-gradient(135deg, #2E7D32 0%, #81C784 100%);
  color: white;
  padding: 60px 24px 40px;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiPjxkZWZzPjxwYXR0ZXJuIGlkPSJwYXR0ZXJuIiB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiIHBhdHRlcm5UcmFuc2Zvcm09InJvdGF0ZSg0NSkiPjxyZWN0IHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjA4KSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3QgZmlsbD0idXJsKCNwYXR0ZXJuKSIgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIvPjwvc3ZnPg==');
    opacity: 0.3;
  }
}

.hero-content {
  position: relative;
  z-index: 1;
  max-width: 1200px;
  margin: 0 auto;
  text-align: left;
}

.hero-title {
  font-size: 2.5rem;
  font-weight: 700;
  line-height: 1.2;
  margin-bottom: 24px;

  .hero-highlight {
    display: block;
    text-shadow: 0 3px 6px rgba(0, 0, 0, 0.2);
  }

  .hero-subtitle {
    display: block;
    font-size: 1.6rem;
    font-weight: 400;
    opacity: 0.9;
    margin-top: 12px;
  }
}

.courses-container {
  padding: 48px 32px;
  max-width: 1200px;
  margin: 0 auto;
}

.filters-section {
  display: flex;
  gap: 16px;
  margin-bottom: 40px;
  flex-wrap: wrap;
  background: white;
  padding: 16px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);

  .search-input {
    flex: 1;
    min-width: 250px;
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-2px);
    }
  }

  .filter-select {
    min-width: 180px;
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-2px);
    }
  }

  .clear-filters-btn {
    align-self: flex-end;
    transition: all 0.3s ease;

    &:hover {
      transform: scale(1.05);
      background-color: #2E7D32 !important;
      color: white !important;
    }
  }
}

.section-header {
  display: flex;
  align-items: center;
  margin-bottom: 24px;

  .section-title {
    font-size: 2rem;
    font-weight: 700;
    color: #1a3c1f;
  }
}

.courses-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 32px;

  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  }

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
}

.course-card {
  border-radius: 16px;
  overflow: hidden;
  transition: all 0.3s ease;
  background: white;
  cursor: pointer;

  &:hover {
    transform: translateY(-6px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);

    .course-title {
      color: #1a3c1f;
    }

    .buy-btn {
      background-color: #1a3c1f !important;
    }
  }

  .course-image {
    border-top-left-radius: 16px;
    border-top-right-radius: 16px;
    transition: transform 0.3s ease;

    &:hover {
      transform: scale(1.05);
    }
  }

  .course-title {
    font-size: 1.3rem;
    margin-bottom: 12px;
    transition: color 0.3s ease;
  }

  .course-description {
    font-size: 0.95rem;
    line-height: 1.6;
    max-height: 3.2rem;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .course-details {
    display: flex;
    gap: 8px;
    margin-top: 12px;
  }

  .course-price {
    display: flex;
    align-items: center;
    gap: 12px;

    .text-strike {
      text-decoration: line-through;
      font-size: 0.9rem;
    }
  }

  .buy-btn {
    flex: 1;
    transition: all 0.3s ease;
  }
}

@media (max-width: 600px) {
  .hero-title {
    font-size: 2.2rem;

    .hero-subtitle {
      font-size: 1.3rem;
    }
  }

  .section-title {
    font-size: 1.6rem;
  }

  .filters-section {
    flex-direction: column;
    padding: 12px;
  }

  .course-card {
    .course-title {
      font-size: 1.1rem;
    }

    .course-description {
      font-size: 0.85rem;
    }
  }
}
</style>
