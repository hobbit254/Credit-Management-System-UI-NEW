<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useTheme } from 'vuetify'
import { usePayments } from '@/composables/payments/usePayments'
import type { NewPayment, Payment, PaymentTransactionItem } from '@/schemas/payments'

const {
  payments,
  loading,
  pagination,
  fetchAllPayments,
  updatePaymentStatus,
  createPayment,
} = usePayments()

const theme = useTheme()
const surfaceColor = computed(() => theme.current.value.colors.surface)

const paymentStatusOptions = ['PENDING', 'ACCEPTED', 'REJECTED']
const perPageOptions = [5, 10, 25, 50, 100]

// Modal States
const openItemsModal = ref(false)
const selectedTransactionItems = ref<PaymentTransactionItem[]>([])
const openCreateModal = ref(false)

// Logic Functions
async function handleUpdatePaymentStatus(item: Payment, newStatus: string) {
  await updatePaymentStatus(item.payment_uuid, newStatus)
}

function changePerPage(value: number) {
  pagination.value.perPage = value
  pagination.value.currentPage = 1
  fetchAllPayments()
}

function viewTransactionItems(item: Payment) {
  selectedTransactionItems.value = item.transaction?.items ?? []
  openItemsModal.value = true
}

async function handleCreatePayment(payment: NewPayment) {
  await createPayment(payment)
  openCreateModal.value = false
}

// Strictly Typed Headers
const headers = [
  { title: 'Method & Ref', key: 'payment_method', fixed: true },
  { title: 'Amount (KES)', key: 'amount', align: 'end' },
  { title: 'Status', key: 'status', width: '160px' },
  { title: 'Linked Transaction', key: 'transaction' },
  { title: 'Inventory', key: 'transaction_items', align: 'center' },
  { title: 'Timeline', key: 'created_at' },
] as const

onMounted(async () => {
  loading.value = true
  try {
    await fetchAllPayments()
  }
  finally {
    loading.value = false
  }
})
</script>

