from django.db.models.signals import post_save
from django.dispatch import receiver
from django.core.mail import send_mail
from django.conf import settings
from .models import Order

@receiver(post_save, sender=Order)
def order_success_notification(sender, instance, **kwargs):
    if instance.status == "COMPLETED":

        lines = []
        for item in instance.order_details.all():
            subtotal = item.price * item.quantity
            lines.append(
                f"{item.order_item.title} × {item.quantity} = ₹{subtotal:.2f}"
            )

        product_details = "\n".join(lines)

        send_mail(
            subject=f"Order Confirmed - #{instance.id}",
            message=f"""
Hi {instance.user.username},

🎉 Your order has been placed successfully!

🛒 Order Items:
{product_details}

------------------------
💰 Total Amount: ₹{instance.total_amount:.2f}
------------------------

Thank you for shopping with us ❤️
""",
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[instance.user.email],
            fail_silently=False,
        )
