import razorpay
from django.conf import settings
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt
from .models import Payment, PaymentAttempt
from orders.models import Order, Address

client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))


@login_required
def create_razorpay_order(request, order_id):
    order = get_object_or_404(Order, id=order_id, user=request.user)

    if not order.address:
        return redirect('select_address_for_order', order_id=order.id)

    razorpay_order_data = {
        "amount": int(order.total_amount * 100),
        "currency": "INR",
        "receipt": f"order_rcpt_{order.id}",
        "payment_capture": 1,
    }
    razorpay_order = client.order.create(data=razorpay_order_data)

    # update_or_create prevents duplicate Payment records
    payment, created = Payment.objects.update_or_create(
        order=order,
        defaults={
            "razorpay_order_id": razorpay_order["id"],
            "status": "PENDING",
        }
    )

    context = {
        "order": order,
        "razorpay_order": razorpay_order,
        "key_id": settings.RAZORPAY_KEY_ID,
    }
    return render(request, "payments/checkout.html", context)


@csrf_exempt
def payment_success(request):
    if request.method != "POST":
        return redirect('home_page')

    razorpay_order_id  = request.POST.get("razorpay_order_id")
    razorpay_payment_id = request.POST.get("razorpay_payment_id")
    razorpay_signature  = request.POST.get("razorpay_signature")

    if not all([razorpay_order_id, razorpay_payment_id, razorpay_signature]):
        return render(request, "payments/failure.html", {
            "error": "Incomplete payment response received."
        })

    try:
        # 1. Verify signature
        client.utility.verify_payment_signature({
            "razorpay_order_id": razorpay_order_id,
            "razorpay_payment_id": razorpay_payment_id,
            "razorpay_signature": razorpay_signature,
        })

        # 2. Fetch payment — 404 if not found
        payment = get_object_or_404(Payment, razorpay_order_id=razorpay_order_id)
        order   = payment.order

        # 3. Avoid duplicate PaymentAttempt (IntegrityError fix)
        PaymentAttempt.objects.get_or_create(
            payment=payment,
            razorpay_payment_id=razorpay_payment_id,
            defaults={
                "razorpay_signature": razorpay_signature,
                "status": "SUCCESS",
            }
        )

        # 4. Update statuses
        payment.status = "COMPLETED"
        payment.save()
        order.status = "COMPLETED"
        order.save()

        return render(request, "payments/success.html", {"order": order})

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

        return render(request, "payments/failure.html", {
            "error": "Payment verification failed. Please contact support."
        })

    except Exception as e:
        return render(request, "payments/failure.html", {
            "error": f"Something went wrong: {str(e)}"
        })


@csrf_exempt
def payment_failure(request):
    razorpay_order_id  = request.POST.get("razorpay_order_id")
    razorpay_payment_id = request.POST.get("razorpay_payment_id", None)
    failure_reason      = request.POST.get("error_description", "Unknown error")

    if razorpay_order_id:
        try:
            payment = Payment.objects.get(razorpay_order_id=razorpay_order_id)
            PaymentAttempt.objects.get_or_create(
                payment=payment,
                razorpay_payment_id=razorpay_payment_id,
                defaults={
                    "status": "FAILED",
                    "failure_reason": failure_reason,
                }
            )
            payment.status = "FAILED"
            payment.save()
        except Payment.DoesNotExist:
            pass

    return render(request, "payments/failure.html", {"error": failure_reason})