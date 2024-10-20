from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
from base.models import User, CustomUser, Product
from decimal import Decimal
from rest_framework_simplejwt.tokens import RefreshToken
from django.core.cache import cache

class UserRegistrationAndListViewTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.url = reverse('user')

    def test_user_registration_success(self):
        data = {
            'username': 'testuser',
            'password': 'testpass123',
            'role': 'buyer'
        }
        response = self.client.post(self.url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(User.objects.filter(username='testuser').exists())
        self.assertTrue(CustomUser.objects.filter(user__username='testuser', role='buyer').exists())

    def test_user_registration_duplicate_username(self):
        User.objects.create_user(username='existinguser', password='pass123')
        data = {
            'username': 'existinguser',
            'password': 'testpass123',
            'role': 'buyer'
        }
        response = self.client.post(self.url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('A user with that username already exists.', str(response.data))
    
    def test_user_registration_invalid_role(self):
        data = {
            'username': 'testuser',
            'password': 'testpass123',
            'role': 'invalidrole'
        }
        response = self.client.post(self.url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("Value \'invalidrole\' is not a valid choice.", str(response.data))

    def test_user_list(self):
        User.objects.create_user(username='user1', password='pass123')
        User.objects.create_user(username='user2', password='pass123')
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)

class UserDetailManagementViewTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(username='testuser', password='testpass123')

        # create a custom user manually
        CustomUser.objects.create(user=self.user, role='buyer', deposit=0)

        self.url = reverse('user_detail', kwargs={'id': self.user.id})

        refresh = RefreshToken.for_user(self.user)
        self.access_token = str(refresh.access_token)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.access_token}')

    def test_get_user_detail(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['username'], 'testuser')

    def test_get_nonexistent_user_detail(self):
        url = reverse('user_detail', kwargs={'id': 9999})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_update_user_detail(self):
        data = {'password': 'newpassword123', 'role': self.user.customuser.role, 'deposit': self.user.customuser.deposit}
        response = self.client.put(self.url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password('newpassword123'))

    def test_delete_user(self):
        response = self.client.delete(self.url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(User.objects.filter(id=self.user.id).exists())

class UserAuthenticationViewTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.url = reverse('signin')
        self.user = User.objects.create_user(username='testuser', password='testpass123')

    def test_user_login_success(self):
        data = {'username': 'testuser', 'password': 'testpass123'}
        response = self.client.post(self.url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('refresh', response.data)
        self.assertIn('access', response.data)
        self.assertIn('user', response.data)

    def test_user_login_failure(self):
        data = {'username': 'testuser', 'password': 'wrongpassword'}
        response = self.client.post(self.url, data)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertIn('error', response.data)

class UserLogoutViewTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.url = reverse('logout')
        self.user = User.objects.create_user(username='testuser', password='testpass123')
        refresh = RefreshToken.for_user(self.user)
        self.refresh_token = str(refresh)
        self.access_token = str(refresh.access_token)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.access_token}')

    def test_logout_success(self):
        data = {'refresh_token': self.refresh_token}
        response = self.client.post(self.url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, 'Logged out successfully')

    def test_logout_invalid_token(self):
        data = {'refresh_token': 'invalid_token'}
        response = self.client.post(self.url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)
        self.assertIn('Token is invalid or expired', response.data['error'])


class UserLogoutAllViewTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.url = reverse('logout_all')
        self.user = User.objects.create_user(username='testuser', password='testpass123')
        refresh = RefreshToken.for_user(self.user)
        self.access_token = str(refresh.access_token)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.access_token}')

    def test_logout_all_success(self):
        response = self.client.post(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, 'All sessions logged out successfully')

    def test_logout_all_unauthorized(self):
        self.client.credentials()  # Remove authorization
        response = self.client.post(self.url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

class UserDepositViewTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.url = reverse('deposit')
        self.user = User.objects.create_user(username='testuser', password='testpass123')

        CustomUser.objects.create(user=self.user, deposit=0)
        refresh = RefreshToken.for_user(self.user)
        self.access_token = str(refresh.access_token)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.access_token}')

    def test_deposit_success(self):
        data = {'amount': 1}
        response = self.client.post(self.url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.user.customuser.refresh_from_db()
        self.assertEqual(self.user.customuser.deposit, Decimal('1'))
    
    def test_invalid_deposit_amount(self):
        data = {'amount': 0.3}
        response = self.client.post(self.url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('Invalid coin value. Only 5, 10, 20, 50 cent and 1 euro coins are accepted', str(response.data))

class ProductPurchaseViewTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.url = reverse('buy')
        self.user = User.objects.create_user(username='testuser', password='testpass123')
        CustomUser.objects.create(user=self.user, deposit=20)

        self.seller = User.objects.create_user(username='seller', password='sellerpass123')
        self.product = Product.objects.create(product_name='Test Product', seller_id=self.seller, amount_available=10, cost=5)

        refresh = RefreshToken.for_user(self.user)
        self.access_token = str(refresh.access_token)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.access_token}')

    def test_purchase_success(self):
        data = {'product_id': self.product.id, 'quantity': 2}
        response = self.client.post(self.url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['total_price'], 10)
        self.user.customuser.refresh_from_db()
        self.assertEqual(self.user.customuser.deposit, Decimal('10'))
    
    def test_purchase_insufficient_funds(self):
        data = {'product_id': self.product.id, 'quantity': 5}
        response = self.client.post(self.url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('Insufficient deposit', str(response.data))
    
    def test_purchase_insufficient_stock(self):
        data = {'product_id': self.product.id, 'quantity': 11}
        response = self.client.post(self.url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('Insufficient stock', str(response.data))
    
    def test_purchase_invalid_product_id(self):
        data = {'product_id': 9999, 'quantity': 2}
        response = self.client.post(self.url, data)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertIn('Product not found', str(response.data))

class UserDepositResetViewTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.url = reverse('reset')

        self.user = User.objects.create_user(username='testuser', password='testpass123')
        CustomUser.objects.create(user=self.user, deposit=100)
    
        refresh = RefreshToken.for_user(self.user)
        self.access_token = str(refresh.access_token)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.access_token}')

    def test_reset_deposit(self):
        response = self.client.post(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.user.customuser.refresh_from_db()
        self.assertEqual(self.user.customuser.deposit, Decimal('0'))
    
    def test_reset_deposit_unauthorized(self):
        self.client.credentials(HTTP_AUTHORIZATION='')
        response = self.client.post(self.url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

class ProductListViewTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.url = reverse('product_get')
        self.seller = User.objects.create_user(username='seller', password='sellerpass123')
        Product.objects.create(product_name='Product 1', seller_id=self.seller, amount_available=10, cost=5)
        Product.objects.create(product_name='Product 2', seller_id=self.seller, amount_available=20, cost=10)

    def test_list_products(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)

class ProductCreationViewTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.url = reverse('product')
        self.user = User.objects.create_user(username='seller', password='sellerpass123')

        CustomUser.objects.create(user=self.user, role='seller')

        refresh = RefreshToken.for_user(self.user)
        self.access_token = str(refresh.access_token)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.access_token}')

    def test_create_product(self):
        data = {'product_name': 'New Product', 'amount_available': 50, 'cost': 15, 'seller_id': self.user.id}
        response = self.client.post(self.url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(Product.objects.filter(product_name='New Product').exists())
    
    def test_create_product_unauthorized(self):
        self.client.credentials(HTTP_AUTHORIZATION='')
        data = {'product_name': 'New Product', 'amount_available': 50, 'cost': 15, 'seller_id': self.user.id}
        response = self.client.post(self.url, data)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
    
    def test_create_product_invalid_data(self):
        data = {'product_name': '', 'amount_available': 50, 'cost': 15, 'seller_id': self.user.id}
        response = self.client.post(self.url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('This field may not be blank.', str(response.data))

class ProductUpdateDeleteViewTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(username='seller', password='sellerpass123')
        CustomUser.objects.create(user=self.user, role='seller')

        self.product = Product.objects.create(product_name='Test Product', seller_id=self.user, amount_available=10, cost=5)
        self.url = reverse('product_detail', kwargs={'id': self.product.id})

        refresh = RefreshToken.for_user(self.user)
        self.access_token = str(refresh.access_token)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.access_token}')

    def test_update_product(self):
        data = {'product_name': 'Updated Product', 'cost': 10}
        response = self.client.put(self.url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.product.refresh_from_db()
        self.assertEqual(self.product.product_name, 'Updated Product')
        self.assertEqual(self.product.cost, Decimal('10'))

    def test_delete_product(self):
        response = self.client.delete(self.url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Product.objects.filter(id=self.product.id).exists())
    
    def test_delete_product_unauthorized(self):
        self.client.credentials(HTTP_AUTHORIZATION='')
        response = self.client.delete(self.url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
    
    def test_delete_nonexistent_product(self):
        url = reverse('product_detail', kwargs={'id': 9999})
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
    
    def test_update_product_unauthorized(self):
        self.client.credentials(HTTP_AUTHORIZATION='')
        data = {'product_name': 'Updated Product', 'cost': 10}
        response = self.client.put(self.url, data)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
    
    def test_update_nonexistent_product(self):
        url = reverse('product_detail', kwargs={'id': 9999})
        data = {'product_name': 'Updated Product', 'cost': 10}
        response = self.client.put(url, data)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
