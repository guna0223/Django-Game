import logging
import razorpay
from django.conf import settings
from django.shortcuts import get_object_or_404
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .models import Payment, PaymentAttempt
from orders.models import Order
from .serializers import (
    CreateRazorpayOrderInputSerializer,
    CreateRazorpayOrderOutputSerializer,
    VerifyRazorpayPaymentInputSerializer,
    VerifyRazorpayPaymentOutputSerializer,
)

logger = logging.getLogger(__name__)

client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))


class CreateRazorpayOrderView(APIView):
    """
    POST /api/payment/create-order/
    Accepts: { "order_id": <int> }
    Returns: { razorpay_order_id, amount, currency, razorpay_key_id }
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = CreateRazorpayOrderInputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        order_id = serializer.validated_data['order_id']

        order = get_object_or_404(Order, id=order_id, user=request.user)

        if not order.address:
            return Response(
                {"error": "Please select a delivery address before proceeding to payment."},
                status=status.HTTP_400_BAD_REQUEST
            )

        razorpay_order_data = {
            "amount": int(order.total_amount * 100),
            "currency": "INR",
            "receipt": f"order_rcpt_{order.id}",
            "payment_capture": 1,
        }
        razorpay_order = client.order.create(data=razorpay_order_data)

        Payment.objects.update_or_create(
            order=order,
            defaults={
                "razorpay_order_id": razorpay_order["id"],
                "status": "PENDING",
            }
        )

        output_serializer = CreateRazorpayOrderOutputSerializer({
            "razorpay_order_id": razorpay_order["id"],
            "amount": razorpay_order_data["amount"],
            "currency": razorpay_order_data["currency"],
            "razorpay_key_id": settings.RAZORPAY_KEY_ID,
        })

        return Response(output_serializer.data, status=status.HTTP_200_OK)


class VerifyRazorpayPaymentView(APIView):
    """
    POST /api/payment/verify/
    Accepts: { razorpay_payment_id, razorpay_order_id, razorpay_signature }
    Returns: { success, message, order_id }
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = VerifyRazorpayPaymentInputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        razorpay_payment_id = serializer.validated_data['razorpay_payment_id']
        razorpay_order_id = serializer.validated_data['razorpay_order_id']
        razorpay_signature = serializer.validated_data['razorpay_signature']

        try:
            client.utility.verify_payment_signature({
                "razorpay_order_id": razorpay_order_id,
                "razorpay_payment_id": razorpay_payment_id,
                "razorpay_signature": razorpay_signature,
            })

            payment = get_object_or_404(Payment, razorpay_order_id=razorpay_order_id)
            order = payment.order

            # Ensure the authenticated user owns this order
            if order.user != request.user:
                return Response(
                    {"error": "You do not have permission to verify this payment."},
                    status=status.HTTP_403_FORBIDDEN
                )

            PaymentAttempt.objects.get_or_create(
                payment=payment,
                razorpay_payment_id=razorpay_payment_id,
                defaults={
                    "razorpay_signature": razorpay_signature,
                    "status": "SUCCESS",
                }
            )

            payment.status = "COMPLETED"
            payment.save()
            order.status = "COMPLETED"
            order.save()

            output_serializer = VerifyRazorpayPaymentOutputSerializer({
                "success": True,
                "message": "Payment verified successfully.",
                "order_id": order.id,
            })

            return Response(output_serializer.data, status=status.HTTP_200_OK)

        except razorpay.errors.SignatureVerificationError:
            try:
                payment = Payment.objects.get(razorpay_order_id=razorpay_order_id)
                PaymentAttempt.objects.get_or_create(
                    payment=payment,
                    razorpay_payment_id=razorpay_payment_id,
                    defaults={
                        "razorpay_signature": razorpay_signature,
                        "status": "FAILED",
                        "failure_reason": "Signature verification failed",
                    }
                )
                payment.status = "FAILED"
                payment.save()
            except Payment.DoesNotExist:
                pass

            return Response(
                {"error": "Payment verification failed. Invalid signature."},
                status=status.HTTP_400_BAD_REQUEST
            )

        except Exception as e:
            logger.error(f"VerifyRazorpayPaymentView error: {e}", exc_info=True)
            return Response(
                {"error": f"Something went wrong: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST
            )
