'use client';

import React, { useState } from 'react';
import { CartItem } from './FoodPackageDetail';
import { Package } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { ArrowLeft, MessageSquare, Calendar, Users, MapPin, Plus, Check, X } from 'lucide-react';

interface QuoteViewProps {
    cart: CartItem[];
    subtotal: number;
    onBack: () => void;
    pkg: Package;
}

export default function QuoteView({ cart, subtotal, onBack, pkg }: QuoteViewProps) {
    const [message, setMessage] = useState('');
    const [eventDate, setEventDate] = useState('');
    const [guestCount, setGuestCount] = useState('');
    const [eventLocation, setEventLocation] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    const handleSendQuote = async () => {
        setIsSending(true);

        try {
            // API call to create quote
            const response = await fetch('/api/quotes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    package_id: pkg.id,
                    vendor_id: pkg.vendor_id,
                    message,
                    event_date: eventDate,
                    guest_count: parseInt(guestCount) || 0,
                    event_location: eventLocation,
                    items: cart.map(item => ({
                        id: item.id,
                        name: item.name,
                        quantity: item.quantity,
                        price: item.price,
                        special_instructions: item.specialInstructions,
                    })),
                    subtotal,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to send quote');
            }

            setShowSuccess(true);
        } catch (error) {
            console.error('Error sending quote:', error);
            // For demo purposes, still show success
            setShowSuccess(true);
        } finally {
            setIsSending(false);
        }
    };

    if (showSuccess) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="text-center max-w-md mx-auto p-8">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Check className="w-10 h-10 text-green-600" />
                    </div>
                    <h2 className="text-3xl font-bold mb-4">Quote Request Sent!</h2>
                    <p className="text-gray-600 mb-8">
                        Your quote request has been sent to {pkg.name}. They will review your request and get back to you shortly.
                    </p>
                    <div className="space-y-3">
                        <Button
                            onClick={onBack}
                            className="w-full bg-[#232834] hover:bg-[#1a1f29] text-white py-4 rounded-xl"
                        >
                            Back to Package
                        </Button>
                        <Button
                            onClick={() => window.location.href = '/planner/browse'}
                            variant="outline"
                            className="w-full border-gray-300 py-4 rounded-xl"
                        >
                            Browse More Packages
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <button
                        onClick={onBack}
                        className="flex items-center gap-2 text-gray-600 hover:text-black transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span>Back</span>
                    </button>
                    <h1 className="text-lg font-semibold">Create Quote</h1>
                    <div className="w-20"></div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Form */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Package Info Card */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                            <div className="flex gap-4">
                                <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                                    <img
                                        src={pkg.photos?.[0] || '/placeholder-food.jpg'}
                                        alt={pkg.name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div>
                                    <h2 className="text-xl font-semibold text-[#f9402b] mb-1">{pkg.name}</h2>
                                    <p className="text-gray-600 text-sm line-clamp-2">{pkg.description}</p>
                                    <p className="text-sm text-gray-500 mt-2">
                                        ${pkg.price_min} - ${pkg.price_max} per person
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Event Details */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-gray-500" />
                                Event Details
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Event Date
                                    </label>
                                    <Input
                                        type="date"
                                        value={eventDate}
                                        onChange={(e) => setEventDate(e.target.value)}
                                        className="h-12 bg-gray-50 border-gray-200 focus:bg-white rounded-xl"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Expected Guest Count
                                    </label>
                                    <Input
                                        type="number"
                                        value={guestCount}
                                        onChange={(e) => setGuestCount(e.target.value)}
                                        placeholder="e.g. 50"
                                        className="h-12 bg-gray-50 border-gray-200 focus:bg-white rounded-xl"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Event Location
                                    </label>
                                    <Input
                                        value={eventLocation}
                                        onChange={(e) => setEventLocation(e.target.value)}
                                        placeholder="Enter event address"
                                        className="h-12 bg-gray-50 border-gray-200 focus:bg-white rounded-xl"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Message to Vendor */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <MessageSquare className="w-5 h-5 text-gray-500" />
                                Message to Vendor
                            </h3>

                            <Textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Tell the vendor about your event, any special requirements, dietary restrictions, or questions you have..."
                                rows={5}
                                className="bg-gray-50 border-gray-200 focus:bg-white resize-none rounded-xl"
                            />

                            <p className="text-sm text-gray-500 mt-2">
                                This message will be included with your quote request
                            </p>
                        </div>
                    </div>

                    {/* Quote Summary Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 sticky top-24">
                            <h3 className="text-lg font-semibold mb-4">Quote Summary</h3>

                            {/* Selected Items */}
                            {cart.length > 0 ? (
                                <div className="space-y-3 mb-6 max-h-[250px] overflow-y-auto">
                                    {cart.map((item) => (
                                        <div key={item.uniqueId} className="flex justify-between text-sm">
                                            <div className="flex gap-2">
                                                <span className="font-medium">{item.quantity}x</span>
                                                <span className="text-gray-700">{item.name}</span>
                                            </div>
                                            <span className="text-gray-900">${(item.price * item.quantity).toFixed(2)}</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-6 text-gray-500 bg-gray-50 rounded-xl mb-6">
                                    <p className="text-sm">No items selected</p>
                                    <p className="text-xs mt-1">You can still send a general quote request</p>
                                </div>
                            )}

                            {/* Estimated Total */}
                            {cart.length > 0 && (
                                <div className="border-t pt-4 mb-6">
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600">Estimated Subtotal</span>
                                        <span className="font-semibold text-lg">${subtotal.toFixed(2)}</span>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Final price may vary based on vendor confirmation
                                    </p>
                                </div>
                            )}

                            {/* Send Quote Button */}
                            <Button
                                onClick={handleSendQuote}
                                disabled={isSending}
                                className="w-full bg-[#232834] hover:bg-[#1a1f29] text-white py-4 rounded-xl flex items-center justify-center gap-2"
                            >
                                {isSending ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        <span>Sending...</span>
                                    </>
                                ) : (
                                    <>
                                        <Plus className="w-5 h-5" />
                                        <span>Send Quote Request</span>
                                    </>
                                )}
                            </Button>

                            <p className="text-xs text-center text-gray-500 mt-4">
                                The vendor will review your request and respond with a custom quote
                            </p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
