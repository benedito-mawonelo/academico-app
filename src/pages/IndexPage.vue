<template>
  <q-layout view="lHh Lpr lFf">
    <!-- Navbar -->
    <q-header class="navbar">
      <q-toolbar class="navbar-content">
        <q-toolbar-title class="navbar-title">
          <q-icon name="school" size="lg" class="logo-icon" />
          <span class="logo-text">Mawonelo</span>
        </q-toolbar-title>

        <q-space />

        <!-- Desktop Menu -->
        <div class="desktop-menu">
          <q-btn flat label="Início" class="menu-btn" to="/" exact />
          <q-btn flat label="Cadeiras" class="menu-btn" to="/cadeiras" />
          <q-btn flat label="Recursos" class="menu-btn" to="/recursos" />
          <q-btn flat label="Sobre" class="menu-btn" to="/sobre" />
        </div>

        <!-- Auth Buttons -->
        <div class="auth-buttons">
          <q-btn flat label="Entrar" class="login-btn" to="/login" />
          <q-btn label="Registrar" class="register-btn" to="/register" />
        </div>

        <!-- Mobile Menu Button -->
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          class="mobile-menu-btn"
          @click="toggleMobileMenu"
        />
      </q-toolbar>
    </q-header>

    <!-- Mobile Menu Drawer -->
    <q-drawer
      v-model="mobileMenuOpen"
      side="right"
      :width="280"
      class="mobile-menu-drawer"
    >
      <q-scroll-area class="fit">
        <q-list padding>
          <q-item clickable v-ripple to="/" exact>
            <q-item-section avatar>
              <q-icon name="home" />
            </q-item-section>
            <q-item-section>Início</q-item-section>
          </q-item>
          <q-item clickable v-ripple to="/cadeiras">
            <q-item-section avatar>
              <q-icon name="school" />
            </q-item-section>
            <q-item-section>Cadeiras</q-item-section>
          </q-item>
          <q-item clickable v-ripple to="/recursos">
            <q-item-section avatar>
              <q-icon name="menu_book" />
            </q-item-section>
            <q-item-section>Recursos</q-item-section>
          </q-item>
          <q-item clickable v-ripple to="/sobre">
            <q-item-section avatar>
              <q-icon name="info" />
            </q-item-section>
            <q-item-section>Sobre</q-item-section>
          </q-item>
          <q-separator class="q-my-md" />
          <q-item clickable v-ripple to="/login">
            <q-item-section avatar>
              <q-icon name="login" color="primary" />
            </q-item-section>
            <q-item-section>Entrar</q-item-section>
          </q-item>
          <q-item clickable v-ripple to="/register">
            <q-item-section avatar>
              <q-icon name="person_add" color="primary" />
            </q-item-section>
            <q-item-section>Registrar</q-item-section>
          </q-item>
        </q-list>
      </q-scroll-area>
    </q-drawer>

    <q-page-container class="page-container">
      <q-page class="index-page">
        <!-- Hero Section -->
        <div class="hero-section">
          <div class="particles"></div>
          <div class="hero-overlay"></div>
          <div class="hero-content">
            <h1 class="hero-title">
              Explore o Futuro com <span class="highlight">Mawonelo</span>
            </h1>
            <p class="hero-subtitle">
              A plataforma que redefine sua jornada acadêmica com inovação
            </p>
            <!-- <div class="hero-actions">
              <q-btn
                label="Começar Agora"
                class="hero-btn primary-btn"
                to="/register"
                icon="rocket_launch"
              />
              <q-btn
                label="Explorar Cadeiras"
                class="hero-btn secondary-btn"
                to="/cadeiras"
                icon="school"
              />
            </div> -->
          </div>
          <div class="scroll-indicator">
            <q-icon name="expand_more" size="xl" />
          </div>
        </div>

        <!-- Features Section -->
        <div class="features-section q-pa-md">
          <h2 class="section-title">Recursos que Inspiram</h2>
          <div class="features-grid">
            <q-card class="feature-card" v-intersection="onFeatureCardIntersection(0)">
              <div class="card-icon">
                <q-icon name="school" size="lg" />
              </div>
              <h3>Cadeiras Organizadas</h3>
              <p>Organize seus estudos com acesso intuitivo a materiais por disciplina</p>
              <q-btn flat label="Saiba Mais" color="primary" to="/cadeiras" />
            </q-card>
            <q-card class="feature-card" v-intersection="onFeatureCardIntersection(1)">
              <div class="card-icon">
                <q-icon name="ondemand_video" size="lg" />
              </div>
              <h3>Videoaulas Dinâmicas</h3>
              <p>Aprenda com vídeos interativos e de alta qualidade</p>
              <q-btn flat label="Saiba Mais" color="primary" to="/videos" />
            </q-card>
            <q-card class="feature-card" v-intersection="onFeatureCardIntersection(2)">
              <div class="card-icon">
                <q-icon name="qr_code_scanner" size="lg" />
              </div>
              <h3>Scanner Inteligente</h3>
              <p>Digitalize e acesse materiais rapidamente com QR codes</p>
              <q-btn flat label="Saiba Mais" color="primary" to="/scanner" />
            </q-card>
          </div>
        </div>

        <!-- Stats Section -->
        <div class="stats-section">
          <div class="stat-item">
            <div class="stat-circle">
              <span class="stat-number" v-counter="12500">0</span>
            </div>
            <p>Estudantes Ativos</p>
          </div>
          <div class="stat-item">
            <div class="stat-circle">
              <span class="stat-number" v-counter="850">0</span>
            </div>
            <p>Cadeiras Disponíveis</p>
          </div>
          <div class="stat-item">
            <div class="stat-circle">
              <span class="stat-number" v-counter="3200">0</span>
            </div>
            <p>Videoaulas</p>
          </div>
          <div class="stat-item">
            <div class="stat-circle">
              <span class="stat-number" v-counter="98">0</span>
            </div>
            <p>% Satisfação</p>
          </div>
        </div>

        <!-- Testimonials Section -->
        <div class="testimonials-section q-pa-md">
          <h2 class="section-title">Depoimentos dos Nossos Usuários</h2>
          <q-carousel
            v-model="testimonialSlide"
            animated
            infinite
            arrows
            navigation
            height="350px"
            class="testimonials-carousel"
          >
            <q-carousel-slide :name="1" class="slide-content">
              <q-avatar size="100px" class="avatar">
                <img src="https://randomuser.me/api/portraits/women/44.jpg" alt="Maria Silva" @error="handleImageError" />
              </q-avatar>
              <p class="testimonial-text">
                "Mawonelo transformou minha rotina de estudos com recursos incríveis!"
              </p>
              <p class="testimonial-author">— Maria Silva, Engenharia</p>
            </q-carousel-slide>
            <q-carousel-slide :name="2" class="slide-content">
              <q-avatar size="100px" class="avatar">
                <img src="https://randomuser.me/api/portraits/men/32.jpg" alt="João Santos" @error="handleImageError" />
              </q-avatar>
              <p class="testimonial-text">
                "A melhor plataforma para organizar e acessar conteúdos acadêmicos!"
              </p>
              <p class="testimonial-author">— João Santos, Medicina</p>
            </q-carousel-slide>
            <q-carousel-slide :name="3" class="slide-content">
              <q-avatar size="100px" class="avatar">
                <img src="https://randomuser.me/api/portraits/women/68.jpg" alt="Ana Oliveira" @error="handleImageError" />
              </q-avatar>
              <p class="testimonial-text">
                "O scanner de documentos é um divisor de águas para meus estudos!"
              </p>
              <p class="testimonial-author">— Ana Oliveira, Direito</p>
            </q-carousel-slide>
          </q-carousel>
        </div>

        <!-- CTA Section -->
        <div class="cta-section">
          <div class="cta-content">
            <h2>Junte-se à Revolução do Aprendizado</h2>
            <p>Comece hoje e transforme sua experiência acadêmica com Mawonelo</p>
            <div class="cta-buttons">
              <q-btn label="Começar Agora" class="cta-btn primary-btn" to="/register" icon="rocket_launch" />
              <!-- <q-btn label="Fazer Tour" class="cta-btn secondary-btn" to="/tour" icon="explore" /> -->
            </div>
          </div>
          <div class="wave-bg"></div>
        </div>

        <!-- Footer -->
        <q-footer class="footer">
          <div class="footer-content">
            <div class="footer-brand">
              <div class="logo-wrapper">
                <q-icon name="school" size="lg" />
                <span class="logo-text">Mawonelo</span>
              </div>
              <p>Transformando a educação com tecnologia inovadora</p>
              <div class="footer-social">
                <q-btn flat round icon="facebook" class="social-btn" />
                <q-btn flat round icon="twitter" class="social-btn" />
                <q-btn flat round icon="instagram" class="social-btn" />
                <q-btn flat round icon="linkedin" class="social-btn" />
              </div>
            </div>
            <div class="footer-links">
              <div class="link-group">
                <h3>Plataforma</h3>
                <a href="#">Cadeiras</a>
                <a href="#">Videoaulas</a>
                <a href="#">Resumos</a>
                <a href="#">Scanner</a>
              </div>
              <div class="link-group">
                <h3>Suporte</h3>
                <a href="#">Central de Ajuda</a>
                <a href="#">Tutoriais</a>
                <a href="#">Contato</a>
                <a href="#">Feedback</a>
              </div>
              <div class="link-group">
                <h3>Legal</h3>
                <a href="#">Termos de Uso</a>
                <a href="#">Privacidade</a>
                <a href="#">Cookies</a>
                <a href="#">Licenças</a>
              </div>
            </div>
          </div>
          <div class="footer-bottom">
            <p>© 2025 Mawonelo - Todos os direitos reservados</p>
            <div class="app-links">
              <q-btn flat round icon="android" class="app-btn" />
              <q-btn flat round icon="apple" class="app-btn" />
            </div>
          </div>
        </q-footer>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

