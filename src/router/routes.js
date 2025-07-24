// const routes = [
//   {
//     path: '/',
//     component: () => import('layouts/MainLayout.vue'),
//     children: [
//       { path: '', component: () => import('pages/IndexPage.vue') },
//       { path: 'login', component: () => import('pages/LoginPage.vue') },
//       { path: 'register', component: () => import('pages/RegisterPage.vue') },
//       { path: 'first-access', component: () => import('pages/FirstAccessPage.vue') },
//       { path: 'dashboard', component: () => import('pages/DashboardPage.vue') },
//       { path: '/:catchAll(.*)*',component: () => import('pages/ErrorNotFound.vue'),},
//       { path: 'disciplinas/', component: () => import('pages/DisciplinePage.vue') },
//       { path: 'ebooks', component: () => import('pages/EbooksPage.vue') },
//       { path: 'scanner', component: () => import('pages/ScannerPage.vue') },
//       { path: 'uploads', component: () => import('pages/BibliotecaUploadsPage.vue') },
//       { path: 'profile', component: () => import('pages/PerfilPage.vue') },

//       { path: 'disciplinas/:id', component: () => import('pages/DisciplinaView.vue') }



//     ]
//   }
// ]

// export default routes

const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      // Páginas principais
      { path: '', component: () => import('pages/IndexPage.vue') },
      { path: 'login', component: () => import('pages/LoginPage.vue') },
      { path: 'register', component: () => import('pages/RegisterPage.vue') },
      { path: 'first-access', component: () => import('pages/FirstAccessPage.vue') },
      { path: 'dashboard', component: () => import('pages/DashboardPage.vue') },

      // Fluxo de recuperação de senha
      { path: 'forgot-password', component: () => import('pages/passwordRecovery/SendOtpPage.vue') },
      { path: 'verify-otp', component: () => import('pages/passwordRecovery/VerifyOtpPage.vue') },
      { path: 'otp-success', component: () => import('pages/passwordRecovery/OtpSuccessPage.vue') },
      { path: 'reset-password', component: () => import('pages/passwordRecovery/ResetPasswordPage.vue') },
      { path: 'reset-password-success', component: () => import('pages/passwordRecovery/ResetPasswordSuccessPage.vue') },

      // Páginas acadêmicas
      { path: 'disciplinas', component: () => import('pages/DisciplinePage.vue') },
      { path: 'disciplinas/:id', component: () => import('pages/DisciplinaView.vue') },
      { path: 'ebooks', component: () => import('pages/EbooksPage.vue') },
      { path: 'scanner', component: () => import('pages/ScannerPage.vue') },
      { path: 'uploads', component: () => import('pages/BibliotecaUploadsPage.vue') },
      { path: 'profile', component: () => import('pages/PerfilPage.vue') },
      { path: 'loja-academica', component: () => import('pages/LojaPage.vue') },
      { path: 'Notificacoes', component: () => import('pages/NotificacoesPage.vue') },
      {path: '/video-player', component: () => import('pages/VideoPlayerPage.vue')},
      // Página de erro (deve ser a última rota)
      { path: '/:catchAll(.*)*', component: () => import('pages/ErrorNotFound.vue') }
    ]
  }
]

export default routes
