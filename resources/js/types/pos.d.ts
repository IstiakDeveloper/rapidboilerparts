export interface OrderItem {
  product_id: number;
  quantity: number;
  price: number;
}

export interface OrderForm {
  items: OrderItem[];
  customer_id: number | null;
  payment_method: 'cash' | 'card';
  notes: string;
  subtotal: number;
  tax: number;
  total: number;
  amount_paid: string;
  change: number;
}

export interface Order {
  id: number;
  customer_id: number | null;
  payment_method: 'cash' | 'card';
  notes: string;
  subtotal: number;
  tax: number;
  total: number;
  amount_paid: number;
  change: number;
  created_at: string;
  updated_at: string;
}

declare module '@inertiajs/core' {
  interface PageProps {
    order?: Order;
  }
}