// Navbar and menu control
const mobileMenuOpen = ref(false);
const testimonialSlide = ref(1);
const featureCardVisible = ref([false, false, false]);
const scrollPosition = ref(0);

// Handle scroll for parallax
const handleScroll = () => {
  scrollPosition.value = window.scrollY;
};

// Intersection observer for feature cards
const onFeatureCardIntersection = (index) => (isIntersecting) => {
  if (isIntersecting) {
    featureCardVisible.value[index] = true;
  }
};

// Toggle mobile menu
const toggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value;
};

// Image error handling
const handleImageError = (e) => {
  e.target.src = 'https://via.placeholder.com/100';
};

// Counter directive for stats
const vCounter = {
  mounted(el, binding) {
    const target = binding.value;
    const duration = 2000;
    const step = target / (duration / 16);
    let current = 0;

    const updateCounter = () => {
      current += step;
      if (current < target) {
        el.textContent = Math.floor(current);
        requestAnimationFrame(updateCounter);
      } else {
        el.textContent = target;
      }
    };

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        updateCounter();
        observer.disconnect();
      }
    }, { threshold: 0.5 });

    observer.observe(el);
  },
};

// Lifecycle hooks
onMounted(() => {
  window.addEventListener('scroll', handleScroll);
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
});
</script>

