from django import forms
from django.contrib.auth.forms import(
    UserCreationForm, AuthenticationForm
)

from django.contrib.auth.models import User


# applying same attributes for all form fields

BOOTSTRAP_ATTRS = {
    'class' : 'form-control'
}

class UserRegisterForm(UserCreationForm):
    username = forms.CharField(widget=forms.TextInput(attrs=BOOTSTRAP_ATTRS))
    email = forms.EmailField(widget=forms.EmailInput(attrs=BOOTSTRAP_ATTRS))
    password1 = forms.CharField(widget=forms.PasswordInput(attrs=BOOTSTRAP_ATTRS))
    # confirm password
    password2 = forms.CharField(widget=forms.PasswordInput(attrs=BOOTSTRAP_ATTRS))
    
    class Meta:
        model = User
        fields = [
            'username','email','password1','password2'
        ]
    def clean_email(self):
        email = self.cleaned_data.get('email')
        if User.objects.filter(email = email).exists() :
            raise forms.ValidationError("Email already exists!!!")
        return email

class UserLoginForm(AuthenticationForm):
    username = forms.CharField(
        widget=forms.TextInput(attrs=BOOTSTRAP_ATTRS)
        )
    
    password = forms.CharField(
        widget=forms.PasswordInput(attrs=BOOTSTRAP_ATTRS)
        )
    
       