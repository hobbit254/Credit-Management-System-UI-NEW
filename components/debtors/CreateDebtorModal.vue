<script setup lang="ts">
import { ref } from 'vue'
import { type NewDebtor, NewDebtorSchema } from '@/schemas/debtors'

const props = defineProps<{
  modelValue: boolean
  loading: boolean
  debtor: NewDebtor
}>()

const emit = defineEmits(['update:modelValue', 'update:debtor', 'confirm'])

const isOpen = computed({
  get: () => props.modelValue,
  set: value => emit('update:modelValue', value),
})

const localDebtor = ref<NewDebtor>({ ...props.debtor })

watch(() => props.debtor, newVal => {
  // Only update if different to avoid loops/resets during typing if parent updates back
  if (JSON.stringify(newVal) !== JSON.stringify(localDebtor.value))
    localDebtor.value = { ...newVal }
}, { deep: true })

watch(localDebtor, newVal => {
  emit('update:debtor', newVal)
}, { deep: true })

function closeModal() {
  isOpen.value = false
}

const fieldErrors = ref<Record<string, string[]>>({})

function handleConfirm() {
  const result = NewDebtorSchema.safeParse(localDebtor.value)

  if (!result.success) {
    fieldErrors.value = result.error.flatten().fieldErrors

    return
  }

  fieldErrors.value = {}
  emit('confirm', result.data)
}
const debtorTypes = ['Salesperson', 'Shop']
</script>

<template>
  <VDialog
    v-model="isOpen"
    max-width="600"
  >
    <VCard
      prepend-icon="tabler-user"
      title="Add New Debtor"
    >
      <VCardText>
        <VForm @submit.prevent="handleConfirm">
          <VRow dense>
            <VCol cols="12">
              <AppTextField
                v-model="localDebtor.debtor_name"
                label="Debtor Name*"
                placeholder="Enter Debtor Name"
                :error-messages="fieldErrors.debtor_name"
              />
            </VCol>
            <VCol cols="12">
              <AppTextField
                v-model="localDebtor.debtor_email"
                label="Debtor Email"
                type="email"
                placeholder="Enter Debtor Email"
                :error-messages="fieldErrors.debtor_email"
              />
            </VCol>
            <VCol cols="12">
              <AppTextField
                v-model="localDebtor.debtor_phone"
                label="Debtor Phone Number"
                placeholder="Enter Debtor Phone"
                :error-messages="fieldErrors.debtor_phone"
              />
            </VCol>
            <VCol cols="12">
              <AppSelect
                v-model:="localDebtor.debtor_type"
                :items="debtorTypes"
                label="Debtor Type*"
                placeholder="Select a Debtor Type*"
              />
            </VCol>
            <VCol cols="12">
              <AppTextField
                v-model="localDebtor.credit_limit"
                label="Credit Limit*"
                type="number"
                placeholder="Enter Credit Limit"
                :error-messages="fieldErrors.credit_limit"
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
