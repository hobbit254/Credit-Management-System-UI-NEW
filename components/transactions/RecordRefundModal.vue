<script setup lang="ts">
import type { NewRefund, Transaction } from '@/schemas/transactions'
import { hasCents } from '@/schemas/transactions'

const props = defineProps<{
  modelValue: boolean
  sale: Transaction | null
  loading?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'confirm': [refund: NewRefund]
}>()

const refundMethodOptions = ['Cash', 'M-Pesa', 'Bank', 'Cheque']

const refund = ref<NewRefund>({ transaction_uuid: '', amount: '', refund_method: '', reference_code: '', note: '' })
const fieldErrors = ref<Record<string, string>>({})
const due = computed(() => Number(props.sale?.overpaid ?? 0))

// Start from the full amount due back each time the dialog opens.
watch(() => props.modelValue, open => {
  if (open && props.sale) {
    refund.value = { transaction_uuid: props.sale.transaction_uuid, amount: String(due.value), refund_method: '', reference_code: '', note: '' }
    fieldErrors.value = {}
  }
})

function handleConfirm() {
  const amount = refund.value.amount.trim()
  const errors: Record<string, string> = {}
  if (!(Number(amount) > 0))
    errors.amount = 'Amount must be greater than 0'
  else if (!hasCents(amount))
    errors.amount = 'Use at most 2 decimals'
  else if (Math.round(Number(amount) * 100) > Math.round(due.value * 100))
    errors.amount = `At most ${due.value.toLocaleString()} is due back on this sale`
  if (!refund.value.refund_method)
    errors.refund_method = 'How was the money paid back?'
  if (refund.value.refund_method && refund.value.refund_method !== 'Cash' && !refund.value.reference_code.trim())
    errors.reference_code = 'Reference code is required for non-cash refunds'

  fieldErrors.value = errors
  if (!Object.keys(errors).length)
    emit('confirm', { ...refund.value, amount })
}
</script>

<template>
  <VDialog
    :model-value="modelValue"
    max-width="480"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <VCard>
      <VCardTitle class="pa-4">
        Record Refund
      </VCardTitle>
      <VCardText>
        <p class="text-body-2 mb-4">
          <strong>KES {{ due.toLocaleString() }}</strong> is due back to {{ sale?.debtor?.debtor_name ?? 'the customer' }}
          on this sale. Record the money once it has been paid back.
        </p>
        <VRow>
          <VCol cols="12">
            <AppTextField
              v-model="refund.amount"
              label="Amount*"
              type="number"
              prefix="KES"
              :error-messages="fieldErrors.amount"
            />
          </VCol>
          <VCol cols="12">
            <AppSelect
              v-model="refund.refund_method"
              :items="refundMethodOptions"
              label="Paid back by*"
              placeholder="Select method"
              :error-messages="fieldErrors.refund_method"
            />
          </VCol>
          <VCol
            v-if="refund.refund_method && refund.refund_method !== 'Cash'"
            cols="12"
          >
            <AppTextField
              v-model="refund.reference_code"
              label="Reference Code*"
              placeholder="e.g. the M-Pesa reversal code"
              :error-messages="fieldErrors.reference_code"
            />
          </VCol>
          <VCol cols="12">
            <AppTextarea
              v-model="refund.note"
              label="Note"
              rows="2"
              counter="255"
              maxlength="255"
            />
          </VCol>
        </VRow>
      </VCardText>
      <VCardActions class="pa-4">
        <VSpacer />
        <VBtn
          variant="tonal"
          :disabled="loading"
          @click="emit('update:modelValue', false)"
        >
          Cancel
        </VBtn>
        <VBtn
          color="primary"
          variant="flat"
          :loading="loading"
          @click="handleConfirm"
        >
          Record Refund
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>
