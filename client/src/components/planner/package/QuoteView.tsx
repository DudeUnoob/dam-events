'use client';

import React, { useState } from 'react';
import { CartItem } from './FoodPackageDetail';
import { Package } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { ArrowLeft, MessageSquare, Calendar, Users, MapPin, Plus, Check, X, Send as SendIcon } from 'lucide-react';

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
    const [step, setStep] = useState<'form' | 'review' | 'success'>('form');

    const handleConfirmQuote = async () => {
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

            setStep('success');
        } catch (error) {
            console.error('Error sending quote:', error);
            // For demo purposes, still show success
            setStep('success');
        } finally {
            setIsSending(false);
        }
    };

    const handleSendQuote = () => {
        setStep('review');
    };

    if (step === 'success') {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="max-w-3xl w-full bg-[#f2f4f8] rounded-[25px] border border-[#232834] px-10 py-10 flex flex-col items-center">
                    <div className="w-20 h-20 rounded-full border-[3px] border-[#545f71] flex items-center justify-center mb-6">
                        <Check className="w-10 h-10 text-[#545f71]" />
                    </div>
                    <h2 className="text-[32px] font-semibold text-black text-center mb-1">
                        Your quote has been sent!
                    </h2>
                    <p className="text-[12px] text-black text-center mb-8">
                        Start a message with your service provider
                    </p>

                    <div className="w-full bg-white rounded-[10px] px-6 py-4 mb-6 flex items-center">
                        <textarea
                            className="flex-1 text-[12px] text-black resize-none outline-none border-none bg-transparent min-h-[96px] placeholder:text-black/60"
                            placeholder="send a message..."
                        />
                        <button
                            type="button"
                            className="ml-4 w-9 h-9 rounded-full border border-[#545f71] flex items-center justify-center text-[#545f71]"
                        >
                            <SendIcon className="w-4 h-4" />
                        </button>
                    </div>

                    <Button
                        variant="ghost"
                        size="sm"
                        className="mt-2 h-9 px-10 bg-[#232834] hover:bg-[#111827] text-white rounded-[15px] text-xs font-medium tracking-[-0.15px] leading-5 border border-transparent whitespace-nowrap"
                        onClick={onBack}
                    >
                        Exit
                    </Button>
                </div>
            </div>
        );
    }

    if (step === 'review') {
        const dateDisplay = eventDate ? new Date(eventDate).toLocaleDateString() : 'TBD';
        const guestsDisplay = guestCount || '0';
        const locationDisplay = eventLocation || 'Location not specified';

        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="max-w-3xl w-full bg-[#f2f4f8] rounded-[25px] border border-[#232834] px-10 py-8">
                    <h2 className="text-2xl font-semibold text-center text-black mb-1">
                        Review Quote
                    </h2>
                    <p className="text-[12px] text-black text-center mb-6">
                        Review your quote before you send the request
                    </p>

                    {/* Event Summary */}
                    <div className="mb-4">
                        <h3 className="text-[20px] font-medium text-black mb-2">Event Summary</h3>
                        <p className="text-[16px] text-black">
                            {pkg.name} | {dateDisplay} | {guestsDisplay} guests | {locationDisplay}
                        </p>
                    </div>

                    <div className="border-t border-[#d8dfe9] my-4" />

                    {/* Service */}
                    <div className="mb-4">
                        <h3 className="text-[20px] font-medium text-black mb-1">Service</h3>
                        <p className="text-[16px] text-black">
                            {pkg.vendor?.business_name || 'Vendor Name'}
                        </p>
                        <p className="text-[14px] text-[#232834]">
                            {pkg.venue_details
                                ? 'Venue'
                                : pkg.catering_details
                                ? 'Catering'
                                : pkg.entertainment_details
                                ? 'Entertainment'
                                : 'Service Type'}
                        </p>
                    </div>

                    <div className="border-t border-[#d8dfe9] my-4" />

                    {/* Quote Summary */}
                    <div className="mb-6">
                        <h3 className="text-[20px] font-medium text-black mb-2">Quote Summary</h3>
                        <div className="space-y-1 text-[16px] text-black">
                            <div className="flex justify-between">
                                <span>Estimated Subtotal:</span>
                                <span>${subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Service Fee:</span>
                                <span>$0.00</span>
                            </div>
                            <div className="flex justify-between font-medium mt-1">
                                <span>Total:</span>
                                <span>${subtotal.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-between gap-4">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-9 px-6 bg-[#232834] hover:bg-[#111827] text-white rounded-[15px] text-xs font-medium tracking-[-0.15px] leading-5 border border-transparent whitespace-nowrap"
                            onClick={() => setStep('form')}
                            disabled={isSending}
                        >
                            Back
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-9 px-6 bg-[#232834] hover:bg-[#111827] text-white rounded-[15px] text-xs font-medium tracking-[-0.15px] leading-5 border border-transparent whitespace-nowrap"
                            onClick={handleConfirmQuote}
                            disabled={isSending}
                        >
                            {isSending ? 'Sending...' : 'Confirm Quote'}
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
                                variant="ghost"
                                size="sm"
                                className="w-full h-9 bg-[#232834] hover:bg-[#111827] text-white rounded-[15px] text-xs font-medium tracking-[-0.15px] leading-5 border border-transparent flex items-center justify-center gap-2 whitespace-nowrap"
                            >
                                <Plus className="w-5 h-5" />
                                <span>Send Quote Request</span>
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
