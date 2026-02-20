<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useTheme } from 'vuetify'
import { useTransaction } from '@/composables/transactions/useTransaction'
import type { TransactionItem } from '@/schemas/transactions'
import { usePayments } from '@/composables/payments/usePayments'

const {
  transactions,
  loading,
  pagination,
  showToast,
  fetchAllTransactions,
  openAdd,
  newTransaction,
  addTransaction,
  createTransaction,
  updateTransactionItemStatus,
  updateTransactionStatus,
} = useTransaction()

const { updatePaymentStatus, createPayment } = usePayments()
const theme = useTheme()
const surfaceColor = computed(() => theme.current.value.colors.surface)

// Modal States
const openItemsModal = ref(false)
const selectedItems = ref<TransactionItem[]>([])
const selectedTransactionUuid = ref('')
const openPaymentsModal = ref(false)
const selectedPayments = ref<any[]>([])
const selectedPaymentTransactionUuid = ref('')
const openCreatePaymentModal = ref(false)
const selectedTransactionForPayment = ref('')

const transactionStatusOptions = ['UnPaid', 'Partially_Paid', 'Paid', 'Closed_With_Returns']
const perPageOptions = [5, 10, 25, 50, 100]

// Logic Functions
const viewItems = (item: any) => {
  selectedItems.value = item.items
  selectedTransactionUuid.value = item.transaction_uuid
  openItemsModal.value = true
}

const viewPayments = (item: any) => {
  selectedPayments.value = item.payments ?? []
  selectedPaymentTransactionUuid.value = item.transaction_uuid
  openPaymentsModal.value = true
}

const addPaymentForTransaction = (item: any) => {
  selectedTransactionForPayment.value = item.transaction_uuid
  openCreatePaymentModal.value = true
}

const changePerPage = (value: number) => {
  pagination.value.perPage = value
  pagination.value.currentPage = 1
  fetchAllTransactions()
}

const copyUuid = (uuid: string) => {
  navigator.clipboard.writeText(uuid)
  showToast({ title: 'Copied', text: 'Transaction ID copied', color: 'success', icon: 'tabler-copy' })
}

// Progress based on payments_sum_amount
const calculateProgress = (item: any) => {
  const expected = Number(item.total_expected) || 0
  const collected = Number(item.payments_sum_amount) || 0
  if (expected === 0)
    return 0

  return Math.min(Math.round((collected / expected) * 100), 100)
}

function handleUpdatePaymentStatus(paymentUuid: string, status: string) {
  updatePaymentStatus(paymentUuid, status)
}

async function handleCreatePayment(payment: any) {
  await createPayment(payment)
  openCreatePaymentModal.value = false
}

async function handleUpdateItemStatus(item: TransactionItem, newStatus: string) {
  await updateTransactionItemStatus(selectedTransactionUuid.value, item.transaction_item_uuid, newStatus)

  const found = selectedItems.value.find(i => i.transaction_item_uuid === item.transaction_item_uuid)
  if (found)
    found.status = newStatus
  showToast({ title: 'Updated', text: 'Item status updated successfully', color: 'success', icon: 'tabler-check' })
}

const headers = [
  { title: 'Transaction', key: 'transaction_type', fixed: true },
  { title: 'Status', key: 'status', width: '150px' },
  { title: 'Parties Involved', key: 'debtor.debtor_name' },
  { title: 'Staffing', key: 'staff' },
  { title: 'Financials (KES)', key: 'total_expected', align: 'end' },
  { title: 'Inventory', key: 'items', align: 'center' },
  { title: 'Activity', key: 'created_at' },
  { title: 'Actions', key: 'actions', sortable: false, align: 'end' },
] as const

