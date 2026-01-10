// API Service Layer for DomPort
// Centralized API configuration and endpoints

const API_BASE_URL = 'http://localhost:3000/api';

// Types for API responses
export interface Product {
  product_id: string; // Internal ID
  name: string;
  description: string;
  price: number;
  category?: string; // Legacy field for display name
  category_id?: string; // Backend ID
  supplier_id?: string;
  fandom: string;
  image: string;
  stock?: number; // Legacy field
  stock_qty?: number; // Backend field
  gallery?: string; // JSON string for multiple images
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
  status: string; // 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'PAID' etc.
  shipping_fee: number;
  payment_status: string;
  shipping_address: any; // Can be object or string depending on backend
  created_at: string;
  items: OrderItem[];
  stock_deducted: boolean;
  user?: User; // Optional user details
}

export interface OrderItem {
  item_id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
}

export interface User {
  id: string; // user_id
  user_id: string;
  username: string;
  email: string;
  role: 'user' | 'admin';
  isBlacklisted: boolean;
  deletedAt?: string | null;
  name: string;
  phone?: string;
  points?: number;
  house_number?: string;
  sub_district?: string;
  district?: string;
  province?: string;
  postal_code?: string;
  password?: string;
}

export interface Fandom {
  id: number;
  name: string;
  image?: string; // Optional image URL
}

export interface Payment {
  payment_id: string;
  order_id: string;
  payment_method: 'bank' | 'truemoney';
  amount: number;
  status: 'pending' | 'completed';
  transaction_id?: string;
  created_at: string;
}

export interface Shipment {
  shipment_id: string;
  order_id: string;
  provider: string;
  tracking_number: string;
  label_url: string;
  created_at: string;
}

// Interface for Timeline Events
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

export interface Ticket {
  id: string;
  subject: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  message: string;
  userName: string;
  userEmail: string;
  userId: string;
  created_at: string;
  updated_at: string;
  admin_response?: string;
}

// API Service Class
class APIService {
  private baseURL: string;
  // We no longer cache token strictly in a class property to ensure freshness from storage
  // private token: string | null = null;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  // Retrieve token dynamically from storage (priority: session -> local)
  private getToken(): string | null {
    return sessionStorage.getItem('access_token') || localStorage.getItem('access_token');
  }

  // Set token to storage (default to localStorage)
  setToken(token: string): void {
    localStorage.setItem('access_token', token);
  }

