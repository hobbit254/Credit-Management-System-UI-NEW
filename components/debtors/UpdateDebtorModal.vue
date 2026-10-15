<script lang="ts" setup>
import { computed, ref, watch } from 'vue'
import { phoneNumber } from '@/schemas/phone'
import type { Debtor } from '@/schemas/debtors'

const props = defineProps<{
  modelValue: boolean
  loading: boolean
  debtor: Debtor | null
}>()

const emit = defineEmits(['update:modelValue', 'confirm'])

const isOpen = computed({
  get: () => props.modelValue,
  set: value => emit('update:modelValue', value),
})

// Local editable copies
const localDebtorName = ref('')
const localDebtorEmail = ref('')
const localDebtorPhone = ref('')
const localDebtorType = ref('')
const localCreditLimit = ref<number>(0)

watch(
  () => props.debtor,
  newDebtor => {
    if (newDebtor) {
      localDebtorName.value = newDebtor.debtor_name
      localDebtorEmail.value = newDebtor.debtor_email
      localDebtorType.value = newDebtor.debtor_type || ''
      localDebtorPhone.value = newDebtor.debtor_phone
      localCreditLimit.value = newDebtor.credit_limit
    }
  },
  { immediate: true, deep: true },
)

// Same phone rule as adding one.
const phoneError = ref('')

function handleConfirm() {
  if (!props.debtor)
    return

  const phone = phoneNumber.safeParse(localDebtorPhone.value)

  phoneError.value = phone.success ? '' : phone.error.issues[0]?.message ?? ''
  if (!phone.success)
    return

  emit('confirm', {
    debtor_uuid: props.debtor.debtor_uuid,
    debtor_name: localDebtorName.value,
    debtor_email: localDebtorEmail.value,
    debtor_phone: phone.data,
    debtor_type: localDebtorType.value,
    credit_limit: localCreditLimit.value,
  })
}

const debtorTypes = [
  { title: 'Salesperson / Individual', value: 'Salesperson' },
  { title: 'Shop / Corporate', value: 'Shop' },
]
</script>

<template>
  <FormDialog
    v-model="isOpen"
    title="Edit debtor"
    confirm-text="Save changes"
    :loading="props.loading"
    @confirm="handleConfirm"
  >
    <VRow>
      <VCol cols="12">
        <AppTextField
          v-model="localDebtorName"
          label="Legal Full Name"
          placeholder="Enter full name"
          persistent-placeholder
        />
      </VCol>

      <VCol
        cols="12"
        md="6"
      >
        <AppTextField
          v-model="localDebtorEmail"
          label="Email Address"
          type="email"
          placeholder="email@example.com"
          persistent-placeholder
        />
      </VCol>

      <VCol
        cols="12"
        md="6"
      >
        <AppTextField
          v-model="localDebtorPhone"
          :error-messages="phoneError"
          label="Phone Number"
          placeholder="07XX XXX XXX"
          persistent-placeholder
        />
      </VCol>

      <VCol
        cols="12"
        md="6"
      >
        <AppSelect
          v-model="localDebtorType"
          :items="debtorTypes"
          label="Account Type"
          placeholder="Select type"
        />
      </VCol>

      <VCol
        cols="12"
        md="6"
      >
        <AppTextField
          v-model="localCreditLimit"
          label="Credit Limit"
          type="number"
          placeholder="0"
          hint="Most this debtor can owe on unpaid credit sales. 0 means no limit."
          persistent-hint
          prefix="KES"
          persistent-placeholder
          class="font-mono font-weight-bold"
        />
      </VCol>
    </VRow>
  </FormDialog>
</template>
