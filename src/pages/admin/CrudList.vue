<template>
  <div class="q-pa-md">
    <div class="row items-center justify-between q-mb-md">
      <div class="text-h6">{{ title }}</div>
      <q-btn label="Adicionar" color="primary" icon="add" @click="openDialog" />
    </div>

    <q-table
      :columns="columns"
      :rows="items"
      row-key="id"
      bordered
      flat
    >
      <template v-slot:body-cell-actions="props">
        <q-td align="center">
          <q-btn dense flat icon="edit" @click="() => $emit('edit', props.row)" />
          <q-btn dense flat icon="delete" color="red" @click="() => $emit('delete', props.row.id)" />
        </q-td>
      </template>
    </q-table>

    <!-- Diálogo de Edição/Criação -->
    <q-dialog v-model="visible">
      <q-card style="min-width: 400px" class="q-pa-md">
        <q-card-section>
          <div class="text-h6">{{ isEditing ? 'Editar' : 'Adicionar' }} {{ title }}</div>
        </q-card-section>

        <q-card-section>
          <q-input v-model="localItem.nome" label="Nome" />

          <q-input
            v-if="localItem.texto !== undefined"
            v-model="localItem.texto"
            label="Texto da Pergunta"
            type="textarea"
            autogrow
          />

          <q-select
            v-if="extraFields?.temas"
            v-model="localItem.temaId"
            label="Tema"
            :options="extraFields.temas.map(t => ({ label: t.nome, value: t.id }))"
            emit-value map-options
            class="q-mt-md"
          />

          <div v-if="extraFields?.opcoes" class="q-mt-md">
            <div class="text-subtitle2 q-mb-sm">Opções</div>
            <q-input
              v-for="(opcao, index) in localItem.opcoes"
              :key="index"
              v-model="localItem.opcoes[index]"
              :label="'Opção ' + (index + 1)"
              class="q-mb-sm"
            />
            <q-input
              v-model="localItem.respostaCorreta"
              label="Resposta Correta"
              class="q-mt-sm"
            />
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" @click="cancel" />
          <q-btn flat label="Salvar" color="primary" @click="save" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'

const props = defineProps({
  title: String,
  items: Array,
  columns: Array,
  editedItem: Object,
  dialogVisible: Boolean,
  extraFields: Object
})

const emit = defineEmits(['save', 'edit', 'delete', 'cancel', 'dialog-toggle'])

const visible = ref(false)
const localItem = ref({})
const isEditing = computed(() => !!props.editedItem)

watch(() => props.dialogVisible, (val) => {
  visible.value = val
  if (val && props.editedItem) {
    localItem.value = JSON.parse(JSON.stringify(props.editedItem)) // deep copy
  } else {
    localItem.value = { nome: '', opcoes: ['', '', '', ''], respostaCorreta: '' }
  }
})

function openDialog() {
  emit('edit', null) // novo item
  emit('dialog-toggle', true)
}

function cancel() {
  emit('cancel')
  emit('dialog-toggle', false)
}

function save() {
  emit('save', localItem.value)
  emit('dialog-toggle', false)
}
</script>
