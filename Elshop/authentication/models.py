from django.db import models

from django.utils import timezone
from datetime import timedelta 

# Create your models here.
class EmailOTP(models.Model):
    email = models.EmailField()
    otp = models.CharField(max_length=4)
    created_at = models.DateTimeField(auto_now_add=True)

    # let's set a 10 minute expiry window
    def is_expired(self):
        return timezone.now() > self.created_at + timedelta(minutes = 10)
    
    def __str__(self):
        return f"{self.email} - {self.otp}"