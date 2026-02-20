<script lang="ts" setup>
import { computed, ref, watch } from 'vue'
import { useTheme } from 'vuetify'
import type { Debtor } from '@/schemas/debtors'

const props = defineProps<{
  modelValue: boolean
  loading: boolean
  debtor: Debtor | null
}>()

const emit = defineEmits(['update:modelValue', 'confirm'])

const theme = useTheme()
const surfaceColor = computed(() => theme.current.value.colors.surface)

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

const debtorTypes = [
  { title: 'Salesperson / Individual', value: 'Salesperson' },
  { title: 'Shop / Corporate', value: 'Shop' },
]
</script>

<template>
  <VDialog
    v-model="isOpen"
    max-width="580"
    scrollable
    persistent
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
            tabler-user-cog
          </VIcon>
        </VAvatar>
        <div class="d-flex flex-column">
          <span class="text-h6 font-weight-black">Update Debtor Profile</span>
          <span class="text-caption text-medium-emphasis">Modify account identity and credit terms</span>
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
              class="mb-2"
            >
              <div class="pa-4 rounded-lg bg-light-info border-dashed">
                <div class="d-flex justify-space-between align-center mb-2">
                  <div class="d-flex align-center ga-1">
                    <VIcon
                      size="12"
                      color="info"
                    >
                      tabler-fingerprint
                    </VIcon>
                    <span class="text-xxs text-uppercase font-weight-black text-disabled tracking-widest">System Reference</span>
                  </div>
                  <code class="text-xs font-weight-bold text-info font-mono">
                    {{ props.debtor?.debtor_uuid }}
                  </code>
                </div>
                <div class="d-flex justify-space-between align-center">
                  <span class="text-body-2 font-weight-black text-high-emphasis">
                    {{ localDebtorName || 'Unidentified Debtor' }}
                  </span>
                  <VChip
                    size="x-small"
                    color="info"
                    variant="flat"
                    label
                    class="font-weight-black uppercase"
                  >
                    {{ localDebtorType }}
                  </VChip>
                </div>
              </div>
            </VCol>

            <VCol
              cols="12"
              class="pb-0 mt-2"
            >
              <div class="d-flex align-center ga-2 mb-3">
                <VIcon
                  size="16"
                  color="info"
                >
                  tabler-id-badge-2
                </VIcon>
                <span class="text-xxs font-weight-black text-uppercase tracking-widest text-disabled">
                  Profile Identity
                </span>
              </div>
            </VCol>

            <VCol cols="12">
              <AppTextField
                v-model="localDebtorName"
                label="Legal Full Name"
                placeholder="Enter full name"
                prepend-inner-icon="tabler-user-edit"
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
                prepend-inner-icon="tabler-mail"
                persistent-placeholder
              />
            </VCol>

            <VCol
              cols="12"
              md="6"
            >
              <AppTextField
                v-model="localDebtorPhone"
                label="Phone Number"
                placeholder="07XX XXX XXX"
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
                  tabler-coin-bitcoin
                </VIcon>
                <span class="text-xxs font-weight-black text-uppercase tracking-widest text-disabled">
                  Financial Configuration
                </span>
              </div>
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
                prepend-inner-icon="tabler-category-2"
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
                prefix="KES"
                prepend-inner-icon="tabler-coin"
                persistent-placeholder
                class="font-mono font-weight-bold"
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
          color="info"
          variant="elevated"
          min-width="160"
          :loading="props.loading"
          @click="handleConfirm"
        >
          <VIcon start>
            tabler-refresh
          </VIcon>
          Update Profile
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>

<style scoped>
.border-dashed {
  border: 1px dashed rgba(var(--v-border-color), 0.2) !important;
}

.bg-light-info {
  background-color: rgba(var(--v-theme-info,255,255,255), 0.04) !important;
}

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

:deep(.v-field__outline) {
  --v-field-border-opacity: 0.08;
}
</style>
