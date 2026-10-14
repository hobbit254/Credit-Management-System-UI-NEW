<script setup lang="ts">
import type { TransactionItem } from '@/schemas/transactions'

defineProps<{
  modelValue: boolean
  items: TransactionItem[]
  transactionUuid: string
  loading?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'updateStatus': [item: TransactionItem, status: string, reason: string]
}>()

// Paid follows the sale's payments; a return is the only manual change, and it is final.
const itemStatusOptions = ['Returned']

// A return takes the item off what is owed, so the server asks why it came back.
const returningItem = ref<TransactionItem | null>(null)
const returnReason = ref('')
const reasonError = computed(() => returnReason.value.trim().length < 3 ? 'Say why the item is being returned (at least 3 characters).' : '')

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
  { title: 'Return Reason', key: 'return_reason' },
  { title: 'Created', key: 'created_at' },
  { title: 'Updated', key: 'updated_at' },
]

function close() {
  emit('update:modelValue', false)
}

function askReturnReason(item: TransactionItem) {
  returningItem.value = item
  returnReason.value = ''
}

function confirmReturn() {
  if (!returningItem.value || reasonError.value)
    return
  updatingItemUuid.value = returningItem.value.transaction_item_uuid
  emit('updateStatus', returningItem.value, 'Returned', returnReason.value.trim())
  returningItem.value = null
  updatingItemUuid.value = null
  emit('update:modelValue', false)
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
          aria-label="Close"
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
                    aria-label="Change status"
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
                    :disabled="item.status === 'Returned'"
                    @click="askReturnReason(item)"
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

          <template #item.return_reason="{ item }">
            {{ item.return_reason ?? '—' }}
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

    <VDialog
      :model-value="!!returningItem"
      max-width="460"
      @update:model-value="returningItem = null"
    >
      <VCard>
        <VCardTitle class="pa-4">
          Return {{ returningItem?.product_inventory?.serial_number ?? 'item' }}
        </VCardTitle>
        <VCardText>
          <p class="text-body-2 mb-4">
            The item comes off what this sale owes and is set aside as Returned. Once someone checks it, put it back
            in stock (or return it to the supplier) from Stock Management.
          </p>
          <AppTextarea
            v-model="returnReason"
            label="Reason for the return*"
            placeholder="e.g. Faulty screen, customer changed their mind"
            rows="3"
            counter="255"
            maxlength="255"
            autofocus
            :error-messages="returnReason ? reasonError : ''"
          />
        </VCardText>
        <VCardActions class="pa-4">
          <VSpacer />
          <VBtn
            variant="tonal"
            @click="returningItem = null"
          >
            Cancel
          </VBtn>
          <VBtn
            color="warning"
            variant="flat"
            :disabled="!!reasonError"
            @click="confirmReturn"
          >
            Return item
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>
  </VDialog>
</template>
