from .models import Category
from django.db import OperationalError

def categories_processor(request):
    try:
        categories = Category.objects.all().order_by('title')
        # list() to force evaluation and handle DB error if table not exists yet
        return {'categories': list(categories)}
    except (OperationalError, Exception):
        return {'categories': []}
