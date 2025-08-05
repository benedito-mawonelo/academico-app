<template>
  <footer class="app-footer">
    <div class="footer-wave">
      <svg viewBox="0 0 1200 120" preserveAspectRatio="none">
        <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" opacity=".25" fill="currentColor"></path>
        <path d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" opacity=".5" fill="currentColor"></path>
        <path d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z" fill="currentColor"></path>
      </svg>
    </div>
    <div class="footer-content">
      <div class="footer-main">
        <div class="footer-brand">
          <div class="logo-wrapper">
            <q-icon name="school" size="xl" color="green" />
            <span class="logo-text">Mawonelo</span>
          </div>
          <p class="brand-slogan">Transformando a educação com paixão e tecnologia</p>
          <div class="footer-social">
            <q-btn flat round icon="facebook" color="white" size="md" class="social-icon" />
            <q-btn flat round icon="twitter" color="white" size="md" class="social-icon" />
            <q-btn flat round icon="instagram" color="white" size="md" class="social-icon" />
            <q-btn flat round icon="linkedin" color="white" size="md" class="social-icon" />
          </div>
        </div>
        <div class="footer-links">
          <div class="link-group">
            <h3 class="link-title">Recursos</h3>
            <a href="#" class="footer-link">Cadeiras</a>
            <a href="#" class="footer-link">Livros Digitais</a>
            <a href="#" class="footer-link">Loja Acadêmica</a>
            <a href="#" class="footer-link">Exames</a>
          </div>
          <div class="link-group">
            <h3 class="link-title">Suporte</h3>
            <a href="#" class="footer-link">Central de Ajuda</a>
            <a href="#" class="footer-link">Tutoriais</a>
            <a href="#" class="footer-link">Contato</a>
            <a href="#" class="footer-link">Feedback</a>
          </div>
          <div class="link-group">
            <h3 class="link-title">Legal</h3>
            <a href="#" class="footer-link">Termos de Uso</a>
            <a href="#" class="footer-link">Política de Privacidade</a>
            <a href="#" class="footer-link">Cookies</a>
            <a href="#" class="footer-link">Licenças</a>
          </div>
        </div>
      </div>
      <div class="footer-bottom">
        <div class="footer-copyright">© 2025 Mawonelo - Todos os direitos reservados</div>
        <div class="footer-apps">
          <q-btn flat round icon="android" color="white" size="sm" class="app-icon" />
          <q-btn flat round icon="apple" color="white" size="sm" class="app-icon" />
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup>
// No script logic needed for the footer as it is static
</script>

<style lang="scss" scoped>
.app-footer {
  background: linear-gradient(135deg, #1a3c1f, #2E7D32);
  color: white;
  position: relative;
  margin-top: 80px;

  .footer-wave {
    position: absolute;
    top: -80px;
    left: 0;
    width: 100%;
    height: 80px;
    overflow: hidden;

    svg {
      width: 100%;
      height: 100%;
      fill: #f0f4f8;
    }
  }

  .footer-content {
    max-width: 1400px;
    margin: 0 auto;
    padding: 64px 32px 48px;
  }

  .footer-main {
    display: grid;
    grid-template-columns: 1fr 2fr;
    gap: 64px;
    margin-bottom: 48px;

    @media (max-width: 768px) {
      grid-template-columns: 1fr;
      gap: 32px;
    }
  }

  .footer-brand {
    .logo-wrapper {
      display: flex;
      align-items: center;
      margin-bottom: 20px;

      .logo-text {
        font-size: 1.8rem;
        font-weight: 800;
        margin-left: 16px;
      }
    }

    .brand-slogan {
      opacity: 0.9;
      font-size: 1rem;
      line-height: 1.6;
      margin-bottom: 32px;
    }

    .footer-social {
      display: flex;
      gap: 16px;

      .social-icon {
        transition: all 0.3s ease;

        &:hover {
          transform: scale(1.2);
          color: #81C784 !important;
        }
      }
    }
  }

  .footer-links {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 48px;

    @media (max-width: 768px) {
      // grid-template-columns: 1fr;
      gap: 32px;
    }

    .link-group {
      .link-title {
        font-size: 1.2rem;
        font-weight: 700;
        margin-bottom: 20px;
        position: relative;
        padding-bottom: 10px;

        &::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 50px;
          height: 3px;
          background-color: #81C784;
        }
      }

      .footer-link {
        display: block;
        color: rgba(255, 255, 255, 0.8);
        margin-bottom: 12px;
        transition: all 0.3s ease;
        text-decoration: none;
        font-size: 0.95rem;

        &:hover {
          color: white;
          transform: translateX(6px);
        }
      }
    }
  }

  .footer-bottom {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 32px;
    border-top: 1px solid rgba(255, 255, 255, 0.2);
    margin-top: 48px;

    .footer-copyright {
      font-size: 0.9rem;
      opacity: 0.8;
    }

    .footer-apps {
      display: flex;
      gap: 16px;

      .app-icon {
        transition: all 0.3s ease;

        &:hover {
          transform: scale(1.2);
          color: #81C784 !important;
        }
      }
    }
  }
}
</style>
