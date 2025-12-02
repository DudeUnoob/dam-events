import React from 'react';
import { MenuCategory, MenuItem } from '@/types';
import { Card } from '@/components/ui/Card';
import { Plus } from 'lucide-react';
import MenuItemModal from './MenuItemModal';

interface MenuSectionProps {
    category: MenuCategory;
    onAdd: (item: MenuItem, quantity: number, specialInstructions: string) => void;
}

export default function MenuSection({ category, onAdd }: MenuSectionProps) {
    const [selectedItem, setSelectedItem] = React.useState<MenuItem | null>(null);

    return (
        <div id={`category-${category.id}`} className="scroll-mt-24">
            <h2 className="text-2xl font-bold mb-4">{category.name}</h2>
            {category.description && (
                <p className="text-gray-500 mb-6">{category.description}</p>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {category.items.map((item) => (
                    <Card
                        key={item.id}
                        className="flex overflow-hidden cursor-pointer hover:shadow-md transition-shadow border-gray-200"
                        onClick={() => setSelectedItem(item)}
                    >
                        <div className="flex-1 p-4 flex flex-col justify-between">
                            <div>
                                <div className="flex justify-between items-start mb-1">
                                    <h3 className="font-semibold text-lg">{item.name}</h3>
                                    <span className="font-medium text-gray-900">${item.price.toFixed(2)}</span>
                                </div>
                                <p className="text-gray-500 text-sm line-clamp-2 mb-3">{item.description}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                {item.popular && (
                                    <span className="text-xs font-medium text-orange-600 bg-orange-50 px-2 py-1 rounded-full">
                                        Popular
                                    </span>
                                )}
                                {item.dietary_tags?.map(tag => (
                                    <span key={tag} className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full capitalize">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                        {item.image_url && (
                            <div className="w-32 h-32 shrink-0 bg-gray-100 relative">
                                <img
                                    src={item.image_url}
                                    alt={item.name}
                                    className="w-full h-full object-cover"
                                />
                                <button className="absolute bottom-2 right-2 bg-white rounded-full p-1 shadow-sm border border-gray-200">
                                    <Plus className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                    </Card>
                ))}
            </div>

            {selectedItem && (
                <MenuItemModal
                    item={selectedItem}
                    isOpen={!!selectedItem}
                    onClose={() => setSelectedItem(null)}
                    onAddToCart={(quantity: number, instructions: string) => {
                        onAdd(selectedItem, quantity, instructions);
                    }}
                />
            )}
        </div>
    );
}
