/**
 * defaults.js — Pinia store for ERPNext system defaults
 *
 * Fetches company, currency, and selling price list from frappe.client.get_default.
 * Cached for 30 minutes. Used by the Quotation form and other features that need
 * these values without hardcoding them.
 */

import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api } from '@/composables/useApi'

const DEFAULTS_TTL = 30 * 60 * 1000  // 30 min

const isFresh = (ts) => ts > 0 && (Date.now() - ts) < DEFAULTS_TTL

export const useDefaultsStore = defineStore('defaults', () => {
  const company          = ref('')
  const currency         = ref('AED')
  const sellingPriceList = ref('')
  const _ts              = ref(0)

  async function fetchDefaults(force = false) {
    if (!force && isFresh(_ts.value)) return

    const [compRes, currRes, plRes] = await Promise.allSettled([
      api.call('frappe.client.get_default', { key: 'Company' }),
      api.call('frappe.client.get_default', { key: 'Currency' }),
      api.call('frappe.client.get_default', { key: 'selling_price_list' }),
    ])

    if (compRes.status === 'fulfilled' && compRes.value) company.value          = compRes.value
    if (currRes.status === 'fulfilled' && currRes.value) currency.value         = currRes.value
    if (plRes.status  === 'fulfilled' && plRes.value)   sellingPriceList.value = plRes.value

    _ts.value = Date.now()
  }

  return { company, currency, sellingPriceList, fetchDefaults }
})
