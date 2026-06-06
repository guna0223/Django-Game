from django.urls import path

from .views import homeView,contactView,aboutView,health_check,test_home

urlpatterns = [
    path('',homeView, name="home_page"),
    path("test-home/", test_home, name="test_home"),
    path("about/", aboutView, name='about_page'),
    path("contact/", contactView, name='contact_page'),
    path("health/", health_check, name="health_check"),
]