from django.shortcuts import render

from .models import CarouselImage
from products.models import Product

# Create your views here.

def homeView(request):
    template = 'mainapp/home.html'
    context = {
        'current_page' : 'home',
        'carousel_images': CarouselImage.objects.all(),
        
        'products' : Product.objects.all()
    }
    
    return render(request, template_name=template, context=context)

def aboutView(request):
    template = 'mainapp/about.html'
    context = {
        'current_page' : 'about',
    }
    
    return render(request, template, context)

def contactView(request):
    template = 'mainapp/contact.html'
    context = {
        'current_page' : 'contact',
    }
    
    return render(request, template, context)