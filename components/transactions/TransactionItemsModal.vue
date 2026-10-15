<script setup lang="ts">
import type { TransactionItem } from '@/schemas/transactions'
import { itemStatusLabel } from '@/utils/formatters'

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

// A return takes the item off what is owed, so the server asks why it came back.
const returningItem = ref<TransactionItem | null>(null)
const returnReason = ref('')
const triedReturn = ref(false)
const reasonError = computed(() => returnReason.value.trim().length < 3 ? 'Say why it came back (at least 3 characters).' : '')

function askReturnReason(item: TransactionItem) {
  returningItem.value = item
  returnReason.value = ''
  triedReturn.value = false
}

function confirmReturn() {
  triedReturn.value = true
  if (!returningItem.value || reasonError.value)
    return
  emit('updateStatus', returningItem.value, 'Returned', returnReason.value.trim())
  returningItem.value = null
  emit('update:modelValue', false)
}

const isReturning = computed({
  get: () => !!returningItem.value,
  set: open => {
    if (!open)
      returningItem.value = null
  },
})
</script>

<template>
  <FormDialog
    :model-value="modelValue"
    title="Items and returns"
    description="A returned device comes off what the sale owes. Returns are final."
    confirm-text=""
    hide-confirm
    :width="760"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <VTable v-if="items.length">
      <thead>
        <tr>
          <th>Serial number</th>
          <th class="text-end">
            Price
          </th>
          <th>Status</th>
          <th>
            <span class="d-sr-only">Actions</span>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="item in items"
          :key="item.transaction_item_uuid"
        >
          <td class="py-3">
            {{ item.product_inventory?.serial_number ?? '—' }}
          </td>
          <td class="text-end text-no-wrap">
            KES {{ Number(item.unit_price).toLocaleString('en-KE') }}
          </td>
          <td>
            <div>{{ itemStatusLabel(item.status) }}</div>
            <div
              v-if="item.return_reason"
              class="text-body-2 text-medium-emphasis"
            >
              {{ item.return_reason }}
            </div>
          </td>
          <td class="text-end">
            <VBtn
              v-if="item.status !== 'Returned'"
              variant="outlined"
              color="default"
              :disabled="loading"
              @click="askReturnReason(item)"
            >
              Return
            </VBtn>
          </td>
        </tr>
      </tbody>
    </VTable>
    <p
      v-else
      class="text-body-1 text-medium-emphasis"
    >
      This sale has no items.
    </p>
  </FormDialog>

  <FormDialog
    v-model="isReturning"
    :title="`Return ${returningItem?.product_inventory?.serial_number ?? 'this device'}`"
    description="It comes off what this sale owes and is set aside as Returned. Once someone checks it, put it back in stock or send it to the supplier from Devices."
    confirm-text="Return device"
    danger
    @confirm="confirmReturn"
  >
    <AppTextarea
      v-model="returnReason"
      label="Why did it come back?*"
      placeholder="e.g. Faulty screen, customer changed their mind"
      rows="3"
      counter="255"
      maxlength="255"
      autofocus
      :error-messages="triedReturn || returnReason ? reasonError : ''"
    />
  </FormDialog>
</template>