<template>
  <VRow class="h-100">
    <VCol
      cols="12"
      class="h-100 d-flex"
    >
      <VCard class="d-flex flex-column flex-grow-1 border shadow-sm">
        <VCardTitle class="d-flex justify-space-between align-center pa-4">
          <div class="d-flex align-center ga-3">
            <VAvatar
              color="primary"
              variant="tonal"
              size="42"
              rounded="lg"
            >
              <VIcon size="24">
                tabler-credit-card
              </VIcon>
            </VAvatar>
            <div class="d-flex flex-column">
              <span class="text-h6 font-weight-bold">Payment Journal</span>
              <span class="text-caption text-medium-emphasis">Verify incoming funds and reconcile transactions</span>
            </div>
          </div>
          <VBtn
            color="primary"
            prepend-icon="tabler-plus"
            variant="elevated"
            @click="openCreateModal = true"
          >
            Add Payment
          </VBtn>
        </VCardTitle>

        <VDivider />

        <VDataTable
          :headers="headers"
          :items="payments"
          :loading="loading"
          item-key="payment_uuid"
          class="flex-grow-1 payment-table"
          hover
        >
          <template #item.payment_method="{ item }">
            <div class="d-flex flex-column ga-1 py-2">
              <div class="d-flex align-center ga-2">
                <VIcon
                  size="16"
                  :color="item.payment_method === 'Cash' ? 'success' : 'primary'"
                >
                  {{ item.payment_method === 'Cash' ? 'tabler-cash' : item.payment_method === 'M-Pesa' ? 'tabler-device-mobile' : 'tabler-building-bank' }}
                </VIcon>
                <span class="text-body-2 font-weight-bold">{{ item.payment_method }}</span>
              </div>
              <div
                v-if="item.reference_code"
                class="d-flex align-center ga-1"
              >
                <span class="text-xxs text-disabled font-weight-bold uppercase">Ref:</span>
                <span class="text-xxs font-mono text-medium-emphasis">{{ item.reference_code }}</span>
              </div>
              <span
                v-else
                class="text-xxs text-disabled font-italic"
              >No reference code</span>
            </div>
          </template>

          <template #item.amount="{ item }">
            <div class="d-flex flex-column align-end py-2">
              <div class="d-flex align-center ga-1">
                <span class="text-xxs text-disabled font-weight-bold">KES</span>
                <span class="text-body-1 font-weight-black font-mono">
                  {{ Number(item.amount).toLocaleString() }}
                </span>
              </div>
            </div>
          </template>

          <template #item.status="{ item }">
            <VMenu location="bottom center">
              <template #activator="{ props: menuProps }">
                <VChip
                  :color="item.status === 'ACCEPTED' ? 'success' : item.status === 'PENDING' ? 'warning' : 'error'"
                  size="small"
                  variant="tonal"
                  class="cursor-pointer font-weight-bold"
                  v-bind="menuProps"
                >
                  <VIcon
                    start
                    size="14"
                  >
                    {{ item.status === 'ACCEPTED' ? 'tabler-circle-check' : item.status === 'PENDING' ? 'tabler-clock' : 'tabler-circle-x' }}
                  </VIcon>
                  {{ item.status }}
                  <VIcon
                    end
                    size="12"
                  >
                    tabler-chevron-down
                  </VIcon>
                </VChip>
              </template>
              <VList density="compact">
                <VListSubheader>UPDATE STATUS</VListSubheader>
                <VListItem
                  v-for="status in paymentStatusOptions"
                  :key="status"
                  :disabled="item.status === status || loading"
                  @click="handleUpdatePaymentStatus(item, status)"
                >
                  <template #prepend>
                    <VIcon
                      size="18"
                      :color="status === 'ACCEPTED' ? 'success' : status === 'PENDING' ? 'warning' : 'error'"
                    >
                      {{ status === 'ACCEPTED' ? 'tabler-circle-check' : status === 'PENDING' ? 'tabler-clock' : 'tabler-circle-x' }}
                    </VIcon>
                  </template>
                  <VListItemTitle class="text-caption font-weight-bold">
                    {{ status }}
                  </VListItemTitle>
                </VListItem>
              </VList>
            </VMenu>
          </template>

          <template #item.transaction="{ item }">
            <div class="d-flex flex-column ga-1 py-1">
              <div class="d-flex align-center ga-1">
                <VChip
                  :color="item.transaction?.transaction_type === 'Sale' ? 'primary' : 'warning'"
                  size="x-small"
                  variant="flat"
                  label
                >
                  {{ item.transaction?.transaction_type ?? 'N/A' }}
                </VChip>
                <span class="text-xxs font-mono text-disabled">#{{ item.transaction?.transaction_uuid?.split('-')[0] }}</span>
              </div>
              <div class="d-flex align-center ga-1 text-xxs">
                <span class="text-disabled">Status:</span>
                <span
                  class="font-weight-bold"
                  :class="item.transaction?.status === 'Paid' ? 'text-success' : 'text-warning'"
                >
                  {{ item.transaction?.status?.replace(/_/g, ' ') }}
                </span>
              </div>
            </div>
          </template>

          <template #item.transaction_items="{ item }">
            <VBtn
              variant="tonal"
              size="x-small"
              color="secondary"
              rounded="pill"
              prepend-icon="tabler-package"
              @click="viewTransactionItems(item)"
            >
              {{ item.transaction?.items?.length ?? 0 }} items
            </VBtn>
          </template>

          <template #item.created_at="{ item }">
            <div class="d-flex flex-column text-xxs text-medium-emphasis">
              <div class="d-flex align-center ga-1">
                <VIcon size="12">
                  tabler-calendar-plus
                </VIcon>
                <TableDate :value="item.created_at" />
              </div>
              <div class="d-flex align-center ga-1">
                <VIcon size="12">
                  tabler-clock-edit
                </VIcon>
                <TableDate :value="item.updated_at" />
              </div>
            </div>
          </template>

          <template #no-data>
            <div class="d-flex flex-column align-center justify-center pa-12 ga-2">
              <VIcon
                size="48"
                color="secondary"
                alpha="0.5"
              >
                tabler-credit-card-off
              </VIcon>
              <span class="text-h6 font-weight-light text-medium-emphasis">No payment records found</span>
              <VBtn
                color="primary"
                variant="text"
                size="small"
                @click="openCreateModal = true"
              >
                Create your first payment
              </VBtn>
            </div>
          </template>

          <template #bottom>
            <VDivider />
            <div class="d-flex justify-space-between align-center flex-wrap ga-4 pa-4">
              <div class="d-flex align-center ga-3">
                <span class="text-caption text-medium-emphasis font-weight-medium">Items per page:</span>
                <VSelect
                  :model-value="pagination.perPage"
                  :items="perPageOptions"
                  density="compact"
                  variant="outlined"
                  hide-details
                  style="width: 85px"
                  @update:model-value="changePerPage"
                />
              </div>
              <div class="d-flex align-center ga-4">
                <span class="text-caption text-medium-emphasis">
                  Page <span class="text-high-emphasis font-weight-bold">{{ pagination.currentPage }}</span> of {{ pagination.lastPage }}
                </span>
                <VPagination
                  v-model="pagination.currentPage"
                  :length="pagination.lastPage"
                  :total-visible="5"
                  density="compact"
                  active-color="primary"
                  @update:model-value="(page: number) => fetchAllPayments(page)"
                />
              </div>
            </div>
          </template>
        </VDataTable>
      </VCard>
    </VCol>
  </VRow>

  <PaymentTransactionItemsModal
    v-model="openItemsModal"
    :items="selectedTransactionItems"
  />

  <CreatePaymentModal
    v-model="openCreateModal"
    :loading="loading"
    @confirm="handleCreatePayment"
  />
</template>

<style scoped>
.payment-table :deep(td:first-child) {
  position: sticky;
  left: 0;
  background: v-bind(surfaceColor) !important;
  z-index: 1;
  border-right: 1px solid rgba(var(--v-border-color), 0.12);
}

.text-xxs { font-size: 0.65rem; }
.font-mono { font-family: 'Fira Code', 'Roboto Mono', monospace; }
.border { border: 1px solid rgba(var(--v-border-color), 0.12) !important; }

:deep(.v-data-table__tr:hover) td {
  background-color: rgba(var(--v-theme-primary,255,255,255), 0.02) !important;
}
</style>
