<template>
  <div class="flex flex-col min-h-full bg-surface">

    <!-- ── Loading (edit mode pre-fill) ──────────────────────────────────── -->
    <template v-if="loadingEdit">
      <div class="flex items-center gap-3 px-4 pt-4 pb-3 bg-white border-b border-muted/20">
        <div class="w-8 h-8 rounded-xl bg-muted/20 animate-pulse" />
        <div class="w-36 h-5 bg-surface rounded animate-pulse" />
      </div>
      <div class="px-4 py-4 space-y-5">
        <div v-for="n in 5" :key="n" class="h-14 bg-white rounded-2xl animate-pulse border border-muted/20" />
      </div>
    </template>

    <template v-else>

      <!-- ── Header ──────────────────────────────────────────────────────── -->
      <header class="bg-white sticky top-0 z-10 border-b border-muted/20 shadow-sm flex items-center gap-3 px-4 py-4">
        <button
          class="w-8 h-8 rounded-xl border border-muted/30 flex items-center justify-center shrink-0"
          @click="router.back()"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-gray-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>
        <h1 class="text-lg font-bold text-gray-900">{{ pageTitle }}</h1>
      </header>

      <!-- ── Error banner ────────────────────────────────────────────────── -->
      <div
        v-if="saveError"
        class="mx-4 mt-3 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 font-medium"
      >
        {{ saveError }}
      </div>

      <!-- ── Form ────────────────────────────────────────────────────────── -->
      <div class="px-4 py-4 pb-36 space-y-5">

        <!-- Customer Name (required) -->
        <div>
          <label class="block text-xs font-semibold text-gray-600 mb-1.5" for="customer_name">
            Customer Name <span class="text-red-400">*</span>
          </label>
          <input
            id="customer_name"
            v-model="customer_name"
            type="text"
            placeholder="Full name or company name"
            autocomplete="name"
            class="w-full px-4 py-3 text-sm bg-white rounded-xl border transition focus:outline-none"
            :class="submitted && v.customer_name
              ? 'border-red-400 ring-1 ring-red-400'
              : 'border-muted/40 focus:border-primary focus:ring-1 focus:ring-primary'"
          />
          <p v-if="submitted && v.customer_name" class="mt-1 text-xs text-red-500">
            Customer name is required
          </p>
        </div>

        <!-- Customer Type (segmented control, required) -->
        <div>
          <label class="block text-xs font-semibold text-gray-600 mb-1.5">
            Type <span class="text-red-400">*</span>
          </label>
          <div class="flex bg-surface rounded-xl p-1">
            <button
              v-for="type in ['Individual', 'Company']"
              :key="type"
              type="button"
              class="flex-1 py-2 rounded-lg text-sm font-semibold transition-colors"
              :class="customer_type === type ? 'bg-white text-primary shadow-sm' : 'text-muted'"
              @click="customer_type = type"
            >{{ type }}</button>
          </div>
        </div>

        <!-- Customer Group (select, required) -->
        <div>
          <label class="block text-xs font-semibold text-gray-600 mb-1.5" for="customer_group">
            Customer Group <span class="text-red-400">*</span>
          </label>
          <div class="relative">
            <select
              id="customer_group"
              v-model="customer_group"
              class="w-full px-4 py-3 text-sm bg-white rounded-xl border appearance-none transition focus:outline-none pr-9"
              :class="submitted && v.customer_group
                ? 'border-red-400 ring-1 ring-red-400'
                : 'border-muted/40 focus:border-primary focus:ring-1 focus:ring-primary'"
            >
              <option value="" disabled>Select a group</option>
              <option v-for="g in customerStore.customerGroups" :key="g" :value="g">{{ g }}</option>
            </select>
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-muted absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </div>
          <p v-if="submitted && v.customer_group" class="mt-1 text-xs text-red-500">
            Customer group is required
          </p>
        </div>

        <!-- Territory (select, required) -->
        <div>
          <label class="block text-xs font-semibold text-gray-600 mb-1.5" for="territory">
            Territory <span class="text-red-400">*</span>
          </label>
          <div class="relative">
            <select
              id="territory"
              v-model="territory"
              class="w-full px-4 py-3 text-sm bg-white rounded-xl border appearance-none transition focus:outline-none pr-9"
              :class="submitted && v.territory
                ? 'border-red-400 ring-1 ring-red-400'
                : 'border-muted/40 focus:border-primary focus:ring-1 focus:ring-primary'"
            >
              <option value="" disabled>Select a territory</option>
              <option v-for="t in customerStore.territories" :key="t" :value="t">{{ t }}</option>
            </select>
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-muted absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </div>
          <p v-if="submitted && v.territory" class="mt-1 text-xs text-red-500">
            Territory is required
          </p>
        </div>

        <!-- Mobile Number (optional) -->
        <div>
          <label class="block text-xs font-semibold text-gray-600 mb-1.5" for="mobile_no">
            Mobile Number
          </label>
          <input
            id="mobile_no"
            v-model="mobile_no"
            type="tel"
            placeholder="+971 50 000 0000"
            autocomplete="tel"
            class="w-full px-4 py-3 text-sm bg-white rounded-xl border border-muted/40 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition"
          />
        </div>

        <!-- Email (optional) -->
        <div>
          <label class="block text-xs font-semibold text-gray-600 mb-1.5" for="email_id">
            Email Address
          </label>
          <input
            id="email_id"
            v-model="email_id"
            type="email"
            placeholder="name@example.com"
            autocomplete="email"
            class="w-full px-4 py-3 text-sm bg-white rounded-xl border border-muted/40 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition"
          />
        </div>

        <!-- Tax ID (optional) -->
        <div>
          <label class="block text-xs font-semibold text-gray-600 mb-1.5" for="tax_id">
            Tax ID / VAT Number
          </label>
          <input
            id="tax_id"
            v-model="tax_id"
            type="text"
            placeholder="TRN-XXXXXXXXXXXX"
            class="w-full px-4 py-3 text-sm bg-white rounded-xl border border-muted/40 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition"
          />
        </div>

        <!-- ── Address sub-section (collapsible) ──────────────────────────── -->
        <div class="border border-muted/30 rounded-2xl overflow-hidden">
          <!-- Toggle header -->
          <button
            type="button"
            class="w-full flex items-center justify-between px-4 py-3 bg-white text-left"
            @click="showAddress = !showAddress"
          >
            <span class="text-sm font-semibold text-gray-700">
              {{ showAddress ? 'Address' : 'Add Address' }}
            </span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="w-4 h-4 text-muted transition-transform duration-200"
              :class="showAddress ? 'rotate-180' : ''"
              viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
            >
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </button>

          <!-- Address fields -->
          <div v-if="showAddress" class="px-4 pb-4 pt-2 bg-white border-t border-muted/20 space-y-3">
            <input
              v-model="addr_line1"
              type="text"
              placeholder="Street address"
              class="w-full px-4 py-3 text-sm bg-surface rounded-xl border border-muted/40 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition"
            />
            <input
              v-model="addr_city"
              type="text"
              placeholder="City"
              class="w-full px-4 py-3 text-sm bg-surface rounded-xl border border-muted/40 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition"
            />
            <input
              v-model="addr_state"
              type="text"
              placeholder="State / Emirate"
              class="w-full px-4 py-3 text-sm bg-surface rounded-xl border border-muted/40 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition"
            />
            <input
              v-model="addr_country"
              type="text"
              placeholder="Country"
              class="w-full px-4 py-3 text-sm bg-surface rounded-xl border border-muted/40 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition"
            />
          </div>
        </div>

      </div>

      <!-- ── Sticky save button ──────────────────────────────────────────── -->
      <ActionFooter>
        <button
          type="button"
          class="w-full bg-primary text-white rounded-xl py-3 font-semibold text-sm flex items-center justify-center gap-2 active:scale-[.97] transition-transform"
          :class="saving ? 'opacity-70 pointer-events-none' : ''"
          :disabled="saving"
          @click="handleSave"
        >
          <svg
            v-if="saving"
            class="w-4 h-4 animate-spin"
            xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
          >
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
          </svg>
          {{ saving ? 'Saving…' : (isEdit ? 'Save Changes' : 'Create Customer') }}
        </button>
      </ActionFooter>

    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCustomerStore } from '@/stores/customers'
