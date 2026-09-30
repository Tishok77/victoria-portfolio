"""Email notification about a new lead, sent from the backend over SMTP.

With EMAIL_ENABLED=false (the default, for local development) nothing is sent:
the lead is stored and marked notification_status='skipped'.
"""
import logging
import smtplib
import ssl
from email.message import EmailMessage
from zoneinfo import ZoneInfo

from ..config import Settings, settings
from ..repositories import leads as leads_repo
from ..repositories.leads import Lead

log = logging.getLogger("victoria.notifications")

SUBJECT = "Новая заявка с сайта Victoria Mylnikova"


def build_message(lead: Lead, config: Settings) -> EmailMessage:
    local_time = lead.created_at.astimezone(ZoneInfo(config.timezone))
    body = "\n".join([
        "Новая заявка с сайта.",
        "",
        f"Имя: {lead.name}",
        f"Телефон: {lead.phone}",
        f"Дата и время: {local_time:%d.%m.%Y %H:%M} ({config.timezone})",
        f"ID заявки: {lead.id}",
        "",
        "Сообщение:",
        lead.message,
    ])
    message = EmailMessage()
    message["Subject"] = f"{SUBJECT} (№{lead.id})"
    message["From"] = config.lead_email_from
    message["To"] = config.lead_email_to
    message.set_content(body)
    return message


def _send(message: EmailMessage, config: Settings) -> None:
    context = ssl.create_default_context()
    if config.smtp_security == "ssl":
        client = smtplib.SMTP_SSL(config.smtp_host, config.smtp_port, timeout=20, context=context)
    else:
        client = smtplib.SMTP(config.smtp_host, config.smtp_port, timeout=20)
    with client:
        if config.smtp_security == "starttls":
            client.starttls(context=context)
        if config.smtp_user:
            client.login(config.smtp_user, config.smtp_password)
        client.send_message(message)


def notify_new_lead(lead: Lead, config: Settings = settings) -> str:
    """Runs after the response is sent; never raises. Returns the stored status."""
    if not config.email_enabled:
        status = "skipped"
        log.info("lead %s saved; email disabled (EMAIL_ENABLED=false), nothing sent", lead.id)
    elif not config.smtp_configured:
        status = "failed"
        log.error("lead %s saved; email enabled but SMTP settings are incomplete", lead.id)
    else:
        try:
            _send(build_message(lead, config), config)
            status = "sent"
            log.info("lead %s saved; notification sent", lead.id)
        except Exception as error:  # SMTP/network errors must not lose the lead
            status = "failed"
            # Log the error type only: SMTP errors can echo server responses and credentials.
            log.error("lead %s saved; notification failed: %s", lead.id, type(error).__name__)
    try:
        leads_repo.set_notification_status(lead.id, status)
    except Exception:
        log.exception("lead %s: could not store notification status", lead.id)
    return status
