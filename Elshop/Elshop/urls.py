from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from mainapp.views import ping

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('mainapp.urls')),
    path('products/', include('products.urls')),
    path('api/', include('products.api_urls')),
    path('api/', include('payments.api_urls')),
    path('accounts/', include('authentication.urls')),
    path('accounts/', include('django.contrib.auth.urls')),
    path('cart/', include('cart.urls')),
    path('', include('orders.urls')),
    path('payment/', include('payments.urls')),

    # Health check — both routes point to same view
    path('ping/', ping),
    path('health/', ping),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)