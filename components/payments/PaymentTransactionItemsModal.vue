<script setup lang="ts">
import type { PaymentTransactionItem } from '@/schemas/payments'

const props = defineProps<{
  modelValue: boolean
  items: PaymentTransactionItem[]
}>()

const emit = defineEmits(['update:modelValue'])

const isOpen = computed({
  get: () => props.modelValue,
  set: value => emit('update:modelValue', value),
})

const headers = [
  { title: 'Unit Price', key: 'unit_price' },
  { title: 'Source Type', key: 'source_type' },
  { title: 'Status', key: 'status' },
  { title: 'Created', key: 'created_at' },
]
</script>

<template>
  <VDialog
    v-model="isOpen"
    max-width="650"
    scrollable
  >
    <VCard>
      <VCardTitle class="d-flex align-center ga-3 pa-4">
        <VAvatar
          color="secondary"
          variant="tonal"
          size="38"
        >
          <VIcon>tabler-package</VIcon>
        </VAvatar>
        <div class="d-flex flex-column">
          <span class="text-h6 font-weight-bold">Transaction Items</span>
          <span class="text-caption text-medium-emphasis">{{ items.length }} item(s)</span>
        </div>
      </VCardTitle>

      <VDivider />

      <VCardText class="pa-0">
        <VDataTable
          :headers="headers"
          :items="items"
          item-key="transaction_item_uuid"
          :items-per-page="-1"
        >
          <!-- Unit Price -->
          <template #item.unit_price="{ item }">
            <div class="d-flex align-center ga-1">
              <span class="text-caption font-weight-bold text-success">KES</span>
              <span class="font-weight-medium text-body-2">
                {{ Number(item.unit_price).toLocaleString() }}
              </span>
            </div>
          </template>

          <!-- Source Type -->
          <template #item.source_type="{ item }">
            <VChip
              size="small"
              color="info"
              variant="tonal"
            >
              {{ item.source_type }}
            </VChip>
          </template>

          <!-- Status -->
          <template #item.status="{ item }">
            <VChip
              :color="item.status === 'OnSale' ? 'success' : item.status === 'OnCredit' ? 'warning' : 'secondary'"
              size="small"
              variant="tonal"
            >
              {{ item.status }}
            </VChip>
          </template>

          <!-- Created -->
          <template #item.created_at="{ item }">
            <div class="d-flex align-center ga-1 text-caption text-medium-emphasis">
              <VIcon size="13">
                tabler-calendar
              </VIcon>
              <TableDate :value="item.created_at" />
            </div>
          </template>

          <!-- No data -->
          <template #no-data>
            <div class="d-flex flex-column align-center justify-center pa-6 ga-2">
              <VIcon
                size="40"
                color="secondary"
              >
                tabler-package-off
              </VIcon>
              <span class="text-body-2 text-medium-emphasis">No items found.</span>
            </div>
          </template>

          <template #bottom />
        </VDataTable>
      </VCardText>

      <VDivider />

      <VCardActions class="pa-3">
        <VSpacer />
        <VBtn
          variant="tonal"
          color="secondary"
          prepend-icon="tabler-x"
          @click="isOpen = false"
        >
          Close
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>
