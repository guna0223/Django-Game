from django.db.models.signals import post_save
from django.dispatch import receiver
from django.core.mail import EmailMessage
from django.conf import settings

from .models import Order
from .utils import generate_invoice_pdf


@receiver(post_save, sender=Order)
def order_success_notification(sender, instance, created, **kwargs):

    if instance.status == "COMPLETED":
        pdf_buffer = generate_invoice_pdf(instance)

        email = EmailMessage(
            subject=f"Order Confirmed & Invoice – #{instance.id}",
            body=f"""
Hi {instance.user.username},

🎉 Your order has been successfully completed!

Please find your invoice attached as a PDF.

Thank you for shopping with PlayZoneX ❤️
""",
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[instance.user.email],
        )

        email.attach(
            f"invoice_order_{instance.id}.pdf",
            pdf_buffer.read(),
            "application/pdf"
        )

        email.send(fail_silently=False)