<style lang="scss" scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700&display=swap');

$q-primary: #2E7D32; // Verde floresta
$q-secondary: #62d404; // Verde limão
$q-bg: #F5F5F5; // Cinza claro
$q-dark: #1A1A2E; // Cinza escuro
$q-accent: #FF8C00; // Laranja suave

.q-layout {
  background: $q-bg;
  font-family: 'Poppins', sans-serif;
}

/* Page Container */
.page-container {
  padding: 0 !important;
  margin: 0 !important;
}

/* Navbar Styles */
.navbar {
  background: linear-gradient(90deg, rgba($q-primary, 0.95), rgba($q-secondary, 0.95));
  backdrop-filter: blur(10px);
  position: fixed;
  width: 100%;
  z-index: 1000;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);

  .navbar-content {
    padding: 20px 3%;
    display: flex;
    align-items: center;
  }

  .navbar-title {
    display: flex;
    align-items: center;
    gap: 10px;

    .logo-icon {
      color: white;
      transition: transform 0.3s ease;
    }

    .logo-text {
      font-size: 1.8rem;
      font-weight: 700;
      color: white;
    }
  }

  .desktop-menu {
    display: flex;
    gap: 20px;

    .menu-btn {
      color: white;
      font-weight: 600;
      text-transform: none;
      font-size: 1rem;
      position: relative;
      padding: 8px 16px;
      transition: all 0.3s ease;

      &:after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 50%;
        width: 0;
        height: 2px;
        background: $q-accent;
        transition: all 0.3s ease;
        transform: translateX(-50%);
      }

      &:hover {
        color: $q-accent;
        &:after {
          width: 50%;
        }
      }
    }
  }

  .auth-buttons {
    display: flex;
    gap: 12px;

    .login-btn {
      color: white;
      font-weight: 600;
      transition: all 0.3s ease;
      &:hover {
        color: $q-accent;
      }
    }

    .register-btn {
      background: $q-accent;
      color: white;
      border-radius: 30px;
      padding: 8px 20px;
      font-weight: 600;
      transition: all 0.3s ease;
      &:hover {
        // background: darken($q-accent, 10%);
        transform: translateY(-2px);
      }
    }
  }

  .mobile-menu-btn {
    display: none;
    color: white;
  }
}

