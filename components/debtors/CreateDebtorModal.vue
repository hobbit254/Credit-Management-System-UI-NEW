<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useTheme } from 'vuetify'
import { type NewDebtor, NewDebtorSchema } from '@/schemas/debtors'

const props = defineProps<{
  modelValue: boolean
  loading: boolean
  debtor: NewDebtor
}>()

const emit = defineEmits(['update:modelValue', 'update:debtor', 'confirm'])

const theme = useTheme()
const surfaceColor = computed(() => theme.current.value.colors.surface)

const isOpen = computed({
  get: () => props.modelValue,
  set: value => emit('update:modelValue', value),
})

const localDebtor = ref<NewDebtor>({ ...props.debtor })
const fieldErrors = ref<Record<string, string[]>>({})

watch(() => props.debtor, newVal => {
  if (JSON.stringify(newVal) !== JSON.stringify(localDebtor.value))
    localDebtor.value = { ...newVal }
}, { deep: true })

watch(localDebtor, newVal => {
  emit('update:debtor', newVal)
}, { deep: true })

function closeModal() {
  isOpen.value = false
  fieldErrors.value = {}
}

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
  <VDialog
    v-model="isOpen"
    max-width="550"
    persistent
  >
    <VCard :style="{ backgroundColor: surfaceColor }">
      <VCardTitle class="d-flex align-center ga-3 pa-4">
        <VAvatar
          color="info"
          variant="tonal"
          size="40"
        >
          <VIcon>tabler-user-plus</VIcon>
        </VAvatar>
        <div class="d-flex flex-column">
          <span class="text-h6 font-weight-bold">Add New Debtor</span>
          <span class="text-caption text-medium-emphasis">Establish a new credit profile and limit</span>
        </div>
      </VCardTitle>

      <VDivider />

      <VCardText class="pa-4">
        <VForm @submit.prevent="handleConfirm">
          <VRow dense>
            <VCol cols="12">
              <p class="text-caption text-medium-emphasis font-weight-medium mb-1 text-uppercase">
                Debtor Identity
              </p>
            </VCol>

            <VCol cols="12">
              <AppTextField
                v-model="localDebtor.debtor_name"
                label="Full Name*"
                placeholder="e.g. John Smith"
                :error-messages="fieldErrors.debtor_name"
                autofocus
              >
                <template #prepend-inner>
                  <VIcon size="18">
                    tabler-user
                  </VIcon>
                </template>
              </AppTextField>
            </VCol>

            <VCol
              cols="12"
              md="6"
            >
              <AppTextField
                v-model="localDebtor.debtor_email"
                label="Email"
                type="email"
                placeholder="john@example.com"
                :error-messages="fieldErrors.debtor_email"
              >
                <template #prepend-inner>
                  <VIcon size="18">
                    tabler-mail
                  </VIcon>
                </template>
              </AppTextField>
            </VCol>

            <VCol
              cols="12"
              md="6"
            >
              <AppTextField
                v-model="localDebtor.debtor_phone"
                label="Phone Number"
                placeholder="+1 234 567"
                :error-messages="fieldErrors.debtor_phone"
              >
                <template #prepend-inner>
                  <VIcon size="18">
                    tabler-phone
                  </VIcon>
                </template>
              </AppTextField>
            </VCol>

            <VCol
              cols="12"
              class="mt-4"
            >
              <p class="text-caption text-medium-emphasis font-weight-medium mb-1 text-uppercase">
                Credit Configuration
              </p>
            </VCol>

            <VCol cols="12">
              <AppSelect
                v-model="localDebtor.debtor_type"
                :items="debtorTypes"
                label="Debtor Type*"
                placeholder="Select account type"
                :error-messages="fieldErrors.debtor_type"
              >
                <template #prepend-inner>
                  <VIcon size="18">
                    tabler-category
                  </VIcon>
                </template>
              </AppSelect>
            </VCol>

            <VCol cols="12">
              <AppTextField
                v-model="localDebtor.credit_limit"
                label="Credit Limit*"
                type="number"
                placeholder="0.00"
                :error-messages="fieldErrors.credit_limit"
                prefix="KSH"
              />
            </VCol>
          </VRow>
        </VForm>
      </VCardText>

      <VDivider />

      <VCardActions class="pa-3">
        <VSpacer />

        <VBtn
          text="Cancel"
          variant="plain"
          :disabled="props.loading"
          @click="closeModal"
        />

        <VBtn
          color="primary"
          variant="tonal"
          prepend-icon="tabler-check"
          :loading="props.loading"
          @click="handleConfirm"
        >
          Create Profile
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>

<style scoped>
.text-xxs {
  font-size: 0.65rem;
}
</style>
