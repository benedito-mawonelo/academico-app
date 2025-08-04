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
        <q-input label="Nome completo" v-model="user.name" />
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
import { ref, onMounted } from 'vue';
import { firebaseAuth, db } from 'src/boot/firebase'
import { onAuthStateChanged } from 'firebase/auth';
import {  doc, getDoc } from 'firebase/firestore'



const user = ref({
  name: '',
  email: '',
  instituicao: '',
  ano: '',
  nivel: '',
  foto: ''
})

const loading = ref(true)


onMounted(() => {
  onAuthStateChanged(firebaseAuth, async (currentUser) => {
    if (!currentUser) {
      console.warn('Nenhum usuário autenticado.');
      return;
    }

    try {
      console.log('Usuário logado:', currentUser.uid);
      const uid = currentUser.uid;
      const docRef = doc(db, 'users_academico', uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        user.value = {
          name: data.name,
          email: data.email,
          instituicao: data.instituicao,
          ano: data.ano,
          nivel: data.nivel,
          foto: data.imagem
        };


      } else {
        console.warn('Usuário não encontrado em users_academico.');
      }
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
    } finally {
      loading.value = false;
    }
  });
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
