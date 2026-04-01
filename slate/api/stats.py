import frappe
from datetime import date, timedelta


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


@frappe.whitelist()
def get_weekly_sales():
	"""
	Returns daily sales totals (draft + submitted) for Mon–Sun of the current week.
	Always returns 7 entries, one per day, with 0 for days with no invoices.
	"""
	today = date.today()
	# Monday of current week
	monday = today - timedelta(days=today.weekday())

	rows = frappe.db.sql(
		"""
		SELECT posting_date, COALESCE(SUM(grand_total), 0) AS daily_total
		FROM `tabSales Invoice`
		WHERE docstatus != 2
		  AND posting_date BETWEEN %(monday)s AND %(sunday)s
		GROUP BY posting_date
		""",
		{"monday": monday, "sunday": monday + timedelta(days=6)},
		as_dict=True,
	)

	# Index results by date string for O(1) lookup
	by_date = {str(r.posting_date): float(r.daily_total) for r in rows}

	return [
		{
			"date":  str(monday + timedelta(days=i)),
			"total": by_date.get(str(monday + timedelta(days=i)), 0.0),
		}
		for i in range(7)
	]
