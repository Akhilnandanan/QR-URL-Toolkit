from django.urls import path
from . import views

urlpatterns = [
    path('generate-qr/', views.generate_qr, name='generate_qr'),
    path('shorten/', views.shorten_url, name='shorten_url'),
]