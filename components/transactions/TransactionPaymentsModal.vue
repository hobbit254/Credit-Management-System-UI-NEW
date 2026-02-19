<script setup lang="ts">
import { usePayments } from '@/composables/payments/usePayments'

const props = defineProps<{
  modelValue: boolean
  payments: any[]
  transactionUuid: string
}>()

const emit = defineEmits(['update:modelValue'])

const isOpen = computed({
  get: () => props.modelValue,
  set: value => emit('update:modelValue', value),
})

const { loading, updatePaymentStatus } = usePayments()

const paymentStatusOptions = ['PENDING', 'ACCEPTED', 'REJECTED']

const headers = [
  { title: 'Payment Method', key: 'payment_method' },
  { title: 'Amount', key: 'amount' },
  { title: 'Reference Code', key: 'reference_code' },
  { title: 'Status', key: 'status' },
  { title: 'Date', key: 'created_at' },
]

async function handleStatusChange(item: any, newStatus: string) {
  await updatePaymentStatus(item.payment_uuid, newStatus)
  item.status = newStatus
  isOpen.value = false
}

const totalAmount = computed(() =>
  props.payments.reduce((sum, p) => sum + Number(p.amount ?? 0), 0),
)
</script>

<template>
  <VDialog
    v-model="isOpen"
    max-width="750"
    scrollable
  >
    <VCard>
      <!-- Header -->
      <VCardTitle class="d-flex align-center ga-3 pa-4">
        <VAvatar
          color="primary"
          variant="tonal"
          size="38"
        >
          <VIcon>tabler-credit-card</VIcon>
        </VAvatar>
        <div class="d-flex flex-column">
          <span class="text-h6 font-weight-bold">Payments</span>
          <span class="text-caption text-medium-emphasis">Transaction: {{ transactionUuid }}</span>
        </div>
        <VSpacer />
        <div class="d-flex flex-column align-end">
          <span class="text-caption text-medium-emphasis">Total</span>
          <span class="text-body-1 font-weight-bold text-success">
            KES {{ totalAmount.toLocaleString() }}
          </span>
        </div>
      </VCardTitle>

      <VDivider />

      <VCardText class="pa-0">
        <VDataTable
          :headers="headers"
          :items="payments"
          item-key="payment_uuid"
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
              <template #activator="{ props: menuProps }">
                <VChip
                  :color="item.status === 'ACCEPTED' ? 'success' : item.status === 'PENDING' ? 'warning' : 'error'"
                  size="small"
                  variant="tonal"
                  class="cursor-pointer"
                  v-bind="menuProps"
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
                  @click="handleStatusChange(item, status)"
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

          <!-- Date -->
          <template #item.created_at="{ item }">
            <div class="d-flex align-center ga-1 text-caption text-medium-emphasis">
              <VIcon size="13">
                tabler-calendar
              </VIcon>
              <TableDate :value="item.created_at" />
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
              <span class="text-body-2 text-medium-emphasis">No payments found for this transaction.</span>
            </div>
          </template>

          <template #bottom />
        </VDataTable>
      </VCardText>

      <VDivider />

      <VCardActions class="pa-3">
        <VSpacer />
        <VBtn
          variant="tonal"
          color="secondary"
          prepend-icon="tabler-x"
          :disabled="loading"
          @click="isOpen = false"
        >
          Close
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>
