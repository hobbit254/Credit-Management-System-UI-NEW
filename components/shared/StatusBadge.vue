<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ active: number | string | boolean }>()

const isActive = computed(() => props.active === 1 || props.active === '1' || props.active === true)
</script>

<template>
  <VChip
    :color="isActive ? 'success' : 'error'"
    class="text-black text-capitalize"
    density="compact"
  >
    {{ isActive ? 'Active' : 'Inactive' }}
  </VChip>
</template>