/* Mobile Menu Styles */
.mobile-menu-drawer {
  background: rgba($q-dark, 0.95);
  backdrop-filter: blur(10px);
  color: white;
  width: 100% !important;
  max-width: 280px;

  .q-item {
    padding: 16px;
    transition: all 0.3s ease;
    &:hover {
      background: rgba($q-accent, 0.2);
      transform: translateX(10px);
    }
  }

  .q-separator {
    background: rgba(255, 255, 255, 0.2);
  }
}

/* Hero Section Styles */
.hero-section {
  position: relative;
  height: 100vh;
  min-height: 600px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  background: linear-gradient(135deg, $q-primary, $q-secondary);
  overflow: hidden;
  margin: 0;

  .particles {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: radial-gradient(circle, rgba(255, 255, 255, 0.1), transparent);
    animation: particles 20s linear infinite;
    z-index: 1;
  }

  .hero-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.3);
    z-index: 2;
  }

  .hero-content {
    position: relative;
    z-index: 3;
    max-width: 800px;
    padding: 20px;
    width: 100%;
  }

  .hero-title {
    font-size: 4rem;
    font-weight: 700;
    color: white;
    margin-bottom: 20px;
    line-height: 1.2;

    .highlight {
      color: $q-accent;
      text-shadow: 0 2px 10px rgba($q-accent, 0.5);
    }
  }

  .hero-subtitle {
    font-size: 1.5rem;
    color: rgba(255, 255, 255, 0.9);
    margin-bottom: 30px;
  }

  .hero-actions {
    display: flex;
    justify-content: center;
    gap: 20px;
    flex-wrap: wrap;

    .hero-btn {
      padding: 12px 32px;
      border-radius: 30px;
      font-weight: 600;
      transition: all 0.3s ease;
      min-width: 200px;
      text-align: center;

      &.primary-btn {
        background: linear-gradient(90deg, $q-accent);
        color: white;
        &:hover {
          transform: scale(1.05);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
        }
      }

      &.secondary-btn {
        background: transparent;
        border: 2px solid white;
        color: white;
        &:hover {
          background: rgba(255, 255, 255, 0.1);
          transform: scale(1.05);
        }
      }
    }
  }

  .scroll-indicator {
    position: absolute;
    bottom: 30px;
    z-index: 3;
    color: white;
    animation: bounce 2s infinite;
  }
}

