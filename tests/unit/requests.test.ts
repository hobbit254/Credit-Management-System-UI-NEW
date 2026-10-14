import { describe, expect, it } from 'vitest'
import { ref } from 'vue'
import { parsePage, withLoading } from '@/utils/requests'
import { alertState } from '@/composables/alerts/useAlert'

const meta = { total: 25, currentPage: 2, lastPage: 3 }

describe('parsePage', () => {
  it('reads the [rows, meta] tuple', () => {
    expect(parsePage({ data: [[{ id: 1 }], meta] }, 10)).toEqual({
      rows: [{ id: 1 }],
      pagination: { total: 25, perPage: 10, currentPage: 2, lastPage: 3 },
    })
  })

  it('reads the older { rows, pagination } shape', () => {
    expect(parsePage({ data: { rows: [{ id: 1 }], pagination: meta } }, 10).rows).toEqual([{ id: 1 }])
  })

  it('returns an empty list when rows are missing', () => {
    expect(parsePage({ data: [null, meta] }, 10).rows).toEqual([])
  })
})

describe('withLoading', () => {
  it('toasts non-HTTP errors but leaves HTTP errors to the API plugin', async () => {
    const loading = ref(false)

    alertState.value.visible = false
    await withLoading(loading, async () => {
      throw Object.assign(new Error('422'), { response: {} })
    })
    expect(alertState.value.visible).toBe(false)

    await withLoading(loading, async () => {
      throw new Error('boom')
    })
    expect(alertState.value.text).toBe('boom')
    expect(loading.value).toBe(false)
  })
})
