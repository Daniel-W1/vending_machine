import json
from django.http import JsonResponse
from rest_framework import status
from base.models import Product, User
from rest_framework_simplejwt.tokens import AccessToken

def get_user_from_token(token):
    try:
        token = AccessToken(token)
        user_id = token.payload.get('user_id')
        return user_id
    except Exception as e:
        print(e, 'the error')
        return None


def check_product_owner(get_response):
    def middleware(request):
        if request.method in ['PUT', 'DELETE'] and 'product/' in request.path:
            try:
                product_id = int(request.path.split('/')[-2])
                product = Product.objects.get(id=product_id)

                try:
                    request_user_id = get_user_from_token(request.headers.get('Authorization', '').split(' ')[1])
                except Exception as e:
                    print(e, 'the error in check product owner')
                    return JsonResponse(
                        {'error': 'You are not authorized to perform this action'},
                        status=status.HTTP_401_UNAUTHORIZED
                    )
                if request_user_id != product.seller_id.id:
                    return JsonResponse(
                        {'error': 'You do not have permission to modify this product'},
                        status=status.HTTP_403_FORBIDDEN
                    )
            except (ValueError, Product.DoesNotExist):
                pass

        response = get_response(request)
        return response

    return middleware

def check_similar_user(get_response):
    def middleware(request):
        if request.method in ['PUT', 'DELETE'] and 'user/' in request.path:
            try:
                user_id = int(request.path.split('/')[-2])

                try:
                    request_user_id = get_user_from_token(request.headers.get('Authorization', '').split(' ')[1])
                except Exception as e:
                    print(e, 'the error in check similar user')
                    return JsonResponse(
                        {'error': 'You are not authorized to perform this action'},
                        status=status.HTTP_401_UNAUTHORIZED
                    )

                if request_user_id != user_id:
                    return JsonResponse(
                        {'error': 'You do not have permission to modify this user'},
                        status=status.HTTP_403_FORBIDDEN
                    )
            except (ValueError, User.DoesNotExist):
                pass

        response = get_response(request)
        return response

    return middleware

def check_user_seller(get_response):
    def middleware(request):
        if request.method in ['POST', 'PUT', 'DELETE'] and 'product/' in request.path:
            try:
                try:
                    user_id = get_user_from_token(request.headers.get('Authorization', '').split(' ')[1])
                except Exception as e:
                    print(e, 'the error in check user seller')
                    return JsonResponse(
                        {'error': 'You are not authorized to perform this action'},
                        status=status.HTTP_401_UNAUTHORIZED
                    )
                user = User.objects.get(id=user_id)

                if user.customuser.role != 'seller':
                    return JsonResponse(
                        {'error': 'You need to be a seller to perform this action'},
                        status=status.HTTP_403_FORBIDDEN
                    )
            except Exception as e:
                print(e, 'the error in check user seller')
                pass
        
        response = get_response(request)
        return response

    return middleware

def check_user_buyer(get_response):
    def middleware(request):
        if request.method in ['POST'] and ('buy/' in request.path or 'reset/' in request.path or 'deposit/' in request.path):
            try:
                try:
                    user_id = get_user_from_token(request.headers.get('Authorization', '').split(' ')[1])
                except Exception as e:
                    print(e, 'the error in check user buyer')
                    return JsonResponse(
                        {'error': 'You are not authorized to perform this action'},
                        status=status.HTTP_401_UNAUTHORIZED
                    )
                user = User.objects.get(id=user_id)

                if user.customuser.role != 'buyer':
                    return JsonResponse(
                        {'error': 'You need to be a buyer to perform this action'},
                        status=status.HTTP_403_FORBIDDEN
                    )
            except Exception as e:
                print(e, 'the error in check user buyer')
                pass
        
        response = get_response(request)
        return response

    return middleware