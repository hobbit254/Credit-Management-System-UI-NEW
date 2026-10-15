<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { watchDebounced } from '@vueuse/core'
import { useTransaction } from '@/composables/transactions/useTransaction'
import type { NewRefund, Refund, Transaction, TransactionItem } from '@/schemas/transactions'
import type { AppAbility } from '@/composables/auth/useAbility'
import { usePayments } from '@/composables/payments/usePayments'
import { saleStatusColor, saleStatusLabel } from '@/utils/formatters'
import { daysSince } from '@/utils/owed'

definePageMeta({
  subject: 'v1/transactions',
})

const {
  transactions,
  loading,
  pagination,
  filters,
  showToast,
  fetchAllTransactions,
  openAdd,
  newTransaction,
  addTransaction,
  createTransaction,
  updateTransactionItemStatus,
  recordRefund,
} = useTransaction()

const { createPayment } = usePayments()

onMounted(() => fetchAllTransactions())

// A new search or filter starts again from page 1.
watchDebounced(() => filters.value.search, () => fetchAllTransactions({ page: 1 }), { debounce: 300 })
watch(() => filters.value.show, () => fetchAllTransactions({ page: 1 }))

const showOptions = [
  { value: 'all', label: 'All' },
  { value: 'open', label: 'Still owed money' },
]

const kes = (amount: number) => `KES ${Number(amount).toLocaleString('en-KE')}`

function soldOn(date: string) {
  const days = daysSince(date, Date.now())
  const day = new Date(date).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' })

  return days === 0 ? `${day}, today` : days === 1 ? `${day}, yesterday` : `${day}, ${days} days ago`
}

// Share of what the sale should bring in that has been accepted. Nothing owed (every item returned) counts as settled.
function paidPercent(sale: Transaction) {
  const expected = Number(sale.total_expected) || 0
  const paid = Number(sale.payments_sum_amount) || 0

  return expected === 0 ? 100 : Math.min(Math.round(paid / expected * 100), 100)
}

const isOpen = (sale: Transaction) => ['UnPaid', 'Partially_Paid'].includes(sale.status)

const rows = computed(() => transactions.value.map(sale => ({
  sale,
  percent: paidPercent(sale),
  when: soldOn(sale.created_at),
  people: [
    sale.sales_person?.debtor_name && `Sold by ${sale.sales_person.debtor_name}`,
    sale.runner?.full_name && `runner ${sale.runner.full_name}`,
  ].filter(Boolean).join(', '),
})))

// Items and returns
const openItemsModal = ref(false)
const selectedItems = ref<TransactionItem[]>([])
const selectedTransactionUuid = ref('')

function viewItems(sale: Transaction) {
  selectedItems.value = sale.items
  selectedTransactionUuid.value = sale.transaction_uuid
  openItemsModal.value = true
}

async function handleUpdateItemStatus(item: TransactionItem, newStatus: string, reason: string) {
  // The request already toasts its own success or the server's reason for refusing.
  if (!await updateTransactionItemStatus(selectedTransactionUuid.value, item.transaction_item_uuid, newStatus, reason))
    return

  const found = selectedItems.value.find(i => i.transaction_item_uuid === item.transaction_item_uuid)
  if (found) {
    found.status = newStatus
    found.return_reason = reason
  }
}

// Payment and refund history
const openPaymentsModal = ref(false)
const selectedPayments = ref<any[]>([])
const selectedRefunds = ref<Refund[]>([])
const selectedPaymentTransactionUuid = ref('')

function viewPayments(sale: Transaction) {
  selectedPayments.value = sale.payments ?? []
  selectedRefunds.value = sale.refunds ?? []
  selectedPaymentTransactionUuid.value = sale.transaction_uuid
  openPaymentsModal.value = true
}

// Recording a payment
const openCreatePaymentModal = ref(false)
const selectedTransactionForPayment = ref('')

function addPaymentFor(sale: Transaction) {
  selectedTransactionForPayment.value = sale.transaction_uuid
  openCreatePaymentModal.value = true
}

async function handleCreatePayment(payment: any) {
  if (!await createPayment(payment))
    return
  openCreatePaymentModal.value = false
  await fetchAllTransactions() // so the sale's payment history includes it
}

// Admins and accountants hold refunds/create (granted by the backend migration).
const { $ability } = useNuxtApp() as unknown as { $ability: AppAbility }
const canRecordRefund = computed(() => $ability.can('access', 'v1/refunds/create'))
const openRefundModal = ref(false)
const refundSale = ref<Transaction | null>(null)

function refundFor(sale: Transaction) {
  refundSale.value = sale
  openRefundModal.value = true
}

async function handleRecordRefund(refund: NewRefund) {
  if (await recordRefund(refund))
    openRefundModal.value = false
}

function copyId(uuid: string) {
  navigator.clipboard.writeText(uuid)
  showToast({ title: 'Copied', text: 'Sale ID copied', color: 'success', icon: 'tabler-copy' })
}
</script>

