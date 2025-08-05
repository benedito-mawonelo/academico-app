<template>
  <div class="app-layout">
    <app-header @navigate="goTo" />
    <q-page class="main-content">
      <div v-if="course" class="course-details-container">
        <!-- Hero Section -->
        <div class="hero-section">
          <div class="hero-content">
            <h1 class="hero-title animate__animated animate__fadeInDown">
              <span class="hero-highlight">{{ course.title }}</span>
              <span class="hero-subtitle">{{ course.category }}</span>
            </h1>
          </div>
        </div>

        <!-- Course Details -->
        <div class="course-details">
          <q-card flat bordered class="course-card shadow-4 animate__animated animate__fadeIn">
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
              <div class="course-description text-grey-8 q-mt-md">{{ course.description }}</div>
              <div class="course-details q-mt-md">
                <q-chip dense size="sm" color="green-2" text-color="green-10" icon="schedule">
                  {{ course.duration }} horas
                </q-chip>
                <q-chip dense size="sm" color="green-2" text-color="green-10" icon="school">
                  {{ course.level }}
                </q-chip>
                <q-chip dense size="sm" color="green-2" text-color="green-10" icon="category">
                  {{ course.category }}
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

          <!-- Course Content -->
          <div class="course-content q-mt-xl">
            <h2 class="section-title">Conteúdo do Curso</h2>
            <q-list bordered separator class="content-list">
              <q-item v-for="(item, index) in courseContent" :key="index" class="content-item">
                <q-item-section avatar>
                  <q-icon name="play_circle" color="green" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ item.title }}</q-item-label>
                  <q-item-label caption>{{ item.duration }} min</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </div>

          <!-- Instructor Info -->
          <div class="instructor-section q-mt-xl">
            <h2 class="section-title">Sobre o Instrutor</h2>
            <q-card flat bordered class="instructor-card shadow-4">
              <q-card-section horizontal>
                <q-img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80"
                  class="instructor-image"
                  width="150px"
                />
                <q-card-section>
                  <div class="instructor-name text-weight-bold text-green">Nome do Instrutor</div>
                  <div class="instructor-bio text-grey-8 q-mt-sm">
                    Especialista em {{ course.category }} com mais de 10 anos de experiência. Certificado em diversas áreas e apaixonado por ensinar.
                  </div>
                </q-card-section>
              </q-card-section>
            </q-card>
          </div>

          <!-- Back Button -->
          <q-btn
            color="grey-8"
            label="Voltar"
            rounded
            flat
            icon="arrow_back"
            class="q-mt-lg"
            @click="goTo('')"
          />
        </div>
      </div>
      <div v-else class="text-center q-pa-md">
        <q-spinner color="green" size="3em" />
        <div class="q-mt-md">Carregando detalhes do curso...</div>
      </div>
    </q-page>
    <app-footer />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useQuasar } from 'quasar';
import { doc, getDoc, addDoc, collection } from 'firebase/firestore';
import { db, firebaseAuth } from 'boot/firebase';
import AppHeader from 'components/AppHeader.vue';
import AppFooter from 'components/AppFooter.vue';

const $q = useQuasar();
const router = useRouter();
const route = useRoute();

const course = ref(null);
const purchasingCourse = ref(null);

// Mock course content (replace with actual data from Firestore if available)
const courseContent = ref([
  { title: 'Introdução ao Curso', duration: 15 },
  { title: 'Módulo 1: Fundamentos', duration: 45 },
  { title: 'Módulo 2: Prática Avançada', duration: 60 },
  { title: 'Projeto Final', duration: 90 }
]);

onMounted(async () => {
  const courseId = route.query.id;
  if (!courseId) {
    $q.notify({
      type: 'negative',
      message: 'Curso não encontrado',
      position: 'top'
    });
    router.push('/');
    return;
  }

  try {
    const courseDoc = await getDoc(doc(db, 'cursos', courseId));
    if (courseDoc.exists()) {
      course.value = {
        id: courseDoc.id,
        ...courseDoc.data(),
        originalPrice: courseDoc.data().originalPrice || 0,
        currentPrice: courseDoc.data().currentPrice || 0
      };
    } else {
      $q.notify({
        type: 'negative',
        message: 'Curso não encontrado',
        position: 'top'
      });
      router.push('/');
    }
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Erro ao carregar detalhes do curso',
      caption: error?.message || '',
      position: 'top'
    });
  }
});

function formatPrice(price) {
  if (price == null || isNaN(price)) {
    console.warn('Invalid price value:', price);
    return 'N/A';
  }
  try {
    return price.toLocaleString('pt-MZ', { style: 'currency', currency: 'MZN' });
  } catch (error) {
    console.log(error)
    console.warn('Locale pt-MZ not supported, falling back to manual formatting');
    return `MZN ${price.toFixed(2).replace('.', ',')}`;
  }
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
  max-width: 1200px;
  margin: 0 auto;
  padding: 0;
}

.hero-section {
  background: linear-gradient(135deg, #2E7D32 0%, #81C784 100%);
  color: white;
  padding: 40px 24px;
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
  font-size: 2.2rem;
  font-weight: 700;
  line-height: 1.2;
  margin-bottom: 16px;

  .hero-highlight {
    display: block;
    text-shadow: 0 3px 6px rgba(0, 0, 0, 0.2);
  }

  .hero-subtitle {
    display: block;
    font-size: 1.4rem;
    font-weight: 400;
    opacity: 0.9;
    margin-top: 8px;
  }
}

.course-details-container {
  padding: 32px;
}

.course-card {
  border-radius: 16px;
  overflow: hidden;
  background: white;

  .course-image {
    border-top-left-radius: 16px;
    border-top-right-radius: 16px;
    transition: transform 0.3s ease;

    &:hover {
      transform: scale(1.05);
    }
  }

  .course-title {
    font-size: 1.8rem;
    margin-bottom: 16px;
    transition: color 0.3s ease;
  }

  .course-description {
    font-size: 1rem;
    line-height: 1.6;
  }

  .course-details {
    display: flex;
    gap: 12px;
    margin-top: 16px;
  }

  .course-price {
    display: flex;
    align-items: center;
    gap: 16px;

    .text-strike {
      text-decoration: line-through;
      font-size: 1rem;
    }

    .text-weight-bold {
      font-size: 1.2rem;
    }
  }

  .buy-btn {
    flex: 1;
    transition: all 0.3s ease;

    &:hover {
      background-color: #1a3c1f !important;
    }
  }
}

.section-title {
  font-size: 1.8rem;
  font-weight: 700;
  color: #1a3c1f;
  margin-bottom: 16px;
}

.course-content {
  max-width: 800px;
}

.content-list {
  border-radius: 8px;
  background: white;
}

.content-item {
  padding: 12px;
}

.instructor-section {
  max-width: 800px;
}

.instructor-card {
  border-radius: 8px;
  background: white;

  .instructor-image {
    border-radius: 8px;
  }

  .instructor-name {
    font-size: 1.4rem;
  }

  .instructor-bio {
    font-size: 0.95rem;
    line-height: 1.6;
  }
}

@media (max-width: 600px) {
  .hero-title {
    font-size: 1.8rem;

    .hero-subtitle {
      font-size: 1.2rem;
    }
  }

  .course-details-container {
    padding: 16px;
  }

  .course-card {
    .course-title {
      font-size: 1.4rem;
    }

    .course-description {
      font-size: 0.9rem;
    }
  }

  .section-title {
    font-size: 1.4rem;
  }

  .instructor-name {
    font-size: 1.2rem;
  }

  .instructor-bio {
    font-size: 0.85rem;
  }
}
</style>
