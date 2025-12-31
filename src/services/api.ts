// API Service Layer for DomPort
// Centralized API configuration and endpoints

const API_BASE_URL = 'http://localhost:3000/api';

// Types for API responses
export interface Product {
  product_id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  fandom: string;
  image: string;
  stock: number;
  is_preorder?: boolean;
  release_date?: string;
  deposit_amount?: number;
  created_at: string;
  updated_at: string;
}

export interface Order {
  order_id: string;
  user_id: string;
  total_amount: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  shipping_address: string;
  created_at: string;
  items: OrderItem[];
}

export interface OrderItem {
  item_id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price: number;
}

export interface Payment {
  payment_id: string;
  order_id: string;
  payment_method: 'credit_card' | 'promptpay' | 'cash_on_delivery';
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  transaction_id?: string;
  created_at: string;
}

export interface TimelineEvent {
  event_id: string;
  product_id?: string;
  order_id?: string;
  event_type: 'production' | 'shipping' | 'quality_check' | 'payment' | 'general';
  title: string;
  description: string;
  event_date: string;
  status: 'upcoming' | 'in_progress' | 'completed' | 'delayed';
  created_at: string;
}

// API Service Class
class APIService {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
    this.token = localStorage.getItem('auth_token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API Request failed:', error);
      throw error;
    }
  }

  // Auth methods
  setToken(token: string) {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('auth_token');
  }

  // Products API
  async getProducts(): Promise<Product[]> {
    return this.request<Product[]>('/products');
  }

  async getProductById(id: string): Promise<Product> {
    return this.request<Product>(`/products/${id}`);
  }

  async createProduct(product: Partial<Product>): Promise<Product> {
    return this.request<Product>('/products', {
      method: 'POST',
      body: JSON.stringify(product),
    });
  }

  // Orders API
  async getOrders(): Promise<Order[]> {
    return this.request<Order[]>('/orders');
  }

  async getOrderById(id: string): Promise<Order> {
    return this.request<Order>(`/orders/${id}`);
  }

  async createOrder(order: Partial<Order>): Promise<Order> {
    return this.request<Order>('/orders', {
      method: 'POST',
      body: JSON.stringify(order),
    });
  }

  // Payments API
  async processPayment(paymentData: {
    order_id: string;
    payment_method: string;
    amount: number;
  }): Promise<Payment> {
    return this.request<Payment>('/payments/process', {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });
  }

  async getOrderPayments(orderId: string): Promise<Payment[]> {
    return this.request<Payment[]>(`/payments/order/${orderId}`);
  }

  // Timeline API
  async getTimelineEvents(): Promise<TimelineEvent[]> {
    return this.request<TimelineEvent[]>('/timeline');
  }

  async getTimelineEventsByProduct(productId: string): Promise<TimelineEvent[]> {
    return this.request<TimelineEvent[]>(`/timeline/product/${productId}`);
  }

  async getTimelineEventsByOrder(orderId: string): Promise<TimelineEvent[]> {
    return this.request<TimelineEvent[]>(`/timeline/order/${orderId}`);
  }

  async createTimelineEvent(event: Partial<TimelineEvent>): Promise<TimelineEvent> {
    return this.request<TimelineEvent>('/timeline', {
      method: 'POST',
      body: JSON.stringify(event),
    });
  }
}

// Create and export API service instance
export const api = new APIService();

// Export individual API services for easier usage
export const productAPI = {
  getAll: () => api.getProducts(),
  getById: (id: string) => api.getProductById(id),
  create: (product: Partial<Product>) => api.createProduct(product),
};

export const orderAPI = {
  getAll: () => api.getOrders(),
  getById: (id: string) => api.getOrderById(id),
  create: (order: Partial<Order>) => api.createOrder(order),
};

export const paymentAPI = {
  process: (paymentData: {
    order_id: string;
    payment_method: string;
    amount: number;
  }) => api.processPayment(paymentData),
  getByOrder: (orderId: string) => api.getOrderPayments(orderId),
};

export const timelineAPI = {
  getAll: () => api.getTimelineEvents(),
  getByProduct: (productId: string) => api.getTimelineEventsByProduct(productId),
  getByOrder: (orderId: string) => api.getTimelineEventsByOrder(orderId),
  create: (event: Partial<TimelineEvent>) => api.createTimelineEvent(event),
};

export default api;
