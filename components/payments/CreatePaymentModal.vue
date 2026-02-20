<script setup lang="ts">
import { NewPaymentSchema } from '@/schemas/payments'
import type { NewPayment } from '@/schemas/payments'
import { useTransaction } from '@/composables/transactions/useTransaction'

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

onMounted(async () => {
  loadingTransactions.value = true
  try {
    await fetchAllTransactions()
  }
  finally {
    loadingTransactions.value = false
  }
})

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

const selectedTransaction = computed(() =>
  transactions.value.find((t: any) => t.transaction_uuid === localPayment.value.transaction_uuid),
)
</script>

<template>
  <VDialog
    v-model="isOpen"
    max-width="500"
    scrollable
  >
    <VCard>
      <VCardTitle class="d-flex align-center ga-3 pa-4">
        <VAvatar
          color="primary"
          variant="tonal"
          size="38"
        >
          <VIcon>tabler-credit-card</VIcon>
        </VAvatar>
        <div class="d-flex flex-column">
          <span class="text-h6 font-weight-bold">New Payment</span>
          <span class="text-caption text-medium-emphasis">Fill in the payment details below</span>
        </div>
      </VCardTitle>

      <VDivider />

      <VCardText>
        <VForm @submit.prevent="handleConfirm">
          <VRow dense>
            <!-- Transaction — readonly if preset -->
            <VCol cols="12">
              <template v-if="isPreset">
                <div class="mb-4">
                  <p class="text-caption text-medium-emphasis mb-1">
                    Transaction
                  </p>
                  <VCard
                    variant="outlined"
                    class="pa-3"
                  >
                    <div class="d-flex align-center ga-2">
                      <VChip
                        :color="selectedTransaction?.transaction_type === 'Sale' ? 'primary' : 'warning'"
                        size="x-small"
                        variant="tonal"
                      >
                        <VIcon
                          start
                          size="11"
                        >
                          {{ selectedTransaction?.transaction_type === 'Sale' ? 'tabler-shopping-cart' : 'tabler-credit-card' }}
                        </VIcon>
                        {{ selectedTransaction?.transaction_type ?? '—' }}
                      </VChip>
                      <VChip
                        :color="selectedTransaction?.status === 'Paid' ? 'success' : selectedTransaction?.status === 'Partially_Paid' ? 'warning' : 'error'"
                        size="x-small"
                        variant="tonal"
                      >
                        {{ selectedTransaction?.status?.replace(/_/g, ' ') ?? '—' }}
                      </VChip>
                    </div>
                    <div class="mt-1 d-flex flex-column ga-1">
                      <span class="text-caption text-medium-emphasis">
                        Debtor: {{ selectedTransaction?.debtor?.debtor_name ?? '—' }}
                      </span>
                      <span class="text-caption font-weight-mono text-medium-emphasis">
                        {{ localPayment.transaction_uuid?.slice(0, 24) }}...
                      </span>
                    </div>
                  </VCard>
                </div>
              </template>

              <template v-else>
                <AppAutocomplete
                  v-model="localPayment.transaction_uuid"
                  :items="transactions"
                  item-title="transaction_uuid"
                  item-value="transaction_uuid"
                  :loading="loadingTransactions"
                  label="Transaction*"
                  placeholder="Select a transaction"
                  :error-messages="fieldErrors.transaction_uuid"
                >
                  <template #selection="{ item }">
                    <div class="d-flex align-center ga-2 py-1">
                      <VChip
                        :color="item.raw.transaction_type === 'Sale' ? 'primary' : 'warning'"
                        size="x-small"
                        variant="tonal"
                      >
                        {{ item.raw.transaction_type }}
                      </VChip>
                      <span class="text-caption font-weight-mono">
                        {{ item.raw.transaction_uuid?.slice(0, 16) }}...
                      </span>
                    </div>
                  </template>
                  <template #item="{ item, props: itemProps }">
                    <VListItem v-bind="itemProps">
                      <template #title>
                        <div class="d-flex align-center ga-2">
                          <VChip
                            :color="item.raw.transaction_type === 'Sale' ? 'primary' : 'warning'"
                            size="x-small"
                            variant="tonal"
                          >
                            <VIcon
                              start
                              size="11"
                            >
                              {{ item.raw.transaction_type === 'Sale' ? 'tabler-shopping-cart' : 'tabler-credit-card' }}
                            </VIcon>
                            {{ item.raw.transaction_type }}
                          </VChip>
                          <VChip
                            :color="item.raw.status === 'Paid' ? 'success' : item.raw.status === 'Partially_Paid' ? 'warning' : 'error'"
                            size="x-small"
                            variant="tonal"
                          >
                            {{ item.raw.status?.replace(/_/g, ' ') }}
                          </VChip>
                        </div>
                      </template>
                      <template #subtitle>
                        <div class="d-flex flex-column ga-1 mt-1">
                          <span class="text-caption text-medium-emphasis">
                            Debtor: {{ item.raw.debtor?.debtor_name ?? '—' }}
                          </span>
                          <span class="text-caption font-weight-mono text-medium-emphasis">
                            {{ item.raw.transaction_uuid?.slice(0, 20) }}...
                          </span>
                        </div>
                      </template>
                    </VListItem>
                  </template>
                </AppAutocomplete>
              </template>
            </VCol>

            <!-- Payment Method -->
            <VCol cols="12">
              <AppAutocomplete
                v-model="localPayment.payment_method"
                :items="paymentMethodOptions"
                label="Payment Method*"
                placeholder="Select payment method"
                :error-messages="fieldErrors.payment_method"
              >
                <template #prepend-inner>
                  <VIcon size="18">
                    {{ localPayment.payment_method === 'Cash' ? 'tabler-cash' : localPayment.payment_method === 'M-Pesa' ? 'tabler-phone' : localPayment.payment_method === 'Bank' ? 'tabler-building-bank' : 'tabler-receipt' }}
                  </VIcon>
                </template>
              </AppAutocomplete>
            </VCol>

            <!-- Amount -->
            <VCol cols="12">
              <AppTextField
                v-model="localPayment.amount"
                label="Amount*"
                placeholder="Enter amount"
                type="number"
                :error-messages="fieldErrors.amount"
              >
                <template #prepend-inner>
                  <span class="text-caption font-weight-bold text-success pt-1">KES</span>
                </template>
              </AppTextField>
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
              >
                <template #prepend-inner>
                  <VIcon size="16">
                    tabler-hash
                  </VIcon>
                </template>
              </AppTextField>
            </VCol>
          </VRow>
        </VForm>
      </VCardText>

      <VDivider />

      <VCardActions class="pa-3">
        <VSpacer />
        <VBtn
          variant="plain"
          prepend-icon="tabler-x"
          :disabled="loading"
          @click="isOpen = false"
        >
          Cancel
        </VBtn>
        <VBtn
          color="primary"
          variant="tonal"
          prepend-icon="tabler-check"
          :loading="loading"
          @click="handleConfirm"
        >
          Save Payment
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>
