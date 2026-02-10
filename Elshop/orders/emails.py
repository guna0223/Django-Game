from django.core.mail import EmailMessage
from django.conf import settings

class OrderSuccessEmail:
    def __init__(self, order):
        self.order = order

    def send(self):
        email = EmailMessage(
            subject=f"Order Confirmed - #{self.order.id}",
            body=f"Your order total is ₹{self.order.total_amount}",
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[self.order.user.email]
        )
        email.send()
