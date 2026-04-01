import frappe


@frappe.whitelist()
def get_gross_profit(from_date, to_date):
	"""
	Returns gross profit for draft + submitted Sales Invoices in the given date range.
	Gross profit = SUM((selling_rate - incoming_rate) * qty) across all line items.
	incoming_rate is pre-filled from item valuation even on drafts.
	Items with incoming_rate = 0 (services / zero-valuation) contribute full revenue.
	"""
	result = frappe.db.sql(
		"""
		SELECT
			COALESCE(SUM((sii.rate - sii.incoming_rate) * sii.qty), 0) AS gross_profit,
			COALESCE(SUM(sii.rate * sii.qty), 0)                       AS total_revenue
		FROM `tabSales Invoice Item` sii
		INNER JOIN `tabSales Invoice` si ON si.name = sii.parent
		WHERE si.docstatus IN (0, 1)
		  AND si.posting_date BETWEEN %(from_date)s AND %(to_date)s
		  AND si.is_return = 0
		""",
		{"from_date": from_date, "to_date": to_date},
		as_dict=True,
	)

	row = result[0] if result else {}
	gross_profit  = float(row.get("gross_profit")  or 0)
	total_revenue = float(row.get("total_revenue") or 0)
	margin_pct    = round((gross_profit / total_revenue * 100), 1) if total_revenue else 0

	return {
		"gross_profit": gross_profit,
		"margin_pct":   margin_pct,
	}
