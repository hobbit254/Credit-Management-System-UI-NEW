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
    max-width="550"
    scrollable
    persistent
  >
    <VCard :style="{ backgroundColor: surfaceColor }">
      <VCardTitle class="d-flex align-center ga-3 pa-4">
        <VAvatar
          color="info"
          variant="tonal"
          size="40"
        >
          <VIcon>tabler-user-cog</VIcon>
        </VAvatar>
        <div class="d-flex flex-column">
          <span class="text-h6 font-weight-bold">Update Debtor Profile</span>
          <span class="text-caption text-medium-emphasis">Modify account identity and credit terms</span>
        </div>
      </VCardTitle>

      <VDivider />

      <VCardText class="pa-4">
        <VForm @submit.prevent="handleConfirm">
          <VRow dense>
            <VCol
              cols="12"
              class="mb-4"
            >
              <div class="pa-3 rounded bg-var-theme-background border-dashed">
                <div class="d-flex justify-space-between align-center mb-1">
                  <span class="text-xxs text-uppercase font-weight-bold text-medium-emphasis">System Reference</span>
                  <span class="text-xxs font-mono text-medium-emphasis">{{ props.debtor?.debtor_uuid?.split('-')[0] }}...</span>
                </div>
                <div class="d-flex justify-space-between align-center">
                  <span class="text-caption font-weight-bold">{{ localDebtorName || 'New Debtor' }}</span>
                  <VChip
                    size="x-small"
                    color="info"
                    variant="flat"
                    label
                  >
                    {{ localDebtorType }}
                  </VChip>
                </div>
              </div>
            </VCol>

            <VCol cols="12">
              <p class="text-caption text-medium-emphasis font-weight-medium mb-1 text-uppercase">
                Profile Identity
              </p>
              <AppTextField
                v-model="localDebtorName"
                label="Full Name*"
                placeholder="Debtor full name"
              >
                <template #prepend-inner>
                  <VIcon size="18">
                    tabler-user-edit
                  </VIcon>
                </template>
              </AppTextField>
            </VCol>

            <VCol
              cols="12"
              md="6"
              class="mt-2"
            >
              <AppTextField
                v-model="localDebtorEmail"
                label="Email"
                type="email"
                placeholder="Email address"
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
              class="mt-2"
            >
              <AppTextField
                v-model="localDebtorPhone"
                label="Phone"
                placeholder="Contact number"
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
                Financial Configuration
              </p>
            </VCol>

            <VCol cols="12">
              <AppSelect
                v-model="localDebtorType"
                :items="debtorTypes"
                label="Account Type*"
                placeholder="Select debtor type"
              >
                <template #prepend-inner>
                  <VIcon size="18">
                    tabler-category-2
                  </VIcon>
                </template>
              </AppSelect>
            </VCol>

            <VCol
              cols="12"
              class="mt-2"
            >
              <AppTextField
                v-model="localCreditLimit"
                label="Credit Limit*"
                type="number"
                placeholder="0.00"
                prefix="$"
              >
                <template #prepend-inner>
                  <VIcon size="18">
                    tabler-coin
                  </VIcon>
                </template>
              </AppTextField>
            </VCol>
          </VRow>
        </VForm>
      </VCardText>

      <VDivider />

      <VCardActions class="pa-4">
        <VSpacer />

        <VBtn
          variant="plain"
          prepend-icon="tabler-x"
          :disabled="props.loading"
          @click="closeModal"
        >
          Cancel
        </VBtn>

        <VBtn
          color="primary"
          variant="tonal"
          prepend-icon="tabler-refresh"
          :loading="props.loading"
          @click="handleConfirm"
        >
          Update Profile
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>

<style scoped>
.border-dashed {
  border: 1px dashed rgba(var(--v-border-color), var(--v-border-opacity));
}

.bg-var-theme-background {
  background-color: rgba(var(--v-theme-on-surface,255,255,255), 0.04);
}

.text-xxs {
  font-size: 0.65rem;
}

.v-card {
  background-color: v-bind(surfaceColor);
}
</style>
