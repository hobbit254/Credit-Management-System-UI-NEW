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
</script>

<template>
  <ListPage
    title="Debtors"
    :loading="loading"
    :pagination="pagination"
    :row-count="debtors.length"
    :columns="5"
    :empty-text="filters.search || filters.show !== 'all' ? 'No debtors match. Try another name or filter.' : 'No debtors yet. Add one to start selling on credit.'"
    @page="page => fetchAllDebtors({ page })"
  >
    <template #subtitle>
      {{ pagination.total }} {{ filters.show === 'over_limit' ? 'over their credit limit' : filters.show === 'owing' ? 'still owe money' : (pagination.total === 1 ? 'customer' : 'customers') }}
    </template>

    <template #actions>
      <VBtn
        prepend-icon="tabler-user-plus"
        @click="addDebtor"
      >
        Add debtor
      </VBtn>
    </template>

    <template #filters>
      <AppTextField
        v-model="filters.search"
        aria-label="Search debtors"
        placeholder="Name or phone"
        prepend-inner-icon="tabler-search"
        clearable
        style="max-inline-size: 360px; min-inline-size: 220px;"
      />
      <!-- Chips wrap onto a new line on narrow screens; a button group would overflow. -->
      <VChipGroup
        v-model="filters.show"
        mandatory
        column
        selected-class="bg-primary"
        aria-label="Show"
      >
        <VChip
          v-for="option in showOptions"
          :key="option.value"
          :value="option.value"
          size="large"
          variant="outlined"
        >
          {{ option.label }}
        </VChip>
      </VChipGroup>
    </template>

    <template #head>
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
    </template>

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
        <div
          v-if="use.percent === null"
          class="text-body-2 text-medium-emphasis"
        >
          No limit
        </div>
        <div
          v-else
          class="d-flex align-center gap-3"
        >
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
        <div
          v-if="use.percent !== null"
          class="text-body-2 text-medium-emphasis"
        >
          of {{ kes(debtor.credit_limit) }}
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
  </ListPage>

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
