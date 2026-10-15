<script setup lang="ts">
import type { PaymentTransactionItem } from '@/schemas/payments'
import { itemStatusLabel } from '@/utils/formatters'

defineProps<{
  items: PaymentTransactionItem[]
}>()

const isOpen = defineModel<boolean>({ required: true })
</script>

<template>
  <FormDialog
    v-model="isOpen"
    title="Items on this sale"
    confirm-text=""
    hide-confirm
  >
    <VTable v-if="items.length">
      <thead>
        <tr>
          <th class="text-end">
            Price
          </th>
          <th>Status</th>
          <th>Added</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="item in items"
          :key="item.transaction_item_uuid"
        >
          <td class="text-end">
            KES {{ Number(item.unit_price).toLocaleString('en-KE') }}
          </td>
          <td>{{ itemStatusLabel(item.status) }}</td>
          <td><TableDate :value="item.created_at" /></td>
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
</template>
