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

from django.shortcuts import render, redirect
from django.core.mail import send_mail
from django.conf import settings
from django.contrib import messages

def contactView(request):
    if request.method == "POST":
        name = request.POST.get("name")
        email = request.POST.get("email")
        subject = request.POST.get("subject", "Contact Form")
        message = request.POST.get("message")

        # Email to Admin
        send_mail(
            subject=f"Contact: {subject}",
            message=f"From: {name} ({email})\n\n{message}",
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[settings.ADMIN_EMAIL],
            fail_silently=False,
        )

        # Auto-reply to User
        send_mail(
            subject="We received your message – PlayZoneX 🎮",
            message=(
                f"Hi {name},\n\n"
                "Thanks for contacting PlayZoneX.\n"
                "Our support team will get back to you shortly.\n\n"
                "— PlayZoneX Support Team"
            ),
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[email],
            fail_silently=False,
        )

        messages.success(request, "Your message has been sent successfully!")
        return redirect("contact_page")

    return render(request, "mainapp/contact.html", {
        "current_page": "contact"
    })
