const _fmt2 = new Intl.NumberFormat(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const _fmt0 = new Intl.NumberFormat(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })

export function useFormatters() {
  function fmt(n) { return _fmt2.format(n ?? 0) }
  function fmtShort(n) { return _fmt0.format(n ?? 0) }
  function fmtDate(d) {
    return d ? new Date(d).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) : '—'
  }
  return { fmt, fmtShort, fmtDate }
}
