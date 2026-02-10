from django.shortcuts import render, get_object_or_404
from django.views import View
from django.http import JsonResponse
from django.urls import reverse
from django.contrib.auth.decorators import login_required

from .models import CartItem
from products.models import Product


# =============================
# HELPER — totals calculator
# =============================

def cart_totals(user):
    items = CartItem.objects.filter(user=user)

    total_qty = sum(i.quantity for i in items)
    total_price = sum(i.subtotal for i in items)

    return total_qty, total_price


# =============================
# ADD TO CART
# =============================

class AddToCart(View):
    def post(self, request, *args, **kwargs):

        if not request.user.is_authenticated:
            return JsonResponse({
                'error': 'login_required',
                'redirect_url': reverse('signin')
            }, status=401)

        product_id = request.POST.get('product_id')
        product = get_object_or_404(Product, id=product_id)

        item, created = CartItem.objects.get_or_create(
            user=request.user,
            product=product
        )

        item.quantity += 1
        item.save()

        total_qty, total_price = cart_totals(request.user)

        return JsonResponse({
            "product_id": product.id,
            "qty": item.quantity,
            "subtotal": item.subtotal,
            "cart_count": total_qty,
            "total_qty": total_qty,
            "total_price": total_price,
            "message": f"{product.title} added to cart"
        })


# =============================
# INCREASE QTY
# =============================

class IncreaseCartItem(View):
    def post(self, request, *args, **kwargs):

        if not request.user.is_authenticated:
            return JsonResponse({
                'error': 'login_required',
                'redirect_url': reverse('signin')
            }, status=401)

        product_id = request.POST.get('product_id')

        item = get_object_or_404(
            CartItem,
            user=request.user,
            product_id=product_id
        )

        item.quantity += 1
        item.save()

        total_qty, total_price = cart_totals(request.user)

        return JsonResponse({
            "product_id": product_id,
            "quantity": item.quantity,
            "subtotal": item.subtotal,
            "cart_count": total_qty,
            "total_qty": total_qty,
            "total_price": total_price
        })


# =============================
# DECREASE QTY
# =============================

class DecreaseCartItem(View):
    def post(self, request, *args, **kwargs):

        if not request.user.is_authenticated:
            return JsonResponse({
                'error': 'login_required',
                'redirect_url': reverse('signin')
            }, status=401)

        product_id = request.POST.get('product_id')

        item = get_object_or_404(
            CartItem,
            user=request.user,
            product_id=product_id
        )

        item.quantity -= 1

        if item.quantity <= 0:
            item.delete()
            qty = 0
            subtotal = 0
        else:
            item.save()
            qty = item.quantity
            subtotal = item.subtotal

        total_qty, total_price = cart_totals(request.user)

        deleted = qty == 0

        return JsonResponse({
            "product_id": product_id,
            "quantity": qty,
            "subtotal": subtotal,
            "deleted": deleted,
            "cart_count": total_qty,
            "total_qty": total_qty,
            "total_price": total_price
        })


# =============================
# REMOVE ITEM
# =============================

class RemoveCartItem(View):
    def post(self, request, *args, **kwargs):

        if not request.user.is_authenticated:
            return JsonResponse({
                'error': 'login_required',
                'redirect_url': reverse('signin')
            }, status=401)

        product_id = request.POST.get('product_id')

        CartItem.objects.filter(
            user=request.user,
            product_id=product_id
        ).delete()

        total_qty, total_price = cart_totals(request.user)

        return JsonResponse({
            "product_id": product_id,
            "quantity": 0,
            "subtotal": 0,
            "cart_count": total_qty,
            "total_qty": total_qty,
            "total_price": total_price
        })


# =============================
# CART PAGE VIEW
# =============================

@login_required
def view_cart(request):
    cart_items = CartItem.objects.filter(user=request.user)

    total_quantity = sum(item.quantity for item in cart_items)
    total_price = sum(item.subtotal for item in cart_items)

    context = {
        "cart_items": cart_items,
        "total_quantity": total_quantity,
        "total_price": total_price,
    }

    return render(request, "cart/cart.html", context)


# =============================
# CART BADGE COUNT
# =============================

def get_cart_item_count(request):

    if not request.user.is_authenticated:
        return JsonResponse({'cart_count': 0})

    total_qty, _ = cart_totals(request.user)

    return JsonResponse({
        'cart_count': total_qty
    })


# =============================
# GET ITEM QTY (for detail page hydration)
# =============================

class GetCartItemQty(View):
    def get(self, request, *args, **kwargs):

        if not request.user.is_authenticated:
            return JsonResponse({"qty": 0})

        product_id = request.GET.get("product_id")

        item = CartItem.objects.filter(
            user=request.user,
            product_id=product_id
        ).first()

        qty = item.quantity if item else 0

        return JsonResponse({
            "product_id": product_id,
            "qty": qty
        })
