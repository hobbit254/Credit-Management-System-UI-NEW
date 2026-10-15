<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useDashboard } from '@/composables/dashboard/useDashboard'
import type { AppAbility } from '@/composables/auth/useAbility'
import { summarizeOwed } from '@/utils/owed'

definePageMeta({
  subject: 'v1/dashboard_stats',
})

const { $ability } = useNuxtApp() as unknown as { $ability: AppAbility }
const { loading, dashboardStats, fetchDashboardStats, decidePayment } = useDashboard()

const canDecidePayments = computed(() => $ability.can('access', 'v1/payments/updateStatus'))

const kes = (amount: number) => `KES ${amount.toLocaleString('en-KE')}`
const today = new Date().toLocaleDateString('en-KE', { weekday: 'long', day: 'numeric', month: 'long' })

const owed = computed(() => summarizeOwed(dashboardStats.value.owed))

// Oldest debt in the warmest color, so the eye lands on what is most at risk.
const bucketColors = ['rgb(var(--v-theme-primary))', 'rgba(var(--v-theme-primary), 0.45)', 'rgb(var(--v-theme-warning))', 'rgb(var(--v-theme-error))']

const agingLabel = computed(() => `Money owed by days since the sale: ${owed.value.buckets.map(b => `${b.label} ${kes(b.amount)}`).join('; ')}`)

// One row per model: units in the shop, out on credit, and sold.
const stock = computed(() => {
  const models = new Map<string, { model: string; brand: string; inStock: number; onCredit: number; sold: number }>()
  for (const p of dashboardStats.value.products) {
    const row = models.get(p.product_model_number)
      ?? { model: p.product_name, brand: p.product_brand, inStock: 0, onCredit: 0, sold: 0 }

    if (p.status === 'InStock')
      row.inStock += p.total
    else if (p.status === 'OnCredit')
      row.onCredit += p.total
    else if (p.status === 'Sold')
      row.sold += p.total
    models.set(p.product_model_number, row)
  }

  return [...models.values()].sort((a, b) => b.onCredit + b.inStock - (a.onCredit + a.inStock))
})

onMounted(fetchDashboardStats)
</script>

