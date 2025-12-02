import React, { useState } from 'react';
import { CartItem } from './FoodPackageDetail';
import { Package } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { ArrowLeft, CreditCard, Calendar, Users, MapPin, Info } from 'lucide-react';

interface BookingViewProps {
    cart: CartItem[];
    subtotal: number;
    onBack: () => void;
    pkg: Package;
    onCreateQuote: () => void;
}

export default function BookingView({ cart, subtotal, onBack, pkg, onCreateQuote }: BookingViewProps) {
    const [isProcessing, setIsProcessing] = useState(false);

    const serviceFee = subtotal * 0.15;
    const total = subtotal + serviceFee;

    const handleBook = async () => {
        setIsProcessing(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 2000));
        setIsProcessing(false);
        alert('Booking request sent successfully!');
        // Redirect or show success state
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <button
                    onClick={onBack}
                    className="flex items-center text-gray-600 hover:text-black mb-8 transition-colors font-medium"
                >
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Back to Menu
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    {/* Main Checkout Form */}
                    <div className="lg:col-span-2 space-y-8">
                        <div>
                            <h1 className="text-3xl font-bold mb-2">Checkout</h1>
                            <p className="text-gray-500">Complete your booking request for {pkg.name}</p>
                        </div>

                        {/* Event Details Section */}
                        <section className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
                            <div className="flex items-center mb-6">
                                <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center font-bold mr-3">1</div>
                                <h2 className="text-xl font-bold">Event Details</h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pl-11">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Event Date</label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                                        <Input type="date" className="pl-10 h-12 bg-gray-50 border-gray-200 focus:bg-white" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Guest Count</label>
                                    <div className="relative">
                                        <Users className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                                        <Input type="number" className="pl-10 h-12 bg-gray-50 border-gray-200 focus:bg-white" placeholder="e.g. 50" />
                                    </div>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Event Location</label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                                        <Input className="pl-10 h-12 bg-gray-50 border-gray-200 focus:bg-white" placeholder="Enter full address" />
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Payment Section */}
                        <section className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
                            <div className="flex items-center mb-6">
                                <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center font-bold mr-3">2</div>
                                <h2 className="text-xl font-bold">Payment Method</h2>
                            </div>

                            <div className="pl-11">
                                <div className="flex items-center p-4 border border-gray-200 rounded-xl mb-4 bg-gray-50 hover:bg-white hover:border-black transition-all cursor-pointer">
                                    <CreditCard className="w-6 h-6 text-gray-900 mr-4" />
                                    <div className="flex-1">
                                        <p className="font-bold text-gray-900">Visa ending in 4242</p>
                                        <p className="text-sm text-gray-500">Expires 12/25</p>
                                    </div>
                                    <Button variant="outline" size="sm" className="text-xs">Edit</Button>
                                </div>
                                <p className="text-sm text-gray-500 flex items-center">
                                    <Info className="w-4 h-4 mr-1.5" />
                                    Your card will only be charged after the vendor accepts your booking request.
                                </p>
                            </div>
                        </section>

                        {/* Additional Notes */}
                        <section className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
                            <div className="flex items-center mb-6">
                                <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center font-bold mr-3">3</div>
                                <h2 className="text-xl font-bold">Additional Notes</h2>
                            </div>
                            <div className="pl-11">
                                <Textarea
                                    placeholder="Any special requests, dietary restrictions, or details for the vendor?"
                                    rows={4}
                                    className="bg-gray-50 border-gray-200 focus:bg-white resize-none"
                                />
                            </div>
                        </section>
                    </div>

                    {/* Order Summary Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-lg sticky top-8">
                            <h3 className="text-lg font-bold mb-6 pb-4 border-b">Order Summary</h3>

                            <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                {cart.map((item, i) => (
                                    <div key={i} className="flex justify-between text-sm group">
                                        <div className="flex gap-3">
                                            <span className="font-semibold text-gray-900 w-6">{item.quantity}x</span>
                                            <div>
                                                <span className="text-gray-700 block">{item.name}</span>
                                                {item.specialInstructions && (
                                                    <span className="text-xs text-gray-400 italic block mt-0.5 max-w-[150px] truncate">{item.specialInstructions}</span>
                                                )}
                                            </div>
                                        </div>
                                        <span className="text-gray-900 font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="border-t pt-4 space-y-3 bg-gray-50/50 -mx-6 px-6 py-4">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Subtotal</span>
                                    <span className="font-medium">${subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Service Fee (15%)</span>
                                    <span className="font-medium">${serviceFee.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-xl font-bold pt-3 border-t border-gray-200 mt-2">
                                    <span>Total</span>
                                    <span>${total.toFixed(2)}</span>
                                </div>
                            </div>

                            <Button
                                className="w-full mt-6 py-6 text-lg font-bold shadow-md hover:shadow-lg transition-all"
                                onClick={handleBook}
                                disabled={isProcessing}
                            >
                                {isProcessing ? 'Processing...' : 'Place Order'}
                            </Button>

                            <p className="text-xs text-center text-gray-400 mt-4 leading-relaxed">
                                By confirming, you agree to our Terms of Service.
                            </p>

                            <div className="mt-6 pt-6 border-t text-center">
                                <p className="text-sm text-gray-500 mb-3">Not ready to book?</p>
                                <Button variant="outline" className="w-full border-gray-300" onClick={onCreateQuote}>
                                    Create a Quote Instead
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
