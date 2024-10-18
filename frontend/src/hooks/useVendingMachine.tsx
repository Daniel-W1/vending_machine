import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/useToast';
import { useLoadingStates } from '@/hooks/useLoadingStates';
import { User, Product } from '@/types';
import * as api from '@/services/api/home';

export function useVendingMachine() {
    const user = JSON.parse(localStorage.getItem('user') || '{}') as User;
    const [products, setProducts] = useState<Product[]>([]);
    const [balance, setBalance] = useState(user.deposit || 0);
    const [showAlert, setShowAlert] = useState(false);
    const [newProduct, setNewProduct] = useState<Product>({ product_name: '', seller_id: user.id, amount_available: 0, cost: 0 });
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [addModalOpen, setAddModalOpen] = useState(false);

    const navigate = useNavigate();
    const { toast } = useToast();

    const { setLoading, isLoading } = useLoadingStates([
        'logout',
        'deposit',
        'addProduct',
        'buy',
        'resetBalance',
        'updateProduct',
        'deleteProduct',
        'fetchProducts',
        'fetchSessions',
    ]);

    const clearLocalStorage = useCallback(() => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        localStorage.removeItem('notified');
    }, []);

    const startEditingProduct = (product: Product) => {
        setEditingProduct(product);
        setEditModalOpen(true);
    }

    const updateLocalStorage = useCallback(() => {
        const refresh = localStorage.getItem('refresh_token');
        const access = localStorage.getItem('access_token');

        if (Object.keys(user).length === 0 || !refresh || !access) {
            clearLocalStorage();
            navigate('/');
        } else {
            localStorage.setItem('user', JSON.stringify({ ...user, deposit: balance }));
        }
    }, [balance, user, navigate, clearLocalStorage]);

    const handleLogout = async () => {
        setLoading('logout', true);
        try {
            const response = await api.logout();
            if (response.success) {
                clearLocalStorage();
                navigate('/');
            } else {
                toast({
                    title: 'Error',
                    description: response.message as string,
                    variant: 'destructive',
                });
            }
        } catch (error) {
            console.error('Error logging out:', error);
        } finally {
            setLoading('logout', false);
        }
    };

    const handleLogoutFromAllDevices = async () => {
        setLoading('logout', true);
        try {
            const response = await api.logoutAll();
            if (response.success) {
                clearLocalStorage();
                navigate('/');
            } else {
                toast({
                    title: 'Error',
                    description: response.message as string,
                    variant: 'destructive',
                });
            }
        } catch (error) {
            console.error('Error logging out from all devices:', error);
        } finally {
            setLoading('logout', false);
        }
    };

    const handleDeposit = async (amount: number) => {
        setLoading('deposit', true);
        try {
            const response = await api.depositMoney(amount);
            if (response.success) {
                setBalance(balance + amount);
                toast({
                    title: 'Deposit successful',
                    description: 'Balance updated!',
                });
            } else {
                toast({
                    title: 'Error',
                    description: response.message as string,
                    variant: 'destructive',
                });
            }
        } catch (error) {
            console.error('Error depositing money:', error);
        } finally {
            setLoading('deposit', false);
        }
    };

    const handleBuy = async (productId: number, quantity: number) => {
        setLoading('buy', true);
        try {
            const response = await api.buyProduct(productId, quantity);
            if (response.success) {
                setBalance(response.data.change);
                setProducts(products.map(p =>
                    p.id === productId ? { ...p, amount_available: p.amount_available - quantity } : p
                ));
                toast({
                    title: 'Purchase successful',
                    description: 'Product purchased!',
                });
            } else {
                toast({
                    title: 'Error',
                    description: response.message as string,
                    variant: 'destructive',
                });
            }
        } catch (error) {
            console.error('Error buying product:', error);
        } finally {
            setLoading('buy', false);
        }
    };

    const handleAddProduct = async () => {
        setLoading('addProduct', true);
        setAddModalOpen(true);
        try {
            if (newProduct.product_name && newProduct.cost > 0 && newProduct.amount_available > 0) {
                const response = await api.addProduct(newProduct);
                if (response.success) {
                    setProducts([...products, response.data]);
                    setNewProduct({ product_name: '', seller_id: user.id, amount_available: 0, cost: 0 });
                    setAddModalOpen(false);
                    toast({
                        title: 'Success',
                        description: 'Product added successfully',
                    });
                } else {
                    toast({
                        title: 'Error',
                        description: response.message as string,
                        variant: 'destructive',
                    });
                }
            } else {
                toast({
                    title: 'Error',
                    description: 'Please fill all the fields',
                    variant: 'destructive',
                });
            }
        } catch (error) {
            console.error('Error adding product:', error);
        } finally {
            setLoading('addProduct', false);
        }
    };

    const handleUpdateProduct = async () => {
        if (!editingProduct) return;
        setLoading('updateProduct', true);
        try {
            const response = await api.updateProduct(editingProduct);
            if (response.success) {
                setProducts(products.map(p => p.id === editingProduct.id ? editingProduct : p));
                setEditingProduct(null);
                setEditModalOpen(false);
                toast({
                    title: 'Success',
                    description: 'Product updated successfully',
                });
            } else {
                toast({
                    title: 'Error',
                    description: response.message as string,
                    variant: 'destructive',
                });
            }
        } catch (error) {
            console.error('Error updating product:', error);
        } finally {
            setLoading('updateProduct', false);
        }
    };

    const handleDeleteProduct = async (productId: number) => {
        setLoading('deleteProduct', true);
        try {
            const response = await api.deleteProduct(productId);
            if (response.success) {
                setProducts(products.filter(p => p.id !== productId));
                toast({
                    title: 'Success',
                    description: 'Product deleted successfully',
                });
            } else {
                toast({
                    title: 'Error',
                    description: response.message as string,
                    variant: 'destructive',
                });
            }
        } catch (error) {
            console.error('Error deleting product:', error);
        } finally {
            setLoading('deleteProduct', false);
        }
    };

    const handleResetBalance = async () => {
        setLoading('resetBalance', true);
        try {
            const response = await api.resetBalance();
            if (response.success) {
                setBalance(0);
                toast({
                    title: 'Success',
                    description: 'Balance reset successfully',
                });
            } else {
                toast({
                    title: 'Error',
                    description: response.message as string,
                    variant: 'destructive',
                });
            }
        } catch (error) {
            console.error('Error resetting balance:', error);
        } finally {
            setLoading('resetBalance', false);
        }
    };

    useEffect(() => {
        updateLocalStorage();
    }, [balance, user, updateLocalStorage]);

    useEffect(() => {
        const fetchActiveSessions = async () => {
            setLoading('fetchSessions', true);
            try {
                const response = await api.getActiveSessions();
                if (response.success) {
                    const sessionsCount = parseInt(response.data.active_sessions);
                    if (sessionsCount > 0 && !localStorage.getItem('notified')) {
                        setShowAlert(true);
                    }
                }
            } catch (error) {
                console.error('Error fetching active sessions:', error);
            } finally {
                setLoading('fetchSessions', false);
            }
        };

        const fetchProducts = async () => {
            setLoading('fetchProducts', true);
            try {
                const response = await api.getProducts();
                if (response.success) {
                    setProducts(response.data);
                }
            } catch (error) {
                console.error('Error fetching products:', error);
            } finally {
                setLoading('fetchProducts', false);
            }
        };

        fetchActiveSessions();
        fetchProducts();
    }, [setLoading]);

    return {
        user,
        products,
        balance,
        showAlert,
        newProduct,
        editingProduct,
        editModalOpen,
        addModalOpen,
        startEditingProduct,
        setAddModalOpen,
        setEditModalOpen,
        isLoading,
        setNewProduct,
        setEditingProduct,
        setShowAlert,
        handleLogout,
        handleLogoutFromAllDevices,
        handleDeposit,
        handleBuy,
        handleAddProduct,
        handleUpdateProduct,
        handleDeleteProduct,
        handleResetBalance,
    };
}