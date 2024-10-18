import { useEffect, useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Separator } from "@/components/ui/separator"
import { Plus, ShoppingCart, User as UserIcon, LogOut, Loader2, Edit, Trash2 } from 'lucide-react'
import { User, Product } from '@/types'
import { logout } from '@/services/api/auth'
import { useNavigate } from 'react-router-dom'
import { useToast } from '@/hooks/use-toast'
import { addProduct, buyProduct, depositMoney, getProducts, resetBalance, updateProduct, deleteProduct, getActiveSessions, logoutAll } from '@/services/api/home'
import { Toaster } from '@/components/ui/toaster'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

export default function VendingMachine() {
    const user = JSON.parse(localStorage.getItem('user') || '{}') as User;
    const [products, setProducts] = useState<Product[]>([])
    const [balance, setBalance] = useState(user.deposit || 0)
    const [newProduct, setNewProduct] = useState<Product>({ product_name: '', seller_id: user.id, amount_available: 0, cost: 0 })
    const [editingProduct, setEditingProduct] = useState<Product | null>(null)
    const navigate = useNavigate()
    const { toast } = useToast()
    const [logoutLoading, setLogoutLoading] = useState(false)
    const [depositLoading, setDepositLoading] = useState(false)
    const [addProductLoading, setAddProductLoading] = useState(false)
    const [buyLoading, setBuyLoading] = useState(false)
    const [resetBalanceLoading, setResetBalanceLoading] = useState(false)
    const [updateProductLoading, setUpdateProductLoading] = useState(false)
    const [deleteProductLoading, setDeleteProductLoading] = useState(false)
    const [editModalOpen, setEditModalOpen] = useState(false)
    const [addModalOpen, setAddModalOpen] = useState(false)
    const [showAlert, setshowAlert] = useState(false)

    useEffect(() => {
        const fetchActiveSessions = async () => {
            const response = await getActiveSessions()
            if (response.success) {
                console.log(response.data, 'response.data');
                const sessionsCount = parseInt(response.data.active_sessions)
                if (sessionsCount > 1 && !localStorage.getItem('notified')) {
                    setshowAlert(true)
                }
            }
        }

        fetchActiveSessions()

        const fetchProducts = async () => {
            const response = await getProducts()
            if (response.success) {
                setProducts(response.data)
            }
        }

        fetchProducts()
    }, [])

    useEffect(() => {
        // update the user local storage
        const refresh = localStorage.getItem('refresh_token');
        const access = localStorage.getItem('access_token');

        if (Object.keys(user).length === 0 || !refresh || !access) {
            // clean the local storage
            localStorage.removeItem('access_token')
            localStorage.removeItem('refresh_token')
            localStorage.removeItem('user')
            navigate('/')
        }
        else {
            localStorage.setItem('user', JSON.stringify({ ...user, deposit: balance }))
        }
    }, [balance, user, navigate])

    const handleAddProduct = async () => {
        setAddProductLoading(true)
        setAddModalOpen(true)
        if (newProduct && newProduct.product_name && newProduct.cost > 0 && newProduct.amount_available > 0) {
            const response = await addProduct({ ...newProduct })
            if (response.success) {
                setProducts([...products, response.data])
                setNewProduct({ product_name: '', seller_id: user.id, amount_available: 0, cost: 0 })
                setAddModalOpen(false)
            }
            else {
                toast({
                    title: 'Error',
                    description: response.message as string,
                    variant: 'destructive'
                })
            }
        }
        else {
            toast({
                title: 'Error',
                description: 'Please fill all the fields',
                variant: 'destructive'
            })
        }
        setAddProductLoading(false)
    }

    const handleUpdateProduct = async () => {
        setEditModalOpen(true)
        if (!editingProduct) return;
        setUpdateProductLoading(true)
        const response = await updateProduct(editingProduct)
        if (response.success) {
            console.log(response.data, 'response.data');
            setProducts(products.map(p => p.id === editingProduct.id ? editingProduct : p))
            setEditingProduct(null)
            setEditModalOpen(false)
            toast({
                title: 'Success',
                description: 'Product updated successfully',
            })
        } else {
            toast({
                title: 'Error',
                description: response.message as string,
                variant: 'destructive'
            })
        }
        setUpdateProductLoading(false)
    }

    const handleDeleteProduct = async (productId: number) => {
        setDeleteProductLoading(true)
        const response = await deleteProduct(productId)
        if (response.success) {
            console.log(response.data, 'response.data');
            setProducts(products.filter(p => p.id !== productId))
            toast({
                title: 'Success',
                description: 'Product deleted successfully',
            })
        } else {
            toast({
                title: 'Error',
                description: response.message as string,
                variant: 'destructive'
            })
        }
        setDeleteProductLoading(false)
    }

    const handleDeposit = async (amount: number) => {
        setDepositLoading(true)
        const response = await depositMoney(amount);
        if (response.success) {
            setBalance(balance + amount)
            toast({
                title: 'Deposit successful',
                description: 'Balance updated!',
            })
        }
        else {
            console.log(response.message, 'response.message');
            toast({
                title: 'Error',
                description: response.message as string,
                variant: 'destructive'
            })
        }
        setDepositLoading(false)
    }

    const handleBuy = async (product_id: number, quantity: number) => {
        setBuyLoading(true)
        const response = await buyProduct(product_id, quantity)
        if (response.success) {
            setBalance(response.data.change)
            setProducts(products.map(p =>
                p.id === product_id ? { ...p, amount_available: p.amount_available - 1 } : p
            ))

            toast({
                title: 'Purchase successful',
                description: 'Product purchased!',
            })
        }
        else {
            toast({
                title: 'Error',
                description: response.message as string,
                variant: 'destructive'
            })
        }
        setBuyLoading(false)
    }

    const handleLogout = async () => {
        setLogoutLoading(true)
        const response = await logout()
        if (response.success) {
            localStorage.removeItem('access_token')
            localStorage.removeItem('refresh_token')
            localStorage.removeItem('user')
            localStorage.removeItem('notified')
            navigate('/')
        }
        else {
            toast({
                title: 'Error',
                description: response.message as string,
                variant: 'destructive'
            })
        }
        setLogoutLoading(false)
    }

    const handleLogoutFromAllDevices = async () => {
        setLogoutLoading(true)
        const response = await logoutAll()
        if (response.success) {
            localStorage.removeItem('access_token')
            localStorage.removeItem('refresh_token')
            localStorage.removeItem('user')
            navigate('/')
        }
        else {
            toast({
                title: 'Error',
                description: response.message as string,
                variant: 'destructive'
            })
        }
        setLogoutLoading(false)
    }

    const handleResetBalance = async () => {
        setResetBalanceLoading(true)
        const response = await resetBalance()
        if (response.success) {
            setBalance(0)
        }
        else {
            toast({
                title: 'Error',
                description: response.message as string,
                variant: 'destructive'
            })
        }
        setResetBalanceLoading(false)
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-100 to-purple-100 flex flex-col">
            <Toaster />
            {showAlert &&
                <Alert className='absolute z-10 bg-background' variant={'destructive'}>
                    <AlertTitle>Heads up!</AlertTitle>
                    <AlertDescription className='flex space-x-2 items-center'>
                        <span>You already have active sessions, If that's not you, please logout quickly!</span>
                        <Button onClick={handleLogoutFromAllDevices} variant={'ghost'} className='underline'>Logout from all devices</Button>
                        <Button onClick={() => {
                            setshowAlert(false)
                            localStorage.setItem('notified', 'true')
                        }} variant={'ghost'} className='text-green-500 px-2'>It's Ok</Button>
                    </AlertDescription>
                </Alert>}
            <header className="bg-gray-800 text-white p-4 shadow-md">
                <div className="container mx-auto flex justify-between items-center">
                    <h1 className="text-2xl font-bold">Virtual Vend</h1>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="w-10 h-10 rounded-full p-0">
                                <UserIcon className="h-6 w-6" />
                                <span className="sr-only">Open user menu</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem className="text-sm font-medium">
                                {user.username}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={handleLogout} disabled={logoutLoading}>
                                <LogOut className="mr-2 h-4 w-4" />
                                <span>Log out</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </header>
            <main className="flex-grow p-4 flex items-center justify-center">
                <div className="bg-gray-800 rounded-lg shadow-2xl p-6 w-full max-w-3xl">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                        {products.map(product => (
                            <div key={product.id} className="bg-white rounded-lg px-4 py-2 flex flex-col items-center justify-between relative">
                                <div className="text-center w-full">
                                    <h3 className="font-bold capitalize">{product.product_name}</h3>
                                    <Separator className="mb-2 w-full" />
                                    <p className="text-base text-gray-500 font-bold">${parseFloat(product.cost.toString()).toFixed(2)}</p>
                                    <p className="text-sm text-gray-400">Qty: {product.amount_available}</p>
                                    {product.amount_available === 0 && <Badge className="text-xs absolute top-2 -right-4 rotate-45" variant={'destructive'}>Sold Out</Badge>}
                                </div>
                                {user.role === 'buyer' && (
                                    <Button
                                        onClick={() => handleBuy(product.id!, 1)}
                                        disabled={product.amount_available === 0 || buyLoading}
                                        className="mt-2 w-full"
                                    >
                                        <ShoppingCart className="w-4 h-4 mr-2" /> Buy
                                    </Button>
                                )}
                                {user.role === 'seller' && user.id === product.seller_id && (
                                    <div className="flex mt-2 space-x-1 absolute bottom-0 right-1">
                                        <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
                                            <DialogTrigger asChild>
                                                <Button
                                                    className="p-2"
                                                    variant="ghost"
                                                    onClick={() => setEditingProduct(product)}
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent>
                                                <DialogHeader>
                                                    <DialogTitle>Edit Product</DialogTitle>
                                                </DialogHeader>
                                                <div className="grid gap-4 py-4">
                                                    <div className="grid grid-cols-4 items-center gap-4">
                                                        <Label htmlFor="edit-name" className="text-right">
                                                            Name
                                                        </Label>
                                                        <Input
                                                            id="edit-name"
                                                            value={editingProduct?.product_name}
                                                            onChange={(e) => setEditingProduct({ ...product, product_name: e.target.value })}
                                                            className="col-span-3"
                                                        />
                                                    </div>
                                                    <div className="grid grid-cols-4 items-center gap-4">
                                                        <Label htmlFor="edit-price" className="text-right">
                                                            Price (in cents)
                                                        </Label>
                                                        <Input
                                                            id="edit-price"
                                                            type="number"
                                                            value={editingProduct?.cost}
                                                            onChange={(e) => setEditingProduct({ ...product, cost: parseFloat(e.target.value) })}
                                                            className="col-span-3"
                                                        />
                                                    </div>
                                                    <div className="grid grid-cols-4 items-center gap-4">
                                                        <Label htmlFor="edit-quantity" className="text-right">
                                                            Quantity
                                                        </Label>
                                                        <Input
                                                            id="edit-quantity"
                                                            type="number"
                                                            value={editingProduct?.amount_available}
                                                            onChange={(e) => setEditingProduct({ ...product, amount_available: parseInt(e.target.value) })}
                                                            className="col-span-3"
                                                        />
                                                    </div>
                                                </div>
                                                <Button
                                                    onClick={handleUpdateProduct}
                                                    className="w-full bg-green-500 hover:bg-green-600 text-white"
                                                    disabled={updateProductLoading}
                                                >
                                                    {updateProductLoading && <Loader2 className="w-4 h-4 mr-2" />}
                                                    Update Product
                                                </Button>
                                            </DialogContent>
                                        </Dialog>
                                        <Button
                                            onClick={() => handleDeleteProduct(product.id!)}
                                            className="p-2"
                                            variant="ghost"
                                            disabled={deleteProductLoading}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {user.role === 'buyer' && (
                        <div className="bg-white rounded-lg p-4 mb-6">
                            <div className="flex space-x-3 justify-between items-center mb-3">
                                <h2 className="font-bold mb-2">Your Balance: ${balance.toFixed(2)}</h2>
                                <Button onClick={handleResetBalance} variant="ghost" size={'sm'} disabled={resetBalanceLoading} className='hover:bg-red-500 hover:text-white'>
                                    Reset Balance
                                    {resetBalanceLoading && <Loader2 className="w-4 h-4 ml-2" />}
                                </Button>
                            </div>

                            <div className="flex flex-wrap gap-2 mb-4">
                                {[5, 10, 20, 50, 100].map((coin) => (
                                    <Button
                                        key={coin}
                                        onClick={() => handleDeposit(coin / 100)}
                                        disabled={depositLoading}
                                        className="flex-1"
                                    >
                                        {coin}¢
                                    </Button>
                                ))}
                            </div>
                        </div>
                    )}

                    {user.role === 'seller' && (
                        <Dialog open={addModalOpen} onOpenChange={setAddModalOpen}>
                            <DialogTrigger asChild>
                                <Button className="w-full mb-4 bg-green-500 hover:bg-green-600 text-white">
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add New Product
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Add New Product</DialogTitle>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="name" className="text-right">
                                            Name
                                        </Label>
                                        <Input
                                            id="name"
                                            value={newProduct.product_name}
                                            onChange={(e) => setNewProduct({ ...newProduct, product_name: e.target.value })}
                                            className="col-span-3"
                                        />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="price" className="text-right">
                                            Price (in cents)
                                        </Label>
                                        <Input
                                            id="price"
                                            type="number"
                                            value={newProduct.cost}
                                            onChange={(e) => setNewProduct({ ...newProduct, cost: parseFloat(e.target.value) })}
                                            className="col-span-3"
                                        />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="quantity" className="text-right">
                                            Quantity
                                        </Label>
                                        <Input
                                            id="quantity"
                                            type="number"
                                            value={newProduct.amount_available}
                                            onChange={(e) => setNewProduct({ ...newProduct, amount_available: parseInt(e.target.value) })}
                                            className="col-span-3"
                                        />
                                    </div>
                                </div>
                                <Button
                                    onClick={handleAddProduct}
                                    className="w-full bg-green-500 hover:bg-green-600 text-white"
                                    disabled={addProductLoading}
                                >
                                    {addProductLoading && <Loader2 className="w-4 h-4 mr-2" />}
                                    Add Product
                                </Button>
                            </DialogContent>
                        </Dialog>
                    )}
                </div>
            </main>
            <footer className="bg-gray-800 text-white text-center p-4">
                <p>© 2024 Virtual Vend. All rights reserved.</p>
            </footer>
        </div>
    )
}