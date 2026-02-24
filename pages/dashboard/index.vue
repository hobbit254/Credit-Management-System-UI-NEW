<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useDashboard } from '@/composables/dashboard/useDashboard'

const { loading, dashboardStats, fetchDashboardStats } = useDashboard()

const search = ref('')

const productHeaders = [
  { title: 'Product Info', key: 'product_name', align: 'start' },
  { title: 'Model', key: 'product_model_number' },
  { title: 'Source', key: 'source_type', align: 'center' },
  { title: 'Status', key: 'status', align: 'center' },
  { title: 'Qty', key: 'total', align: 'end', sortable: true },
]

const stats = computed(() => {
  const data = dashboardStats.value
  const p = data?.products ?? []
  const t = data?.transactions ?? []
  const pay = data?.payments ?? []

  const totalT = t.reduce((a, b) => a + b.total, 0)
  const paidT = t.filter(i => i.status === 'Paid').reduce((a, b) => a + b.total, 0)

  return {
    revenue: pay.filter(i => i.status === 'ACCEPTED').reduce((a, b) => a + b.total, 0),
    inStock: p.filter(i => i.status === 'InStock').reduce((a, b) => a + b.total, 0),
    lowStockCount: p.filter(i => i.status === 'InStock' && i.total <= 2).length,
    totalTrans: totalT,
    collectionRate: totalT > 0 ? Math.ceil((paidT / totalT) * 100) : 0,
    onCreditCount: p.filter(p => p.status === 'OnCredit').length,
  }
})

onMounted(() => {
  fetchDashboardStats()
})
</script>

