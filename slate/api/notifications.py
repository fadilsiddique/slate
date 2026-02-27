import frappe


@frappe.whitelist()
def get_unread_count():
	return frappe.db.count(
		"Notification Log",
		{"for_user": frappe.session.user, "read": 0},
	)


@frappe.whitelist()
def mark_all_read():
	frappe.db.set_value(
		"Notification Log",
		{"for_user": frappe.session.user, "read": 0},
		"read",
		1,
		update_modified=False,
	)


@frappe.whitelist()
def are_push_notifications_enabled():
	try:
		return frappe.db.get_single_value(
			"Push Notification Settings", "enable_push_notification_relay"
		)
	except frappe.DoesNotExistError:
		return False


def send_push_for_notification_log(doc, method):
	"""Hook: Notification Log.after_insert → send FCM push to the recipient."""
	try:
		from frappe.push_notification import PushNotification

		pn = PushNotification("slate")
		if not pn.is_enabled():
			return

		link = frappe.utils.get_url() + "/slate/"
		icon = frappe.utils.get_url() + "/assets/slate/frontend/icons/icon-192.png"

		pn.send_notification_to_user(
			doc.for_user,
			title=doc.subject,
			body=doc.email_content or doc.subject,
			link=link,
			icon=icon,
		)
	except ImportError:
		# push_notification module not available in this Frappe version
		pass
	except Exception:
		frappe.log_error(frappe.get_traceback(), "Slate push notification error")
