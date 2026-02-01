<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ value: string | null }>()

const formattedDate = computed(() => {
  if (!props.value)
    return '' // return empty string if null

  return new Date(props.value).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
})
</script>

<template>
  {{ formattedDate }}
</template>
