<template>
  <q-page class="q-pa-md">
    <q-toolbar class="bg-green-10 text-white">
      <q-toolbar-title>Perfil</q-toolbar-title>
    </q-toolbar>

    <div class="q-mt-lg flex flex-center column">
      <q-avatar size="100px">
        <img :src="user.foto" />
      </q-avatar>

      <q-btn class="q-mt-md" flat icon="edit" label="Editar Foto" @click="editarFoto" />

      <q-card class="q-mt-lg q-pa-md full-width">
        <q-input label="Nome completo" v-model="user.nome" />
        <q-input label="Email" v-model="user.email" type="email" />
        <q-input label="Instituição" v-model="user.instituicao" />
        <q-input label="Ano Acadêmico" v-model="user.ano" />
        <q-select
          label="Nível"
          v-model="user.nivel"
          :options="['Ensino Médio', 'Pré-Universitário', 'Universitário']"
        />

        <q-btn class="q-mt-md full-width" color="green-10" label="Salvar alterações" @click="salvarPerfil" />
        <q-btn class="q-mt-sm full-width" color="negative" label="Sair" @click="logout" flat />
      </q-card>
    </div>
  </q-page>
</template>

<script setup>
import { ref } from 'vue';

const user = ref({
  nome: 'Carlos Alberto',
  email: 'carlos@email.com',
  instituicao: 'Universidade de Maputo',
  ano: '3º',
  nivel: 'Universitário',
  foto: 'https://cdn.quasar.dev/img/avatar.png'
});

function editarFoto() {
  console.log('Editar foto...');
  // Em breve: upload para Firebase Storage
}

function salvarPerfil() {
  console.log('Perfil salvo:', user.value);
  // Em breve: update no Firestore
}

function logout() {
  console.log('Logout...');
  // Em breve: firebase.auth().signOut()
}
</script>
