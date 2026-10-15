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

// Load each time the dialog opens: the page mounts it once, so loading on mount kept
// lists from when the page opened (e.g. a unit sold a minute ago still offered).
watch(() => props.modelValue, async open => {
  if (!open)
    return
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
}, { immediate: true })

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
  <FormDialog
    v-model="isOpen"
    title="New sale"
    confirm-text="Record sale"
    :loading="props.loading"
    :width="800"
    @confirm="handleConfirm"
  >
    <VRow dense>
      <!-- Transaction Type -->
      <VCol
        cols="12"
        md="6"
      >
        <AppAutocomplete
          v-model="localTransaction.transaction_type"
          :items="transactionTypeOptions"
          label="Type*"
          placeholder="Sale (paid now) or Credit"
          :error-messages="fieldErrors.transaction_type"
        />
      </VCol>

      <!-- Credit badge info -->
      <VCol
        v-if="isCredit"
        cols="12"
        md="6"
        class="d-flex align-end"
      >
        <p class="text-body-2 text-medium-emphasis mb-0">
          Payments for a credit sale are recorded later, under Payments.
        </p>
      </VCol>

      <!-- Debtor -->
      <VCol
        cols="12"
        md="6"
      >
        <AppAutocomplete
          v-model="localTransaction.debtor_id"
          :items="debtors"
          item-title="debtor_name"
          item-value="debtor_uuid"
          :loading="loadingDebtors"
          label="Debtor*"
          placeholder="Select debtor"
          :error-messages="fieldErrors.debtor_id"
        />
      </VCol>

      <!-- Sales Person -->
      <VCol
        cols="12"
        md="6"
      >
        <AppAutocomplete
          v-model="localTransaction.sales_person_id"
          :items="debtors"
          item-title="debtor_name"
          item-value="debtor_uuid"
          :loading="loadingDebtors"
          label="Sales Person*"
          placeholder="Select sales person"
          :error-messages="fieldErrors.sales_person_id"
        />
      </VCol>

      <!-- Runner -->
      <VCol cols="12">
        <div class="d-flex align-center justify-space-between mb-2">
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
              />
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
              />
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
              />
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
              />
            </VCol>
          </template>
        </VRow>
      </VCol>

      <!-- Payment Section — hidden for Credit -->
      <template v-if="!isCredit">
        <VCol cols="12">
          <h3 class="text-h6 mt-2">
            Payment
          </h3>
        </VCol>

        <!-- Payment Method -->
        <VCol
          cols="12"
          md="6"
        >
          <AppAutocomplete
            v-model="localTransaction.payment_method"
            :items="paymentMethodOptions"
            label="Payment Method*"
            placeholder="Select payment method"
            :error-messages="fieldErrors.payment_method"
          />
        </VCol>

        <!-- Amount -->
        <VCol
          cols="12"
          md="6"
        >
          <AppTextField
            v-model="localTransaction.amount"
            label="Amount*"
            placeholder="Enter amount"
            type="number"
            :error-messages="fieldErrors.amount"
            prefix="KES"
          />
        </VCol>

        <!-- Reference Code -->
        <VCol
          v-if="localTransaction.transaction_type === 'Sale' && localTransaction.payment_method && localTransaction.payment_method !== 'Cash'"
          cols="12"
          md="6"
        >
          <AppTextField
            v-model="localTransaction.reference_code"
            label="Reference Code*"
            placeholder="Enter reference code"
            :error-messages="fieldErrors.reference_code"
          />
        </VCol>
      </template>

      <!-- Transaction Items -->
      <VCol cols="12">
        <div class="d-flex justify-space-between align-center mt-2 mb-3">
          <h3 class="text-h6">
            Devices
          </h3>
          <VBtn
            variant="outlined"
            color="default"
            prepend-icon="tabler-plus"
            @click="addItem"
          >
            Add device
          </VBtn>
        </div>

        <p
          v-if="fieldErrors.transaction_items"
          class="text-body-2 text-error mb-3"
        >
          {{ fieldErrors.transaction_items.join(' ') }}
        </p>

        <p
          v-if="localTransaction.transaction_items.length === 0"
          class="text-body-2 text-medium-emphasis mb-3"
        >
          No devices yet. Add each device being sold.
        </p>

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
                  <span class="text-body-2 text-medium-emphasis">Device {{ index + 1 }}</span>
                </div>
                <VBtn
                  aria-label="Remove this device"
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
                  label="Device (serial number)*"
                  placeholder="Search by serial number"
                />
              </VCol>

              <!-- Unit Price -->
              <VCol
                cols="12"
                md="6"
              >
                <AppTextField
                  v-model="item.unit_price"
                  label="Price*"
                  placeholder="0"
                  type="number"
                  prefix="KES"
                />
              </VCol>
            </VRow>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>
  </FormDialog>
</template>
