<template>
  <q-layout view="lHh Lpr lFf">

    <q-header elevated class="bg-primary text-white">
      <!-- <q-toolbar>
        <q-toolbar-title>
          Explicador App
        </q-toolbar-title>
      </q-toolbar> -->
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>

    <q-footer class="bg-white text-grey-8">
      <q-tabs
        v-model="activeTab"
        dense
        align="justify"
        class="q-px-md"
        active-color="primary"
        indicator-color="primary"
      >
        <q-tab name="home" icon="home" label="Casa" @click="goTo('/dashboard')" />
        <q-tab name="videos" icon="ondemand_video" label="Vídeos" @click="goTo('/videos')" />
        <q-tab name="forum" icon="forum" label="Fórum" @click="goTo('/forum')" />
        <q-tab name="meu-material" icon="inventory_2" label="Meu Material" @click="goTo('/meu-material')" />
        <q-tab name="doubts" icon="help" label="Dúvidas" @click="goTo('/doubts')" />
      </q-tabs>
    </q-footer>
  </q-layout>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const activeTab = ref('')

function syncActiveTab(path) {
  if (path === '/' || path.startsWith('/dashboard')) activeTab.value = 'home'
  else if (path.startsWith('/videos')) activeTab.value = 'videos'
  else if (path.startsWith('/forum')) activeTab.value = 'forum'
  else if (path.startsWith('/meu-material')) activeTab.value = 'meu-material'
  else if (path.startsWith('/doubts')) activeTab.value = 'doubts'
  else activeTab.value = ''
}

watch(() => route.path, (p) => syncActiveTab(p), { immediate: true })

function goTo(to) {
  router.push(to)
}
</script>