/* Features Section Styles */
.features-section {
  background: $q-bg;
  padding: 60px 3% 40px;
  text-align: center;
  margin: 0;

  .section-title {
    font-size: 2.8rem;
    font-weight: 700;
    color: $q-dark;
    margin-bottom: 30px;
    position: relative;

    &:after {
      content: '';
      position: absolute;
      bottom: -10px;
      left: 50%;
      width: 100px;
      height: 4px;
      background: $q-accent;
      transform: translateX(-50%);
    }
  }

  .features-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 20px;
    max-width: 1200px;
    margin: 0 auto;
  }

  .feature-card {
    background: white;
    border-radius: 20px;
    padding: 30px;
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
    // opacity: 0;
    transform: translateY(20px);

    &[data-intersecting="true"] {
      opacity: 1;
      transform: translateY(0);
    }

    &:hover {
      transform: translateY(-10px);
      box-shadow: 0 12px 30px rgba(0, 0, 0, 0.15);
    }

    .card-icon {
      width: 60px;
      height: 60px;
      background: linear-gradient(135deg, $q-primary, $q-secondary);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 20px;
      color: white;
      transition: transform 0.3s ease;

      &:hover {
        transform: scale(1.1);
      }
    }

    h3 {
      font-size: 1.5rem;
      font-weight: 600;
      color: $q-dark;
      margin-bottom: 12px;
    }

    p {
      font-size: 1rem;
      // color: darken($q-bg, 40%);
      margin-bottom: 20px;
    }

    .q-btn {
      font-weight: 600;
      color: $q-primary;
      &:hover {
        color: $q-accent;
      }
    }
  }
}

/* Stats Section Styles */
.stats-section {
  background: linear-gradient(135deg, $q-primary, $q-secondary);
  padding: 60px 3%;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 20px;
  text-align: center;
  color: white;
  margin: 0;

  .stat-item {
    display: flex;
    flex-direction: column;
    align-items: center;

    .stat-circle {
      width: 120px;
      height: 120px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 12px;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);

      .stat-number {
        font-size: 2rem;
        font-weight: 700;
      }
    }

    p {
      font-size: 1.1rem;
      font-weight: 500;
    }
  }
}

/* Testimonials Section Styles */
.testimonials-section {
  background: $q-bg;
  padding: 60px 3% 40px;
  text-align: center;
  margin: 0;

  .section-title {
    font-size: 2.8rem;
    font-weight: 700;
    color: $q-dark;
    margin-bottom: 30px;
    position: relative;

    &:after {
      content: '';
      position: absolute;
      bottom: -10px;
      left: 50%;
      width: 100px;
      height: 4px;
      background: $q-accent;
      transform: translateX(-50%);
    }
  }

  .testimonials-carousel {
    max-width: 900px;
    margin: 0 auto;
    background: white;
    border-radius: 20px;
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);

    .slide-content {
      padding: 40px;
      display: flex;
      flex-direction: column;
      align-items: center;

      .avatar {
        transition: transform 0.3s ease;
        &:hover {
          transform: scale(1.1);
        }
      }

      .testimonial-text {
        font-size: 1.2rem;
        font-style: italic;
        color: $q-dark;
        margin-bottom: 16px;
        max-width: 600px;
      }

      .testimonial-author {
        font-size: 1rem;
        font-weight: 600;
        color: $q-primary;
      }
    }

    :deep(.q-carousel__arrow) {
      // background: rgba($q-primary, 0.8);
      color: green;
      border-radius: 50%;
    }

    :deep(.q-carousel__navigation-inner) {
      background: rgba(255, 255, 255, 0.8);
      border-radius: 20px;
      padding: 8px;
    }
  }
}

/* CTA Section Styles */
.cta-section {
  position: relative;
  padding: 80px 3% 60px;
  background: linear-gradient(135deg, $q-dark, $q-primary);
  color: white;
  text-align: center;
  overflow: hidden;
  margin: 0;

  .wave-bg {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 100px;
    background: url('data:image/svg+xml;utf8,<svg viewBox="0 0 1200 120" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg"><path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113.64,31.08,1200,41.79V0Z" fill="rgba(255,255,255,0.1)"/></svg>');
    background-size: cover;
    animation: wave 10s linear infinite;
  }

  .cta-content {
    max-width: 800px;
    margin: 0 auto;
    position: relative;
    z-index: 2;

    h2 {
      font-size: 2.8rem;
      font-weight: 700;
      margin-bottom: 20px;
    }

    p {
      font-size: 1.2rem;
      margin-bottom: 30px;
      opacity: 0.9;
    }

    .cta-buttons {
      display: flex;
      justify-content: center;
      gap: 20px;
      flex-wrap: wrap;

      .cta-btn {
        padding: 12px 40px;
        border-radius: 30px;
        font-weight: 600;
        transition: all 0.3s ease;
        min-width: 200px;
        text-align: center;

        &.primary-btn {
          background: linear-gradient(90deg, $q-accent);
          color: white;
          &:hover {
            transform: scale(1.05);
            box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
          }
        }

        &.secondary-btn {
          background: transparent;
          border: 2px solid white;
          color: white;
          &:hover {
            background: rgba(255, 255, 255, 0.1);
            transform: scale(1.05);
          }
        }
      }
    }
  }
}