<template>
  <ListPage
    title="Sales"
    :loading="loading"
    :pagination="pagination"
    :row-count="transactions.length"
    :columns="5"
    :empty-text="filters.search || filters.show !== 'all' ? 'No sales match. Try another name or filter.' : 'No sales yet. Start with New sale.'"
    @page="page => fetchAllTransactions({ page })"
  >
    <template #subtitle>
      {{ pagination.total }} {{ filters.show === 'open' ? 'still owed money' : (pagination.total === 1 ? 'sale' : 'sales') }}
    </template>

    <template #actions>
      <VBtn
        prepend-icon="tabler-plus"
        @click="addTransaction"
      >
        New sale
      </VBtn>
    </template>

    <template #filters>
      <AppTextField
        v-model="filters.search"
        aria-label="Search sales"
        placeholder="Customer, sales person or runner"
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
      <th style="min-inline-size: 220px;">
        Paid
      </th>
      <th>Status</th>
      <th>Sold</th>
      <th>
        <span class="d-sr-only">Actions</span>
      </th>
    </template>

    <tr
      v-for="{ sale, percent, when, people } in rows"
      :key="sale.transaction_uuid"
    >
      <td class="py-3">
        <div class="font-weight-medium text-body-1">
          {{ sale.debtor?.debtor_name ?? 'Unknown customer' }}
        </div>
        <div class="text-body-2 text-medium-emphasis">
          {{ sale.transaction_type === 'Credit' ? 'On credit' : 'Paid upfront' }},
          <a
            href="#"
            class="text-primary"
            @click.prevent="viewItems(sale)"
          >{{ sale.items?.length ?? 0 }} {{ sale.items?.length === 1 ? 'item' : 'items' }}</a>
        </div>
        <div
          v-if="people"
          class="text-body-2 text-medium-emphasis"
        >
          {{ people }}
        </div>
      </td>
      <td>
        <div class="text-body-1">
          <span class="font-weight-bold">{{ kes(sale.payments_sum_amount || 0) }}</span>
          <span class="text-medium-emphasis"> of {{ kes(sale.total_expected) }}</span>
        </div>
        <div
          role="img"
          :aria-label="`${percent} percent paid`"
          class="paid-track my-1"
        >
          <div :style="{ inlineSize: `${percent}%` }" />
        </div>
        <div
          v-if="Number(sale.overpaid) > 0"
          class="text-body-2 text-error font-weight-medium"
        >
          {{ kes(sale.overpaid) }} to refund
        </div>
        <div
          v-else-if="Number(sale.total_refunded) > 0"
          class="text-body-2 text-medium-emphasis"
        >
          {{ kes(sale.total_refunded) }} refunded
        </div>
      </td>
      <td>
        <VChip
          :color="saleStatusColor(sale.status)"
          size="small"
        >
          {{ saleStatusLabel(sale.status) }}
        </VChip>
      </td>
      <td class="text-body-2 text-medium-emphasis">
        {{ when }}
      </td>
      <td class="text-end">
        <div class="d-flex justify-end align-center gap-1">
          <VBtn
            v-if="isOpen(sale)"
            variant="outlined"
            color="default"
            @click="addPaymentFor(sale)"
          >
            Record payment
          </VBtn>
          <VMenu location="bottom end">
            <template #activator="{ props: menuProps }">
              <VBtn
                :aria-label="`More for ${sale.debtor?.debtor_name ?? 'this sale'}`"
                icon="tabler-dots-vertical"
                variant="text"
                color="default"
                v-bind="menuProps"
              />
            </template>
            <VList>
              <VListItem
                prepend-icon="tabler-receipt"
                title="Payments and refunds"
                @click="viewPayments(sale)"
              />
              <VListItem
                prepend-icon="tabler-box"
                title="Items and returns"
                @click="viewItems(sale)"
              />
              <!-- Admins and accountants (refunds/create), only while money is due back -->
              <VListItem
                v-if="Number(sale.overpaid) > 0 && canRecordRefund"
                prepend-icon="tabler-receipt-refund"
                title="Record refund"
                @click="refundFor(sale)"
              />
              <VDivider class="my-1" />
              <VListItem
                prepend-icon="tabler-copy"
                title="Copy ID"
                @click="copyId(sale.transaction_uuid)"
              />
            </VList>
          </VMenu>
        </div>
      </td>
    </tr>
  </ListPage>

  <TransactionItemsModal
    v-model="openItemsModal"
    :items="selectedItems"
    :transaction-uuid="selectedTransactionUuid"
    @update-status="handleUpdateItemStatus"
  />
  <TransactionPaymentsModal
    v-model="openPaymentsModal"
    :payments="selectedPayments"
    :refunds="selectedRefunds"
    :transaction-uuid="selectedPaymentTransactionUuid"
    @updated="fetchAllTransactions"
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
  <RecordRefundModal
    v-model="openRefundModal"
    :sale="refundSale"
    :loading="loading"
    @confirm="handleRecordRefund"
  />
</template>

<style scoped>
.paid-track {
  overflow: hidden;
  border-radius: 4px;
  background: rgba(var(--v-track-bg));
  block-size: 8px;
  max-inline-size: 220px;
}

.paid-track > div {
  border-radius: 4px;
  background: rgb(var(--v-theme-primary));
  block-size: 100%;
}
</style>
