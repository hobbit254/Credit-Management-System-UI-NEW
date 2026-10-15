<script setup lang="ts">
import { NewPaymentSchema } from '@/schemas/payments'
import type { NewPayment } from '@/schemas/payments'
import { useTransaction } from '@/composables/transactions/useTransaction'
import type { AppAbility } from '@/composables/auth/useAbility'

const props = defineProps<{
  modelValue: boolean
  loading?: boolean
  presetTransactionUuid?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'confirm': [payment: NewPayment]
}>()

const isOpen = computed({
  get: () => props.modelValue,
  set: value => emit('update:modelValue', value),
})

const paymentMethodOptions = ['Cash', 'M-Pesa', 'Bank', 'Cheque']

const { transactions, fetchAllTransactions } = useTransaction()
const loadingTransactions = ref(false)

// Picking a sale needs the sales list; without it the request would only come back refused.
const { $ability } = useNuxtApp() as unknown as { $ability: AppAbility }
const canListSales = computed(() => $ability.can('access', 'v1/transactions'))

// Load each time the dialog opens: the page mounts it once, so loading on mount kept
// lists from when the page opened (e.g. a unit sold a minute ago still offered).
watch(() => props.modelValue, async open => {
  if (!open || !canListSales.value)
    return
  loadingTransactions.value = true
  try {
    // Only sales that still owe money. shortcut: the newest 100 open sales; add a server-side search if a shop ever has more.
    await fetchAllTransactions({ perPage: 100, open: true })
  }
  finally {
    loadingTransactions.value = false
  }
}, { immediate: true })

const localPayment = ref<NewPayment>({
  transaction_uuid: '',
  amount: '',
  payment_method: '',
  reference_code: '',
})

const fieldErrors = ref<Record<string, string[]>>({})

function resetForm() {
  localPayment.value = {
    transaction_uuid: props.presetTransactionUuid ?? '',
    amount: '',
    payment_method: '',
    reference_code: '',
  }
  fieldErrors.value = {}
}

watch(isOpen, val => {
  if (val)
    resetForm()
})

watch(() => localPayment.value.payment_method, val => {
  if (val === 'Cash')
    localPayment.value.reference_code = ''
})

function handleConfirm() {
  const result = NewPaymentSchema.safeParse(localPayment.value)

  if (!result.success) {
    fieldErrors.value = result.error.flatten().fieldErrors

    return
  }

  fieldErrors.value = {}
  emit('confirm', result.data)
}

const isPreset = computed(() => !!props.presetTransactionUuid)

// What is left to pay, so the right sale is easy to pick.
function owedText(sale: any) {
  const owed = Math.max(0, Number(sale.total_expected ?? 0) - Number(sale.payments_sum_amount ?? 0))

  return `KES ${owed.toLocaleString('en-KE')} still owed, sold ${new Date(sale.created_at).toLocaleDateString('en-KE', { day: 'numeric', month: 'short' })}`
}

const selectedTransaction = computed(() =>
  transactions.value.find((t: any) => t.transaction_uuid === localPayment.value.transaction_uuid),
)
</script>

<template>
  <FormDialog
    v-model="isOpen"
    title="Record a payment"
    description="It waits for approval until someone checks it against the M-Pesa or bank statement."
    confirm-text="Record payment"
    :loading="loading"
    @confirm="handleConfirm"
  >
    <VRow dense>
      <!-- The sale: fixed when opened from a sale's row, otherwise picked from those still owing -->
      <VCol cols="12">
        <p
          v-if="isPreset"
          class="text-body-1 mb-4"
        >
          For <span class="font-weight-medium">{{ selectedTransaction?.debtor?.debtor_name ?? 'this sale' }}</span><template v-if="selectedTransaction">
            , {{ owedText(selectedTransaction) }}
          </template>
        </p>
        <p
          v-else-if="!canListSales"
          class="text-body-1 text-medium-emphasis mb-4"
        >
          Your role can't see the list of sales, so you can't pick one here. Ask an administrator for access to Sales.
        </p>
        <AppAutocomplete
          v-else
          v-model="localPayment.transaction_uuid"
          :items="transactions"
          :item-title="(sale: any) => `${sale.debtor?.debtor_name ?? 'Unknown customer'}, ${owedText(sale)}`"
          item-value="transaction_uuid"
          :loading="loadingTransactions"
          label="Sale*"
          placeholder="Search by customer"
          :error-messages="fieldErrors.transaction_uuid"
        />
      </VCol>

      <!-- Payment Method -->
      <VCol cols="12">
        <AppAutocomplete
          v-model="localPayment.payment_method"
          :items="paymentMethodOptions"
          label="Payment Method*"
          placeholder="Select payment method"
          :error-messages="fieldErrors.payment_method"
        />
      </VCol>

      <!-- Amount -->
      <VCol cols="12">
        <AppTextField
          v-model="localPayment.amount"
          label="Amount*"
          placeholder="Enter amount"
          type="number"
          :error-messages="fieldErrors.amount"
          prefix="KES"
        />
      </VCol>

      <!-- Reference Code — hidden for Cash -->
      <VCol
        v-if="localPayment.payment_method && localPayment.payment_method !== 'Cash'"
        cols="12"
      >
        <AppTextField
          v-model="localPayment.reference_code"
          label="Reference Code*"
          placeholder="Enter reference code"
          :error-messages="fieldErrors.reference_code"
        />
      </VCol>
    </VRow>
  </FormDialog>
</template>
