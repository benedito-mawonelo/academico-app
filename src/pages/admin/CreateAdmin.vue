<template>
  <q-page class="q-pa-md">
    <div class="row items-center justify-between q-mb-md">
      <div class="text-h5">Criar Administrador</div>
      <q-btn flat color="primary" icon="arrow_back" label="Voltar" @click="$router.back()" />
    </div>

    <q-card class="q-pa-md" style="max-width:600px">
      <q-form @submit.prevent="onSubmit" class="q-gutter-md">
        <q-input v-model="form.name" label="Nome" outlined :rules="[v=>!!v||'Obrigatório']" />
        <q-input v-model="form.apelido" label="Apelido" outlined />
        <q-input v-model="form.telefone" label="Telefone (9 dígitos)" outlined mask="#########" :rules="[v=>/^\d{9}$/.test(v)||'Inválido']" />
        <q-input v-model="form.password" :type="show? 'text':'password'" label="Senha" outlined :rules="[v=>!!v&&v.length>=6||'Min 6']">
          <template #append>
            <q-icon :name="show? 'visibility_off':'visibility'" class="cursor-pointer" @click="show=!show" />
          </template>
        </q-input>
        <q-input v-model="form.email_true" label="Email verdadeiro (opcional)" outlined type="email" />

        <div class="row justify-end q-gutter-sm">
          <q-btn flat label="Limpar" @click="reset" />
          <q-btn unelevated color="primary" type="submit" :loading="loading" label="Criar Admin" />
        </div>
      </q-form>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { useQuasar } from 'quasar'
import { useAuthStore } from 'stores/modules/auth'

const $q = useQuasar()
const auth = useAuthStore()

const form = ref({
  name: '',
  apelido: '',
  telefone: '',
  password: '',
  email_true: ''
})

const show = ref(false)
const loading = ref(false)

function reset(){
  form.value = { name:'', apelido:'', telefone:'', password:'', email_true:'' }
}

async function onSubmit(){
  loading.value = true
  try {
    const telefoneEmail = `${form.value.telefone}@gmail.com`
    const payload = {
      name: form.value.name,
      apelido: form.value.apelido,
      telefone: form.value.telefone,
      email: telefoneEmail,
      email_true: form.value.email_true || '',
      password: form.value.password,
      role: 'admin',
      isAdmin: true
    }

    const res = await auth.registerAdmin(payload)
    $q.notify({ type:'positive', message:'Administrador criado', caption: res.id })
    reset()
  } catch (e) {
    $q.notify({ type:'negative', message:'Erro ao criar admin', caption: e?.message })
  } finally {
    loading.value = false
  }
}
</script>
