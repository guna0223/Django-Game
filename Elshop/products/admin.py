from django.contrib import admin
from .models import Product, ProductImage, ProductVideo


# =========================
# PRODUCT IMAGE INLINE
# =========================
class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1
    fields = ('img', 'caption')
    readonly_fields = ()
    show_change_link = True


# =========================
# PRODUCT VIDEO INLINE
# =========================
class ProductVideoInline(admin.TabularInline):
    model = ProductVideo
    extra = 1
    fields = ('title', 'video_code')
    show_change_link = True


# =========================
# PRODUCT ADMIN
# =========================
@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):

    # ---- MAIN LIST VIEW ----
    list_display = (
        'title',
        'price',
        'offer_price_display',
        'stock',
        'discount',
        'created_at'
    )

    list_editable = ('stock', 'discount')
    list_filter = ('created_at',)
    search_fields = ('title', 'desc')
    ordering = ('-created_at',)

    # ---- FORM VIEW ----
    fieldsets = (
        ('Basic Info', {
            'fields': ('title', 'desc', 'thumbnail')
        }),
        ('Pricing & Stock', {
            'fields': ('price', 'discount', 'stock')
        }),
    )

    inlines = [ProductImageInline, ProductVideoInline]

    # ---- CUSTOM COLUMN ----
    def offer_price_display(self, obj):
        return obj.offer_price

    offer_price_display.short_description = 'Offer Price'


# =========================
# PRODUCT IMAGE ADMIN
# =========================
@admin.register(ProductImage)
class ProductImageAdmin(admin.ModelAdmin):
    list_display = ('product', 'caption', 'created_at')
    search_fields = ('product__title',)


# =========================
# PRODUCT VIDEO ADMIN
# =========================
@admin.register(ProductVideo)
class ProductVideoAdmin(admin.ModelAdmin):
    list_display = ('product', 'title', 'video_code', 'created_at')
    search_fields = ('product__title', 'title')
