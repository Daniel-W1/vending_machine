from rest_framework import serializers
from base.models import Product, User, CustomUser

class UserSerializer(serializers.ModelSerializer):
    role = serializers.CharField(source='customuser.role', default='buyer')
    deposit = serializers.IntegerField(source='customuser.deposit', default=0)

    class Meta:
        model = User
        fields = ('id', 'username', 'password', 'role', 'deposit')

    def create(self, validated_data):
        customuser_data = validated_data.pop('customuser')
        user = User.objects.create(**validated_data)
        CustomUser.objects.create(user=user, **customuser_data)
        return user
    
    def update(self, instance, validated_data):
        customuser_data = validated_data.pop('customuser')
        instance = super().update(instance, validated_data)
        instance.customuser.role = customuser_data.get('role', instance.customuser.role)
        instance.customuser.deposit += int(customuser_data.get('deposit', 0))
        instance.customuser.save()
        return instance
    
    def get_role(self, obj):
        return obj.customuser.role

    def get_deposit(self, obj):
        return obj.customuser.deposit

class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = '__all__'