onMounted(async () => {
  loading.value = true
  try {
    await fetchAllTransactions()
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
                tabler-receipt-2
              </VIcon>
            </VAvatar>
            <div class="d-flex flex-column">
              <span class="text-h6 font-weight-bold">Transaction Ledger</span>
              <span class="text-caption text-medium-emphasis">Audit payments and collection progress</span>
            </div>
          </div>
          <div class="d-flex align-center ga-2">
            <VBtn
              variant="tonal"
              color="secondary"
              :loading="loading"
              icon="tabler-refresh"
              @click="fetchAllTransactions"
            />
            <VBtn
              color="primary"
              prepend-icon="tabler-plus"
              variant="elevated"
              @click="addTransaction"
            >
              New Transaction
            </VBtn>
          </div>
        </VCardTitle>

        <VDivider />

        <VDataTable
          :headers="headers"
          :items="transactions"
          :loading="loading"
          class="flex-grow-1 transaction-table"
          :items-per-page="pagination.perPage"
          hover
        >
          <template #item.transaction_type="{ item }">
            <div class="d-flex flex-column ga-1 py-2">
              <VChip
                :color="item.transaction_type === 'Sale' ? 'primary' : 'warning'"
                size="x-small"
                variant="flat"
                label
                class="font-weight-bold"
              >
                {{ item.transaction_type.toUpperCase() }}
              </VChip>
              <span class="text-xxs font-mono text-disabled">#{{ item.transaction_uuid.split('-')[0] }}</span>
            </div>
          </template>

          <template #item.status="{ item }">
            <VMenu location="bottom center">
              <template #activator="{ props: menuProps }">
                <VChip
                  :color="item.status === 'Paid' ? 'success' : item.status === 'Partially_Paid' ? 'warning' : 'error'"
                  variant="tonal"
                  size="small"
                  class="cursor-pointer font-weight-medium"
                  v-bind="menuProps"
                >
                  {{ item.status.replace(/_/g, ' ') }}
                  <VIcon
                    end
                    size="12"
                  >
                    tabler-chevron-down
                  </VIcon>
                </VChip>
              </template>
              <VList density="compact">
                <VListItem
                  v-for="status in transactionStatusOptions"
                  :key="status"
                  @click="updateTransactionStatus(item.transaction_uuid, status)"
                >
                  <VListItemTitle class="text-caption">
                    {{ status.replace(/_/g, ' ') }}
                  </VListItemTitle>
                </VListItem>
              </VList>
            </VMenu>
          </template>

          <template #item.debtor.debtor_name="{ item }">
            <div class="d-flex flex-column ga-1">
              <div class="d-flex align-center ga-2">
                <VIcon
                  size="14"
                  color="primary"
                >
                  tabler-user-dollar
                </VIcon>
                <span class="text-body-2 font-weight-bold text-high-emphasis">{{ item.debtor?.debtor_name }}</span>
              </div>
              <div class="d-flex align-center ga-2 text-xxs text-medium-emphasis">
                <VIcon size="12">
                  tabler-briefcase
                </VIcon>
                <span>SP: {{ item.sales_person?.debtor_name || 'Direct' }}</span>
              </div>
            </div>
          </template>

          <template #item.staff="{ item }">
            <div class="d-flex flex-column ga-2 py-1">
              <div class="d-flex align-center ga-2">
                <VAvatar
                  size="22"
                  color="secondary"
                  variant="tonal"
                  class="border"
                >
                  <span class="text-xxs font-weight-bold">{{ item.clerk?.full_name?.charAt(0) }}</span>
                </VAvatar>
                <div class="d-flex flex-column">
                  <span
                    class="text-xxs text-disabled font-weight-bold uppercase"
                    style="line-height: 1;"
                  >Clerk</span>
                  <span
                    class="text-caption text-high-emphasis font-weight-medium text-truncate"
                    style="max-width: 120px;"
                  >
                    {{ item.clerk?.full_name || '—' }}
                  </span>
                </div>
              </div>

              <div class="d-flex align-center ga-2">
                <VAvatar
                  size="22"
                  color="info"
                  variant="tonal"
                  class="border"
                >
                  <span class="text-xxs font-weight-bold">{{ item.runner?.full_name?.charAt(0) }}</span>
                </VAvatar>
                <div class="d-flex flex-column">
                  <span
                    class="text-xxs text-disabled font-weight-bold uppercase"
                    style="line-height: 1;"
                  >Runner</span>
                  <span
                    class="text-caption text-high-emphasis font-weight-medium text-truncate"
                    style="max-width: 120px;"
                  >
                    {{ item.runner?.full_name || '—' }}
                  </span>
                </div>
              </div>
            </div>
          </template>

          <template #item.total_expected="{ item }">
            <div class="d-flex flex-column align-end ga-1 py-1">
              <div class="d-flex align-center ga-2">
                <span class="text-xxs text-disabled font-weight-bold">TOTAL EXPECTED:</span>
                <span class="text-body-2 font-weight-bold text-high-emphasis font-mono">
                  {{ Number(item.total_expected).toLocaleString() }}
                </span>
              </div>
              <div
                class="d-flex align-center ga-2 border-t pt-1"
                style="border-top: 1px dashed rgba(var(--v-border-color), 0.3) !important;"
              >
                <span class="text-xxs text-disabled font-weight-bold">TOTAL PAID:</span>
                <span class="text-body-2 font-weight-bold text-success font-mono">
                  {{ Number(item.payments_sum_amount || 0).toLocaleString() }}
                </span>
              </div>

              <VProgressLinear
                :model-value="calculateProgress(item)"
                :color="calculateProgress(item) === 100 ? 'success' : 'warning'"
                height="8"
                rounded
                style="width: 100px"
                class="mt-1"
              >
                <template #default="{ value }">
                  <span
                    class="text-white font-weight-black"
                    style="font-size: 8px;"
                  >{{ Math.ceil(value) }}%</span>
                </template>
              </VProgressLinear>
            </div>
          </template>

          <template #item.items="{ item }">
            <VBtn
              variant="tonal"
              size="x-small"
              color="secondary"
              rounded="pill"
              prepend-icon="tabler-box"
              @click="viewItems(item)"
            >
              {{ item.items?.length || 0 }}
            </VBtn>
          </template>

          <template #item.created_at="{ item }">
            <div class="d-flex flex-column text-xxs text-medium-emphasis">
              <div class="d-flex align-center ga-1">
                <VIcon size="12">
                  tabler-calendar-event
                </VIcon><TableDate :value="item.created_at" />
              </div>
              <div class="d-flex align-center ga-1">
                <VIcon size="12">
                  tabler-history
                </VIcon><TableDate :value="item.updated_at" />
              </div>
            </div>
          </template>

          <template #item.actions="{ item }">
            <VMenu location="bottom end">
              <template #activator="{ props: menuProps }">
                <VBtn
                  icon="tabler-dots-vertical"
                  variant="text"
                  size="small"
                  v-bind="menuProps"
                />
              </template>
              <VList density="compact">
                <VListItem
                  color="success"
                  @click="addPaymentForTransaction(item)"
                >
                  <template #prepend>
                    <VIcon size="18">
                      tabler-cash-banknote
                    </VIcon>
                  </template>
                  <VListItemTitle>Record Payment</VListItemTitle>
                </VListItem>
                <VListItem @click="viewPayments(item)">
                  <template #prepend>
                    <VIcon size="18">
                      tabler-receipt
                    </VIcon>
                  </template>
                  <VListItemTitle>Payment History</VListItemTitle>
                </VListItem>
                <VDivider class="my-1" />
                <VListItem @click="copyUuid(item.transaction_uuid)">
                  <template #prepend>
                    <VIcon size="18">
                      tabler-copy
                    </VIcon>
                  </template>
                  <VListItemTitle>Copy ID</VListItemTitle>
                </VListItem>
              </VList>
            </VMenu>
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
                  @update:model-value="(page) => fetchAllTransactions(page)"
                />
              </div>
            </div>
          </template>
        </VDataTable>
      </VCard>
    </VCol>
  </VRow>

  <TransactionItemsModal
    v-model="openItemsModal"
    :items="selectedItems"
    :transaction-uuid="selectedTransactionUuid"
    @update-status="handleUpdateItemStatus"
  />
  <TransactionPaymentsModal
    v-model="openPaymentsModal"
    :payments="selectedPayments"
    :transaction-uuid="selectedPaymentTransactionUuid"
    @update:status="handleUpdatePaymentStatus"
  />
  <CreateTransactionModal
    v-model:model-value="openAdd"
    v-model:transaction="newTransaction"
    :loading="loading"
    @confirm="createTransaction"
  />
  <CreatePaymentModal
    v-model="openCreatePaymentModal"
    :loading="loading"
    :preset-transaction-uuid="selectedTransactionForPayment"
    @confirm="handleCreatePayment"
  />
</template>

<style scoped>
.transaction-table :deep(td:first-child) {
  position: sticky;
  left: 0;
  background: v-bind(surfaceColor) !important;
  z-index: 1;
  border-right: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}
.text-xxs { font-size: 0.65rem; }
.font-mono { font-family: 'Fira Code', 'Roboto Mono', monospace; }
.border { border: 1px solid rgba(var(--v-border-color), 0.12) !important; }
.ga-n2 { margin-left: 8px; }
:deep(.v-progress-linear__content) { justify-content: center; }
</style>
