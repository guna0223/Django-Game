from django.urls import path
from .views import homeView, contactView, aboutView, ping

urlpatterns = [
    path('', homeView, name="home_page"),
    path("about/", aboutView, name='about_page'),
    path("contact/", contactView, name='contact_page'),
    path("health/", ping, name="health_check"),
]