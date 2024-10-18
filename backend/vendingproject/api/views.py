from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.hashers import make_password, check_password
from api.serializers import UserSerializer, ProductSerializer
from base.models import User, Product
from rest_framework_simplejwt.exceptions import TokenError
from decimal import Decimal
from django.core.cache import cache
from django.conf import settings

class UserView(APIView):
    def post(self, request):
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            if User.objects.filter(username=request.data.get('username')).exists():
                return Response({'error': 'Username already exists'}, status=status.HTTP_400_BAD_REQUEST)
            
            serializer.validated_data['password'] = make_password(serializer.validated_data['password'])
            serializer.save()

            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def get(self, request):
        users = User.objects.all()
        serializer = UserSerializer(users, many=True)
        return Response(serializer.data)

class DepositView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        amount = request.data.get('amount')

        if amount:
            custom_user = user.customuser

            custom_user.deposit += Decimal(amount)

            custom_user.save()

            return Response({'message': 'Deposit successful'}, status=status.HTTP_200_OK)
        return Response({'error': 'Amount is required'}, status=status.HTTP_400_BAD_REQUEST)
    
class BuyView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        product_id = request.data.get('product_id')
        quantity = request.data.get('quantity')

        print('product id', product_id)
        print('quantity', quantity)

        if product_id and quantity:
            product = Product.objects.get(id=product_id)
            total_price = product.cost * quantity

            if product.amount_available < quantity:
                return Response({'error': 'Insufficient stock'}, status=status.HTTP_400_BAD_REQUEST)

            custom_user = user.customuser

            print('custom user deposit', custom_user.deposit)
            print('total price', total_price)

            if custom_user.deposit >= total_price:
                custom_user.deposit -= total_price
                custom_user.save()

                product.amount_available -= quantity
                product.save()

                return Response({'total_price': total_price, 'product_name': product.product_name, 'change': custom_user.deposit}, status=status.HTTP_200_OK)
            else:
                return Response({'error': 'Insufficient deposit'}, status=status.HTTP_400_BAD_REQUEST)

        return Response({'error': 'Product ID and quantity are required'}, status=status.HTTP_400_BAD_REQUEST)

class ResetDepositView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        custom_user = user.customuser
        custom_user.deposit = 0
        custom_user.save()
        return Response({'message': 'Deposit reset successfully'}, status=status.HTTP_200_OK)


class UserDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, id):
        try:
            user = User.objects.get(id=id)
            serializer = UserSerializer(user)
            return Response(serializer.data)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

    def put(self, request, id):
        try:
            user = User.objects.get(id=id)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

        allowed_fields = ['password', 'deposit', 'role']
        update_data = {key: value for key, value in request.data.items() if key in allowed_fields}

        if 'password' in update_data:
            update_data['password'] = make_password(update_data['password'])

        serializer = UserSerializer(user, data=update_data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, id):
        try:
            user = User.objects.get(id=id)
            user.delete()
            return Response("User deleted successfully", status=status.HTTP_204_NO_CONTENT)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

class SignInView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')

        if not username or not password:
            return Response({'error': 'Username and password are required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(username=username)
            if check_password(password, user.password):
                active_sessions = cache.get(f'active_sessions_{user.id}', [])

                refresh = RefreshToken.for_user(user)
                access_token = refresh.access_token

                active_sessions.append(access_token)
                cache.set(f'active_sessions_{user.id}', active_sessions, timeout=settings.SIMPLE_JWT['REFRESH_TOKEN_LIFETIME'].total_seconds())

                return Response({
                    'refresh': str(refresh),
                    'access': str(access_token),
                    'user': UserSerializer(user).data
                })
            else:
                return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

class GetActiveSessionsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user_id = request.user.id
        active_sessions = cache.get(f'active_sessions_{user_id}', [])
        return Response({'active_sessions': len(active_sessions)}, status=status.HTTP_200_OK)

class RefreshTokenView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        refresh_token = request.data.get('refresh')
        if not refresh_token:
            return Response({'error': 'Refresh token is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            refresh = RefreshToken(refresh_token)
            access_token = str(refresh.access_token)
            
            return Response({
                'access': access_token
            })
        except TokenError:
            return Response({'error': 'Invalid or expired refresh token'}, status=status.HTTP_401_UNAUTHORIZED)



class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        refresh_token = request.data.get('refresh_token')
        token = RefreshToken(refresh_token)
        token.blacklist()

        user_id = request.user.id
        active_sessions = cache.get(f'active_sessions_{user_id}', [])
        token = request.headers.get('Authorization', '').split(' ')[1]

        if token in active_sessions:
            active_sessions.remove(token)
            cache.set(f'active_sessions_{user_id}', active_sessions, timeout=settings.SIMPLE_JWT['ACCESS_TOKEN_LIFETIME'].total_seconds())
        
        return Response('Logged out successfully', status=status.HTTP_200_OK)

class LogoutAllView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user_id = request.user.id
        active_sessions = cache.get(f'active_sessions_{user_id}', [])

        for token in active_sessions:
            try:
                RefreshToken(token).blacklist()
            except TokenError:
                pass 

        cache.delete(f'active_sessions_{user_id}')

        return Response('All sessions logged out successfully', status=status.HTTP_200_OK)

class ProductGetView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        products = Product.objects.all()
        serializer = ProductSerializer(products, many=True)
        return Response(serializer.data)

class ProductView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ProductSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(seller_id=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        
        print(serializer.errors, 'errors while creating product')
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ProductDetailView(APIView):
    def get(self, request, id):
        try:
            product = Product.objects.get(id=id)
            serializer = ProductSerializer(product)
            return Response(serializer.data)
        except Product.DoesNotExist:
            return Response({'error': 'Product not found'}, status=status.HTTP_404_NOT_FOUND)

    def put(self, request, id):
        try:
            product = Product.objects.get(id=id)
        except Product.DoesNotExist:
            return Response({'error': 'Product not found'}, status=status.HTTP_404_NOT_FOUND)

        allowed_fields = ['product_name', 'cost', 'amount_available']
        update_data = {key: value for key, value in request.data.items() if key in allowed_fields}

        serializer = ProductSerializer(product, data=update_data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, id):
        try:
            product = Product.objects.get(id=id)
            if request.user != product.seller_id:
                return Response({'error': 'You do not have permission to delete this product'}, status=status.HTTP_403_FORBIDDEN)
            product.delete()
            return Response("Product deleted successfully", status=status.HTTP_204_NO_CONTENT)
        except Product.DoesNotExist:
            return Response({'error': 'Product not found'}, status=status.HTTP_404_NOT_FOUND)