from django.urls import path
from . import views

urlpatterns = [
    path('user/', views.UserView.as_view(), name='user'),
    path('user/<int:id>/', views.UserDetailView.as_view(), name='user_detail'),
    path('signin/', views.SignInView.as_view(), name='signin'),
    path('refresh/', views.RefreshTokenView.as_view(), name='refresh'),
    path('logout/', views.LogoutView.as_view(), name='logout'),
    path('product/', views.ProductView.as_view(), name='product'),
    path('product/<int:id>/', views.ProductDetailView.as_view(), name='product_detail'),
    path('product/get/', views.ProductGetView.as_view(), name='product_get'),
    path('deposit/', views.DepositView.as_view(), name='deposit'),
    path('buy/', views.BuyView.as_view(), name='buy'),
    path('reset/', views.ResetDepositView.as_view(), name='reset'),
    path('logout/all/', views.LogoutAllView.as_view(), name='logout_all'),
    path('active-sessions/', views.GetActiveSessionsView.as_view(), name='active_sessions')
]