  // Clear token from storage
  clearToken(): void {
    localStorage.removeItem('access_token');
    sessionStorage.removeItem('access_token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options.headers as Record<string, string>,
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        // Handle 401 Unauthorized globally if needed (e.g., redirect to login)
        if (response.status === 401) {
          console.warn('Unauthorized access. Token might be invalid.');
        }
        let errorMessage = `API Error: ${response.status} ${response.statusText}`;
        try {
          const errorData = await response.json();
          if (errorData.message) errorMessage = errorData.message;
        } catch (e) { /* ignore json parse error */ }
        throw new Error(errorMessage);
      }

      // Some endpoints might return empty body (e.g. DELETE)
      if (response.status === 204) return {} as T;

      return await response.json();
    } catch (error) {
      console.error(`API Request failed [${endpoint}]:`, error);
      throw error;
    }
  }

  // --- Tickets API ---
  async getTickets(): Promise<Ticket[]> {
    return this.request<Ticket[]>('/tickets');
  }

  async updateTicket(id: string, data: Partial<Ticket>): Promise<Ticket> {
    return this.request<Ticket>(`/tickets/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async replyTicket(id: string, response: string): Promise<Ticket> {
    // Specialized endpoint or just PATCH
    return this.updateTicket(id, { admin_response: response, status: 'in_progress' });
  }

  // --- Products API ---
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

  async updateProduct(id: string, product: Partial<Product>): Promise<Product> {
    return this.request<Product>(`/products/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(product),
    });
  }

  async deleteProduct(id: string): Promise<void> {
    return this.request<void>(`/products/${id}`, {
      method: 'DELETE',
    });
  }

  // --- Orders API ---
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

  async createShippingLabel(orderId: string): Promise<Shipment> {
    return this.request<Shipment>(`/orders/${orderId}/shipping-label`, {
      method: 'POST',
    });
  }

  async updateOrderStatus(orderId: string, status: string): Promise<Order> {
    return this.request<Order>(`/orders/${orderId}/status`, {
      method: 'POST', // or PATCH
      body: JSON.stringify({ status }),
    });
  }

  // --- Users API ---
  async getUsers(): Promise<User[]> {
    return this.request<User[]>('/users');
  }

  async getUserById(id: string): Promise<User> {
    return this.request<User>(`/users/${id}`);
  }

  async restoreUser(id: string): Promise<void> {
    return this.request<void>(`/users/${id}/restore`, {
      method: 'PATCH'
    });
  }

  async updateUser(id: string, data: Partial<User>): Promise<User> {
    return this.request<User>(`/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  }

  async deleteUser(id: string): Promise<void> {
    return this.request<void>(`/users/${id}`, { method: 'DELETE' });
  }

  // --- Fandoms API ---
  async getFandoms(): Promise<Fandom[]> {
    return this.request<Fandom[]>('/fandoms');
  }

  async createFandom(fandom: Partial<Fandom>): Promise<Fandom> {
    return this.request<Fandom>('/fandoms', {
      method: 'POST',
      body: JSON.stringify(fandom),
    });
  }

  async updateFandom(id: string | number, fandom: Partial<Fandom>): Promise<Fandom> {
    return this.request<Fandom>(`/fandoms/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(fandom),
    });
  }

  async deleteFandom(id: string | number): Promise<void> {
    return this.request<void>(`/fandoms/${id}`, {
      method: 'DELETE',
    });
  }

  // --- Payments API ---
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

  // --- Timeline API ---
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

  // --- Auth API ---
  // --- Categories API ---
  async getCategories(): Promise<any[]> {
    return this.request<any[]>('/categories');
  }

  async login(credentials: any): Promise<any> {
    return this.request<any>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async register(data: any): Promise<any> {
    return this.request<any>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}

// Create and export API service instance
export const api = new APIService();

// Export individual API services for easier usage
export const authAPI = {
  login: (credentials: any) => api.login(credentials),
  register: (data: any) => api.register(data),
};

export const productAPI = {
  getAll: () => api.getProducts(),
  getById: (id: string) => api.getProductById(id),
  create: (product: Partial<Product>) => api.createProduct(product),
  update: (id: string, product: Partial<Product>) => api.updateProduct(id, product),
  delete: (id: string) => api.deleteProduct(id),
};

export const orderAPI = {
  getAll: () => api.getOrders(),
  getById: (id: string) => api.getOrderById(id),
  create: (order: Partial<Order>) => api.createOrder(order),
  createShippingLabel: (orderId: string) => api.createShippingLabel(orderId),
  updateStatus: (orderId: string, status: string) => api.updateOrderStatus(orderId, status),
};

export const userAPI = {
  getAll: () => api.getUsers(),
  getById: (id: string) => api.getUserById(id),
  restore: (id: string) => api.restoreUser(id),
  update: (id: string, data: Partial<User>) => api.updateUser(id, data),
  delete: (id: string) => api.deleteUser(id),
};

export const fandomAPI = {
  getAll: () => api.getFandoms(),
  create: (fandom: Partial<Fandom>) => api.createFandom(fandom),
  update: (id: string | number, fandom: Partial<Fandom>) => api.updateFandom(id, fandom),
  delete: (id: string | number) => api.deleteFandom(id),
};

export const categoryAPI = {
  getAll: () => api.getCategories(),
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

export const ticketAPI = {
  getAll: () => api.getTickets(),
  update: (id: string, data: Partial<Ticket>) => api.updateTicket(id, data),
  reply: (id: string, response: string) => api.replyTicket(id, response),
};

export default api;
