/**
 * frappe-client.js
 * Backwards-compatible re-exports of the api helpers from useApi.
 * Feature modules should import from here; stores should import { api }
 * directly from '@/composables/useApi' to avoid an extra indirection.
 */
export { api, apiFetch, ApiError } from '@/composables/useApi'

// Named convenience exports kept for backwards compatibility
import { api } from '@/composables/useApi'

export const call       = (method, params)   => api.call(method, params)
export const getList    = (doctype, opts)     => api.getList(doctype, opts)
export const getDoc     = (doctype, name)     => api.getDoc(doctype, name)
export const saveDoc    = (doctype, doc)      => api.saveDoc(doctype, doc)
export const deleteDoc  = (doctype, name)     => api.deleteDoc(doctype, name)
export const submitDoc  = (doctype, name)     => api.submitDoc(doctype, name)
