from django.urls import path

from .views import homeView,contactView,aboutView,health_check

urlpatterns = [
    path('',homeView, name="home_page"),
    path("about/", aboutView, name='about_page'),
    path("contact/", contactView, name='contact_page'),
    path("health/", health_check, name="health_check"),
]