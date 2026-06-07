from django.shortcuts import render, get_object_or_404
from django.views import View
from django.http import JsonResponse
from django.urls import reverse
from django.contrib.auth.decorators import login_required
from .models import CartItem
from products.models import Product


def cart_totals(user):
    items = CartItem.objects.filter(user=user).select_related('product')
    total_qty = sum(i.quantity for i in items)
    total_price = sum(i.subtotal for i in items)
    return total_qty, total_price


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
            user=request.user, product=product
        )

        if item.quantity >= product.stock:
            total_qty, total_price = cart_totals(request.user)
            return JsonResponse({
                "error": "out_of_stock",
                "message": f"Only {product.stock} items available.",
                "cart_count": total_qty,
                "total_qty": total_qty,
                "total_price": float(total_price),
                "qty": item.quantity,
                "max_stock": product.stock,
            }, status=400)

        item.quantity += 1
        item.save()
        total_qty, total_price = cart_totals(request.user)

        return JsonResponse({
            "product_id": product.id,
            "qty": item.quantity,
            "subtotal": float(item.subtotal),
            "cart_count": total_qty,
            "total_qty": total_qty,
            "total_price": float(total_price),
            "max_stock": product.stock,
            "message": f"{product.title} added to cart"
        })


class IncreaseCartItem(View):
    def post(self, request, *args, **kwargs):
        if not request.user.is_authenticated:
            return JsonResponse({'error': 'login_required'}, status=401)

        product_id = request.POST.get('product_id')
        item = get_object_or_404(CartItem, user=request.user, product_id=product_id)

        if item.quantity >= item.product.stock:
            total_qty, total_price = cart_totals(request.user)
            return JsonResponse({
                "error": "out_of_stock",
                "message": f"Only {item.product.stock} items available.",
                "product_id": product_id,
                "quantity": item.quantity,
                "subtotal": float(item.subtotal),
                "cart_count": total_qty,
                "total_qty": total_qty,
                "total_price": float(total_price),
                "max_stock": item.product.stock,
            }, status=400)

        item.quantity += 1
        item.save()
        total_qty, total_price = cart_totals(request.user)

        return JsonResponse({
            "product_id": product_id,
            "quantity": item.quantity,
            "subtotal": float(item.subtotal),
            "cart_count": total_qty,
            "total_qty": total_qty,
            "total_price": float(total_price),
            "max_stock": item.product.stock,
        })


class DecreaseCartItem(View):
    def post(self, request, *args, **kwargs):
        if not request.user.is_authenticated:
            return JsonResponse({'error': 'login_required'}, status=401)

        product_id = request.POST.get('product_id')
        item = get_object_or_404(CartItem, user=request.user, product_id=product_id)

        item.quantity -= 1
        if item.quantity <= 0:
            item.delete()
            qty, subtotal = 0, 0
        else:
            item.save()
            qty = item.quantity
            subtotal = float(item.subtotal)

        total_qty, total_price = cart_totals(request.user)

        return JsonResponse({
            "product_id": product_id,
            "quantity": qty,
            "subtotal": subtotal,
            "deleted": qty == 0,
            "cart_count": total_qty,
            "total_qty": total_qty,
            "total_price": float(total_price),
            "max_stock": item.product.stock if qty > 0 else 0,
        })


class RemoveCartItem(View):
    def post(self, request, *args, **kwargs):
        if not request.user.is_authenticated:
            return JsonResponse({'error': 'login_required'}, status=401)

        product_id = request.POST.get('product_id')
        CartItem.objects.filter(user=request.user, product_id=product_id).delete()
        total_qty, total_price = cart_totals(request.user)

        return JsonResponse({
            "product_id": product_id,
            "quantity": 0,
            "subtotal": 0,
            "cart_count": total_qty,
            "total_qty": total_qty,
            "total_price": float(total_price),
        })


@login_required
def view_cart(request):
    cart_items = CartItem.objects.filter(
        user=request.user
    ).select_related('product')

    for item in cart_items:
        item.max_reached = item.quantity >= item.product.stock

    total_quantity = sum(item.quantity for item in cart_items)
    total_price = sum(item.subtotal for item in cart_items)

    return render(request, "cart/cart.html", {
        "cart_items": cart_items,
        "total_quantity": total_quantity,
        "total_price": total_price,
    })


# ✅ New — returns partial HTML for cart items (used by JS)
@login_required
def cart_summary_partial(request):
    cart_items = CartItem.objects.filter(
        user=request.user
    ).select_related('product')

    for item in cart_items:
        item.max_reached = item.quantity >= item.product.stock

    total_quantity = sum(item.quantity for item in cart_items)
    total_price = sum(item.subtotal for item in cart_items)

    return render(request, "cart/partials/cart_items.html", {
        "cart_items": cart_items,
        "total_quantity": total_quantity,
        "total_price": total_price,
    })


def get_cart_item_count(request):
    if not request.user.is_authenticated:
        return JsonResponse({'cart_count': 0})
    total_qty, _ = cart_totals(request.user)
    return JsonResponse({'cart_count': total_qty})


class GetCartItemQty(View):
    def get(self, request, *args, **kwargs):
        if not request.user.is_authenticated:
            return JsonResponse({"qty": 0})
        product_id = request.GET.get("product_id")
        item = CartItem.objects.filter(
            user=request.user, product_id=product_id
        ).first()
        return JsonResponse({
            "product_id": product_id,
            "qty": item.quantity if item else 0,
            "max_stock": item.product.stock if item else 0,
        })