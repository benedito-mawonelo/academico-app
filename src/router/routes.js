const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      // Admin Painel
      { path: 'admin', component: () => import('pages/admin/adminPainel.vue') },
      { path: 'admin/create-professor', component: () => import('pages/admin/CreateProfessor.vue') },
      { path: 'admin/create-admin', component: () => import('pages/admin/CreateAdmin.vue') },
      { path: 'professor', component: () => import('src/pages/professor/ProfessorPainel.vue') },


      // Páginas principais
      { path: '', component: () => import('pages/IndexPage.vue') },
      { path: 'login', component: () => import('pages/LoginPage.vue') },
      { path: 'loginCF', component: () => import('pages/LoginPageCF.vue') },
      { path: 'register', component: () => import('pages/RegisterPage.vue') },
      { path: 'upload-photo', component: () => import('pages/UploadPhoto.vue') },
      { path: 'first-access', component: () => import('pages/FirstAccessPage.vue') },
      { path: 'dashboard', component: () => import('pages/DashboardPage.vue') },

      // Fluxo de recuperação de senha
      { path: 'forgot-password', component: () => import('pages/passwordRecovery/SendOtpPage.vue') },
      { path: 'verify-otp', component: () => import('pages/passwordRecovery/VerifyOtpPage.vue') },
      { path: 'otp-success', component: () => import('pages/passwordRecovery/OtpSuccessPage.vue') },
      { path: 'reset-password', component: () => import('pages/passwordRecovery/ResetPasswordPage.vue') },
      { path: 'reset-password-success', component: () => import('pages/passwordRecovery/ResetPasswordSuccessPage.vue') },

      // Páginas acadêmicas
      { path: 'cadeiras', component: () => import('pages/DisciplinePage.vue') },
      { path: 'cadeiras/:id', component: () => import('pages/CadeiraView.vue') },
      { path: 'cadeiras/:id/tests', component: () => import('pages/meuMaterialDeEstudo/TestsScreen.vue') },
      { path: '/cadeiras/:cadeiraId/modulos/:moduloId', component:() => import('pages/ModuloDetailPage.vue')},
      { path: 'ebooks', component: () => import('pages/EbooksPage.vue') },
      { path: 'meu-material', component: () => import('src/pages/meuMaterialDeEstudo/MeuMaterialDeEstudo.vue') },
      { path: 'scanner', component: () => import('pages/ScannerPage.vue') },
      { path: 'uploads', component: () => import('pages/BibliotecaUploadsPage.vue') },
      { path: 'profile', component: () => import('pages/PerfilPage.vue') },
      { path: 'cursos', component: () => import('pages/LojaPage.vue') },
      { path: 'Notificacoes', component: () => import('pages/NotificacoesPage.vue') },
      { path: '/video-player', component: () => import('pages/VideoPlayerPage.vue')},
      { path: 'editar-perfil', component: () => import('../pages/EditProfile.vue') },

      { path: 'curso-detalhes', component: () => import('../pages/CourseDetails.vue') },
      // Novas rotas para as telas do material de estudo
      { path: 'videos', component: () => import('pages/meuMaterialDeEstudo/VideosScreen.vue') },
      { path: 'favorites', component: () => import('pages/meuMaterialDeEstudo/FavoritosScreen.vue') },
      { path: 'notes', component: () => import('pages/meuMaterialDeEstudo/AnotacoesScreen.vue') },
      { path: 'doubts', component: () => import('pages/meuMaterialDeEstudo/DuvidasScreen.vue') },
      { path: 'tests', component: () => import('pages/meuMaterialDeEstudo/TestsScreen.vue') },
      
      // Rotas do Fórum de Discussões
      { path: 'forum', component: () => import('pages/ForumPage.vue') },
      { path: 'forum/live/:classId', component: () => import('pages/LiveClassRoom.vue') },
      
      // Rotas para páginas de detalhes
      // { path: 'video/:id', component: () => import('pages/meuMaterialDeEstudo/VideoDetail.vue') },
      // { path: 'note/:id', component: () => import('pages/meuMaterialDeEstudo/NoteDetail.vue') },
      // { path: 'note/new', component: () => import('pages/meuMaterialDeEstudo/NoteDetail.vue') },
      // { path: 'doubt/:id', component: () => import('pages/meuMaterialDeEstudo/DoubtDetail.vue') },
      // { path: 'doubt/new', component: () => import('pages/meuMaterialDeEstudo/DoubtDetail.vue') },
      // { path: 'test/:id', component: () => import('pages/meuMaterialDeEstudo/TestDetail.vue') },
      // Página de erro (deve ser a última rota)
      { path: '/:catchAll(.*)*', component: () => import('pages/ErrorNotFound.vue') }
    ]
  }
]

export default routes
