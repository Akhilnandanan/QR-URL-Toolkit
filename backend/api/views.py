from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.shortcuts import redirect
import json
import qrcode
import io
import base64
import string
import random
from .models import ShortenedURL

@csrf_exempt
@require_http_methods(["POST"])
def generate_qr(request):
    try:
        data = json.loads(request.body)
        text = data.get('text', '')
        
        if not text:
            return JsonResponse({'error': 'Text is required'}, status=400)
        
        # Generate QR code
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_L,
            box_size=10,
            border=4,
        )
        qr.add_data(text)
        qr.make(fit=True)
        
        img = qr.make_image(fill_color="black", back_color="white")
        
        # Convert to base64
        buffered = io.BytesIO()
        img.save(buffered, format="PNG")
        img_str = base64.b64encode(buffered.getvalue()).decode()
        
        return JsonResponse({
            'success': True,
            'qr_code': f'data:image/png;base64,{img_str}'
        })
    
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


def generate_short_code(length=6):
    characters = string.ascii_letters + string.digits
    while True:
        code = ''.join(random.choice(characters) for _ in range(length))
        if not ShortenedURL.objects.filter(short_code=code).exists():
            return code


@csrf_exempt
@require_http_methods(["POST"])
def shorten_url(request):
    try:
        data = json.loads(request.body)
        original_url = data.get('url', '')
        
        if not original_url:
            return JsonResponse({'error': 'URL is required'}, status=400)
        
        # Generate short code
        short_code = generate_short_code()
        
        # Save to database
        shortened = ShortenedURL.objects.create(
            short_code=short_code,
            original_url=original_url
        )
        
        short_url = f'http://localhost:8000/s/{short_code}'
        
        return JsonResponse({
            'success': True,
            'short_url': short_url,
            'short_code': short_code,
            'original_url': original_url
        })
    
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@require_http_methods(["GET"])
def redirect_short_url(request, short_code):
    try:
        url_obj = ShortenedURL.objects.get(short_code=short_code)
        url_obj.clicks += 1
        url_obj.save()
        return redirect(url_obj.original_url)
    
    except ShortenedURL.DoesNotExist:
        return JsonResponse({'error': 'Short URL not found'}, status=404)