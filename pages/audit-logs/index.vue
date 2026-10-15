<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import type { AuditLog } from '@/schemas/audit_logs'
import { useAuditLogs } from '@/composables/audit-logs/useAuditLogs'
import { dateTime, describeAction } from '@/utils/formatters'

definePageMeta({
  subject: 'v1/audit_logs',
})

const { auditLogs, loading, pagination, fetchAllAuditLogs } = useAuditLogs()

const startDate = ref('')
const endDate = ref('')

const load = (page = 1) => fetchAllAuditLogs({
  page,
  start_date: startDate.value || undefined,
  end_date: endDate.value || undefined,
})

onMounted(() => load())

// A new date range starts again from page 1.
watch([startDate, endDate], () => load(1))

// Only what helps answer "who did this, from where": older rows also hold a sign-in token, which is never shown.
const openDetails = ref(false)
const selected = ref<AuditLog | null>(null)

function viewDetails(log: AuditLog) {
  selected.value = log
  openDetails.value = true
}
</script>

<template>
  <ListPage
    title="Activity log"
    subtitle="Everything staff have viewed or changed, newest first."
    :loading="loading"
    :pagination="pagination"
    :row-count="auditLogs.length"
    :columns="4"
    :empty-text="startDate || endDate ? 'Nothing happened between these dates.' : 'No activity yet.'"
    @page="load"
  >
    <template #filters>
      <AppTextField
        v-model="startDate"
        label="From"
        type="date"
        style="max-inline-size: 200px;"
      />
      <AppTextField
        v-model="endDate"
        label="To"
        type="date"
        style="max-inline-size: 200px;"
      />
      <VBtn
        v-if="startDate || endDate"
        variant="text"
        color="default"
        class="align-self-end"
        @click="startDate = ''; endDate = ''"
      >
        Clear dates
      </VBtn>
    </template>

    <template #head>
      <th>Who</th>
      <th>What</th>
      <th>When</th>
      <th>
        <span class="d-sr-only">Details</span>
      </th>
    </template>

    <tr
      v-for="(log, i) in auditLogs"
      :key="`${log.created_at}-${i}`"
    >
      <td class="py-3">
        <div class="font-weight-medium text-body-1">
          {{ log.full_name }}
        </div>
        <div class="text-body-2 text-medium-emphasis">
          {{ log.role_name }}
        </div>
      </td>
      <td class="text-body-1">
        {{ describeAction(log.action, log.entity) }}
      </td>
      <td class="text-body-2 text-medium-emphasis">
        {{ dateTime(log.created_at) }}
      </td>
      <td class="text-end">
        <VBtn
          variant="text"
          color="default"
          @click="viewDetails(log)"
        >
          Details
        </VBtn>
      </td>
    </tr>
  </ListPage>

  <VDialog
    v-model="openDetails"
    max-width="600"
  >
    <VCard
      v-if="selected"
      class="pa-2"
    >
      <VCardTitle>{{ describeAction(selected.action, selected.entity) }}</VCardTitle>
      <VCardText>
        <dl class="details">
          <dt>By</dt>
          <dd>{{ selected.full_name }} ({{ selected.details?.email }})</dd>
          <dt>When</dt>
          <dd>{{ dateTime(selected.created_at) }}</dd>
          <dt>From</dt>
          <dd>{{ selected.details?.ip }}</dd>
          <dt>Browser</dt>
          <dd>{{ selected.details?.userAgent }}</dd>
          <dt>Recorded as</dt>
          <dd>{{ selected.action }}</dd>
        </dl>
        <template v-if="selected.details?.payload && Object.keys(selected.details.payload).length">
          <h3 class="text-h6 mt-4 mb-2">
            What was sent
          </h3>
          <pre class="payload">{{ JSON.stringify(selected.details.payload, null, 2) }}</pre>
        </template>
      </VCardText>
      <VCardActions>
        <VSpacer />
        <VBtn
          variant="text"
          color="default"
          @click="openDetails = false"
        >
          Close
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>

<style scoped>
.details {
  display: grid;
  gap: 6px 16px;
  grid-template-columns: max-content 1fr;
}

.details dt { color: rgba(var(--v-theme-on-surface), var(--v-medium-emphasis-opacity)); }
.details dd { margin: 0; overflow-wrap: anywhere; }

.payload {
  overflow-x: auto;
  padding: 12px;
  border-radius: 8px;
  background: rgb(var(--v-theme-background));
  font-size: 0.875rem;
}
</style>
