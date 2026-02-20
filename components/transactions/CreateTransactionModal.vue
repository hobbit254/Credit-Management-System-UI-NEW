<script setup lang="ts">
import { ref } from 'vue'
import type { NewTransaction, ProductInventory } from '@/schemas/transactions'
import { NewTransactionSchema } from '@/schemas/transactions'
import type { Debtor } from '@/schemas/debtors'
import { useDebtor } from '@/composables/debtors/useDebtor'
import { useProductInventory } from '@/composables/product-inventory/useProductInventory'
import { useCollectors } from '@/composables/collectors/useCollectors'
import type { Collector } from '@/schemas/collectors'

const props = defineProps<{
  modelValue: boolean
  loading: boolean
  transaction: NewTransaction
}>()

const emit = defineEmits(['update:modelValue', 'update:transaction', 'confirm'])

const isOpen = computed({
  get: () => props.modelValue,
  set: value => emit('update:modelValue', value),
})

const localTransaction = ref<NewTransaction>({ ...props.transaction })

watch(() => props.transaction, newVal => {
  if (JSON.stringify(newVal) !== JSON.stringify(localTransaction.value))
    localTransaction.value = { ...newVal }
}, { deep: true })

watch(localTransaction, newVal => {
  emit('update:transaction', newVal)
}, { deep: true })

function closeModal() {
  isOpen.value = false
}

const fieldErrors = ref<Record<string, string[]>>({})

function handleConfirm() {
  const result = NewTransactionSchema.safeParse(localTransaction.value)

  if (!result.success) {
    fieldErrors.value = result.error.flatten().fieldErrors

    return
  }

  fieldErrors.value = {}
  emit('confirm', result.data)
}

// Dropdown options
const transactionTypeOptions = ['Sale', 'Credit']
const paymentMethodOptions = ['Cash', 'M-Pesa', 'Bank', 'Cheque']

// Debtors
const { fetchAllActiveDebtors } = useDebtor()
const debtors = ref<Debtor[]>([])
const loadingDebtors = ref(false)

// Collectors
const { fetchAllActiveCollectors } = useCollectors()
const collectors = ref<Collector[]>([])
const loadingCollectors = ref(false)

// Product Inventories
const { fetchAllActiveProductInventory } = useProductInventory()
const productInventories = ref<ProductInventory[]>([])
const loadingInventory = ref(false)

onMounted(async () => {
  loadingDebtors.value = true
  loadingCollectors.value = true
  loadingInventory.value = true

  try {
    const [debtorData, collectorData, inventoryData] = await Promise.all([
      fetchAllActiveDebtors(),
      fetchAllActiveCollectors(),
      fetchAllActiveProductInventory(),
    ])

    debtors.value = debtorData as unknown as Debtor[]
    collectors.value = collectorData[0] as unknown as Collector[]
    productInventories.value = inventoryData as unknown as ProductInventory[]
  }
  finally {
    loadingDebtors.value = false
    loadingCollectors.value = false
    loadingInventory.value = false
  }
})

// Runner new collector toggle
interface NewCollectorFields { full_name: string; id_number: string; phone_number: string }

const isNewRunner = ref(false)
const newRunner = ref<NewCollectorFields>({ full_name: '', id_number: '', phone_number: '' })

watch(isNewRunner, val => {
  if (val) {
    localTransaction.value.runner_id = null
    localTransaction.value.new_runner = newRunner.value
  }
  else {
    localTransaction.value.new_runner = null
    newRunner.value = { full_name: '', id_number: '', phone_number: '' }
  }
})

watch(() => localTransaction.value.transaction_type, val => {
  if (val !== 'Sale')
    localTransaction.value.reference_code = ''
  if (val === 'Credit') {
    localTransaction.value.payment_method = ''
    localTransaction.value.amount = ''
    localTransaction.value.reference_code = ''
  }
})

watch(newRunner, val => {
  if (isNewRunner.value)
    localTransaction.value.new_runner = { ...val }
}, { deep: true })

