// API Service Layer for Velocity VVIP
// Connects the React frontend to the Express backend

const API_URL = 'https://velocity-vvip.onrender.com/api';

// ─── Auth Helpers ────────────────────────────────────────────────────────────

export const getToken = (): string | null => localStorage.getItem('authToken');

export const setToken = (token: string): void => localStorage.setItem('authToken', token);

export const clearToken = (): void => localStorage.removeItem('authToken');

export const isAuthenticated = (): boolean => !!getToken();

// ─── Core Fetch ──────────────────────────────────────────────────────────────

class APIError extends Error {
    public status: number;
    constructor(status: number, message: string) {
        super(message);
        this.status = status;
        this.name = 'APIError';
    }
}

async function fetchAPI<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = getToken();

    const config: RequestInit = {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...options.headers,
        },
    };

    const response = await fetch(`${API_URL}${endpoint}`, config);

    if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = errorText;
        try {
            const parsed = JSON.parse(errorText);
            errorMessage = parsed.error || errorText;
        } catch (_) { }
        throw new APIError(response.status, errorMessage);
    }

    if (response.status === 204) return undefined as any as T;
    return response.json();
}

// ─── Auth API ────────────────────────────────────────────────────────────────

export const AuthAPI = {
    async login(email: string, password: string) {
        const data = await fetchAPI<{ token: string; user: any }>('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });
        setToken(data.token);
        return data;
    },

    async register(email: string, password: string, name: string, registrationSecret?: string) {
        const data = await fetchAPI<{ token: string; user: any }>('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ email, password, name, registrationSecret }),
        });
        setToken(data.token);
        return data;
    },

    logout() {
        clearToken();
    },
};

// ─── Reservations API ────────────────────────────────────────────────────────

export const ReservationAPI = {
    async getAll(filters?: { status?: string; startDate?: string; endDate?: string }) {
        const query = filters ? '?' + new URLSearchParams(filters as Record<string, string>).toString() : '';
        return fetchAPI<any[]>(`/reservations${query}`);
    },

    async create(data: any) {
        return fetchAPI<any>('/reservations', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    async update(id: number, data: any) {
        return fetchAPI<any>(`/reservations/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    },

    async delete(id: number) {
        return fetchAPI<void>(`/reservations/${id}`, { method: 'DELETE' });
    },
};

// ─── Customers API ───────────────────────────────────────────────────────────

export const CustomerAPI = {
    async getAll() {
        return fetchAPI<any[]>('/customers');
    },

    async getOne(id: number) {
        return fetchAPI<any>(`/customers/${id}`);
    },

    async create(data: any) {
        return fetchAPI<any>('/customers', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    async update(id: number, data: any) {
        return fetchAPI<any>(`/customers/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    },

    async delete(id: number) {
        return fetchAPI<void>(`/customers/${id}`, { method: 'DELETE' });
    },
};

// ─── Drivers API ─────────────────────────────────────────────────────────────

export const DriverAPI = {
    async getAll() {
        return fetchAPI<any[]>('/drivers');
    },

    async create(data: any) {
        return fetchAPI<any>('/drivers', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    async update(id: number, data: any) {
        return fetchAPI<any>(`/drivers/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    },

    async delete(id: number) {
        return fetchAPI<void>(`/drivers/${id}`, { method: 'DELETE' });
    },
};

// ─── Affiliates API ──────────────────────────────────────────────────────────

export const AffiliateAPI = {
    async getAll() {
        return fetchAPI<any[]>('/affiliates');
    },

    async create(data: any) {
        return fetchAPI<any>('/affiliates', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    async update(id: number, data: any) {
        return fetchAPI<any>(`/affiliates/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    },

    async delete(id: number) {
        return fetchAPI<void>(`/affiliates/${id}`, { method: 'DELETE' });
    },
};

export { APIError };
