import type { ApiErrorBody } from '../types/domain';

export type TokenProvider = () => Promise<string | null>;

export class ApiClientError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code: string,
    public readonly details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = 'ApiClientError';
  }
}

export class ApiClient {
  constructor(
    private readonly baseUrl = import.meta.env.VITE_API_BASE_URL?.trim() ?? '',
    private readonly getToken: TokenProvider = async () => null,
    private readonly timeoutMs = 12_000,
  ) {}

  async request<T>(path: string, init: RequestInit = {}): Promise<T> {
    if (!this.baseUrl) {
      throw new ApiClientError('No API base URL is configured. Mock mode is still active.', 0, 'API_NOT_CONFIGURED');
    }
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), this.timeoutMs);
    const token = await this.getToken();
    const headers = new Headers(init.headers);
    headers.set('Accept', 'application/json');
    if (init.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
    if (token) headers.set('Authorization', `Bearer ${token}`);
    try {
      const response = await fetch(`${this.baseUrl.replace(/\/$/, '')}${path}`, {
        ...init,
        headers,
        credentials: 'include',
        signal: controller.signal,
      });
      const body: unknown = response.status === 204 ? undefined : await response.json().catch(() => undefined);
      if (!response.ok) {
        const candidate = body && typeof body === 'object' && 'error' in body
          ? (body as { error: ApiErrorBody }).error
          : undefined;
        throw new ApiClientError(
          candidate?.message ?? `Request failed (${response.status}).`,
          response.status,
          candidate?.code ?? 'HTTP_ERROR',
          candidate?.details,
        );
      }
      if (body && typeof body === 'object' && 'data' in body) return (body as { data: T }).data;
      return body as T;
    } catch (error) {
      if (error instanceof ApiClientError) throw error;
      if (error instanceof DOMException && error.name === 'AbortError') {
        throw new ApiClientError('The request timed out. Please try again.', 408, 'REQUEST_TIMEOUT');
      }
      throw new ApiClientError('We could not reach the service. Please check your connection and try again.', 0, 'NETWORK_ERROR');
    } finally {
      window.clearTimeout(timeoutId);
    }
  }
}

export const apiClient = new ApiClient();
