<script setup lang="ts">
import { computed, onMounted, watch } from 'vue'
import { watchDebounced } from '@vueuse/core'
import { useDebtor } from '@/composables/debtors/useDebtor'
import type { Debtor } from '@/schemas/debtors'
import { creditUse, daysSince } from '@/utils/owed'

definePageMeta({
  subject: 'v1/debtors',
})

const {
  debtors, loading, pagination, filters, showToast, fetchAllDebtors,
  openAdd, newDebtor, addDebtor, createDebtor,
  openEdit, debtorToEdit, editDebtor, updateDebtor,
  openDelete, deleteDebtorModal, debtorToDelete, deleteDebtor,
  restoreDebtor, activateDebtor, deactivateDebtor,
} = useDebtor()

onMounted(() => fetchAllDebtors())

// A new search or filter starts again from page 1.
watchDebounced(() => filters.value.search, () => fetchAllDebtors({ page: 1 }), { debounce: 300 })
watch(() => filters.value.show, () => fetchAllDebtors({ page: 1 }))

const showOptions = [
  { value: 'all', label: 'All' },
  { value: 'owing', label: 'Owes money' },
  { value: 'over_limit', label: 'Over limit' },
]

const kes = (amount: number) => `KES ${amount.toLocaleString('en-KE')}`

const barColor = { ok: 'rgb(var(--v-theme-primary))', near: 'rgb(var(--v-theme-warning))', over: 'rgb(var(--v-theme-error))' }

function lastPaid(debtor: Debtor) {
  if (!debtor.last_paid_at)
    return { date: 'No payments yet', ago: '', late: false }

  const days = daysSince(debtor.last_paid_at, Date.now())
  const date = new Date(debtor.last_paid_at).toLocaleDateString('en-KE', { day: 'numeric', month: 'short' })

  return { date, ago: days === 0 ? 'Today' : days === 1 ? 'Yesterday' : `${days} days ago`, late: debtor.owed > 0 && days > 60 }
}

function copyId(uuid: string) {
  navigator.clipboard.writeText(uuid)
  showToast({ title: 'Copied', text: 'Debtor ID copied', color: 'success', icon: 'tabler-clipboard-check' })
}

const rows = computed(() => debtors.value.map(debtor => ({
  debtor,
  use: creditUse(debtor.owed, debtor.credit_limit),
  paid: lastPaid(debtor),
})))

const firstShown = computed(() => (pagination.value.currentPage - 1) * pagination.value.perPage + 1)
const lastShown = computed(() => Math.min(pagination.value.currentPage * pagination.value.perPage, pagination.value.total))
</script>