import { api } from '@/composables/useApi'
import ActionFooter from '@/components/shared/ActionFooter.vue'

const route         = useRoute()
const router        = useRouter()
const customerStore = useCustomerStore()

// ── Mode detection ─────────────────────────────────────────────────────────────
const isEdit       = route.name === 'CustomerEdit'
const customerName = isEdit ? route.params.name : null

// ── Form fields ───────────────────────────────────────────────────────────────
const customer_name  = ref('')
const customer_type  = ref('Individual')
const customer_group = ref('')
const territory      = ref('')
const mobile_no      = ref('')
const email_id       = ref('')
const tax_id         = ref('')

// ── Address sub-section ───────────────────────────────────────────────────────
const showAddress  = ref(false)
const addr_line1   = ref('')
const addr_city    = ref('')
const addr_state   = ref('')
const addr_country = ref('')

// ── UI state ──────────────────────────────────────────────────────────────────
const saving      = ref(false)
const loadingEdit = ref(isEdit)   // shows skeleton while pre-filling in edit mode
const saveError   = ref(null)
const submitted   = ref(false)    // enables validation display after first submit attempt

// ── Validation ────────────────────────────────────────────────────────────────
const v = computed(() => ({
  customer_name:  customer_name.value.trim() === '',
  customer_group: customer_group.value === '',
  territory:      territory.value === '',
}))

