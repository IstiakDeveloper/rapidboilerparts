import React, { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import { CreditCard, Lock, AlertCircle, CheckCircle } from 'lucide-react';
import AppLayout from '@/layouts/AppLayout';

interface Order {
    id: number;
    order_number: string;
    total_amount: number;
    payment_method: string;
}

interface PaymentPageProps {
    order: Order;
}

const PaymentPage: React.FC<PaymentPageProps> = ({ order }) => {
    const [processing, setProcessing] = useState(false);
    const [paymentError, setPaymentError] = useState('');
    const [cardDetails, setCardDetails] = useState({
        card_number: '',
        card_holder: '',
        expiry_month: '',
        expiry_year: '',
        cvv: '',
    });

    const formatPrice = (price: number): string => {
        return `£${price.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value.replace(/\s/g, '');
        value = value.replace(/\D/g, '');
        value = value.substring(0, 16);

        // Format with spaces every 4 digits
        const formatted = value.match(/.{1,4}/g)?.join(' ') || value;
        setCardDetails({ ...cardDetails, card_number: formatted });
    };

    const handleExpiryChange = (field: 'expiry_month' | 'expiry_year', value: string) => {
        const numValue = value.replace(/\D/g, '');

        if (field === 'expiry_month') {
            const month = numValue.substring(0, 2);
            if (month && parseInt(month) > 12) return;
            setCardDetails({ ...cardDetails, expiry_month: month });
        } else {
            const year = numValue.substring(0, 2);
            setCardDetails({ ...cardDetails, expiry_year: year });
        }
    };

    const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/\D/g, '').substring(0, 4);
        setCardDetails({ ...cardDetails, cvv: value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setProcessing(true);
        setPaymentError('');

        // Validate card details
        if (cardDetails.card_number.replace(/\s/g, '').length !== 16) {
            setPaymentError('Invalid card number');
            setProcessing(false);
            return;
        }

        if (!cardDetails.expiry_month || !cardDetails.expiry_year) {
            setPaymentError('Invalid expiry date');
            setProcessing(false);
            return;
        }

        if (cardDetails.cvv.length < 3) {
            setPaymentError('Invalid CVV');
            setProcessing(false);
            return;
        }

        // Simulate payment processing
        setTimeout(() => {
            // In production, integrate with actual payment gateway
            // For now, simulate success
            router.get(`/orders/${order.id}`, {}, {
                onSuccess: () => {
                    // Payment successful
                },
                onError: () => {
                    setPaymentError('Payment failed. Please try again.');
                    setProcessing(false);
                }
            });
        }, 2000);
    };

    const handlePayPalPayment = () => {
        setProcessing(true);
        // Integrate PayPal SDK here
        // For now, redirect to order page
        setTimeout(() => {
            router.get(`/orders/${order.id}`);
        }, 2000);
    };

    return (
        <AppLayout>
            <Head title={`Payment - Order ${order.order_number}`} />

            <div className="max-w-2xl mx-auto px-4 py-12">
                <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-red-600 to-red-700 px-6 py-8 text-white">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h1 className="text-2xl font-bold">Complete Payment</h1>
                                <p className="text-red-100 text-sm mt-1">Order #{order.order_number}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-red-100 text-sm">Amount to Pay</p>
                                <p className="text-3xl font-bold">{formatPrice(order.total_amount)}</p>
                            </div>
                        </div>
                        <div className="flex items-center text-sm text-red-100">
                            <Lock size={16} className="mr-2" />
                            <span>Secure payment powered by SSL encryption</span>
                        </div>
                    </div>

                    {/* Payment Methods */}
                    <div className="p-6">
                        {order.payment_method === 'card' ? (
                            <form onSubmit={handleSubmit}>
                                <div className="mb-6">
                                    <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                                        <CreditCard className="mr-2 text-red-600" size={20} />
                                        Card Details
                                    </h2>

                                    {/* Card Number */}
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Card Number
                                        </label>
                                        <input
                                            type="text"
                                            value={cardDetails.card_number}
                                            onChange={handleCardNumberChange}
                                            placeholder="1234 5678 9012 3456"
                                            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                                            required
                                        />
                                    </div>

                                    {/* Card Holder */}
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Card Holder Name
                                        </label>
                                        <input
                                            type="text"
                                            value={cardDetails.card_holder}
                                            onChange={(e) => setCardDetails({ ...cardDetails, card_holder: e.target.value.toUpperCase() })}
                                            placeholder="JOHN DOE"
                                            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                                            required
                                        />
                                    </div>

                                    {/* Expiry and CVV */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Expiry Date
                                            </label>
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    value={cardDetails.expiry_month}
                                                    onChange={(e) => handleExpiryChange('expiry_month', e.target.value)}
                                                    placeholder="MM"
                                                    maxLength={2}
                                                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                                                    required
                                                />
                                                <span className="flex items-center text-gray-500">/</span>
                                                <input
                                                    type="text"
                                                    value={cardDetails.expiry_year}
                                                    onChange={(e) => handleExpiryChange('expiry_year', e.target.value)}
                                                    placeholder="YY"
                                                    maxLength={2}
                                                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                CVV
                                            </label>
                                            <input
                                                type="text"
                                                value={cardDetails.cvv}
                                                onChange={handleCvvChange}
                                                placeholder="123"
                                                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                {paymentError && (
                                    <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md flex items-center text-red-800">
                                        <AlertCircle size={20} className="mr-2 flex-shrink-0" />
                                        <span>{paymentError}</span>
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="w-full bg-red-600 text-white py-4 rounded-md hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                                >
                                    {processing ? (
                                        <>
                                            <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                            </svg>
                                            Processing Payment...
                                        </>
                                    ) : (
                                        <>Pay {formatPrice(order.total_amount)}</>
                                    )}
                                </button>

                                <div className="mt-4 flex items-center justify-center space-x-4">
                                    <img src="/images/visa.png" alt="Visa" className="h-8" />
                                    <img src="/images/mastercard.png" alt="Mastercard" className="h-8" />
                                    <img src="/images/amex.png" alt="Amex" className="h-8" />
                                </div>
                            </form>
                        ) : order.payment_method === 'paypal' ? (
                            <div>
                                <div className="text-center mb-6">
                                    <img src="/images/paypal-logo.png" alt="PayPal" className="h-12 mx-auto mb-4" />
                                    <p className="text-gray-600">
                                        You will be redirected to PayPal to complete your payment
                                    </p>
                                </div>

                                <button
                                    onClick={handlePayPalPayment}
                                    disabled={processing}
                                    className="w-full bg-yellow-500 text-gray-900 py-4 rounded-md hover:bg-yellow-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {processing ? 'Redirecting to PayPal...' : 'Continue with PayPal'}
                                </button>
                            </div>
                        ) : null}

                        {/* Security Info */}
                        <div className="mt-6 pt-6 border-t border-gray-200">
                            <div className="flex items-start text-sm text-gray-600">
                                <CheckCircle className="text-green-600 mr-2 flex-shrink-0 mt-0.5" size={16} />
                                <div>
                                    <p className="font-medium text-gray-800 mb-1">Your payment is secure</p>
                                    <p>We use industry-standard encryption to protect your payment information.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Help Text */}
                <div className="mt-6 text-center text-sm text-gray-500">
                    <p>Having trouble? <a href="/contact" className="text-red-600 hover:text-red-700">Contact Support</a></p>
                </div>
            </div>
        </AppLayout>
    );
};

export default PaymentPage;
