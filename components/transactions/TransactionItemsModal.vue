<script setup lang="ts">
import type { TransactionItem } from '@/schemas/transactions'

const props = defineProps<{
  modelValue: boolean
  items: TransactionItem[]
  transactionUuid: string
  loading?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'updateStatus': [item: TransactionItem, status: string]
}>()

const itemStatusOptions = ['OnSale', 'Paid', 'Returned']

const itemStatusColorMap: Record<string, string> = {
  OnSale: 'primary',
  Sold: 'success',
  Returned: 'warning',
  Cancelled: 'error',
}

const updatingItemUuid = ref<string | null>(null)

const itemHeaders = [
  { title: 'Serial Number', key: 'product_inventory.serial_number' },
  { title: 'Source Type', key: 'source_type' },
  { title: 'Unit Price', key: 'unit_price' },
  { title: 'Status', key: 'status' },
  { title: 'Created', key: 'created_at' },
  { title: 'Updated', key: 'updated_at' },
]

function close() {
  emit('update:modelValue', false)
}

async function handleUpdateItemStatus(item: TransactionItem, newStatus: string) {
  updatingItemUuid.value = item.transaction_item_uuid
  try {
    emit('updateStatus', item, newStatus)
    emit('update:modelValue', false)
  }
  finally {
    updatingItemUuid.value = null
  }
}
</script>

<template>
  <VDialog
    :model-value="modelValue"
    max-width="900"
    scrollable
    @update:model-value="emit('update:modelValue', $event)"
  >
    <VCard>
      <VCardTitle class="d-flex justify-space-between align-center pa-4">
        <span class="text-h6">Transaction Items</span>
        <VBtn
          icon="tabler-x"
          variant="text"
          @click="close"
        />
      </VCardTitle>

      <VDivider />

      <VCardText class="pa-0">
        <VDataTable
          :headers="itemHeaders"
          :items="items"
          item-key="transaction_item_uuid"
          :items-per-page="-1"
          hide-default-footer
        >
          <!-- Serial Number -->
          <template #item.product_inventory.serial_number="{ item }">
            {{ item.product_inventory?.serial_number ?? '—' }}
          </template>

          <!-- Unit Price -->
          <template #item.unit_price="{ item }">
            {{ Number(item.unit_price).toLocaleString() }}
          </template>

          <!-- Status with inline update -->
          <template #item.status="{ item }">
            <div class="d-flex align-center ga-2">
              <VChip
                :color="itemStatusColorMap[item.status] ?? 'default'"
                size="small"
              >
                {{ item.status }}
              </VChip>
              <VMenu>
                <template #activator="{ props: menuProps }">
                  <VBtn
                    v-bind="menuProps"
                    size="x-small"
                    variant="tonal"
                    :loading="updatingItemUuid === item.transaction_item_uuid"
                    icon="tabler-pencil"
                  />
                </template>
                <VList density="compact">
                  <VListSubheader>Change Status</VListSubheader>
                  <VListItem
                    v-for="statusOption in itemStatusOptions"
                    :key="statusOption"
                    :disabled="statusOption === item.status"
                    @click="handleUpdateItemStatus(item, statusOption)"
                  >
                    <VChip
                      :color="itemStatusColorMap[statusOption] ?? 'default'"
                      size="small"
                    >
                      {{ statusOption }}
                    </VChip>
                  </VListItem>
                </VList>
              </VMenu>
            </div>
          </template>

          <!-- Dates -->
          <template #item.created_at="{ item }">
            <TableDate :value="item.created_at" />
          </template>
          <template #item.updated_at="{ item }">
            <TableDate :value="item.updated_at" />
          </template>
        </VDataTable>
      </VCardText>

      <VDivider />

      <VCardActions class="pa-4">
        <VSpacer />
        <VBtn
          variant="tonal"
          @click="close"
        >
          Close
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>
