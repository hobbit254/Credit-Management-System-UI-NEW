<script lang="ts" setup>
import { computed, ref, watch } from 'vue'

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

function closeModal() {
  isOpen.value = false
}

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

function handleConfirm() {
  if (!props.debtor)
    return
  emit('confirm', {
    debtor_uuid: props.debtor.debtor_uuid,
    debtor_name: localDebtorName.value,
    debtor_email: localDebtorEmail.value,
    debtor_phone: localDebtorPhone.value,
    debtor_type: localDebtorType.value,
    credit_limit: localCreditLimit.value,
  })
}
const debtorTypes = ['Salesperson', 'Shop']
</script>

<template>
  <VDialog
    v-model="isOpen"
    max-width="600"
  >
    <VCard
      prepend-icon="tabler-shield-lock"
      title="Update Debtors"
    >
      <VCardText>
        <VForm @submit.prevent="handleConfirm">
          <VRow dense>
            <VCol cols="12">
              <AppTextField
                v-model="localDebtorName"
                label="Debtor Name*"
                placeholder="Enter Debtor Name"
              />
            </VCol>
            <VCol cols="12">
              <AppTextField
                v-model="localDebtorEmail"
                label="Debtor Email"
                type="email"
                placeholder="Enter Debtor Email"
              />
            </VCol>
            <VCol cols="12">
              <AppTextField
                v-model="localDebtorPhone"
                label="Debtor Phone Number"
                placeholder="Enter Debtor Phone"
              />
            </VCol>
            <VCol cols="12">
              <AppSelect
                v-model:="localDebtorType"
                :items="debtorTypes"
                label="Debtor Type*"
                placeholder="Select a Debtor Type*"
              />
            </VCol>
            <VCol cols="12">
              <AppTextField
                v-model="localCreditLimit"
                label="Credit Limit*"
                type="number"
                placeholder="Enter Credit Limit"
              />
            </VCol>
          </VRow>
        </VForm>
      </VCardText>

      <VDivider />

      <VCardActions>
        <VSpacer />

        <VBtn
          text="Cancel"
          variant="plain"
          @click="closeModal"
        />

        <VBtn
          color="primary"
          text="Save"
          variant="tonal"
          :loading="props.loading"
          @click="handleConfirm"
        />
      </VCardActions>
    </VCard>
  </VDialog>
</template>
