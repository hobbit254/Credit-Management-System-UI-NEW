<script setup lang="ts">
import { useTransaction } from '@/composables/transactions/useTransaction'
import type { TransactionItem } from '@/schemas/transactions'
import { usePayments } from '@/composables/payments/usePayments'

const perPageOptions = [5, 10, 25, 50, 100]

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

const { updatePaymentStatus } = usePayments()

function handleUpdatePaymentStatus(paymentUuid: string, status: string) {
  updatePaymentStatus(paymentUuid, status)
}

const openItemsModal = ref(false)
const selectedItems = ref<TransactionItem[]>([])
const selectedTransactionUuid = ref('')

const openPaymentsModal = ref(false)
const selectedPayments = ref<any[]>([])
const selectedPaymentTransactionUuid = ref('')

const transactionStatusOptions = ['UnPaid', 'Partially_Paid', 'Paid', 'Closed_With_Returns']

function viewItems(item: any) {
  selectedItems.value = item.items
  selectedTransactionUuid.value = item.transaction_uuid
  openItemsModal.value = true
}

function viewPayments(item: any) {
  selectedPayments.value = item.payments ?? []
  selectedPaymentTransactionUuid.value = item.transaction_uuid
  openPaymentsModal.value = true
}

async function handleUpdateItemStatus(item: TransactionItem, newStatus: string) {
  await updateTransactionItemStatus(selectedTransactionUuid.value, item.transaction_item_uuid, newStatus)

  const found = selectedItems.value.find(i => i.transaction_item_uuid === item.transaction_item_uuid)
  if (found)
    found.status = newStatus

  showToast({
    title: 'Updated',
    text: 'Item status updated successfully',
    color: 'success',
    icon: '$success',
  })
}

async function handleUpdateTransactionStatus(item: any, newStatus: string) {
  await updateTransactionStatus(item.transaction_uuid, newStatus)
}

onMounted(async () => {
  loading.value = true
  try {
    await fetchAllTransactions()
  }
  finally {
    loading.value = false
  }
})

function changePerPage(value: number) {
  pagination.value.perPage = value
  pagination.value.currentPage = 1
  fetchAllTransactions()
}

const openCreatePaymentModal = ref(false)
const selectedTransactionForPayment = ref('')

function addPaymentForTransaction(item: any) {
  selectedTransactionForPayment.value = item.transaction_uuid
  openCreatePaymentModal.value = true
}

function copyUuid(uuid: string) {
  navigator.clipboard.writeText(uuid)
  showToast({
    title: 'Copied',
    text: 'UUID copied to clipboard',
    color: 'success',
    icon: '$success',
  })
}

