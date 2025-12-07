'use client';

import React, { useState } from 'react';
import { Package, MenuCategory, MenuItem } from '@/types';
import { Button } from '@/components/ui/Button';
import MenuItemModal from './MenuItemModal';
import BookingView from './BookingView';
import QuoteView from './QuoteView';
import {
    Star,
    MapPin,
    Heart,
    Share2,
    Send,
    Phone,
    Plus,
    Users,
    ChefHat,
    Clock,
    Check,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';
import Link from 'next/link';

interface FoodPackageDetailProps {
    pkg: Package;
}

export interface CartItem extends MenuItem {
    quantity: number;
    specialInstructions?: string;
    categoryId: string;
    uniqueId: string;
}

// Menu category filters for the booking tab
const MENU_CATEGORIES = ['Individual', 'Bundles', 'Sides', 'Beverages', 'Desserts'];

// Mock menu items for demo (would come from pkg.catering_details in production)
const MOCK_MENU_ITEMS: MenuItem[] = [
    { id: '1', name: 'Grilled Chicken Platter', description: 'Herb-marinated grilled chicken with seasonal vegetables', price: 25.99, image_url: '/placeholder-food.jpg', popular: true },
    { id: '2', name: 'Mediterranean Salad', description: 'Fresh greens with feta, olives, and lemon vinaigrette', price: 18.99, image_url: '/placeholder-food.jpg', dietary_tags: ['vegetarian'] },
    { id: '3', name: 'BBQ Pulled Pork', description: 'Slow-smoked pulled pork with house-made BBQ sauce', price: 22.99, image_url: '/placeholder-food.jpg' },
    { id: '4', name: 'Veggie Spring Rolls', description: 'Crispy rolls filled with fresh vegetables and served with sweet chili sauce', price: 15.99, image_url: '/placeholder-food.jpg', dietary_tags: ['vegan'] },
    { id: '5', name: 'Grilled Salmon', description: 'Atlantic salmon with lemon butter and capers', price: 32.99, image_url: '/placeholder-food.jpg' },
    { id: '6', name: 'Caesar Salad', description: 'Romaine lettuce with parmesan, croutons, and Caesar dressing', price: 14.99, image_url: '/placeholder-food.jpg', dietary_tags: ['vegetarian'] },
    { id: '7', name: 'Beef Tenderloin', description: 'Premium beef with red wine reduction', price: 38.99, image_url: '/placeholder-food.jpg', popular: true },
    { id: '8', name: 'Mushroom Risotto', description: 'Creamy arborio rice with wild mushrooms', price: 21.99, image_url: '/placeholder-food.jpg', dietary_tags: ['vegetarian', 'gluten-free'] },
];

// Highlights list for overview tab
const HIGHLIGHTS = [
    'Delivery and Pickup',
    'Catering Setup',
    'Vegan Options',
    'Dietary Accommodations',
    'Gluten-Free Options',
    'Individual Foods and Bundles',
    'Same Day Delivery',
    'Provides Utensils',
];

// Mock reviews
const MOCK_REVIEWS = [
    { id: '1', name: 'Sarah M.', date: 'October 2024', rating: 4.5, text: 'The food was absolutely incredible! Our guests are still raving about the presentation and flavor.' },
    { id: '2', name: 'John D.', date: 'September 2024', rating: 4.5, text: 'Perfect for our corporate event. They accommodated all dietary restrictions and the custom menu was a huge hit with our team.' },
    { id: '3', name: 'Emily R.', date: 'August 2024', rating: 4.5, text: 'Excellent food quality and beautiful presentation. The vegan options were surprisingly delicious.' },
];

export default function FoodPackageDetail({ pkg }: FoodPackageDetailProps) {
    const [activeTab, setActiveTab] = useState<'booking' | 'overview'>('booking');
    const [activeMenuCategory, setActiveMenuCategory] = useState('Individual');
    const [deliveryType, setDeliveryType] = useState<'delivery' | 'pickup'>('delivery');
    const [cart, setCart] = useState<CartItem[]>([]);
    const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
    const [viewState, setViewState] = useState<'details' | 'booking' | 'quote'>('details');

    const addToCart = (item: MenuItem, quantity: number, specialInstructions: string, categoryId: string) => {
        const uniqueId = `${item.id}-${Date.now()}`;
        setCart(prev => [...prev, { ...item, quantity, specialInstructions, categoryId, uniqueId }]);
    };

    const removeFromCart = (uniqueId: string) => {
        setCart(prev => prev.filter(i => i.uniqueId !== uniqueId));
    };

    const updateQuantity = (uniqueId: string, quantity: number) => {
        if (quantity <= 0) {
            removeFromCart(uniqueId);
            return;
        }
        setCart(prev => prev.map(i => i.uniqueId === uniqueId ? { ...i, quantity } : i));
    };

    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // Get menu items - use real data if available, otherwise mock
    const menuItems = pkg.catering_details?.menu_categories?.flatMap(c => c.items) || MOCK_MENU_ITEMS;

    if (viewState === 'booking') {
        return (
            <BookingView
                cart={cart}
                subtotal={subtotal}
                onBack={() => setViewState('details')}
                pkg={pkg}
                onCreateQuote={() => setViewState('quote')}
            />
        );
    }

    if (viewState === 'quote') {
        return (
            <QuoteView
                cart={cart}
                subtotal={subtotal}
                onBack={() => setViewState('details')}
                pkg={pkg}
            />
        );
    }

    return (
        <div className="min-h-screen bg-white">
            {/* Main content sits under global navigation */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {/* Hero Image */}
                <div className="relative h-[208px] w-full rounded-t-[25px] overflow-hidden shadow-lg">
                    <img
                        src={pkg.photos?.[0] || '/placeholder-food.jpg'}
                        alt={pkg.name}
                        className="w-full h-full object-cover"
                    />
                </div>

                {/* Vendor Info Card - Below Hero */}
                <div className="bg-[#f4f6fa] rounded-b-[25px] shadow-lg px-8 py-6 mb-6">
                    <div className="flex justify-between items-start">
                        <div>
                            {/* Vendor Name */}
                            <h1 className="text-[32px] font-medium text-[#f9402b] mb-2">{pkg.name}</h1>

                            {/* Rating, Reviews, Location Row */}
                            <div className="flex items-center gap-4 text-sm">
                                <div className="flex items-center gap-1">
                                    <span className="font-normal text-base">4.2</span>
                                    <div className="flex">
                                        {[1, 2, 3, 4].map((i) => (
                                            <Star key={i} className="w-4 h-4 fill-[#545f71] text-[#545f71]" />
                                        ))}
                                        <Star className="w-4 h-4 text-[#9ba5b7]" />
                                    </div>
                                    <span className="text-base">(45)</span>
                                </div>
                                <div className="flex items-center gap-1 text-black">
                                    <MapPin className="w-5 h-5 text-[#545f71]" />
                                    <span>{pkg.vendor?.location_address || 'Location'}</span>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-3">
                            <button className="flex items-center gap-2 bg-white rounded-full px-4 py-2 text-sm">
                                <Heart className="w-5 h-5 text-[#545f71]" />
                                <span>Save</span>
                            </button>
                            <button className="flex items-center gap-2 bg-white rounded-full px-4 py-2 text-sm">
                                <Share2 className="w-5 h-5 text-[#545f71]" />
                                <span>Share</span>
                            </button>
                            <button className="p-2 text-[#545f71]">
                                <Send className="w-5 h-5" />
                            </button>
                            <button className="p-2 text-[#545f71]">
                                <Phone className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Booking / Overview Tabs + Delivery Toggle */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex gap-2">
                        <button
                            onClick={() => setActiveTab('booking')}
                            className={`px-8 py-3 rounded-full text-base font-normal transition-all ${
                                activeTab === 'booking'
                                    ? 'bg-[#232834] text-white'
                                    : 'bg-[#f2f4f8] text-black hover:bg-gray-200'
                            }`}
                        >
                            Booking
                        </button>
                        <button
                            onClick={() => setActiveTab('overview')}
                            className={`px-8 py-3 rounded-full text-base font-normal transition-all ${
                                activeTab === 'overview'
                                    ? 'bg-[#232834] text-white'
                                    : 'bg-[#f2f4f8] text-black hover:bg-gray-200'
                            }`}
                        >
                            Overview
                        </button>
                    </div>

                    {/* Delivery/Pickup Toggle - Only show on Booking tab */}
                    {activeTab === 'booking' && (
                        <div className="flex items-center bg-[#f4f6fa] rounded-full p-1">
                            <button
                                onClick={() => setDeliveryType('delivery')}
                                className={`px-6 py-2 rounded-full text-sm transition-all ${
                                    deliveryType === 'delivery'
                                        ? 'bg-white text-black shadow-sm'
                                        : 'text-[#545f71]'
                                }`}
                            >
                                Delivery
                            </button>
                            <button
                                onClick={() => setDeliveryType('pickup')}
                                className={`px-6 py-2 rounded-full text-sm transition-all ${
                                    deliveryType === 'pickup'
                                        ? 'bg-white text-black shadow-sm'
                                        : 'text-[#545f71]'
                                }`}
                            >
                                Pickup
                            </button>
                        </div>
                    )}
                </div>

                {/* Content based on active tab */}
                {activeTab === 'booking' ? (
                    <BookingTabContent
                        menuItems={menuItems}
                        activeMenuCategory={activeMenuCategory}
                        setActiveMenuCategory={setActiveMenuCategory}
                        onAddItem={setSelectedItem}
                        cart={cart}
                        subtotal={subtotal}
                        onCreateQuote={() => setViewState('quote')}
                        pkg={pkg}
                    />
                ) : (
                    <OverviewTabContent
                        pkg={pkg}
                        onCreateQuote={() => setViewState('quote')}
                    />
                )}
            </main>

            {/* Menu Item Modal */}
            {selectedItem && (
                <MenuItemModal
                    item={selectedItem}
                    isOpen={!!selectedItem}
                    onClose={() => setSelectedItem(null)}
                    onAddToCart={(quantity: number, instructions: string) => {
                        addToCart(selectedItem, quantity, instructions, 'menu');
                        setSelectedItem(null);
                    }}
                />
            )}
        </div>
    );
}

// Booking Tab Content Component
interface BookingTabContentProps {
    menuItems: MenuItem[];
    activeMenuCategory: string;
    setActiveMenuCategory: (category: string) => void;
    onAddItem: (item: MenuItem) => void;
    cart: CartItem[];
    subtotal: number;
    onCreateQuote: () => void;
    pkg: Package;
}

function BookingTabContent({
    menuItems,
    activeMenuCategory,
    setActiveMenuCategory,
    onAddItem,
    cart,
    subtotal,
    onCreateQuote,
    pkg,
}: BookingTabContentProps) {
    return (
        <div>
            {/* Catering Menu Header */}
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-[32px] font-normal">Catering Menu</h2>
                <Button
                    onClick={onCreateQuote}
                    variant="ghost"
                    size="sm"
                    className="h-9 px-4 bg-[#232834] hover:bg-[#111827] text-white rounded-[15px] text-xs font-medium tracking-[-0.15px] leading-5 border border-transparent flex items-center gap-2 whitespace-nowrap"
                >
                    <Plus className="w-5 h-5" />
                    <span>Create quote</span>
                </Button>
            </div>

            {/* Menu Category Filters */}
            <div className="flex items-center gap-4 mb-6">
                {MENU_CATEGORIES.map((category) => (
                    <button
                        key={category}
                        onClick={() => setActiveMenuCategory(category)}
                        className={`px-4 py-2 rounded-full text-base transition-all ${
                            activeMenuCategory === category
                                ? 'border border-black text-[#232834]'
                                : 'text-[#232834] hover:bg-gray-100'
                        }`}
                    >
                        {category}
                    </button>
                ))}
            </div>

            {/* Divider */}
            <div className="border-t border-gray-200 mb-6"></div>

            {/* Food Items Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {menuItems.map((item) => (
                    <FoodItemCard
                        key={item.id}
                        item={item}
                        onAdd={() => onAddItem(item)}
                    />
                ))}
            </div>
        </div>
    );
}

// Food Item Card Component
interface FoodItemCardProps {
    item: MenuItem;
    onAdd: () => void;
}

function FoodItemCard({ item, onAdd }: FoodItemCardProps) {
    return (
        <div className="bg-white border border-[#545f71]/30 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
            {/* Image placeholder */}
            <div className="h-28 bg-[#ededed] rounded-lg m-3">
                {item.image_url && (
                    <img
                        src={item.image_url}
                        alt={item.name}
                        className="w-full h-full object-cover rounded-lg"
                    />
                )}
            </div>

            {/* Content */}
            <div className="px-4 pb-4">
                <h3 className="font-medium text-base text-black mb-1">{item.name}</h3>
                <p className="text-[9px] text-black mb-2 line-clamp-1">{item.description}</p>

                <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs text-black">${item.price.toFixed(2)}</span>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onAdd();
                        }}
                        className="w-6 h-6 bg-[#545f71] rounded-full flex items-center justify-center text-white hover:bg-[#3d4554] transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}

// Overview Tab Content Component
interface OverviewTabContentProps {
    pkg: Package;
    onCreateQuote: () => void;
}

function OverviewTabContent({ pkg, onCreateQuote }: OverviewTabContentProps) {
    return (
        <div>
            <div className="flex gap-8">
                {/* Left Column - Main Content */}
                <div className="flex-1 space-y-6">
                    {/* About This Venue Card */}
                    <div className="bg-white border border-[#9ba5b7] rounded-[25px] p-6 shadow-sm">
                        <h3 className="text-2xl font-semibold mb-4">About This Venue</h3>
                        <p className="text-[#364153] text-base leading-relaxed mb-6">
                            {pkg.description || 'A boutique catering service dedicated to creating memorable dining experiences through fresh, locally-sourced ingredients and thoughtful presentation. We specialize in personalized menus that reflect your unique style and dietary preferences, from intimate gatherings to grand celebrations.'}
                        </p>

                        {/* Divider */}
                        <div className="border-t border-gray-200 my-6"></div>

                        {/* Details Section */}
                        <h4 className="text-2xl font-semibold mb-4">Details</h4>

                        {/* Details Grid */}
                        <div className="grid grid-cols-3 gap-4 mb-6">
                            <div className="bg-gray-50 rounded-xl p-4">
                                <div className="flex items-start gap-3">
                                    <Users className="w-6 h-6 text-gray-600 mt-1" />
                                    <div>
                                        <p className="text-[#6a7282] text-base">Guest Range</p>
                                        <p className="text-black text-base">Up to {pkg.capacity || 300} guests</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-50 rounded-xl p-4">
                                <div className="flex items-start gap-3">
                                    <ChefHat className="w-6 h-6 text-gray-600 mt-1" />
                                    <div>
                                        <p className="text-[#6a7282] text-base">Cuisine Types</p>
                                        <p className="text-black text-sm">American, Mediterranean</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-50 rounded-xl p-4">
                                <div className="flex items-start gap-3">
                                    <Clock className="w-6 h-6 text-gray-600 mt-1" />
                                    <div>
                                        <p className="text-[#6a7282] text-base">Booking Notice</p>
                                        <p className="text-black text-base">2 weeks minimum</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Days of Operation */}
                        <div className="mb-6">
                            <p className="text-[#6a7282] font-medium text-base mb-2">Days of Operation</p>
                            <div className="flex gap-2">
                                {['Monday', 'Tuesday', 'Wednesday', 'Thursday'].map((day) => (
                                    <span key={day} className="bg-[#f2f4f8] text-[#364153] px-3 py-1.5 rounded-full text-base">
                                        {day}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Service Types */}
                        <div className="flex items-center gap-4">
                            <p className="text-[#6a7282] font-medium text-base">Service Types Offered</p>
                            <span className="text-black text-base">11:00 am - 10:00 pm</span>
                        </div>
                        <div className="flex gap-2 mt-2 flex-wrap">
                            {['Full-Service Catering', 'Delivery', 'Buffet Style', 'Plated Service', 'Pick Up'].map((service) => (
                                <span key={service} className="bg-[#f2f4f8] text-[#364153] px-3 py-1.5 rounded-full text-base">
                                    {service}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Highlights Card */}
                    <div className="bg-white border border-[#9ba5b7] rounded-[25px] p-6 shadow-sm">
                        <h3 className="text-2xl font-semibold mb-4">Highlights</h3>
                        <div className="grid grid-cols-2 gap-3">
                            {HIGHLIGHTS.map((highlight) => (
                                <div key={highlight} className="flex items-center gap-3">
                                    <Check className="w-5 h-5 text-green-500" />
                                    <span className="text-black text-base">{highlight}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Column - Pricing & Map */}
                <div className="w-[340px] space-y-6">
                    {/* Pricing Card */}
                    <div className="bg-white border border-[#9ba5b7] rounded-[25px] p-6 shadow-sm">
                        <h3 className="text-2xl font-semibold mb-4">Pricing</h3>

                        <div className="mb-4">
                            <p className="text-[#4a5565] text-base">Ranging from</p>
                            <p className="text-[30px] text-black">
                                ${pkg.price_min || 20} - ${pkg.price_max || 80}
                            </p>
                            <p className="text-[#6a7282] text-base">per person</p>
                        </div>

                        {/* Divider */}
                        <div className="border-t border-gray-200 my-4"></div>

                        <Button
                            onClick={onCreateQuote}
                            variant="ghost"
                            size="sm"
                            className="w-full h-9 bg-[#232834] hover:bg-[#111827] text-white rounded-[15px] text-xs font-medium tracking-[-0.15px] leading-5 border border-transparent flex items-center justify-center gap-2"
                        >
                            <Plus className="w-5 h-5" />
                            <span>Create quote</span>
                        </Button>

                        <p className="text-center text-[#6a7282] text-base mt-3">
                            You'll be able to select or create an event
                        </p>
                    </div>

                    {/* Map Card */}
                    <div className="border border-[#9ba5b7]/30 rounded-[25px] overflow-hidden shadow-sm">
                        <div className="h-[460px] bg-gray-100 relative">
                            {/* Map placeholder - would use Google Maps in production */}
                            <img
                                src="https://maps.googleapis.com/maps/api/staticmap?center=Austin,TX&zoom=14&size=400x400&maptype=roadmap&key=YOUR_API_KEY"
                                alt="Map"
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).style.display = 'none';
                                }}
                            />
                            <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                                <MapPin className="w-12 h-12" />
                            </div>
                        </div>
                        <div className="bg-[#232834] text-white px-4 py-4 flex items-center gap-2">
                            <MapPin className="w-5 h-5 text-[#f2f4f8]" />
                            <span className="text-sm">{pkg.vendor?.location_address || 'Location'}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Reviews Section - Full Width Below */}
            <div className="mt-8 pt-8 border-t">
                <h3 className="text-2xl font-semibold mb-4">Reviews</h3>

                {/* Rating Summary */}
                <div className="flex items-center gap-2 mb-6">
                    <span className="text-2xl font-normal">4.2</span>
                    <div className="flex">
                        {[1, 2, 3, 4].map((i) => (
                            <Star key={i} className="w-5 h-5 fill-[#545f71] text-[#545f71]" />
                        ))}
                        <Star className="w-5 h-5 text-[#9ba5b7]" />
                    </div>
                    <span className="text-lg">(45)</span>
                </div>

                {/* Review Navigation */}
                <div className="flex justify-end gap-2 mb-4">
                    <button className="p-2 border rounded-full hover:bg-gray-100 transition-colors">
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button className="p-2 border rounded-full hover:bg-gray-100 transition-colors">
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>

                {/* Review Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {MOCK_REVIEWS.map((review) => (
                        <div key={review.id} className="border rounded-2xl p-5">
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <p className="font-normal text-black">{review.name}</p>
                                    <p className="text-[#6a7282] text-sm">{review.date}</p>
                                </div>
                                <div className="flex">
                                    {[1, 2, 3, 4].map((i) => (
                                        <Star key={i} className="w-4 h-4 fill-[#545f71] text-[#545f71]" />
                                    ))}
                                    <Star className="w-4 h-4 text-[#9ba5b7]" />
                                </div>
                            </div>
                            <p className="text-[#364153] text-base leading-relaxed">{review.text}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