<template>
  <div class="debtors">
    <header class="d-flex flex-wrap align-end gap-4 mb-6">
      <div class="flex-grow-1">
        <h1 class="text-h2 mb-1">
          Debtors
        </h1>
        <p class="text-body-1 text-medium-emphasis mb-0">
          {{ pagination.total }} {{ filters.show === 'over_limit' ? 'over their credit limit' : filters.show === 'owing' ? 'still owe money' : (pagination.total === 1 ? 'customer' : 'customers') }}
        </p>
      </div>
      <VBtn
        prepend-icon="tabler-user-plus"
        @click="addDebtor"
      >
        Add debtor
      </VBtn>
    </header>

    <div class="d-flex flex-wrap align-center gap-3 mb-6">
      <AppTextField
        v-model="filters.search"
        aria-label="Search debtors"
        placeholder="Name or phone"
        prepend-inner-icon="tabler-search"
        clearable
        style="max-inline-size: 360px; min-inline-size: 220px;"
      />
      <VBtnToggle
        v-model="filters.show"
        mandatory
        divided
        variant="outlined"
        color="primary"
        aria-label="Show"
      >
        <VBtn
          v-for="option in showOptions"
          :key="option.value"
          :value="option.value"
        >
          {{ option.label }}
        </VBtn>
      </VBtnToggle>
    </div>

    <VCard
      border
      flat
    >
      <VTable class="debtor-table">
        <thead>
          <tr>
            <th>Customer</th>
            <th class="text-end">
              Owes
            </th>
            <th style="min-inline-size: 220px;">
              Credit limit used
            </th>
            <th>Last payment</th>
            <th>
              <span class="d-sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="{ debtor, use, paid } in rows"
            :key="debtor.debtor_uuid"
            :class="{ archived: debtor.deleted_at }"
          >
            <td class="py-3">
              <div class="d-flex align-center gap-2">
                <span class="font-weight-medium text-body-1">{{ debtor.debtor_name }}</span>
                <VChip
                  v-if="debtor.deleted_at"
                  size="small"
                  color="error"
                >
                  Archived
                </VChip>
                <VChip
                  v-else-if="!debtor.active"
                  size="small"
                  color="warning"
                >
                  Suspended
                </VChip>
              </div>
              <div class="text-body-2 text-medium-emphasis">
                {{ debtor.debtor_phone }}, {{ debtor.debtor_type }}
              </div>
            </td>
            <td class="text-end font-weight-bold text-body-1">
              {{ debtor.owed > 0 ? kes(debtor.owed) : 'Paid up' }}
            </td>
            <td>
              <div class="d-flex align-center gap-3">
                <div
                  role="img"
                  :aria-label="`${use.percent} percent of a ${kes(debtor.credit_limit)} limit used`"
                  class="limit-track"
                >
                  <div :style="{ inlineSize: `${Math.min(use.percent, 100)}%`, background: barColor[use.level] }" />
                </div>
                <span
                  class="text-body-2 percent"
                  :class="{ 'text-error font-weight-bold': use.level === 'over' }"
                >{{ use.percent }}%</span>
              </div>
              <div class="text-body-2 text-medium-emphasis">
                {{ debtor.credit_limit > 0 ? `of ${kes(debtor.credit_limit)}` : 'No credit allowed' }}
              </div>
            </td>
            <td>
              <div class="text-body-1">
                {{ paid.date }}
              </div>
              <div
                class="text-body-2"
                :class="paid.late ? 'text-error font-weight-medium' : 'text-medium-emphasis'"
              >
                {{ paid.ago }}
              </div>
            </td>
            <td class="text-end">
              <VMenu location="bottom end">
                <template #activator="{ props: menuProps }">
                  <VBtn
                    :aria-label="`Actions for ${debtor.debtor_name}`"
                    icon="tabler-dots-vertical"
                    variant="text"
                    color="default"
                    v-bind="menuProps"
                  />
                </template>
                <VList>
                  <VListItem
                    prepend-icon="tabler-edit"
                    title="Edit details"
                    @click="editDebtor(debtor)"
                  />
                  <VListItem
                    prepend-icon="tabler-copy"
                    title="Copy ID"
                    @click="copyId(debtor.debtor_uuid)"
                  />
                  <!-- Archived rows are restored, not unsuspended -->
                  <template v-if="!debtor.deleted_at">
                    <VDivider class="my-1" />
                    <VListItem
                      :prepend-icon="debtor.active ? 'tabler-lock-pause' : 'tabler-lock-open'"
                      :title="debtor.active ? 'Suspend' : 'Unsuspend'"
                      @click="debtor.active ? deactivateDebtor(debtor) : activateDebtor(debtor)"
                    />
                    <VListItem
                      prepend-icon="tabler-archive"
                      title="Archive"
                      base-color="error"
                      @click="deleteDebtorModal(debtor)"
                    />
                  </template>
                  <VListItem
                    v-else
                    prepend-icon="tabler-restore"
                    title="Restore"
                    @click="restoreDebtor(debtor)"
                  />
                </VList>
              </VMenu>
            </td>
          </tr>
          <tr v-if="!debtors.length && !loading">
            <td
              colspan="5"
              class="text-body-1 text-medium-emphasis py-6"
            >
              {{ filters.search || filters.show !== 'all' ? 'No debtors match. Try another name or filter.' : 'No debtors yet. Add one to start selling on credit.' }}
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
        @update:model-value="page => fetchAllDebtors({ page })"
      />
    </nav>
  </div>

  <CreateDebtorModal
    v-model:model-value="openAdd"
    v-model:debtor="newDebtor"
    :loading="loading"
    @confirm="createDebtor"
  />
  <UpdateDebtorModal
    v-model:model-value="openEdit"
    v-model:debtor="debtorToEdit"
    :loading="loading"
    @confirm="updateDebtor"
  />
  <DeleteDebtorModal
    v-model:model-value="openDelete"
    v-model:debtor="debtorToDelete"
    :loading="loading"
    @confirm="deleteDebtor"
  />
</template>

<style scoped>
.debtors { max-width: 1120px; }

.debtor-table { overflow-x: auto; }
.debtor-table :deep(table) { min-inline-size: 820px; }
.debtor-table th { font-weight: 500 !important; }

.archived { opacity: 0.6; }

.limit-track {
  flex: 1;
  overflow: hidden;
  border-radius: 4px;
  background: rgba(var(--v-track-bg));
  block-size: 8px;
}

.limit-track > div {
  border-radius: 4px;
  block-size: 100%;
}

.percent { flex: 0 0 48px; }
</style>
