<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { watchDebounced } from '@vueuse/core'
import { usePayments } from '@/composables/payments/usePayments'
import type { AppAbility } from '@/composables/auth/useAbility'
import type { NewPayment, Payment, PaymentTransactionItem } from '@/schemas/payments'
import { daysSince } from '@/utils/owed'
import { kes, paymentStatus } from '@/utils/formatters'

definePageMeta({
  subject: 'v1/payments',
})

const { $ability } = useNuxtApp() as unknown as { $ability: AppAbility }
const { payments, loading, pagination, filters, fetchAllPayments, updatePaymentStatus, createPayment } = usePayments()

const canDecide = computed(() => $ability.can('access', 'v1/payments/updateStatus'))

onMounted(() => fetchAllPayments())

// A new search or filter starts again from page 1.
watchDebounced(() => filters.value.search, () => fetchAllPayments({ page: 1 }), { debounce: 300 })
watch(() => filters.value.status, () => fetchAllPayments({ page: 1 }))

const statusOptions = [
  { value: 'all', label: 'All' },
  { value: 'PENDING', label: 'Waiting for approval' },
  { value: 'ACCEPTED', label: 'Accepted' },
  { value: 'REJECTED', label: 'Rejected' },
]

function received(date: string) {
  const days = daysSince(date, Date.now())

  return {
    date: new Date(date).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' }),
    ago: days === 0 ? 'Today' : days === 1 ? 'Yesterday' : `${days} days ago`,
  }
}

const rows = computed(() => payments.value.map(payment => ({ payment, when: received(payment.created_at) })))

const openItemsModal = ref(false)
const selectedItems = ref<PaymentTransactionItem[]>([])

function viewItems(payment: Payment) {
  selectedItems.value = payment.transaction?.items ?? []
  openItemsModal.value = true
}

const openCreateModal = ref(false)

async function handleCreatePayment(payment: NewPayment) {
  if (await createPayment(payment))
    openCreateModal.value = false
}
</script>

<template>
  <ListPage
    title="Payments"
    :loading="loading"
    :pagination="pagination"
    :row-count="payments.length"
    :columns="5"
    :empty-text="filters.search || filters.status !== 'all' ? 'No payments match. Try another code, name or filter.' : 'No payments yet. Record one when a customer pays.'"
    @page="page => fetchAllPayments({ page })"
  >
    <template #subtitle>
      Check each M-Pesa, bank or cheque payment against the statement before you approve it. An approval or rejection is final.
    </template>

    <template #actions>
      <VBtn
        prepend-icon="tabler-plus"
        @click="openCreateModal = true"
      >
        Record payment
      </VBtn>
    </template>

    <template #filters>
      <AppTextField
        v-model="filters.search"
        aria-label="Search payments"
        placeholder="Receipt code or customer"
        prepend-inner-icon="tabler-search"
        clearable
        style="max-inline-size: 360px; min-inline-size: 220px;"
      />
      <!-- Chips wrap onto a new line on narrow screens; a button group would overflow. -->
      <VChipGroup
        v-model="filters.status"
        mandatory
        column
        selected-class="bg-primary"
        aria-label="Show"
      >
        <VChip
          v-for="option in statusOptions"
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
        Amount
      </th>
      <th>Method</th>
      <th>Received</th>
      <th>Status</th>
    </template>

    <tr
      v-for="{ payment, when } in rows"
      :key="payment.payment_uuid"
    >
      <td class="py-3">
        <div class="font-weight-medium text-body-1">
          {{ payment.transaction?.debtor?.debtor_name ?? 'Unknown customer' }}
        </div>
        <div class="text-body-2 text-medium-emphasis">
          {{ payment.transaction?.transaction_type }} sale,
          <a
            href="#"
            class="text-primary"
            @click.prevent="viewItems(payment)"
          >{{ payment.transaction?.items?.length ?? 0 }} {{ payment.transaction?.items?.length === 1 ? 'item' : 'items' }}</a>
        </div>
      </td>
      <td class="text-end font-weight-bold text-body-1">
        {{ kes(payment.amount) }}
      </td>
      <td>
        <div class="text-body-1">
          {{ payment.payment_method }}
        </div>
        <div class="text-body-2 text-medium-emphasis">
          {{ payment.reference_code || 'No receipt code' }}
        </div>
      </td>
      <td>
        <div class="text-body-1">
          {{ when.date }}
        </div>
        <div class="text-body-2 text-medium-emphasis">
          {{ when.ago }}
        </div>
      </td>
      <td>
        <div
          v-if="payment.status === 'PENDING' && canDecide"
          class="d-flex gap-2"
        >
          <VBtn
            variant="tonal"
            :disabled="loading"
            @click="updatePaymentStatus(payment.payment_uuid, 'ACCEPTED')"
          >
            Approve
          </VBtn>
          <VMenu location="bottom end">
            <template #activator="{ props: menuProps }">
              <VBtn
                variant="outlined"
                color="default"
                :disabled="loading"
                v-bind="menuProps"
              >
                Reject
              </VBtn>
            </template>
            <VCard
              max-width="280"
              class="pa-4"
            >
              <p class="text-body-1 mb-3">
                Reject this {{ kes(payment.amount) }} payment? You can't undo this, but the customer can pay again with the same receipt code.
              </p>
              <VBtn
                block
                color="error"
                @click="updatePaymentStatus(payment.payment_uuid, 'REJECTED')"
              >
                Reject payment
              </VBtn>
            </VCard>
          </VMenu>
        </div>
        <VChip
          v-else
          :color="paymentStatus(payment.status).color"
          size="small"
        >
          {{ paymentStatus(payment.status).text }}
        </VChip>
      </td>
    </tr>
  </ListPage>

  <PaymentTransactionItemsModal
    v-model="openItemsModal"
    :items="selectedItems"
  />

  <CreatePaymentModal
    v-model="openCreateModal"
    :loading="loading"
    @confirm="handleCreatePayment"
  />
</template>
