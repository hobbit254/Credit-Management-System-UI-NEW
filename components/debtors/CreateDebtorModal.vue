<script setup lang="ts">
import { computed, ref, watch } from 'vue'
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
const fieldErrors = ref<Record<string, string[]>>({})

// Watch for external reset (when opening/closing)
watch(() => props.modelValue, val => {
  if (val) {
    localDebtor.value = { ...props.debtor }
    fieldErrors.value = {}
  }
})

// Sync local changes back to parent
watch(localDebtor, newVal => {
  emit('update:debtor', newVal)
}, { deep: true })

// Clear old errors once the pop-up has closed.
watch(isOpen, open => {
  if (!open)
    fieldErrors.value = {}
})

function handleConfirm() {
  const result = NewDebtorSchema.safeParse(localDebtor.value)

  if (!result.success) {
    fieldErrors.value = result.error.flatten().fieldErrors

    return
  }

  fieldErrors.value = {}
  emit('confirm', result.data)
}

const debtorTypes = [
  { title: 'Salesperson / Individual', value: 'Salesperson' },
  { title: 'Shop / Corporate', value: 'Shop' },
]
</script>

<template>
  <FormDialog
    v-model="isOpen"
    title="Add a debtor"
    description="Someone you sell to on credit. Their credit limit caps how much they can owe."
    confirm-text="Add debtor"
    :loading="props.loading"
    @confirm="handleConfirm"
  >
    <VRow>
      <VCol cols="12">
        <AppTextField
          v-model="localDebtor.debtor_name"
          label="Legal Name*"
          placeholder="e.g. John Smith or TechCorp Ltd"
          :error-messages="fieldErrors.debtor_name"
          persistent-placeholder
          autofocus
        />
      </VCol>

      <VCol
        cols="12"
        md="6"
      >
        <AppTextField
          v-model="localDebtor.debtor_email"
          label="Email Address"
          type="email"
          placeholder="john@example.com"
          :error-messages="fieldErrors.debtor_email"
          persistent-placeholder
        />
      </VCol>

      <VCol
        cols="12"
        md="6"
      >
        <AppTextField
          v-model="localDebtor.debtor_phone"
          label="Phone Number"
          placeholder="07XX XXX XXX"
          :error-messages="fieldErrors.debtor_phone"
          persistent-placeholder
        />
      </VCol>

      <VCol
        cols="12"
        md="6"
      >
        <AppSelect
          v-model="localDebtor.debtor_type"
          :items="debtorTypes"
          label="Account Type*"
          placeholder="Select type"
          :error-messages="fieldErrors.debtor_type"
        />
      </VCol>

      <VCol
        cols="12"
        md="6"
      >
        <AppTextField
          v-model="localDebtor.credit_limit"
          label="Credit Limit*"
          type="number"
          placeholder="0"
          :error-messages="fieldErrors.credit_limit"
          hint="Most this debtor can owe on unpaid credit sales. 0 means no limit."
          persistent-hint
          prefix="KES"
          persistent-placeholder
          class="font-mono"
        />
      </VCol>
    </VRow>
  </FormDialog>
</template>
