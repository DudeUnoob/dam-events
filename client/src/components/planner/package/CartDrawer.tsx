import React from 'react';
import { CartItem } from './FoodPackageDetail';
import { Button } from '@/components/ui/Button';
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';

interface CartDrawerProps {
    cart: CartItem[];
    onUpdateQuantity: (itemId: string, quantity: number, specialInstructions?: string) => void;
    onRemove: (itemId: string, specialInstructions?: string) => void;
    onCheckout: () => void;
    onCreateQuote: () => void;
    subtotal: number;
}

export default function CartDrawer({
    cart,
    onUpdateQuantity,
    onRemove,
    onCheckout,
    onCreateQuote,
    subtotal
}: CartDrawerProps) {
    return (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden flex flex-col h-[calc(100vh-120px)] sticky top-24">
            <div className="p-6 border-b border-gray-100 bg-white z-10">
                <h2 className="text-xl font-bold flex items-center">
                    Your Order
                    {cart.length > 0 && (
                        <span className="ml-2 bg-black text-white text-xs px-2 py-0.5 rounded-full">{cart.length}</span>
                    )}
                </h2>
            </div>

            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                {cart.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center space-y-4 text-gray-500">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center">
                            <ShoppingBag className="w-8 h-8 text-gray-300" />
                        </div>
                        <p className="text-lg font-medium text-gray-900">Your cart is empty</p>
                        <p className="text-sm max-w-[200px]">Add items from the menu to start your order.</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {cart.map((item) => (
                            <div key={item.uniqueId} className="group animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex-1 pr-4">
                                        <h4 className="font-semibold text-gray-900">{item.name}</h4>
                                        {item.specialInstructions && (
                                            <p className="text-xs text-gray-500 mt-1 italic">"{item.specialInstructions}"</p>
                                        )}
                                        <p className="text-sm text-gray-500 mt-1">${item.price.toFixed(2)}</p>
                                    </div>
                                    <div className="flex items-center border rounded-lg bg-gray-50">
                                        <button 
                                            onClick={() => onUpdateQuantity(item.uniqueId, Math.max(0, item.quantity - 1))}
                                            className="p-1 hover:bg-gray-200 rounded-l-lg transition-colors"
                                        >
                                            <Minus className="w-4 h-4" />
                                        </button>
                                        <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                                        <button 
                                            onClick={() => onUpdateQuantity(item.uniqueId, item.quantity + 1)}
                                            className="p-1 hover:bg-gray-200 rounded-r-lg transition-colors"
                                        >
                                            <Plus className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                                <div className="flex justify-end">
                                    <button 
                                        onClick={() => onRemove(item.uniqueId)}
                                        className="text-xs text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        Remove
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {cart.length > 0 && (
                <div className="p-6 bg-gray-50 border-t border-gray-100 space-y-4 z-10">
                    <div className="flex justify-between items-center text-lg font-bold">
                        <span>Subtotal</span>
                        <span>${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <Button 
                            variant="ghost"
                            size="sm"
                            className="h-9 px-4 bg-[#232834] hover:bg-[#111827] text-white rounded-[15px] text-xs font-medium tracking-[-0.15px] leading-5 border border-transparent whitespace-nowrap"
                            onClick={onCreateQuote}
                        >
                            Create Quote
                        </Button>
                        <Button 
                            variant="ghost"
                            size="sm"
                            className="h-9 px-4 bg-[#232834] hover:bg-[#111827] text-white rounded-[15px] text-xs font-medium tracking-[-0.15px] leading-5 border border-transparent whitespace-nowrap shadow-md hover:shadow-lg"
                            onClick={onCheckout}
                        >
                            Book Now
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}