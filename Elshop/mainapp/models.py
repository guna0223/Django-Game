from django.db import models
from products.models import Product

# Create your models here.
class CarouselImage(models.Model):
    img = models.ImageField(upload_to='carousel_images/')
    title = models.CharField(max_length=200)
    caption = models.TextField(max_length=400)
    link = models.CharField(max_length=200)
    active = models.BooleanField(default=True)
    
    def __str__(self):
        return f"carousel Image : {self.title}"

