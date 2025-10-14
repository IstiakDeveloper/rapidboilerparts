import React from 'react';
import { Head } from '@inertiajs/react';
import { formatPrice } from '@/utils/formatters';
import type { Order } from '@/types/order';

interface Props {
  order: Order;
}

export default function Receipt({ order }: Props) {
  return (
    <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
      <Head title={`Receipt - ${order.order_number}`} />

      <div className="relative py-3 sm:max-w-xl sm:mx-auto">
        <div className="relative px-4 py-10 bg-white mx-8 md:mx-0 shadow rounded-3xl sm:p-10">
          <div className="max-w-md mx-auto">
            <div className="divide-y divide-gray-200">
              <div className="py-8 text-base leading-6 space-y-4 text-gray-700 sm:text-lg sm:leading-7">
                {/* Header */}
                <div className="text-center mb-8">
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">Rapid Boiler Parts</h1>
                  <p className="text-sm text-gray-600">123 Sample Street, London, UK</p>
                  <p className="text-sm text-gray-600">Tel: +44 20 1234 5678</p>
                </div>

                {/* Order Info */}
                <div className="text-sm border-t border-gray-200 pt-4">
                  <p><strong>Order #:</strong> {order.order_number}</p>
                  <p><strong>Date:</strong> {new Date(order.created_at).toLocaleString()}</p>
                  {order.user && (
                    <div className="mt-2">
                      <p><strong>Customer:</strong> {order.user.first_name} {order.user.last_name}</p>
                      <p>{order.user.email}</p>
                    </div>
                  )}
                </div>

                {/* Items */}
                <div className="mt-8">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th className="text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                        <th className="text-right text-xs font-medium text-gray-500 uppercase">Qty</th>
                        <th className="text-right text-xs font-medium text-gray-500 uppercase">Price</th>
                        <th className="text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {order.items.map((item) => (
                        <tr key={item.id}>
                          <td className="py-4">
                            <div className="text-sm font-medium text-gray-900">{item.product.name}</div>
                            <div className="text-xs text-gray-500">{item.product.sku}</div>
                          </td>
                          <td className="py-4 text-right text-sm">{item.quantity}</td>
                          <td className="py-4 text-right text-sm">£{formatPrice(item.unit_price)}</td>
                          <td className="py-4 text-right text-sm">£{formatPrice(item.total_price)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Totals */}
                <div className="mt-8 border-t border-gray-200 pt-4">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span>£{formatPrice(order.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm mt-2">
                    <span>VAT (20%)</span>
                    <span>£{formatPrice(order.tax_amount)}</span>
                  </div>
                  <div className="flex justify-between text-base font-medium mt-4 pt-4 border-t border-gray-200">
                    <span>Total</span>
                    <span>£{formatPrice(order.total_amount)}</span>
                  </div>
                </div>

                {/* Payment Method */}
                <div className="mt-8 text-sm text-gray-600">
                  <p><strong>Payment Method:</strong> {order.payment_method.toUpperCase()}</p>
                </div>

                {/* Notes */}
                {order.notes && (
                  <div className="mt-4 text-sm text-gray-600">
                    <p><strong>Notes:</strong></p>
                    <p>{order.notes}</p>
                  </div>
                )}

                {/* Footer */}
                <div className="mt-8 text-center text-sm text-gray-600">
                  <p>Thank you for your purchase!</p>
                  <p>www.rapidboilerparts.com</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
