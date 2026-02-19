<script setup lang="ts">
import { usePayments } from '@/composables/payments/usePayments'
import type { NewPayment, Payment, PaymentTransactionItem } from '@/schemas/payments'

const perPageOptions = [5, 10, 25, 50, 100]

const {
  payments,
  loading,
  pagination,
  fetchAllPayments,
  updatePaymentStatus,
  createPayment,
} = usePayments()

const paymentStatusOptions = ['PENDING', 'ACCEPTED', 'REJECTED']

async function handleUpdatePaymentStatus(item: Payment, newStatus: string) {
  await updatePaymentStatus(item.payment_uuid, newStatus)
}

function changePerPage(value: number) {
  pagination.value.perPage = value
  pagination.value.currentPage = 1
  fetchAllPayments()
}

onMounted(async () => {
  loading.value = true
  try {
    await fetchAllPayments()
  }
  finally {
    loading.value = false
  }
})

const headers = [
  { title: 'Payment Method', key: 'payment_method' },
  { title: 'Amount', key: 'amount' },
  { title: 'Reference Code', key: 'reference_code' },
  { title: 'Status', key: 'status' },
  { title: 'Transaction', key: 'transaction' },
  { title: 'Transaction Items', key: 'transaction_items' },
  { title: 'Created', key: 'created_at' },
  { title: 'Updated', key: 'updated_at' },

]

const openItemsModal = ref(false)
const selectedTransactionItems = ref<PaymentTransactionItem[]>([])

function viewTransactionItems(item: Payment) {
  selectedTransactionItems.value = item.transaction?.items ?? []
  openItemsModal.value = true
}

const openCreateModal = ref(false)

async function handleCreatePayment(payment: NewPayment) {
  await createPayment(payment)
  openCreateModal.value = false
}
</script>

