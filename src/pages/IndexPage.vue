<template>
  <q-page class="index-page">
    <!-- Hero Section -->
    <div class="hero-section bg-green-10 text-white">
      <div class="hero-content">
        <h1 class="hero-title">Bem-vindo à Plataforma Acadêmica</h1>
        <p class="hero-subtitle">Acesse seus cursos, materiais e ferramentas de estudo em um só lugar</p>

        <!-- verificar a questao de login, procurar saber mais o que posso colocar aqui -->
        <!-- <div class="hero-actions">
          <q-btn
            label="Entrar"
            color="white"
            text-color="green-10"
            class="hero-btn"
            to="/login"
          />
          <q-btn
            label="Cadastrar"
            outline
            color="white"
            class="hero-btn"
            to="/register"
          />
        </div> -->
      </div>
    </div>

    <!-- Features Section -->
    <div class="features-section q-pa-lg">
      <h2 class="section-title text-center text-green-10">Recursos Principais</h2>

      <div class="features-grid">
        <q-card class="feature-card">
          <q-icon name="school" size="lg" color="green-10" />
          <h3>Disciplinas</h3>
          <p>Acesse todas as suas disciplinas e materiais de estudo</p>
        </q-card>

        <q-card class="feature-card">
          <q-icon name="menu_book" size="lg" color="green-10" />
          <h3>Biblioteca Digital</h3>
          <p>eBooks e materiais de referência disponíveis 24/7</p>
        </q-card>

        <q-card class="feature-card">
          <q-icon name="qr_code_scanner" size="lg" color="green-10" />
          <h3>Scanner Acadêmico</h3>
          <p>Digitalize documentos e QR codes de materiais</p>
        </q-card>
      </div>
    </div>

    <!-- Call to Action -->
    <div class="cta-section bg-grey-2 text-center q-pa-xl">
      <h2 class="text-h4 text-weight-bold text-green-10">Pronto para começar?</h2>
      <q-btn
        label="Acesse sua conta agora"
        color="green-10"
        size="lg"
        class="q-mt-md"
        to="/login"
      />
    </div>
  </q-page>
</template>

<script setup>
// Lógica pode ser adicionada aqui conforme necessário
</script>

<style lang="scss" scoped>
.index-page {
  padding: 0;
}

.hero-section {
  padding: 80px 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
}

.hero-content {
  max-width: 800px;
}

.hero-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 16px;
}

.hero-subtitle {
  font-size: 1.25rem;
  margin-bottom: 32px;
  opacity: 0.9;
}

.hero-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
}

.hero-btn {
  padding: 10px 24px;
  font-weight: 500;
}

.features-section {
  max-width: 1200px;
  margin: 0 auto;
  padding: 60px 20px;
}

.section-title {
  font-size: 2rem;
  margin-bottom: 40px;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
}

.feature-card {
  padding: 30px;
  text-align: center;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  transition: transform 0.3s ease;

  &:hover {
    transform: translateY(-5px);
  }

  h3 {
    color: var(--q-green-10);
    margin: 16px 0 8px;
    font-size: 1.25rem;
  }

  p {
    color: var(--q-grey-7);
    font-size: 1rem;
  }
}

.cta-section {
  padding: 80px 20px;
}

@media (max-width: 600px) {
  .hero-title {
    font-size: 2rem;
  }

  .hero-subtitle {
    font-size: 1.1rem;
  }

  .hero-actions {
    flex-direction: column;
    align-items: center;
  }

  .features-grid {
    grid-template-columns: 1fr;
  }
}
</style>
