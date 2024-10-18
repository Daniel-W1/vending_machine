from django.urls import path
from . import views

urlpatterns = [
    path('user/', views.UserRegistrationAndListView.as_view(), name='user'),
    path('user/<int:id>/', views.UserDetailManagementView.as_view(), name='user_detail'),
    path('signin/', views.UserAuthenticationView.as_view(), name='signin'),
    path('refresh/', views.TokenRefreshView.as_view(), name='refresh'),
    path('logout/', views.UserLogoutView.as_view(), name='logout'),
    path('product/', views.ProductCreationView.as_view(), name='product'),
    path('product/<int:id>/', views.ProductUpdateDeleteView.as_view(), name='product_detail'),
    path('product/get/', views.ProductListView.as_view(), name='product_get'),
    path('deposit/', views.UserDepositView.as_view(), name='deposit'),
    path('buy/', views.ProductPurchaseView.as_view(), name='buy'),
    path('reset/', views.UserDepositResetView.as_view(), name='reset'),
    path('logout/all/', views.UserLogoutAllView.as_view(), name='logout_all'),
    path('active-sessions/', views.ActiveSessionsCountView.as_view(), name='active_sessions')
]