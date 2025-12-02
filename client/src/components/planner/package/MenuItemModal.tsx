import React, { useState } from 'react';
import { MenuItem } from '@/types';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { Minus, Plus } from 'lucide-react';

interface MenuItemModalProps {
    item: MenuItem;
    isOpen: boolean;
    onClose: () => void;
    onAddToCart: (quantity: number, specialInstructions: string) => void;
}

export default function MenuItemModal({ item, isOpen, onClose, onAddToCart }: MenuItemModalProps) {
    const [quantity, setQuantity] = useState(1);
    const [instructions, setInstructions] = useState('');

    const handleIncrement = () => setQuantity(q => q + 1);
    const handleDecrement = () => setQuantity(q => Math.max(1, q - 1));

    const handleAddToOrder = () => {
        onAddToCart(quantity, instructions);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={item.name} size="lg">
            <div className="flex flex-col md:flex-row gap-6">
                {item.image_url && (
                    <div className="w-full md:w-1/2 h-64 md:h-auto rounded-lg overflow-hidden bg-gray-100">
                        <img
                            src={item.image_url}
                            alt={item.name}
                            className="w-full h-full object-cover"
                        />
                    </div>
                )}

                <div className="flex-1 flex flex-col">
                    <div className="flex-1">
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="text-2xl font-bold">{item.name}</h3>
                            <span className="text-xl font-semibold">${item.price.toFixed(2)}</span>
                        </div>
                        <p className="text-gray-600 mb-6">{item.description}</p>

                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Special Instructions
                            </label>
                            <Textarea
                                placeholder="Add a note for the kitchen (e.g. no onions, sauce on side)"
                                value={instructions}
                                onChange={(e) => setInstructions(e.target.value)}
                                rows={3}
                            />
                        </div>
                    </div>

                    <div className="border-t pt-6 mt-auto">
                        <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center border rounded-md">
                                <button
                                    onClick={handleDecrement}
                                    className="p-3 hover:bg-gray-50 text-gray-600 disabled:opacity-50"
                                    disabled={quantity <= 1}
                                >
                                    <Minus className="w-4 h-4" />
                                </button>
                                <span className="w-12 text-center font-medium">{quantity}</span>
                                <button
                                    onClick={handleIncrement}
                                    className="p-3 hover:bg-gray-50 text-gray-600"
                                >
                                    <Plus className="w-4 h-4" />
                                </button>
                            </div>

                            <Button
                                className="flex-1 py-6 text-lg"
                                onClick={handleAddToOrder}
                            >
                                Add to Order - ${(item.price * quantity).toFixed(2)}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </Modal>
    );
}
