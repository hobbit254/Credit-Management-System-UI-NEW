<script setup lang="ts">
import { computed } from 'vue'
import type { Pagination } from '@/schemas/pagination'

// The redesigned list page: title, toolbar, a bordered table, and paging.
// The page supplies the table's head and rows; this keeps them all laid out alike.
const props = defineProps<{
  title: string
  subtitle?: string
  loading: boolean
  pagination: Pagination
  rowCount: number
  columns: number
  emptyText: string
}>()

const emit = defineEmits<{ page: [page: number] }>()

const firstShown = computed(() => (props.pagination.currentPage - 1) * props.pagination.perPage + 1)
const lastShown = computed(() => Math.min(props.pagination.currentPage * props.pagination.perPage, props.pagination.total))
</script>

<template>
  <div class="list-page">
    <header class="d-flex flex-wrap align-end gap-4 mb-6">
      <div class="flex-grow-1">
        <h1 class="text-h2 mb-1">
          {{ title }}
        </h1>
        <p
          v-if="subtitle"
          class="text-body-1 text-medium-emphasis mb-0"
        >
          {{ subtitle }}
        </p>
      </div>
      <div class="d-flex flex-wrap gap-2">
        <slot name="actions" />
      </div>
    </header>

    <div
      v-if="$slots.filters"
      class="d-flex flex-wrap align-center gap-3 mb-6"
    >
      <slot name="filters" />
    </div>

    <VCard
      border
      flat
    >
      <VTable class="list-table">
        <thead>
          <tr>
            <slot name="head" />
          </tr>
        </thead>
        <tbody>
          <slot />
          <tr v-if="!rowCount && !loading">
            <td
              :colspan="columns"
              class="text-body-1 text-medium-emphasis py-6"
            >
              {{ emptyText }}
            </td>
          </tr>
        </tbody>
      </VTable>
      <VProgressLinear
        v-if="loading"
        indeterminate
        color="primary"
        height="2"
      />
    </VCard>

    <nav
      v-if="pagination.total"
      aria-label="Pages"
      class="d-flex flex-wrap justify-space-between align-center gap-3 mt-4"
    >
      <span class="text-body-1 text-medium-emphasis">Showing {{ firstShown }}–{{ lastShown }} of {{ pagination.total }}</span>
      <VPagination
        :model-value="pagination.currentPage"
        :length="pagination.lastPage"
        :total-visible="5"
        @update:model-value="page => emit('page', page)"
      />
    </nav>
  </div>
</template>

<style scoped>
.list-page { max-width: 1120px; }

.list-table { overflow-x: auto; }
.list-table :deep(table) { min-inline-size: 760px; }
.list-table :deep(th) { font-weight: 500 !important; }
.list-table :deep(tr.archived) { opacity: 0.6; }
</style>
