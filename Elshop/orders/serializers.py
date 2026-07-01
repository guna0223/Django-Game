from rest_framework import serializers
from .models import Post   # replace with your actual model

class PostSerializer(serializers.ModelSerializer):
    class Meta:
        model = Post
        fields = '__all__'