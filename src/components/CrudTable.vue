<!-- src/components/CrudTable.vue -->
<template>
  <q-table
    :rows="items"
    :columns="columns"
    :loading="loading"
    row-key="id"
    :pagination="{ rowsPerPage: 10 }"
    no-data-label="Nenhum item encontrado"
  >
    <template v-slot:body="props">
      <q-tr :props="props">
        <q-td v-for="col in props.cols" :key="col.name" :props="props">
          {{ col.format ? col.format(props.row[col.field]) : props.row[col.field] }}
        </q-td>
        <q-td auto-width>
          <q-btn flat dense icon="edit" color="primary" @click="$emit('edit', props.row)" />
          <q-btn flat dense icon="delete" color="negative" @click="$emit('delete', props.row.id)" />
          <q-btn
            v-for="action in extraActions"
            :key="action.icon"
            flat
            dense
            :icon="action.icon"
            :color="action.color"
            @click="action.handler(props.row)"
          >
            <q-tooltip>{{ action.tooltip }}</q-tooltip>
          </q-btn>
        </q-td>
      </q-tr>
    </template>
  </q-table>
</template>

<script setup>
defineProps({
  items: {
    type: Array,
    default: () => []
  },
  columns: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  },
  extraActions: {
    type: Array,
    default: () => []
  }
})
defineEmits(['edit', 'delete'])
</script>