const headers = [
  { title: 'Transaction Type', key: 'transaction_type' },
  { title: 'Status', key: 'status' },
  { title: 'Debtor', key: 'debtor.debtor_name' },
  { title: 'Clerk', key: 'clerk.full_name' },
  { title: 'Runner', key: 'runner.full_name' },
  { title: 'Sales Person', key: 'sales_person.debtor_name' },
  { title: 'Expected Amount', key: 'total_expected' },
  { title: 'Payments', key: 'payments' },
  { title: 'Transaction Items', key: 'items' },
  { title: 'Created', key: 'created_at' },
  { title: 'Updated', key: 'updated_at' },
  { title: 'Actions', key: 'actions' },
]
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
              tabler-receipt
            </VIcon>
            <span class="text-h6 font-weight-bold">Transactions</span>
          </div>
          <VBtn
            color="primary"
            prepend-icon="tabler-plus"
            @click="addTransaction"
          >
            Add Transaction
          </VBtn>
        </VCardTitle>

        <VDivider />

        <VDataTable
          :headers="headers"
          :items="transactions"
          :loading="loading"
          item-key="transaction_uuid"
          class="flex-grow-1"
          :items-per-page="-1"
        >
          <!-- Transaction Type -->
          <template #item.transaction_type="{ item }">
            <VChip
              :color="item.transaction_type === 'Sale' ? 'primary' : 'warning'"
              size="small"
              variant="tonal"
            >
              <VIcon
                start
                size="14"
              >
                {{ item.transaction_type === 'Sale' ? 'tabler-shopping-cart' : 'tabler-credit-card' }}
              </VIcon>
              {{ item.transaction_type }}
            </VChip>
          </template>

          <!-- Status -->
          <template #item.status="{ item }">
            <VMenu>
              <template #activator="{ props }">
                <VChip
                  :color="item.status === 'Paid' ? 'success' : item.status === 'Closed_With_Returns' ? 'info' : item.status === 'Partially_Paid' ? 'warning' : 'error'"
                  size="small"
                  variant="tonal"
                  class="cursor-pointer"
                  v-bind="props"
                >
                  <VIcon
                    start
                    size="14"
                  >
                    {{ item.status === 'Paid' ? 'tabler-circle-check' : item.status === 'Closed_With_Returns' ? 'tabler-circle-minus' : item.status === 'Partially_Paid' ? 'tabler-clock' : 'tabler-circle-x' }}
                  </VIcon>
                  {{ item.status?.replace(/_/g, ' ') }}
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
                  v-for="status in transactionStatusOptions"
                  :key="status"
                  :disabled="item.status === status"
                  @click="handleUpdateTransactionStatus(item, status)"
                >
                  <div class="d-flex align-center ga-2">
                    <VIcon
                      :color="status === 'Paid' ? 'success' : status === 'Closed_With_Returns' ? 'info' : status === 'Partially_Paid' ? 'warning' : 'error'"
                      size="16"
                    >
                      {{ status === 'Paid' ? 'tabler-circle-check' : status === 'Closed_With_Returns' ? 'tabler-circle-minus' : status === 'Partially_Paid' ? 'tabler-clock' : 'tabler-circle-x' }}
                    </VIcon>
                    <span>{{ status.replace(/_/g, ' ') }}</span>
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

          <!-- Debtor -->
          <template #item.debtor.debtor_name="{ item }">
            <div class="d-flex align-center ga-2">
              <VAvatar
                size="30"
                color="primary"
                variant="tonal"
              >
                <span class="text-caption font-weight-bold">
                  {{ item.debtor?.debtor_name?.charAt(0)?.toUpperCase() ?? '?' }}
                </span>
              </VAvatar>
              <div class="d-flex flex-column">
                <span class="font-weight-medium text-body-2">{{ item.debtor?.debtor_name ?? '—' }}</span>
                <span class="text-caption text-medium-emphasis">{{ item.debtor?.debtor_phone ?? '' }}</span>
              </div>
            </div>
          </template>

          <!-- Clerk -->
          <template #item.clerk.full_name="{ item }">
            <div class="d-flex align-center ga-2">
              <VAvatar
                size="28"
                color="secondary"
                variant="tonal"
              >
                <span class="text-caption">
                  {{ item.clerk?.full_name?.charAt(0)?.toUpperCase() ?? '?' }}
                </span>
              </VAvatar>
              <span class="text-body-2">{{ item.clerk?.full_name ?? '—' }}</span>
            </div>
          </template>

          <!-- Runner -->
          <template #item.runner.full_name="{ item }">
            <div class="d-flex align-center ga-2">
              <VAvatar
                size="28"
                color="info"
                variant="tonal"
              >
                <span class="text-caption">
                  {{ item.runner?.full_name?.charAt(0)?.toUpperCase() ?? '?' }}
                </span>
              </VAvatar>
              <span class="text-body-2">{{ item.runner?.full_name ?? '—' }}</span>
            </div>
          </template>

          <!-- Sales Person -->
          <template #item.sales_person.debtor_name="{ item }">
            <div class="d-flex align-center ga-2">
              <VAvatar
                size="28"
                color="warning"
                variant="tonal"
              >
                <span class="text-caption">
                  {{ item.sales_person?.debtor_name?.charAt(0)?.toUpperCase() ?? '?' }}
                </span>
              </VAvatar>
              <span class="text-body-2">{{ item.sales_person?.debtor_name ?? '—' }}</span>
            </div>
          </template>

          <!-- Total Expected Amount -->
          <template #item.total_expected="{ item }">
            <div class="d-flex align-center ga-1">
              <span class="text-caption font-weight-bold text-success">KES</span>
              <span class="font-weight-medium text-body-2">
                {{ item.total_expected ? Number(item.total_expected).toLocaleString() : '—' }}
              </span>
            </div>
          </template>

          <!-- Payments -->
          <template #item.payments="{ item }">
            <div
              class="d-flex align-center ga-1 cursor-pointer"
              @click="viewPayments(item)"
            >
              <template v-if="item.payments?.length">
                <VChip
                  v-for="payment in item.payments.slice(0, 2)"
                  :key="payment.payment_uuid"
                  :color="payment.status === 'COMPLETED' ? 'success' : payment.status === 'PENDING' ? 'warning' : 'error'"
                  size="small"
                  variant="tonal"
                >
                  <VIcon
                    start
                    size="12"
                  >
                    {{ payment.payment_method === 'Cash' ? 'tabler-cash' : payment.payment_method === 'M-pesa' ? 'tabler-phone' : 'tabler-building-bank' }}
                  </VIcon>
                  {{ payment.amount.toLocaleString() }}
                </VChip>
                <VChip
                  v-if="item.payments.length > 2"
                  size="small"
                  color="secondary"
                  variant="tonal"
                >
                  +{{ item.payments.length - 2 }} more
                </VChip>
              </template>
              <span
                v-else
                class="text-medium-emphasis text-body-2"
              >—</span>
            </div>
          </template>

          <!-- Items -->
          <template #item.items="{ item }">
            <VChip
              size="small"
              color="secondary"
              variant="tonal"
              class="cursor-pointer"
              @click="viewItems(item)"
            >
              <VIcon
                start
                size="14"
              >
                tabler-package
              </VIcon>
              {{ item.items?.length ?? 0 }} item(s)
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
          <!-- Actions -->
          <template #item.actions="{ item }">
            <VMenu>
              <template #activator="{ props }">
                <VBtn
                  icon="tabler-dots"
                  variant="text"
                  v-bind="props"
                />
              </template>
              <VList>
                <VListSubheader>Actions</VListSubheader>

                <VListItem @click="copyUuid(item.transaction_uuid)">
                  <VIcon>tabler-copy</VIcon>
                  <span class="ms-2">Copy UUID</span>
                </VListItem>

                <VDivider />

                <VListItem @click="addPaymentForTransaction(item)">
                  <VIcon>tabler-credit-card</VIcon>
                  <span class="ms-2">Add Payment</span>
                </VListItem>

                <VDivider />

                <VListItem @click="viewPayments(item)">
                  <VIcon>tabler-eye</VIcon>
                  <span class="ms-2">View Payments</span>
                </VListItem>

                <VListItem @click="viewItems(item)">
                  <VIcon>tabler-package</VIcon>
                  <span class="ms-2">View Items</span>
                </VListItem>
              </VList>
            </VMenu>
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
                @update:model-value="(page: number) => fetchAllTransactions(page)"
              />
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
    @confirm="createTransaction"
  />
</template>

<style scoped>
:deep(.deleted-row) td {
  background-color: rgba(255, 82, 82, 0.12) !important;
}

:deep(.deleted-row:hover) td {
  background-color: rgba(255, 82, 82, 0.22) !important;
}

:deep(.v-data-table__tr:hover) td {
  background-color: rgba(0, 0, 0, 0.04) !important;
}
</style>
