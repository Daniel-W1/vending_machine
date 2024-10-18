import React from 'react';
import { Product } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Loader2 } from 'lucide-react';

interface SellerPanelProps {
  newProduct: Product;
  setNewProduct: React.Dispatch<React.SetStateAction<Product>>;
  onAddProduct: () => void;
  isAdding: boolean;
  editingProduct: Product | null;
  setEditingProduct: React.Dispatch<React.SetStateAction<Product | null>>;
  onUpdateProduct: () => void;
  isUpdating: boolean;
  addModalOpen: boolean;
  setAddModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  editModalOpen: boolean;
  setEditModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export function SellerPanel({
  newProduct,
  setNewProduct,
  onAddProduct,
  isAdding,
  editingProduct,
  setEditingProduct,
  onUpdateProduct,
  isUpdating,
  addModalOpen,
  setAddModalOpen,
  editModalOpen,
  setEditModalOpen,
}: SellerPanelProps) {

    console.log(editModalOpen, editingProduct, 'edit modal')
  return (
    <>
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
              <Label htmlFor="name" className="text-right">Name</Label>
              <Input
                id="name"
                value={newProduct.product_name}
                onChange={(e) => setNewProduct({ ...newProduct, product_name: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="price" className="text-right">Price (in cents)</Label>
              <Input
                id="price"
                type="number"
                value={newProduct.cost}
                onChange={(e) => setNewProduct({ ...newProduct, cost: parseFloat(e.target.value) })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="quantity" className="text-right">Quantity</Label>
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
            onClick={onAddProduct}
            className="w-full bg-green-500 hover:bg-green-600 text-white"
            disabled={isAdding}
          >
            {isAdding && <Loader2 className="w-4 h-4 mr-2" />}
            Add Product
          </Button>
        </DialogContent>
      </Dialog>

      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-name" className="text-right">Name</Label>
              <Input
                id="edit-name"
                value={editingProduct?.product_name}
                onChange={(e) => setEditingProduct(prev => prev ? { ...prev, product_name: e.target.value } : null)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-price" className="text-right">Price (in cents)</Label>
              <Input
                id="edit-price"
                type="number"
                value={editingProduct?.cost}
                onChange={(e) => setEditingProduct(prev => prev ? { ...prev, cost: parseFloat(e.target.value) } : null)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-quantity" className="text-right">Quantity</Label>
              <Input
                id="edit-quantity"
                type="number"
                value={editingProduct?.amount_available}
                onChange={(e) => setEditingProduct(prev => prev ? { ...prev, amount_available: parseInt(e.target.value) } : null)}
                className="col-span-3"
              />
            </div>
          </div>
          <Button
            onClick={onUpdateProduct}
            className="w-full bg-green-500 hover:bg-green-600 text-white"
            disabled={isUpdating}
          >
            {isUpdating && <Loader2 className="w-4 h-4 mr-2" />}
            Update Product
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
}