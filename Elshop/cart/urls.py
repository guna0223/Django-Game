from django.urls import path 

from .views import AddToCart, IncreaseCartItem, DecreaseCartItem, RemoveCartItem, GetCartItemQty

from .views import view_cart, get_cart_item_count

urlpatterns = [
    path("", view_cart, name="view_cart"),
    path("add/", AddToCart.as_view(), name="add_to_cart"),
    path("cart/count/", get_cart_item_count, name="cart_count"),

    path("increase/", IncreaseCartItem.as_view(), name="increase_cart_item"),
    path("decrease/", DecreaseCartItem.as_view(), name="decrease_cart_item"),
    path("remove/", RemoveCartItem.as_view(), name="remove_cart_item"),
]