<template>
  <div class="dashboard-page pa-6 bg-grey-lighten-4 min-vh-100">
    <VContainer fluid>
      <VRow
        class="mb-6"
        align="center"
      >
        <VCol
          cols="12"
          md="6"
        >
          <div class="d-flex align-center">
            <VIcon
              icon="tabler-layout-dashboard"
              size="32"
              color="primary"
              class="mr-3"
            />
            <h1 class="text-h4 font-weight-black text-grey-darken-3">
              Inventory Insights
            </h1>
          </div>
        </VCol>
        <VCol
          cols="12"
          md="6"
          class="d-flex align-center justify-md-end gap-3"
        >
          <VTextField
            v-model="search"
            prepend-inner-icon="tabler-search"
            placeholder="Search models, brands..."
            variant="solo"
            flat
            hide-details
            rounded="lg"
            class="max-width-300"
          />
          <VBtn
            :loading="loading"
            color="primary"
            rounded="lg"
            icon="tabler-refresh"
            variant="tonal"
            @click="fetchDashboardStats"
          />
        </VCol>
      </VRow>

      <VRow>
        <VCol
          v-for="(card, i) in [
            { title: 'Total Revenue', value: `KES ${stats.revenue.toLocaleString()}`, icon: 'tabler-cash', color: 'primary' },
            { title: 'In Stock', value: stats.inStock, icon: 'tabler-box', color: 'success' },
            { title: 'Low Stock Alerts', value: stats.lowStockCount, icon: 'tabler-alert-triangle', color: stats.lowStockCount > 0 ? 'error' : 'grey' },
            { title: 'Collection Rate', value: `${stats.collectionRate}%`, icon: 'tabler-chart-pie', color: 'info' },
          ]"
          :key="i"
          cols="12"
          sm="6"
          lg="3"
        >
          <VCard
            border
            flat
            class="pa-4 rounded-xl shadow-card bg-white"
          >
            <div class="d-flex align-center">
              <VAvatar
                :color="card.color"
                variant="tonal"
                rounded="lg"
                size="48"
                class="mr-4"
              >
                <VIcon
                  :icon="card.icon"
                  size="24"
                />
              </VAvatar>
              <div>
                <div class="text-caption font-weight-bold text-uppercase text-medium-emphasis">
                  {{ card.title }}
                </div>
                <div class="text-h5 font-weight-black">
                  {{ card.value }}
                </div>
              </div>
            </div>
          </VCard>
        </VCol>
      </VRow>

      <VRow class="mt-4">
        <VCol
          cols="12"
          lg="9"
        >
          <VCard
            border
            flat
            class="rounded-xl overflow-hidden shadow-card"
          >
            <VDataTable
              :headers="productHeaders"
              :items="dashboardStats?.products ?? []"
              :search="search"
              :loading="loading"
              hover
            >
              <template #[`item.product_name`]="{ item }">
                <div class="d-flex align-center py-2">
                  <div class="d-flex flex-column">
                    <span class="font-weight-bold text-body-2">{{ item.product_name }}</span>
                    <span class="text-caption text-medium-emphasis">{{ item.product_brand }}</span>
                  </div>
                  <VTooltip
                    v-if="item.total <= 2 && item.status === 'InStock'"
                    text="Low Stock: Restock Soon"
                  >
                    <template #activator="{ props }">
                      <VIcon
                        v-bind="props"
                        icon="tabler-alert-circle"
                        color="error"
                        size="18"
                        class="ml-2 animate-pulse"
                      />
                    </template>
                  </VTooltip>
                </div>
              </template>

              <template #[`item.status`]="{ item }">
                <VChip
                  size="x-small"
                  class="font-weight-bold px-3"
                  :color="item.status === 'InStock' ? 'success' : item.status === 'Sold' ? 'grey' : 'warning'"
                  :variant="item.status === 'InStock' ? 'flat' : 'tonal'"
                >
                  {{ item.status }}
                </VChip>
              </template>

              <template #[`item.total`]="{ item }">
                <span
                  :class="item.total <= 2 && item.status === 'InStock' ? 'text-error font-weight-black' : 'font-weight-bold'"
                  class="text-body-1"
                >
                  {{ item.total }}
                </span>
              </template>
            </VDataTable>
          </VCard>
        </VCol>

        <VCol
          cols="12"
          lg="3"
        >
          <VCard
            border
            flat
            class="rounded-xl pa-5 bg-white mb-4 shadow-card"
          >
            <h3 class="text-subtitle-1 font-weight-bold mb-4 d-flex align-center">
              <VIcon
                icon="tabler-shield-check"
                color="success"
                class="mr-2"
              />
              Financial Risk
            </h3>
            <div class="text-center py-4">
              <div class="text-h3 font-weight-black text-warning">
                {{ stats.onCreditCount }}
              </div>
              <div class="text-caption text-medium-emphasis">
                Items currently on credit
              </div>
            </div>
            <VBtn
              block
              color="warning"
              variant="tonal"
              rounded="lg"
              class="mt-2"
              size="small"
            >
              View Credit Ledger
            </VBtn>
          </VCard>

          <VCard
            border
            flat
            class="rounded-xl pa-5 bg-white mb-4 shadow-card"
          >
            <h3 class="text-subtitle-1 font-weight-bold mb-4">
              Payment Channels
            </h3>
            <VList
              bg-color="transparent"
              density="compact"
              class="pa-0"
            >
              <VListItem
                v-for="(p, i) in (dashboardStats?.payments ?? [])"
                :key="i"
                class="px-0 mb-2"
              >
                <template #prepend>
                  <VIcon
                    :icon="p.status === 'ACCEPTED' ? 'tabler-circle-check-filled' : 'tabler-circle-x-filled'"
                    :color="p.status === 'ACCEPTED' ? 'success' : 'error'"
                    class="mr-2"
                  />
                </template>
                <VListItemTitle class="text-body-2 font-weight-bold">
                  {{ p.payment_method }}
                </VListItemTitle>
                <template #append>
                  <span class="text-body-2 font-weight-black">KES {{ p.total.toLocaleString() }}</span>
                </template>
              </VListItem>
              <div
                v-if="!dashboardStats?.payments?.length && !loading"
                class="text-caption text-center py-4 text-disabled"
              >
                No payment data available
              </div>
            </VList>
          </VCard>

          <VCard
            border
            flat
            class="rounded-xl pa-5 bg-white shadow-card"
          >
            <h3 class="text-subtitle-1 font-weight-bold mb-4">
              Top Models
            </h3>
            <div
              v-for="product in (dashboardStats?.products?.slice(0, 3) ?? [])"
              :key="product.product_model_number"
              class="mb-4"
            >
              <div class="d-flex justify-space-between text-caption font-weight-bold mb-1">
                <span>{{ product.product_model_number }}</span>
                <span>{{ product.total }} left</span>
              </div>
              <VProgressLinear
                :model-value="(product.total / 10) * 100"
                color="primary"
                height="8"
                rounded
              />
            </div>
          </VCard>
        </VCol>
      </VRow>
    </VContainer>
  </div>
</template>

<style scoped>
.shadow-card { box-shadow: 0 4px 24px -4px rgba(0,0,0,0.04) !important; }
.max-width-300 { max-width: 300px; }
.gap-3 { gap: 12px; }

@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.5; }
  100% { opacity: 1; }
}

.animate-pulse { animation: pulse 2s infinite ease-in-out; }

:deep(.v-data-table) { background: transparent !important; }

:deep(.v-data-table-header th) {
  text-transform: uppercase !important;
  font-size: 0.75rem !important;
  letter-spacing: 1px !important;
  color: #9e9e9e !important;
}
</style>
