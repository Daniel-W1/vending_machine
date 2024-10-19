from django.db import models
from django.contrib.auth.models import User
from django.core.exceptions import ValidationError

class CustomUser(models.Model):
    class Role(models.TextChoices):
        SELLER = 'seller'
        BUYER = 'buyer'

    user = models.OneToOneField(User, on_delete=models.CASCADE)
    deposit = models.DecimalField(default=0, max_digits=10, decimal_places=2)
    role = models.CharField(
        max_length=6,
        choices=Role.choices,
        default=Role.BUYER
    )

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)
    
    def update(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

class Product(models.Model):
    id = models.AutoField(primary_key=True)
    product_name = models.CharField(max_length=30)
    seller_id = models.ForeignKey(User, on_delete=models.CASCADE, related_name='products')
    amount_available = models.PositiveIntegerField(default=0)
    cost = models.DecimalField(default=0, max_digits=10, decimal_places=2)

    def clean(self):
        if self.cost*100 % 5 != 0:
            raise ValidationError('Cost must be in multiples of 5 cents.')

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)


