<script lang="ts" setup>
import { computed } from 'vue'
import type { Notification } from '@/schemas/notifications'

const props = defineProps<{
  modelValue: boolean
  notification: Notification | null
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

const isOpen = computed({
  get: () => props.modelValue,
  set: val => emit('update:modelValue', val),
})

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES' }).format(amount)
</script>

<template>
  <VNavigationDrawer
    v-model="isOpen"
    temporary
    location="end"
    :width="420"
  >
    <template v-if="notification">
      <!-- Drawer Header -->
      <div class="d-flex align-center justify-space-between pa-5 pb-4">
        <div class="d-flex align-center gap-3">
          <VAvatar
            :color="notification.read ? 'secondary' : 'primary'"
            variant="tonal"
            size="38"
            rounded
          >
            <VIcon
              size="20"
              :icon="notification.read ? 'tabler-bell-check' : 'tabler-bell-ringing'"
            />
          </VAvatar>
          <h6 class="text-h6">
            Notification Detail
          </h6>
        </div>

        <VBtn
          icon
          variant="text"
          size="small"
          @click="isOpen = false"
        >
          <VIcon icon="tabler-x" />
        </VBtn>
      </div>

      <VDivider />

      <div class="pa-5">
        <!-- Read status -->
        <div class="d-flex justify-end mb-4">
          <VChip
            :color="notification.read ? 'success' : 'error'"
            size="small"
            label
            variant="tonal"
            :prepend-icon="notification.read ? 'tabler-circle-check' : 'tabler-circle-x'"
          >
            {{ notification.read ? 'Read' : 'Unread' }}
          </VChip>
        </div>

        <!-- Title -->
        <h5 class="text-h5 mb-2">
          {{ notification.title }}
        </h5>

        <!-- Message -->
        <p
          class="text-body-1 text-medium-emphasis mb-5"
          style="line-height: 1.7;"
        >
          {{ notification.message }}
        </p>

        <VDivider class="mb-5" />

        <!-- Sender Info -->
        <div class="mb-5">
          <p class="text-overline text-medium-emphasis mb-3">
            Sent By
          </p>
          <div class="d-flex align-center gap-3">
            <VAvatar
              color="primary"
              variant="tonal"
              size="36"
              rounded
            >
              <VIcon
                size="18"
                icon="tabler-user"
              />
            </VAvatar>
            <div>
              <p class="text-body-2 font-weight-medium mb-0">
                {{ notification.full_name }}
              </p>
              <p class="text-caption text-medium-emphasis mb-0">
                {{ notification.email }}
              </p>
            </div>
          </div>
        </div>

        <VDivider class="mb-5" />

        <!-- Details Array -->
        <div
          v-if="notification.details?.length"
          class="mb-5"
        >
          <p class="text-overline text-medium-emphasis mb-3">
            Details
          </p>

          <VCard
            v-for="(detail, index) in notification.details"
            :key="index"
            variant="outlined"
            class="mb-3"
          >
            <VList density="compact">
              <VListItem>
                <VListItemTitle class="d-flex justify-space-between align-center">
                  <span class="text-body-2 text-medium-emphasis">Transaction Item</span>
                  <span
                    class="text-caption font-weight-medium text-truncate ms-2"
                    style="max-width: 180px; font-family: monospace;"
                  >
                    {{ detail.transaction_item_uuid }}
                  </span>
                </VListItemTitle>
              </VListItem>
              <VDivider />
              <VListItem>
                <VListItemTitle class="d-flex justify-space-between align-center">
                  <span class="text-body-2 text-medium-emphasis">Unit Price</span>
                  <span class="text-body-2 font-weight-medium">{{ formatCurrency(detail.unit_price) }}</span>
                </VListItemTitle>
              </VListItem>
              <VDivider />
              <VListItem>
                <VListItemTitle class="d-flex justify-space-between align-center">
                  <span class="text-body-2 text-medium-emphasis">Source Type</span>
                  <span class="text-body-2 font-weight-medium">{{ detail.source_type }}</span>
                </VListItemTitle>
              </VListItem>
              <VDivider />
              <VListItem>
                <VListItemTitle class="d-flex justify-space-between align-center">
                  <span class="text-body-2 text-medium-emphasis">Status</span>
                  <VChip
                    size="x-small"
                    color="warning"
                    variant="tonal"
                    label
                  >
                    {{ detail.status }}
                  </VChip>
                </VListItemTitle>
              </VListItem>
              <VDivider />
              <VListItem>
                <VListItemTitle class="d-flex justify-space-between align-center">
                  <span class="text-body-2 text-medium-emphasis">Created</span>
                  <span class="text-caption">
                    <TableDate :value="detail.created_at" />
                  </span>
                </VListItemTitle>
              </VListItem>
            </VList>
          </VCard>
        </div>

        <VDivider class="mb-5" />

        <!-- Timestamps -->
        <p class="text-overline text-medium-emphasis mb-3">
          Timestamps
        </p>
        <VCard variant="outlined">
          <VList density="compact">
            <VListItem>
              <VListItemTitle class="d-flex justify-space-between align-center">
                <span class="text-body-2 text-medium-emphasis">Received</span>
                <span class="text-caption">
                  <TableDate :value="notification.created_at" />
                </span>
              </VListItemTitle>
            </VListItem>
            <VDivider />
            <VListItem>
              <VListItemTitle class="d-flex justify-space-between align-center">
                <span class="text-body-2 text-medium-emphasis">Read At</span>
                <span
                  v-if="notification.read_at"
                  class="text-caption"
                >
                  <TableDate :value="notification.read_at" />
                </span>
                <VChip
                  v-else
                  size="x-small"
                  color="secondary"
                  variant="tonal"
                  label
                >
                  Not yet read
                </VChip>
              </VListItemTitle>
            </VListItem>
          </VList>
        </VCard>
      </div>
    </template>
  </VNavigationDrawer>
</template>
