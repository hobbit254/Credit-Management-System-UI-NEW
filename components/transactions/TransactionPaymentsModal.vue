<script setup lang="ts">
import { usePayments } from '@/composables/payments/usePayments'
import type { Refund } from '@/schemas/transactions'
import type { AppAbility } from '@/composables/auth/useAbility'

const props = withDefaults(defineProps<{
  modelValue: boolean
  payments: any[]
  refunds?: Refund[]
  transactionUuid: string
}>(), { refunds: () => [] })

const emit = defineEmits(['update:modelValue', 'updated'])

const totalRefunded = computed(() => props.refunds.reduce((sum, r) => sum + Number(r.amount), 0))

const isOpen = computed({
  get: () => props.modelValue,
  set: value => emit('update:modelValue', value),
})

const { loading, updatePaymentStatus } = usePayments()

// Only a PENDING payment can be decided, and the decision is final.
const { $ability } = useNuxtApp() as unknown as { $ability: AppAbility }
const canDecide = computed(() => $ability.can('access', 'v1/payments/updateStatus'))

const statusLabel: Record<string, { text: string; color: string }> = {
  PENDING: { text: 'Waiting for approval', color: 'warning' },
  ACCEPTED: { text: 'Accepted', color: 'success' },
  REJECTED: { text: 'Rejected', color: 'error' },
}

const kes = (amount: number | string) => `KES ${Number(amount).toLocaleString('en-KE')}`

async function handleStatusChange(item: any, newStatus: string) {
  await updatePaymentStatus(item.payment_uuid, newStatus)
  emit('updated') // the sale's status follows its payments
  isOpen.value = false
}

// Only accepted money counts towards the sale.
const acceptedTotal = computed(() =>
  props.payments.filter(p => p.status === 'ACCEPTED').reduce((sum, p) => sum + Number(p.amount ?? 0), 0),
)
</script>

<template>
  <FormDialog
    v-model="isOpen"
    title="Payments and refunds"
    :description="`${kes(acceptedTotal)} accepted so far.`"
    confirm-text=""
    hide-confirm
    :loading="loading"
    :width="760"
  >
    <VTable v-if="payments.length">
      <thead>
        <tr>
          <th class="text-end">
            Amount
          </th>
          <th>Method</th>
          <th>Received</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="payment in payments"
          :key="payment.payment_uuid"
        >
          <td class="text-end font-weight-medium text-no-wrap py-3">
            {{ kes(payment.amount) }}
          </td>
          <td>
            <div>{{ payment.payment_method }}</div>
            <div class="text-body-2 text-medium-emphasis">
              {{ payment.reference_code || 'No receipt code' }}
            </div>
          </td>
          <td class="text-body-2 text-medium-emphasis">
            <TableDate :value="payment.created_at" />
          </td>
          <td>
            <div
              v-if="payment.status === 'PENDING' && canDecide"
              class="d-flex gap-2"
            >
              <VBtn
                variant="tonal"
                :disabled="loading"
                @click="handleStatusChange(payment, 'ACCEPTED')"
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
                    Reject this {{ kes(payment.amount) }} payment? You can't undo this.
                  </p>
                  <VBtn
                    block
                    color="error"
                    @click="handleStatusChange(payment, 'REJECTED')"
                  >
                    Reject payment
                  </VBtn>
                </VCard>
              </VMenu>
            </div>
            <VChip
              v-else
              :color="statusLabel[payment.status]?.color ?? 'default'"
              size="small"
            >
              {{ statusLabel[payment.status]?.text ?? payment.status }}
            </VChip>
          </td>
        </tr>
      </tbody>
    </VTable>
    <p
      v-else
      class="text-body-1 text-medium-emphasis"
    >
      No payments yet.
    </p>

    <!-- Money paid back on this sale: how, the reference, who recorded it and when -->
    <template v-if="refunds.length">
      <div class="d-flex justify-space-between align-baseline mt-6 mb-2">
        <h3 class="text-h6">
          Refunds
        </h3>
        <span class="text-body-1 font-weight-medium">{{ kes(totalRefunded) }} paid back</span>
      </div>
      <div
        v-for="refund in refunds"
        :key="refund.refund_uuid"
        class="refund py-3"
      >
        <div class="text-body-1">
          <span class="font-weight-medium">{{ kes(refund.amount) }}</span> by {{ refund.refund_method }}<template v-if="refund.reference_code">
            , {{ refund.reference_code }}
          </template>
        </div>
        <div class="text-body-2 text-medium-emphasis">
          Recorded by {{ refund.recorder?.full_name ?? 'unknown' }}, <TableDate :value="refund.created_at" /><template v-if="refund.note">
            . {{ refund.note }}
          </template>
        </div>
      </div>
    </template>
  </FormDialog>
</template>

<style scoped>
.refund { border-block-start: 1px solid rgba(var(--v-border-color), var(--v-border-opacity)); }
</style>