const isValid = computed(() => !Object.values(v.value).some(Boolean))

// ── Page title ────────────────────────────────────────────────────────────────
const pageTitle = computed(() => isEdit ? 'Edit Customer' : 'New Customer')

// ── onMounted ─────────────────────────────────────────────────────────────────
onMounted(async () => {
  // Always load filter options for the selects
  customerStore.fetchFilterOptions().catch(() => {})

  if (!isEdit) return

  // Pre-fill form from existing customer data
  try {
    const doc = await customerStore.fetchCustomerDetail(customerName)
    customer_name.value  = doc.customer_name  ?? ''
    customer_type.value  = doc.customer_type  ?? 'Individual'
    customer_group.value = doc.customer_group ?? ''
    territory.value      = doc.territory      ?? ''
    mobile_no.value      = doc.mobile_no      ?? ''
    email_id.value       = doc.email_id       ?? ''
    tax_id.value         = doc.tax_id         ?? ''

    // Pre-fill address if one exists
    const addr = doc.addrList?.[0]
    if (addr) {
      showAddress.value  = true
      addr_line1.value   = addr.address_line1 ?? ''
      addr_city.value    = addr.city          ?? ''
      addr_state.value   = addr.state         ?? ''
      addr_country.value = addr.country       ?? ''
    }
  } catch (e) {
    saveError.value = e?.message ?? 'Failed to load customer data'
  } finally {
    loadingEdit.value = false
  }
})

// ── Save ──────────────────────────────────────────────────────────────────────
async function handleSave() {
  submitted.value = true
  if (!isValid.value) return

  saving.value    = true
  saveError.value = null

  try {
    // Build Customer document payload
    const doc = {
      ...(isEdit ? { name: customerName } : {}),
      customer_name:  customer_name.value.trim(),
      customer_type:  customer_type.value,
      customer_group: customer_group.value,
      territory:      territory.value,
      ...(mobile_no.value.trim() ? { mobile_no:  mobile_no.value.trim()  } : {}),
      ...(email_id.value.trim()  ? { email_id:   email_id.value.trim()   } : {}),
      ...(tax_id.value.trim()    ? { tax_id:      tax_id.value.trim()     } : {}),
    }

    const saved     = await customerStore.saveCustomer(doc)
    const savedName = saved?.name ?? customerName

    // Save address if any field is filled
    const hasAddressData = [addr_line1.value, addr_city.value, addr_state.value, addr_country.value]
      .some((f) => f.trim() !== '')

    if (showAddress.value && hasAddressData) {
      await api.saveDoc('Address', {
        address_title: customer_name.value.trim(),
        address_type:  'Billing',
        address_line1: addr_line1.value.trim()   || undefined,
        city:          addr_city.value.trim()    || undefined,
        state:         addr_state.value.trim()   || undefined,
        country:       addr_country.value.trim() || 'United Arab Emirates',
        links: [
          { link_doctype: 'Customer', link_name: savedName },
        ],
      })
    }

    router.push({ name: 'CustomerDetail', params: { name: savedName } })
  } catch (e) {
    saveError.value = e?.message ?? 'Failed to save customer'
  } finally {
    saving.value = false
  }
}
</script>