/* Footer Styles */
.footer {
  background: linear-gradient(180deg, $q-dark);
  color: white;
  padding: 40px 3% 20px;
  position: relative;
  margin: 0;

  .footer-content {
    display: grid;
    grid-template-columns: 1fr 2fr;
    gap: 40px;
    max-width: 1200px;
    margin: 0 auto;

    .footer-brand {
      .logo-wrapper {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 20px;

        .q-icon {
          color: $q-accent;
        }

        .logo-text {
          font-size: 1.8rem;
          font-weight: 700;
        }
      }

      p {
        font-size: 1rem;
        opacity: 0.8;
        margin-bottom: 20px;
      }

      .footer-social {
        display: flex;
        gap: 12px;

        .social-btn {
          color: white;
          transition: all 0.3s ease;
          &:hover {
            color: $q-accent;
            transform: scale(1.2);
          }
        }
      }
    }

    .footer-links {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 30px;

      .link-group {
        h3 {
          font-size: 1.2rem;
          font-weight: 600;
          margin-bottom: 16px;
          color: white;
        }

        a {
          display: block;
          color: rgba(255, 255, 255, 0.8);
          font-size: 0.9rem;
          margin-bottom: 10px;
          text-decoration: none;
          transition: all 0.3s ease;

          &:hover {
            color: $q-accent;
            transform: translateX(5px);
          }
        }
      }
    }
  }

  .footer-bottom {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 20px;
    padding-top: 20px;
    border-top: 1px solid rgba(255, 255, 255, 0.2);

    p {
      font-size: 0.9rem;
      opacity: 0.8;
    }

    .app-links {
      display: flex;
      gap: 12px;

      .app-btn {
        color: white;
        transition: all 0.3s ease;
        &:hover {
          color: $q-accent;
          transform: scale(1.2);
        }
      }
    }
  }
}

/* Animations */
@keyframes particles {
  0% { background-position: 0 0; }
  100% { background-position: 200% 200%; }
}

@keyframes wave {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

/* Responsive Styles */
@media (max-width: 1024px) {
  .hero-title {
    font-size: 3rem;
  }

  .footer-content {
    grid-template-columns: 1fr;
  }

  .footer-links {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .navbar {
    .desktop-menu, .auth-buttons {
      display: none;
    }

    .mobile-menu-btn {
      display: block;
    }

    .navbar-content {
      padding: 20px 2%;
    }
  }

  .hero-section {
    padding: 0 2%;
  }

  .hero-title {
    font-size: 2.5rem;
  }

  .hero-subtitle {
    font-size: 1.2rem;
  }

  .hero-actions {
    flex-direction: column;
    align-items: center;
    gap: 15px;
  }

  .section-title {
    font-size: 2.2rem;
  }

  .stats-section {
    grid-template-columns: repeat(2, 1fr);
    padding: 40px 2%;
  }

  .features-section, .testimonials-section {
    padding: 40px 2% 20px;
  }

  .footer-links {
    grid-template-columns: 1fr;
  }

  .footer {
    padding: 30px 2% 10px;
  }
}

@media (max-width: 480px) {
  .hero-title {
    font-size: 2rem;
  }

  .hero-actions, .cta-buttons {
    flex-direction: column;
    align-items: center;
    gap: 12px;

    .q-btn {
      width: 100%;
      max-width: 280px;
    }
  }

  .stats-section {
    grid-template-columns: 1fr;
    padding: 30px 2%;
  }

  .testimonials-carousel {
    .slide-content {
      padding: 20px;

      .testimonial-text {
        font-size: 1rem;
      }
    }
  }
}
</style>

