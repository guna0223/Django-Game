from django.urls import path
from .api_views import CreateRazorpayOrderView, VerifyRazorpayPaymentView

urlpatterns = [
    path('payment/create-order/', CreateRazorpayOrderView.as_view(), name='api_create_razorpay_order'),
    path('payment/verify/', VerifyRazorpayPaymentView.as_view(), name='api_verify_razorpay_payment'),
]