<template>
  <div class="overview">
    <div class="d-flex flex-wrap align-center gap-4 mb-8">
      <span class="text-body-1 text-medium-emphasis flex-grow-1">{{ today }}</span>
      <VBtn
        variant="outlined"
        color="default"
        prepend-icon="tabler-refresh"
        :loading="loading"
        @click="fetchDashboardStats"
      >
        Refresh
      </VBtn>
    </div>

    <section
      aria-labelledby="owed-heading"
      class="mb-10"
    >
      <h1
        id="owed-heading"
        class="headline mb-7"
      >
        <template v-if="owed.count">
          Customers owe you <b>{{ kes(owed.total) }}</b> across <b>{{ owed.count }} {{ owed.count === 1 ? 'sale' : 'sales' }}</b>.
          <template v-if="owed.quietOver60">
            {{ owed.quietOver60 }} {{ owed.quietOver60 === 1 ? 'has' : 'have' }} had no payment in over 60 days.
          </template>
        </template>
        <template v-else-if="!loading">
          Nobody owes you anything right now.
        </template>
      </h1>

      <template v-if="owed.count">
        <div
          role="img"
          :aria-label="agingLabel"
          class="aging-bar mb-4"
        >
          <div
            v-for="(bucket, i) in owed.buckets"
            v-show="bucket.amount > 0"
            :key="bucket.label"
            :style="{ flexGrow: bucket.amount, background: bucketColors[i] }"
          />
        </div>
        <div class="aging-legend">
          <div
            v-for="(bucket, i) in owed.buckets"
            :key="bucket.label"
            class="d-flex gap-2 align-baseline"
          >
            <span
              aria-hidden="true"
              class="swatch"
              :style="{ background: bucketColors[i] }"
            />
            <div>
              <div class="text-body-2 text-medium-emphasis">
                {{ bucket.label }}
              </div>
              <div class="text-body-1 font-weight-medium">
                {{ kes(bucket.amount) }}
              </div>
            </div>
          </div>
        </div>
      </template>
    </section>

    <VRow class="mb-2">
      <VCol
        cols="12"
        md="7"
      >
        <VCard
          border
          flat
          class="pa-6 h-100"
        >
          <div class="d-flex justify-space-between align-baseline gap-3 mb-1">
            <h2 class="text-h5">
              Follow up today
            </h2>
            <NuxtLink
              to="/debtors"
              class="text-primary font-weight-medium"
            >
              All debtors
            </NuxtLink>
          </div>
          <p class="text-body-1 text-medium-emphasis mb-3">
            Longest since their last payment first.
          </p>
          <div
            v-for="sale in owed.followUps"
            :key="sale.transaction_uuid"
            class="row d-flex flex-wrap align-center gap-4"
          >
            <div class="flex-grow-1">
              <div class="font-weight-medium text-body-1">
                {{ sale.debtor_name ?? 'Unknown customer' }}
              </div>
              <div class="text-body-2 text-medium-emphasis">
                {{ sale.debtor_phone }}
              </div>
            </div>
            <div class="text-end">
              <div class="font-weight-bold text-body-1">
                {{ kes(sale.balance) }}
              </div>
              <div
                class="text-body-2"
                :class="sale.quietDays > 60 ? 'text-error font-weight-medium' : 'text-medium-emphasis'"
              >
                {{ sale.quietDays }} days since {{ sale.paidBefore ? 'last payment' : 'the sale, nothing paid' }}
              </div>
            </div>
            <div class="d-flex gap-2">
              <VBtn
                v-if="sale.debtor_phone"
                :href="`tel:${sale.debtor_phone}`"
                :aria-label="`Call ${sale.debtor_name}`"
                icon="tabler-phone"
                variant="outlined"
                color="default"
              />
              <VBtn
                to="/payments"
                variant="outlined"
                color="default"
              >
                Record payment
              </VBtn>
            </div>
          </div>
          <p
            v-if="!owed.followUps.length && !loading"
            class="text-body-1 text-medium-emphasis mb-0"
          >
            No one to chase. Every sale is paid up.
          </p>
        </VCard>
      </VCol>

      <VCol
        cols="12"
        md="5"
      >
        <VCard
          border
          flat
          class="pa-6 h-100"
        >
          <h2 class="text-h5 mb-1">
            Payments to approve
          </h2>
          <p class="text-body-1 text-medium-emphasis mb-3">
            Check each one against the M-Pesa or bank statement.
          </p>
          <div
            v-for="payment in dashboardStats.pending_payments"
            :key="payment.payment_uuid"
            class="row d-flex align-center gap-3"
          >
            <div class="flex-grow-1">
              <div class="font-weight-medium text-body-1">
                {{ kes(payment.amount) }}
              </div>
              <div class="text-body-2 text-medium-emphasis">
                {{ payment.debtor_name ?? 'Unknown customer' }}, {{ payment.payment_method }} {{ payment.reference_code }}
              </div>
            </div>
            <VBtn
              v-if="canDecidePayments"
              variant="tonal"
              :disabled="loading"
              @click="decidePayment(payment.payment_uuid, 'ACCEPTED')"
            >
              Approve
            </VBtn>
          </div>
          <p
            v-if="!dashboardStats.pending_payments.length && !loading"
            class="text-body-1 text-medium-emphasis mb-0"
          >
            Nothing waiting. New payments show up here until someone approves them.
          </p>
        </VCard>
      </VCol>
    </VRow>

    <VCard
      border
      flat
      class="pa-6"
    >
      <div class="d-flex justify-space-between align-baseline gap-3 mb-4">
        <h2 class="text-h5">
          Stock
        </h2>
        <NuxtLink
          to="/product-inventory"
          class="text-primary font-weight-medium"
        >
          All devices
        </NuxtLink>
      </div>
      <VTable class="stock-table">
        <thead>
          <tr>
            <th>Model</th>
            <th class="text-end">
              In the shop
            </th>
            <th class="text-end">
              Out on credit
            </th>
            <th class="text-end">
              Sold
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="row in stock"
            :key="row.model + row.brand"
          >
            <td>
              <span class="font-weight-medium">{{ row.model }}</span>
              <span class="text-medium-emphasis ms-1">{{ row.brand }}</span>
            </td>
            <td
              class="text-end"
              :class="{ 'text-error font-weight-bold': row.inStock <= 2 }"
            >
              {{ row.inStock <= 2 ? `${row.inStock} left` : row.inStock }}
            </td>
            <td class="text-end">
              {{ row.onCredit }}
            </td>
            <td class="text-end">
              {{ row.sold }}
            </td>
          </tr>
          <tr v-if="!stock.length && !loading">
            <td
              colspan="4"
              class="text-medium-emphasis"
            >
              No devices yet. Add them under Stock, Devices.
            </td>
          </tr>
        </tbody>
      </VTable>
    </VCard>
  </div>
</template>

<style scoped>
.overview { max-width: 1120px; }

.headline {
  max-width: 24ch;
  font-size: clamp(2rem, 4.4vw, 3.5rem);
  font-weight: 400;
  line-height: 1.08;
  letter-spacing: -0.02em;
}

.headline b { font-weight: 700; }

.aging-bar {
  display: flex;
  gap: 3px;
  block-size: 18px;
  border-radius: 9px;
  overflow: hidden;
}

.aging-legend {
  display: grid;
  gap: 12px 24px;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
}

.swatch {
  flex: none;
  border-radius: 3px;
  block-size: 10px;
  inline-size: 10px;
}

.row {
  border-block-start: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  padding-block: 14px;
}

.stock-table { overflow-x: auto; }
.stock-table th { font-weight: 500 !important; }
</style>
