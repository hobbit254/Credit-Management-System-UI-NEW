<script setup lang="ts">
import type { NuxtError } from 'nuxt/app'

defineOptions({
  inheritAttrs: false,
})

const props = defineProps<{
  error: NuxtError
}>()

const isDev = import.meta.dev

const errToShow = computed(() => {
  const is404 = props.error?.statusCode === 404 || props.error.message?.includes('404')

  if (is404)
    return { title: 'Page not found', description: 'This address doesn\'t match any page. Check it, or go back to your start page.' }

  if (props.error?.statusCode === 403)
    return { title: 'You can\'t open this page', description: props.error.statusMessage || 'Your role doesn\'t allow it. Ask an administrator if you need access.' }

  if (isDev)
    return { title: props.error?.statusMessage || 'Error', description: props.error.message }

  return { title: 'Something went wrong', description: 'Reload the page. If it keeps happening, tell an administrator what you were doing.' }
})

const handleError = () => clearError({ redirect: '/' })
</script>

<template>
  <NuxtLayout name="blank">
    <BrandShell>
      <p
        v-if="error.statusCode"
        class="text-body-1 text-medium-emphasis mb-1"
      >
        Error {{ error.statusCode }}
      </p>
      <h1 class="text-h3 mb-2">
        {{ errToShow.title }}
      </h1>
      <p class="text-body-1 mb-6">
        {{ errToShow.description }}
      </p>
      <VBtn
        block
        size="large"
        @click="handleError"
      >
        Go to your start page
      </VBtn>

      <!-- eslint-disable vue/no-v-html -->
      <div
        v-if="isDev"
        class="mt-6"
        style="overflow-x: auto;"
        v-html="error.stack"
      />
      <!-- eslint-enable -->
    </BrandShell>
  </NuxtLayout>
</template>