<template>
  <VRow class="h-100">
    <VCol
      cols="12"
      class="h-100 d-flex"
    >
      <VCard class="d-flex flex-column flex-grow-1">
        <VCardTitle class="d-flex justify-space-between align-center pa-4">
          <div class="d-flex align-center ga-2">
            <VIcon color="primary">
              tabler-credit-card
            </VIcon>
            <span class="text-h6 font-weight-bold">Payments</span>
          </div>
          <VBtn
            color="primary"
            prepend-icon="tabler-plus"
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
          class="flex-grow-1"
          :items-per-page="-1"
        >
          <!-- Payment Method -->
          <template #item.payment_method="{ item }">
            <VChip
              size="small"
              color="secondary"
              variant="tonal"
            >
              <VIcon
                start
                size="14"
              >
                {{ item.payment_method === 'Cash' ? 'tabler-cash' : item.payment_method === 'M-pesa' ? 'tabler-phone' : item.payment_method === 'Bank' ? 'tabler-building-bank' : 'tabler-receipt' }}
              </VIcon>
              {{ item.payment_method }}
            </VChip>
          </template>

          <!-- Amount -->
          <template #item.amount="{ item }">
            <div class="d-flex align-center ga-1">
              <span class="text-caption font-weight-bold text-success">KES</span>
              <span class="font-weight-medium text-body-2">
                {{ Number(item.amount).toLocaleString() }}
              </span>
            </div>
          </template>

          <!-- Reference Code -->
          <template #item.reference_code="{ item }">
            <template v-if="item.reference_code">
              <VChip
                size="small"
                variant="outlined"
                color="secondary"
              >
                <VIcon
                  start
                  size="12"
                >
                  tabler-hash
                </VIcon>
                {{ item.reference_code }}
              </VChip>
            </template>
            <span
              v-else
              class="text-medium-emphasis"
            >—</span>
          </template>

          <!-- Status -->
          <template #item.status="{ item }">
            <VMenu>
              <template #activator="{ props }">
                <VChip
                  :color="item.status === 'ACCEPTED' ? 'success' : item.status === 'PENDING' ? 'warning' : 'error'"
                  size="small"
                  variant="tonal"
                  class="cursor-pointer"
                  v-bind="props"
                >
                  <VIcon
                    start
                    size="13"
                  >
                    {{ item.status === 'ACCEPTED' ? 'tabler-circle-check' : item.status === 'PENDING' ? 'tabler-clock' : 'tabler-circle-x' }}
                  </VIcon>
                  {{ item.status }}
                  <VIcon
                    end
                    size="12"
                  >
                    tabler-pencil
                  </VIcon>
                </VChip>
              </template>
              <VList density="compact">
                <VListSubheader>Change Status</VListSubheader>
                <VListItem
                  v-for="status in paymentStatusOptions"
                  :key="status"
                  :disabled="item.status === status || loading"
                  @click="handleUpdatePaymentStatus(item, status)"
                >
                  <div class="d-flex align-center ga-2">
                    <VIcon
                      :color="status === 'ACCEPTED' ? 'success' : status === 'PENDING' ? 'warning' : 'error'"
                      size="16"
                    >
                      {{ status === 'ACCEPTED' ? 'tabler-circle-check' : status === 'PENDING' ? 'tabler-clock' : 'tabler-circle-x' }}
                    </VIcon>
                    <span>{{ status }}</span>
                    <VIcon
                      v-if="item.status === status"
                      size="12"
                      color="primary"
                    >
                      tabler-check
                    </VIcon>
                  </div>
                </VListItem>
              </VList>
            </VMenu>
          </template>

          <!-- Transaction -->
          <template #item.transaction="{ item }">
            <div class="d-flex flex-column ga-1">
              <div class="d-flex align-center ga-1">
                <VChip
                  :color="item.transaction?.transaction_type === 'Sale' ? 'primary' : 'warning'"
                  size="x-small"
                  variant="tonal"
                >
                  <VIcon
                    start
                    size="11"
                  >
                    {{ item.transaction?.transaction_type === 'Sale' ? 'tabler-shopping-cart' : 'tabler-credit-card' }}
                  </VIcon>
                  {{ item.transaction?.transaction_type ?? '—' }}
                </VChip>
                <VChip
                  :color="item.transaction?.status === 'Paid' ? 'success' : item.transaction?.status === 'Partially_Paid' ? 'warning' : 'error'"
                  size="x-small"
                  variant="tonal"
                >
                  {{ item.transaction?.status?.replace(/_/g, ' ') ?? '—' }}
                </VChip>
              </div>
            </div>
          </template>

          <!-- Transaction Items -->
          <template #item.transaction_items="{ item }">
            <VChip
              size="small"
              color="secondary"
              variant="tonal"
              class="cursor-pointer"
              @click="viewTransactionItems(item)"
            >
              <VIcon
                start
                size="14"
              >
                tabler-package
              </VIcon>
              {{ item.transaction?.items?.length ?? 0 }} item(s)
            </VChip>
          </template>

          <!-- Dates -->
          <template #item.created_at="{ item }">
            <div class="d-flex align-center ga-1 text-caption text-medium-emphasis">
              <VIcon size="13">
                tabler-calendar
              </VIcon>
              <TableDate :value="item.created_at" />
            </div>
          </template>

          <template #item.updated_at="{ item }">
            <div class="d-flex align-center ga-1 text-caption text-medium-emphasis">
              <VIcon size="13">
                tabler-clock-edit
              </VIcon>
              <TableDate :value="item.updated_at" />
            </div>
          </template>

          <!-- No data -->
          <template #no-data>
            <div class="d-flex flex-column align-center justify-center pa-6 ga-2">
              <VIcon
                size="40"
                color="secondary"
              >
                tabler-credit-card-off
              </VIcon>
              <span class="text-body-2 text-medium-emphasis">No payments found.</span>
            </div>
          </template>

          <!-- Bottom Pagination Slot -->
          <template #bottom>
            <VDivider />
            <div class="d-flex justify-space-between align-center flex-wrap ga-4 pa-4">
              <div class="d-flex align-center ga-2">
                <span class="text-medium-emphasis text-sm">Rows per page</span>
                <VSelect
                  :model-value="pagination.perPage"
                  :items="perPageOptions"
                  density="compact"
                  variant="outlined"
                  style="width: 90px"
                  @update:model-value="changePerPage"
                />
              </div>
              <span class="text-medium-emphasis text-sm">
                Page {{ pagination.currentPage }} of {{ pagination.lastPage }}
              </span>
              <VPagination
                v-model="pagination.currentPage"
                :length="pagination.lastPage"
                @update:model-value="(page: number) => fetchAllPayments(page)"
              />
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
:deep(.v-data-table__tr:hover) td {
  background-color: rgba(0, 0, 0, 0.04) !important;
}
</style>
