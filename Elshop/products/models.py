from django.db import models
from decimal import Decimal

# class Category(models.Model):
#     title 
#     thumbnail
#     added

# Create your models here.
class Product(models.Model):
    title = models.CharField(max_length=224)
    desc = models.CharField(max_length=400)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    stock = models.PositiveIntegerField(null=False,blank=False,default=0)
    thumbnail = models.ImageField(upload_to='products/thumbnails', blank=True, null=True)
    discount = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    @property
    def offer_price(self):
        if self.discount:
            return self.price -(self.price * Decimal(self.discount) / Decimal(100))
        return self.price
    
    def __str__(self):
        return self.title


    
class ProductImage(models.Model):
    img = models.ImageField(upload_to='product/images/', blank=True, null=True)
    caption = models.CharField(max_length=200, blank=True)
    product = models.ForeignKey(Product, 
                                on_delete=models.CASCADE, 
                                related_name='images')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.product.title} image"
    
class ProductVideo(models.Model):
    title = models.CharField(max_length=200)

    # This stores ONLY the code (e.g. YouTube ID)
    video_code = models.CharField(max_length=255, blank=True, null=True)

    product = models.ForeignKey(Product, on_delete=models.CASCADE,
                                related_name='videos')

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def youtube_embed_url(self):
        return f"https://www.youtube.com/embed/{self.video_code}"

    def youtube_thumbnail(self):
        return f"https://img.youtube.com/vi/{self.video_code}/hqdefault.jpg"
    
    def __str__(self):
        return f"{self.product.title} video"
