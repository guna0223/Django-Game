from django.shortcuts import render, redirect
from django.urls import reverse
from .models import Product

# Create your views here.

def productsView(request):
    template = 'products/products.html'
    context = {
        'products' : Product.objects.all(),
        'current_page' : 'products'
    }
    
    return render (request, template, context)

# search product
from django.db.models import Q

def searchProducts(request):
    template = 'products/search_results.html'
    query = request.GET.get('q')
    if query:
        search_results = Product.objects.filter(
            Q(title__icontains = query) |
            Q(desc__icontains = query)
        )
        
        context = {
            'query' : query,
            'products' : search_results
        }
    else :
        context = {
            'query' : query,
            'products' : None
        }
        
    return render(request, template, context)

# CURD operations using Generic Class Bases Views of Django

from django.views.generic import (
    CreateView, DetailView,UpdateView,DeleteView
)

# Listview 

class CreateProduct(CreateView):
    model = Product
    template_name = 'products/add_product.html'
    
    fields = "__all__"
    
    success_url = '/'
    
class ProductDetail(DetailView):
    model = Product
    template_name = 'products/product_details.html'
    context_object_name = 'product'

    def get_queryset(self):
        return Product.objects.prefetch_related('images')

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)

        # show other products except current one
        context['products'] = Product.objects.exclude(
            id=self.object.id
        )[:8]  # limit to 8 products

        return context

    
# views for video
from django import forms

class ProductMediaForm(forms.Form):
    img = forms.ImageField(required=True)
    caption = forms.CharField(max_length=255, required=False)
    video_code = forms.CharField(
        max_length=255,
        required=False,
        help_text="YouTube / video code (optional)"
    )

    def clean(self):
        cleaned_data = super().clean()
        if not cleaned_data.get('img'):
            raise forms.ValidationError("Please upload an image")
        return cleaned_data

# end

from django.shortcuts import get_object_or_404, redirect
from .models import Product, ProductImage,ProductVideo
from .forms import ProductMediaForm
def AddImages(request, pk):
    product = get_object_or_404(Product, pk=pk)

    if request.method == 'POST':
        form = ProductMediaForm(request.POST, request.FILES)
        if form.is_valid():

            ProductImage.objects.create(
                product=product,
                img=form.cleaned_data['img'],
                caption=form.cleaned_data.get('caption')
            )

            if form.cleaned_data.get('video_code'):
                ProductVideo.objects.create(
                    product=product,
                    title="Product Video",
                    video_code=form.cleaned_data['video_code']
                )

            return redirect('product_details', pk=pk)
    else:
        form = ProductMediaForm()

    return render(request, 'products/add_images.html', {
        'form': form,
        'product': product
    })
class UpdateProduct(UpdateView):
    model = Product
    template_name = 'products/update_product.html'
    fields = '__all__'
    
    success_url = '/'
    
class DeleteProduct(DeleteView):
    model = Product
    template_name = 'products/delete_product.html'
    success_url = '/'
    
# Edit product image 

from django.shortcuts import get_object_or_404, redirect, render
from django.contrib.admin.views.decorators import staff_member_required
from .models import ProductImage
from .forms import ProductMediaForm

@staff_member_required
def EditProductImage(request, pk):
    image = get_object_or_404(ProductImage, pk=pk)
    form = ProductMediaForm(request.POST or None, request.FILES or None, instance=image)

    if form.is_valid():
        form.save()
        return redirect('product_details', image.product.pk)

    return render(request, 'products/image_edit.html', {
        'form': form,
        'image': image,
        'product': image.product
    })


@staff_member_required
def DeleteProductImage(request, pk):
    image = get_object_or_404(ProductImage, pk=pk)
    
    if request.method == 'POST':
        product_id = image.product.pk
        image.delete()
        return redirect('product_details', product_id)
    
    return render(request, 'products/image_del.html', {'image': image, 'image_pk': pk})


# Edit product video

@staff_member_required
def EditProductVideo(request, pk):
    video = get_object_or_404(ProductVideo, pk=pk)
    
    if request.method == 'POST':
        video.title = request.POST.get('title', video.title)
        video.video_code = request.POST.get('video_code', video.video_code)
        video.save()
        return redirect('product_details', video.product.pk)
    
    return render(request, 'products/video_edit.html', {
        'video': video,
        'product': video.product
    })


@staff_member_required
def DeleteProductVideo(request, pk):
    video = get_object_or_404(ProductVideo, pk=pk)
    
    if request.method == 'POST':
        product_id = video.product.pk
        video.delete()
        return redirect('product_details', product_id)
    
    return render(request, 'products/video_del.html', {'video': video, 'video_pk': pk})
