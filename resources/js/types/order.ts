export interface OrderItem {
  id: number;
  quantity: number;
  unit_price: string | number;
  total_price: string | number;
  product: {
    name: string;
    sku: string;
  };
}

export interface Order {
  id: number;
  order_number: string;
  created_at: string;
  subtotal: string | number;
  tax_amount: string | number;
  total_amount: string | number;
  payment_method: string;
  user?: {
    first_name: string;
    last_name: string;
    email: string;
  };
  items: OrderItem[];
  notes?: string;
}
