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

function closeModal() {
  isOpen.value = false
  setTimeout(() => {
    fieldErrors.value = {}
  }, 200)
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
    max-width="580"
    persistent
    scrollable
  >
    <VCard
      class="border shadow-lg"
      :style="{ backgroundColor: surfaceColor }"
    >
      <VCardTitle class="d-flex align-center ga-3 pa-4 bg-var-theme-surface">
        <VAvatar
          color="info"
          variant="tonal"
          size="44"
          rounded="lg"
        >
          <VIcon size="24">
            tabler-user-plus
          </VIcon>
        </VAvatar>
        <div class="d-flex flex-column">
          <span class="text-h6 font-weight-black">Register New Debtor</span>
          <span class="text-caption text-medium-emphasis">Establish credit limits and account details</span>
        </div>
        <VSpacer />
        <VBtn
          icon="tabler-x"
          variant="text"
          size="small"
          density="comfortable"
          @click="closeModal"
        />
      </VCardTitle>

      <VDivider />

      <VCardText class="pa-5">
        <VForm @submit.prevent="handleConfirm">
          <VRow>
            <VCol
              cols="12"
              class="pb-0"
            >
              <div class="d-flex align-center ga-2 mb-3">
                <VIcon
                  size="16"
                  color="info"
                >
                  tabler-id-badge-2
                </VIcon>
                <span class="text-xxs font-weight-black text-uppercase tracking-widest text-disabled">
                  Debtor Identity
                </span>
              </div>
            </VCol>

            <VCol cols="12">
              <AppTextField
                v-model="localDebtor.debtor_name"
                label="Legal Name*"
                placeholder="e.g. John Smith or TechCorp Ltd"
                :error-messages="fieldErrors.debtor_name"
                prepend-inner-icon="tabler-user"
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
                prepend-inner-icon="tabler-mail"
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
                prepend-inner-icon="tabler-phone"
                persistent-placeholder
              />
            </VCol>

            <VCol
              cols="12"
              class="pt-4 pb-0"
            >
              <div class="d-flex align-center ga-2 mb-3">
                <VIcon
                  size="16"
                  color="info"
                >
                  tabler-settings-automation
                </VIcon>
                <span class="text-xxs font-weight-black text-uppercase tracking-widest text-disabled">
                  Credit Configuration
                </span>
              </div>
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
                prepend-inner-icon="tabler-category"
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
                prefix="KES"
                persistent-placeholder
                class="font-mono"
              />
            </VCol>
          </VRow>
        </VForm>
      </VCardText>

      <VDivider />

      <VCardActions class="pa-4 bg-var-theme-background">
        <VBtn
          variant="text"
          color="secondary"
          class="font-weight-bold"
          :disabled="props.loading"
          @click="closeModal"
        >
          Cancel
        </VBtn>
        <VSpacer />
        <VBtn
          color="primary"
          variant="elevated"
          min-width="160"
          :loading="props.loading"
          @click="handleConfirm"
        >
          <VIcon start>
            tabler-user-check
          </VIcon>
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

.tracking-widest {
  letter-spacing: 0.12em;
}

.font-mono {
  font-family: 'Fira Code', monospace;
}

.v-card {
  border-radius: 12px !important;
}
</style>
