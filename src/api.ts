// API Configuration
const API_BASE_STORAGE_KEY = 'api_base_url';
const DEFAULT_API_BASE = 'https://4e72cc6cf8fa.ngrok-free.app';

// Load API base from localStorage or use default
export let API_BASE = localStorage.getItem(API_BASE_STORAGE_KEY) || DEFAULT_API_BASE;

export const setApiBase = (url: string) => {
  API_BASE = url.replace(/\/$/, ''); // Remove trailing slash
  localStorage.setItem(API_BASE_STORAGE_KEY, API_BASE);
  console.log('API Base URL set to:', API_BASE);
};

export const getApiBase = (): string => {
  return API_BASE;
};
// Token Management
const TOKEN_STORAGE_KEY = 'auth_tokens';

interface TokenPair {
  access: string;
  refresh: string;
}

const getTokens = (): TokenPair | null => {
  try {
    const stored = localStorage.getItem(TOKEN_STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

const setTokens = (tokens: TokenPair | null) => {
  if (tokens) {
    localStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(tokens));
  } else {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
  }
};

const getAccessToken = (): string | null => {
  const tokens = getTokens();
  return tokens?.access || null;
};

// API Error Types
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// HTTP Client with automatic token refresh
class ApiClient {
  private isRefreshing = false;
  private refreshPromise: Promise<TokenPair> | null = null;

  private async makeRequest(
    endpoint: string,
    options: RequestInit = {},
    skipAuth = false
  ): Promise<Response> {
    const url = `${API_BASE}${endpoint}`;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // Add authorization header if token exists and not skipped
    if (!skipAuth) {
      const accessToken = getAccessToken();
      if (accessToken) {
        headers.Authorization = `Bearer ${accessToken}`;
      }
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    return response;
  }

  private async refreshTokens(): Promise<TokenPair> {
    const tokens = getTokens();
    if (!tokens?.refresh) {
      throw new ApiError('No refresh token available', 401);
    }

    const response = await this.makeRequest('/token/refresh/', {
      method: 'POST',
      body: JSON.stringify({ refresh: tokens.refresh }),
    }, true);

    if (!response.ok) {
      setTokens(null); // Clear invalid tokens
      throw new ApiError('Token refresh failed', response.status);
    }

    const newTokens = await response.json();
    setTokens(newTokens);
    return newTokens;
  }

  async request(
    endpoint: string,
    options: RequestInit = {},
    skipAuth = false
  ): Promise<any> {
    const url = `${API_BASE}${endpoint}`;
    console.log('Making API request to:', url, 'with options:', options);
    
    try {
      let response = await this.makeRequest(endpoint, options, skipAuth);

      // Handle 401 with automatic token refresh (only once)
      if (response.status === 401 && !skipAuth && !this.isRefreshing) {
        try {
          this.isRefreshing = true;
          
          // Use existing refresh promise or create new one
          if (!this.refreshPromise) {
            this.refreshPromise = this.refreshTokens();
          }
          
          await this.refreshPromise;
          this.refreshPromise = null;
          
          // Retry the original request with new token
          response = await this.makeRequest(endpoint, options, skipAuth);
        } catch (refreshError) {
          this.isRefreshing = false;
          this.refreshPromise = null;
          throw refreshError;
        } finally {
          this.isRefreshing = false;
        }
      }

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          errorData = { message: response.statusText };
        }
        
        throw new ApiError(
          errorData.message || `HTTP ${response.status}`,
          response.status,
          errorData
        );
      }

      // Handle empty responses
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      }
      
      return null;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      
      // Network or other errors
      console.error('API request failed:', error);
      throw new ApiError(
        error instanceof Error ? error.message : 'Network error',
        0
      );
    }
  }
}

const apiClient = new ApiClient();

// Authentication API
export const login = async (username: string, password: string): Promise<TokenPair> => {
  const response = await apiClient.request('/token/', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  }, true);
  
  setTokens(response);
  return response;
};

export const refresh = async (refreshToken: string): Promise<TokenPair> => {
  const response = await apiClient.request('/token/refresh/', {
    method: 'POST',
    body: JSON.stringify({ refresh: refreshToken }),
  }, true);
  
  setTokens(response);
  return response;
};

export const register = async (username: string, password: string): Promise<TokenPair> => {
  const response = await apiClient.request('/auth/register/', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  }, true);
  
  setTokens(response);
  return response;
};

export const logout = () => {
  setTokens(null);
};

// Contacts API
export interface ContactListParams {
  page?: number;
  page_size?: number;
  search?: string;
  ordering?: string;
}

export interface ContactListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: any[];
}

export const listContacts = async (params: ContactListParams = {}): Promise<ContactListResponse> => {
  const searchParams = new URLSearchParams();
  
  if (params.page) searchParams.set('page', params.page.toString());
  if (params.page_size) searchParams.set('page_size', params.page_size.toString());
  if (params.search) searchParams.set('search', params.search);
  if (params.ordering) searchParams.set('ordering', params.ordering);
  
  const queryString = searchParams.toString();
  const endpoint = `/contacts/${queryString ? `?${queryString}` : ''}`;
  
  return await apiClient.request(endpoint);
};

export const createContact = async (dto: any): Promise<any> => {
  return await apiClient.request('/contacts/', {
    method: 'POST',
    body: JSON.stringify(dto),
  });
};

export const updateContact = async (id: string, dto: any): Promise<any> => {
  return await apiClient.request(`/contacts/${id}/`, {
    method: 'PUT',
    body: JSON.stringify(dto),
  });
};

export const deleteContact = async (id: string): Promise<void> => {
  await apiClient.request(`/contacts/${id}/`, {
    method: 'DELETE',
  });
};

// Utility functions
export const isAuthenticated = (): boolean => {
  return getAccessToken() !== null;
};

export const getCurrentTokens = (): TokenPair | null => {
  return getTokens();
};

export const clearTokens = () => {
  setTokens(null);
};