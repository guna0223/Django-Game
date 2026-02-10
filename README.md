# Elshop - Gaming E-Commerce Store

A Django-based e-commerce platform for gaming products, built with Python and Django 6.0.

## 🛠️ Technologies Used

### Backend
- **Python 3.x** - Programming language
- **Django 6.0.1** - Web framework
- **SQLite** - Database (default, can be changed to PostgreSQL/MySQL)

### Frontend
- **HTML5** - Markup language
- **CSS3** - Styling
- **JavaScript** - Client-side interactivity
- **Bootstrap** - CSS framework for responsive design

### Third-Party Integrations
- **Razorpay** - Payment gateway integration
- **Pillow** - Image processing and file uploads
- **python-decouple** - Environment variable management
- **Django Allauth** - Authentication (optional, can be added)

## 📦 Dependencies

All dependencies are listed in `requirements.txt`:

```
Django==6.0.1
Pillow==12.1.0
python-decouple==3.8
razorpay==2.0.0
requests==2.32.5
certifi==2026.1.4
charset-normalizer==3.4.4
idna==3.11
setuptools==80.10.2
sqlparse==0.5.5
tzdata==2025.3
urllib3==2.6.3
asgiref==3.11.0
```

## 🏗️ Project Structure

```
Elshop/
├── Elshop/                 # Main Django project
│   ├── __init__.py
│   ├── settings.py         # Django settings
│   ├── urls.py             # Root URL configuration
│   ├── asgi.py             # ASGI config
│   └── wsgi.py             # WSGI config
├── mainapp/                # Main application (home, about, contact)
├── products/               # Product management
├── authentication/         # User authentication
├── cart/                   # Shopping cart functionality
├── orders/                 # Order management
├── payments/               # Payment processing
├── static/                 # Static files (CSS, JS, images)
├── templates/              # HTML templates
├── media/                  # User-uploaded files
│   ├── product/           # Product images
│   ├── carousel_images/   # Carousel images
│   └── products/
├── requirements.txt        # Python dependencies
└── README.md              # This file
```

## 📱 Apps Overview

### 1. mainapp
- **Home Page** - Landing page with carousel images
- **About Page** - About the store
- **Contact Page** - Contact information
- **Models:** CarouselImage

### 2. products
- **Product Management** - Add, edit, delete products
- **Product Images** - Multiple images per product
- **Product Videos** - YouTube video integration
- **Models:** Product, ProductImage, ProductVideo

### 3. authentication
- **User Registration** - Sign up functionality
- **User Login/Logout** - Authentication system
- **Email OTP Verification** - OTP-based email verification
- **Models:** EmailOTP

### 4. cart
- **Shopping Cart** - Add/remove items
- **Cart Management** - Update quantities
- **Models:** CartItem

### 5. orders
- **Order Management** - Track orders
- **Order History** - View past orders

### 6. payments
- **Razorpay Integration** - Payment gateway
- **Payment Processing** - Handle payments securely

## 🔧 Configuration

### Environment Variables

Configure the following in your `.env` file:

```env
# Email Configuration
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_USE_TLS = True
EMAIL_PORT = 587
EMAIL_HOST_USER = 'your-email@gmail.com'
EMAIL_HOST_PASSWORD = 'your-app-password'

# Razorpay Configuration
RAZORPAY_KEY_ID = 'your-razorpay-key-id'
RAZORPAY_KEY_SECRET = 'your-razorpay-key-secret'
```

### Django Settings

Key settings in `Elshop/settings.py`:
- **DEBUG** - Set to `False` in production
- **ALLOWED_HOSTS** - Add your domain/host
- **MEDIA_ROOT** - Path for uploaded files
- **MEDIA_URL** - URL for media files
- **STATIC_URL** - URL for static files

## 🚀 Getting Started

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd Elshop
```

2. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Run migrations:
```bash
cd Elshop
python manage.py migrate
```

5. Create superuser:
```bash
python manage.py createsuperuser
```

6. Run the development server:
```bash
python manage.py runserver
```

7. Access the site at `http://127.0.0.1:8000`

## 📋 Features

- User authentication with email verification
- Product catalog with images and videos
- Shopping cart functionality
- Order management
- Razorpay payment integration
- Admin panel for product management
- Responsive design with Bootstrap
- Discount and offer pricing
- Stock management

## 🔒 Security Features

- CSRF protection
- Password validation
- Secure payment processing with Razorpay
- Session management
- Email OTP verification

## 📄 License

This project is for educational purposes.
