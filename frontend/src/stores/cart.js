import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useCartStore = defineStore('cart', () => {
  /** @type {import('vue').Ref<Array<{item_code: string, item_name: string, qty: number, rate: number, uom: string}>>} */
  const items = ref([])
  const customer = ref(null)
  const currency = ref('USD')
  const priceList = ref('Standard Selling')

  const itemCount = computed(() =>
    items.value.reduce((sum, i) => sum + i.qty, 0),
  )

  const subtotal = computed(() =>
    items.value.reduce((sum, i) => sum + i.qty * i.rate, 0),
  )

  const isEmpty = computed(() => items.value.length === 0)

  function addItem(item) {
    const addQty = item.qty ?? 1
    const existing = items.value.find((i) => i.item_code === item.item_code)
    if (existing) {
      existing.qty += addQty
    } else {
      items.value.push({ ...item, qty: addQty })
    }
  }

  function removeItem(itemCode) {
    items.value = items.value.filter((i) => i.item_code !== itemCode)
  }

  function updateQty(itemCode, qty) {
    const item = items.value.find((i) => i.item_code === itemCode)
    if (!item) return
    if (qty <= 0) {
      removeItem(itemCode)
    } else {
      item.qty = qty
    }
  }

  function updateRate(itemCode, rate) {
    const item = items.value.find((i) => i.item_code === itemCode)
    if (item) item.rate = rate
  }

  function clearCart() {
    items.value = []
    customer.value = null
  }

  /** Serialize cart to a Frappe Sales Order document payload */
  function toSalesOrderDoc() {
    return {
      doctype: 'Sales Order',
      customer: customer.value,
      currency: currency.value,
      selling_price_list: priceList.value,
      items: items.value.map((i) => ({
        item_code: i.item_code,
        qty: i.qty,
        rate: i.rate,
        uom: i.uom || 'Nos',
      })),
    }
  }

  return {
    items,
    customer,
    currency,
    priceList,
    itemCount,
    subtotal,
    isEmpty,
    addItem,
    removeItem,
    updateQty,
    updateRate,
    clearCart,
    toSalesOrderDoc,
  }
})
