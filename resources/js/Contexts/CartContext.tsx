import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { router } from '@inertiajs/react';

interface CartContextType {
    cartCount: number;
    setCartCount: (count: number) => void;
    addToCart: (productId: number, quantity: number, selectedServices?: any[]) => Promise<boolean>;
    showToast: (type: 'success' | 'error' | 'info' | 'warning', message: string) => void;
    refreshCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode; initialCartCount: number }> = ({
    children,
    initialCartCount
}) => {
    const [cartCount, setCartCount] = useState(initialCartCount);
    const [toastQueue, setToastQueue] = useState<Array<{ type: string; message: string }>>([]);

    const showToast = useCallback((type: 'success' | 'error' | 'info' | 'warning', message: string) => {
        // Dispatch custom event for toast
        window.dispatchEvent(new CustomEvent('showToast', {
            detail: { type, message }
        }));
    }, []);

    const addToCart = useCallback(async (productId: number, quantity: number = 1, selectedServices?: any[]): Promise<boolean> => {
        try {
            const requestBody: any = {
                product_id: productId,
                quantity
            };

            // Add selected services if provided
            if (selectedServices && selectedServices.length > 0) {
                requestBody.selected_services = selectedServices;
            }

            console.log('=== Adding to Cart ===', requestBody);

            const response = await fetch('/api/cart/add', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
                body: JSON.stringify(requestBody),
            });

            const data = await response.json();

            if (response.ok && data.success) {
                setCartCount(data.cartCount);
                showToast('success', data.message);

                // Trigger cart sidebar refresh
                window.dispatchEvent(new CustomEvent('cartUpdated'));

                return true;
            } else {
                showToast('error', data.message || 'Failed to add to cart');
                return false;
            }
        } catch (error) {
            console.error('Add to cart error:', error);
            showToast('error', 'An error occurred. Please try again.');
            return false;
        }
    }, [showToast]);

    const refreshCart = useCallback(() => {
        router.reload({ only: ['cartCount'] });
    }, []);

    return (
        <CartContext.Provider value={{
            cartCount,
            setCartCount,
            addToCart,
            showToast,
            refreshCart
        }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};