watch(() => localTransaction.value.payment_method, val => {
  if (val === 'Cash')
    localTransaction.value.reference_code = ''
})

// Transaction Items
function addItem() {
  localTransaction.value.transaction_items.push({
    product_inventory_uuid: '',
    unit_price: '',
    source_type: 'Inventory',
    status: 'OnSale',
  })
}

function removeItem(index: number) {
  localTransaction.value.transaction_items.splice(index, 1)
}

const isCredit = computed(() => localTransaction.value.transaction_type === 'Credit')
</script>

<template>
  <VDialog
    v-model="isOpen"
    max-width="800"
    scrollable
  >
    <VCard>
      <!-- Header -->
      <VCardTitle class="d-flex align-center ga-3 pa-4">
        <VAvatar
          color="primary"
          variant="tonal"
          size="40"
        >
          <VIcon>tabler-receipt</VIcon>
        </VAvatar>
        <div class="d-flex flex-column">
          <span class="text-h6 font-weight-bold">Add New Transaction</span>
          <span class="text-caption text-medium-emphasis">Fill in the transaction details below</span>
        </div>
      </VCardTitle>

      <VDivider />

      <VCardText class="pa-4">
        <VForm @submit.prevent="handleConfirm">
          <VRow dense>
            <!-- Transaction Type -->
            <VCol
              cols="12"
              md="6"
            >
              <p class="text-caption text-medium-emphasis font-weight-medium mb-1">
                TRANSACTION TYPE
              </p>
              <AppAutocomplete
                v-model="localTransaction.transaction_type"
                :items="transactionTypeOptions"
                label="Transaction Type*"
                placeholder="Select transaction type"
                :error-messages="fieldErrors.transaction_type"
              >
                <template #prepend-inner>
                  <VIcon size="18">
                    {{ localTransaction.transaction_type === 'Sale' ? 'tabler-shopping-cart' : 'tabler-credit-card' }}
                  </VIcon>
                </template>
              </AppAutocomplete>
            </VCol>

            <!-- Credit badge info -->
            <VCol
              v-if="isCredit"
              cols="12"
              md="6"
              class="d-flex align-end"
            >
              <VAlert
                color="info"
                variant="tonal"
                density="compact"
                class="w-100"
              >
                <template #prepend>
                  <VIcon color="info">
                    tabler-info-circle
                  </VIcon>
                </template>
                Credit transactions do not require payment details.
              </VAlert>
            </VCol>

            <!-- Debtor -->
            <VCol
              cols="12"
              md="6"
            >
              <p class="text-caption text-medium-emphasis font-weight-medium mb-1">
                DEBTOR
              </p>
              <AppAutocomplete
                v-model="localTransaction.debtor_id"
                :items="debtors"
                item-title="debtor_name"
                item-value="debtor_uuid"
                :loading="loadingDebtors"
                label="Debtor*"
                placeholder="Select debtor"
                :error-messages="fieldErrors.debtor_id"
              >
                <template #prepend-inner>
                  <VIcon size="18">
                    tabler-user-dollar
                  </VIcon>
                </template>
              </AppAutocomplete>
            </VCol>

            <!-- Sales Person -->
            <VCol
              cols="12"
              md="6"
            >
              <p class="text-caption text-medium-emphasis font-weight-medium mb-1">
                SALES PERSON
              </p>
              <AppAutocomplete
                v-model="localTransaction.sales_person_id"
                :items="debtors"
                item-title="debtor_name"
                item-value="debtor_uuid"
                :loading="loadingDebtors"
                label="Sales Person*"
                placeholder="Select sales person"
                :error-messages="fieldErrors.sales_person_id"
              >
                <template #prepend-inner>
                  <VIcon size="18">
                    tabler-briefcase
                  </VIcon>
                </template>
              </AppAutocomplete>
            </VCol>

            <!-- Runner -->
            <VCol cols="12">
              <div class="d-flex align-center justify-space-between mb-2">
                <p class="text-caption text-medium-emphasis font-weight-medium mb-0">
                  RUNNER
                </p>
                <VSwitch
                  v-model="isNewRunner"
                  density="compact"
                  hide-details
                  color="primary"
                  :label="isNewRunner ? 'New Runner' : 'Existing Runner'"
                />
              </div>

              <VRow dense>
                <template v-if="!isNewRunner">
                  <VCol cols="12">
                    <AppAutocomplete
                      v-model="localTransaction.runner_id"
                      :items="collectors"
                      item-title="full_name"
                      item-value="collectors_uuid"
                      :loading="loadingCollectors"
                      label="Select Runner*"
                      placeholder="Select runner"
                      :error-messages="fieldErrors.runner_id"
                    >
                      <template #prepend-inner>
                        <VIcon size="18">
                          tabler-run
                        </VIcon>
                      </template>
                    </AppAutocomplete>
                  </VCol>
                </template>

                <template v-else>
                  <VCol
                    cols="12"
                    md="4"
                  >
                    <AppTextField
                      v-model="newRunner.full_name"
                      label="Full Name*"
                      placeholder="Enter full name"
                      :error-messages="fieldErrors['new_runner.full_name']"
                    >
                      <template #prepend-inner>
                        <VIcon size="18">
                          tabler-user
                        </VIcon>
                      </template>
                    </AppTextField>
                  </VCol>
                  <VCol
                    cols="12"
                    md="4"
                  >
                    <AppTextField
                      v-model="newRunner.id_number"
                      label="ID Number*"
                      placeholder="Enter ID number"
                      :error-messages="fieldErrors['new_runner.id_number']"
                    >
                      <template #prepend-inner>
                        <VIcon size="18">
                          tabler-id
                        </VIcon>
                      </template>
                    </AppTextField>
                  </VCol>
                  <VCol
                    cols="12"
                    md="4"
                  >
                    <AppTextField
                      v-model="newRunner.phone_number"
                      label="Phone Number*"
                      placeholder="Enter phone number"
                      :error-messages="fieldErrors['new_runner.phone_number']"
                    >
                      <template #prepend-inner>
                        <VIcon size="18">
                          tabler-phone
                        </VIcon>
                      </template>
                    </AppTextField>
                  </VCol>
                </template>
              </VRow>
            </VCol>

            <!-- Payment Section — hidden for Credit -->
            <template v-if="!isCredit">
              <VCol cols="12">
                <VDivider class="mb-3">
                  <span class="text-caption text-medium-emphasis px-2">PAYMENT DETAILS</span>
                </VDivider>
              </VCol>

              <!-- Payment Method -->
              <VCol
                cols="12"
                md="6"
              >
                <p class="text-caption text-medium-emphasis font-weight-medium mb-1">
                  PAYMENT METHOD
                </p>
                <AppAutocomplete
                  v-model="localTransaction.payment_method"
                  :items="paymentMethodOptions"
                  label="Payment Method*"
                  placeholder="Select payment method"
                  :error-messages="fieldErrors.payment_method"
                >
                  <template #prepend-inner>
                    <VIcon size="18">
                      {{ localTransaction.payment_method === 'Cash' ? 'tabler-cash' : localTransaction.payment_method === 'M-Pesa' ? 'tabler-phone' : localTransaction.payment_method === 'Bank' ? 'tabler-building-bank' : 'tabler-receipt' }}
                    </VIcon>
                  </template>
                </AppAutocomplete>
              </VCol>

              <!-- Amount -->
              <VCol
                cols="12"
                md="6"
              >
                <p class="text-caption text-medium-emphasis font-weight-medium mb-1">
                  AMOUNT
                </p>
                <AppTextField
                  v-model="localTransaction.amount"
                  label="Amount*"
                  placeholder="Enter amount"
                  type="number"
                  :error-messages="fieldErrors.amount"
                >
                  <template #prepend-inner>
                    <span class="text-caption font-weight-bold text-success pt-1">KES</span>
                  </template>
                </AppTextField>
              </VCol>

              <!-- Reference Code -->
              <VCol
                v-if="localTransaction.transaction_type === 'Sale' && localTransaction.payment_method && localTransaction.payment_method !== 'Cash'"
                cols="12"
                md="6"
              >
                <p class="text-caption text-medium-emphasis font-weight-medium mb-1">
                  REFERENCE CODE
                </p>
                <AppTextField
                  v-model="localTransaction.reference_code"
                  label="Reference Code*"
                  placeholder="Enter reference code"
                  :error-messages="fieldErrors.reference_code"
                >
                  <template #prepend-inner>
                    <VIcon size="18">
                      tabler-hash
                    </VIcon>
                  </template>
                </AppTextField>
              </VCol>
            </template>

            <!-- Transaction Items -->
            <VCol cols="12">
              <VDivider class="mb-3">
                <span class="text-caption text-medium-emphasis px-2">TRANSACTION ITEMS</span>
              </VDivider>

              <div class="d-flex justify-space-between align-center mb-3">
                <p class="text-caption text-medium-emphasis font-weight-medium mb-0">
                  {{ localTransaction.transaction_items.length }} item(s) added
                </p>
                <VBtn
                  size="small"
                  color="primary"
                  variant="tonal"
                  prepend-icon="tabler-plus"
                  @click="addItem"
                >
                  Add Item
                </VBtn>
              </div>

              <VAlert
                v-if="fieldErrors.transaction_items"
                type="error"
                density="compact"
                variant="tonal"
                class="mb-3"
              >
                {{ fieldErrors.transaction_items }}
              </VAlert>

              <VAlert
                v-if="localTransaction.transaction_items.length === 0"
                type="info"
                density="compact"
                variant="tonal"
                class="mb-2"
              >
                <template #prepend>
                  <VIcon color="info">
                    tabler-package-off
                  </VIcon>
                </template>
                No items added yet. Click "Add Item" to add a transaction item.
              </VAlert>

              <VCard
                v-for="(item, index) in localTransaction.transaction_items"
                :key="index"
                variant="outlined"
                class="mb-3"
              >
                <VCardText class="pa-3">
                  <VRow dense>
                    <VCol
                      cols="12"
                      class="d-flex justify-space-between align-center pb-1"
                    >
                      <div class="d-flex align-center ga-2">
                        <VAvatar
                          size="22"
                          color="primary"
                          variant="tonal"
                        >
                          <span class="text-caption font-weight-bold">{{ index + 1 }}</span>
                        </VAvatar>
                        <span class="text-caption text-medium-emphasis font-weight-medium">Item {{ index + 1 }}</span>
                      </div>
                      <VBtn
                        size="x-small"
                        color="error"
                        variant="text"
                        icon="tabler-trash"
                        @click="removeItem(index)"
                      />
                    </VCol>

                    <!-- Product Inventory -->
                    <VCol
                      cols="12"
                      md="6"
                    >
                      <AppAutocomplete
                        v-model="item.product_inventory_uuid"
                        :items="productInventories"
                        item-title="serial_number"
                        item-value="inventory_uuid"
                        :loading="loadingInventory"
                        label="Product Inventory*"
                        placeholder="Select product inventory"
                      >
                        <template #prepend-inner>
                          <VIcon size="18">
                            tabler-package
                          </VIcon>
                        </template>
                      </AppAutocomplete>
                    </VCol>

                    <!-- Unit Price -->
                    <VCol
                      cols="12"
                      md="6"
                    >
                      <AppTextField
                        v-model="item.unit_price"
                        label="Unit Price*"
                        placeholder="Enter unit price"
                        type="number"
                      >
                        <template #prepend-inner>
                          <span class="text-caption font-weight-bold text-success pt-1">KES</span>
                        </template>
                      </AppTextField>
                    </VCol>
                  </VRow>
                </VCardText>
              </VCard>
            </VCol>
          </VRow>
        </VForm>
      </VCardText>

      <VDivider />

      <VCardActions class="pa-3">
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
          prepend-icon="tabler-check"
          :loading="props.loading"
          @click="handleConfirm"
        >
          Save Transaction
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>
