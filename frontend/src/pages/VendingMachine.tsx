import { useVendingMachine } from '@/hooks/useVendingMachine'
import { AlertBanner } from "@/components/alertBanner"
import Header from "@/components/header"
import { ProductGrid } from "@/components/productGrid"
import { BuyerPanel } from "@/components/buyerPanel"
import { SellerPanel } from "@/components/sellerPanel"
import Footer from "@/components/footer"
import { Toaster } from '@/components/ui/toaster'

export default function VendingMachine() {
    const {
        user,
        products,
        balance,
        showAlert,
        newProduct,
        editingProduct,
        addModalOpen,
        editModalOpen,
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
        startEditingProduct,
    } = useVendingMachine();

    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-100 to-purple-100 flex flex-col">
            <Toaster />
            <AlertBanner
                show={showAlert}
                onLogoutAll={handleLogoutFromAllDevices}
                onDismiss={() => {
                    setShowAlert(false)
                    localStorage.setItem('notified', 'true')
                }}
            />
            <Header
                user={user}
                isLoading={isLoading('logout')}
                onLogout={handleLogout}
            />
            <main className="flex-grow p-4 flex items-center justify-center">
                <div className="bg-gray-800 rounded-lg shadow-2xl p-6 w-full max-w-3xl">
                    <ProductGrid
                        products={products}
                        userRole={user.role}
                        userId={user.id}
                        onBuy={handleBuy}
                        onEdit={startEditingProduct}
                        onDelete={handleDeleteProduct}
                        isBuying={isLoading('buy')}
                        isUpdating={isLoading('updateProduct')}
                        isDeleting={isLoading('deleteProduct')}
                    />
                    {user.role === 'buyer' && (
                        <BuyerPanel
                            balance={balance}
                            onDeposit={handleDeposit}
                            onResetBalance={handleResetBalance}
                            isDepositing={isLoading('deposit')}
                            isResetting={isLoading('resetBalance')}
                        />
                    )}
                    {user.role === 'seller' && (
                        <SellerPanel
                            addModalOpen={addModalOpen}
                            setAddModalOpen={setAddModalOpen}
                            editModalOpen={editModalOpen}
                            setEditModalOpen={setEditModalOpen}
                            newProduct={newProduct}
                            setNewProduct={setNewProduct}
                            onAddProduct={handleAddProduct}
                            isAdding={isLoading('addProduct')}
                            editingProduct={editingProduct}
                            setEditingProduct={setEditingProduct}
                            onUpdateProduct={handleUpdateProduct}
                            isUpdating={isLoading('updateProduct')}
                        />
                    )}
                </div>
            </main>
            <Footer />
        </div>
    )
}