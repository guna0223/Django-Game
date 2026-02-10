from django import forms
from .models import ProductImage, ProductVideo

class ProductMediaForm(forms.ModelForm):
    video_code = forms.CharField(
        max_length=255,
        required=False,
        help_text="YouTube video code (optional)"
    )
    
    class Meta:
        model = ProductImage
        fields = ['img', 'caption', 'video_code']
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Make img optional for editing
        self.fields['img'].required = False
    
    def clean(self):
        cleaned_data = super().clean()
        img = cleaned_data.get('img')
        video_code = cleaned_data.get('video_code')
        
        # Only require at least one of img or video_code when creating a new image
        if not img and not video_code and not self.instance.pk:
            raise forms.ValidationError("Please upload an image or add a video code")
        
        return cleaned_data
    
    def save(self, commit=True):
        instance = super().save(commit=commit)
        
        # Handle video code separately (creates or updates ProductVideo)
        video_code = self.cleaned_data.get('video_code')
        if video_code:
            # Get or create a video for this product
            video, created = ProductVideo.objects.get_or_create(
                product=instance.product,
                defaults={'title': 'Product Video', 'video_code': video_code}
            )
            if not created and video.video_code != video_code:
                video.video_code = video_code
                video.save()
        
        return instance
