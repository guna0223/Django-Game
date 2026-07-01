from rest_framework import serializers


class CreateRazorpayOrderInputSerializer(serializers.Serializer):
    order_id = serializers.IntegerField(required=True)


class VerifyRazorpayPaymentInputSerializer(serializers.Serializer):
    razorpay_payment_id = serializers.CharField(required=True)
    razorpay_order_id = serializers.CharField(required=True)
    razorpay_signature = serializers.CharField(required=True)


class CreateRazorpayOrderOutputSerializer(serializers.Serializer):
    razorpay_order_id = serializers.CharField()
    amount = serializers.IntegerField()
    currency = serializers.CharField()
    razorpay_key_id = serializers.CharField()


class VerifyRazorpayPaymentOutputSerializer(serializers.Serializer):
    success = serializers.BooleanField()
    message = serializers.CharField()
    order_id = serializers.IntegerField()
