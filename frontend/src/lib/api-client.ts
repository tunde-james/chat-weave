import axios, {
  type AxiosRequestConfig,
  type AxiosError,
  type AxiosInstance,
} from 'axios';

export class ApiError extends Error {
  public readonly status: number;
  public readonly code?: string;
  public readonly details?: unknown;

  constructor(
    status: number,
    message: string,
    code?: string,
    details?: unknown,
  ) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
    this.name = 'ApiError';
  }

  static fromAxiosError(
    error: AxiosError<{ message?: string; details?: unknown }>,
  ): ApiError {
    const status = error.response?.status ?? 500;
    const message =
      error.response?.data?.message ?? error.message ?? 'An error occurred';
    const details = error.response?.data?.details;

    return new ApiError(status, message, error.code, details);
  }
}

export function createApiClient(
  getToken: () => Promise<string | null>,
): AxiosInstance {
  const client = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3000',
    withCredentials: false,
  });

  client.interceptors.request.use(async (config) => {
    const token = await getToken();
    if (token) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  });

  client.interceptors.response.use(
    (response) => response,
    (error: unknown) => {
      if (!axios.isAxiosError(error)) {
        return Promise.reject(
          new ApiError(
            500,
            error instanceof Error ? error.message : String(error),
          ),
        );
      }

      return Promise.reject(ApiError.fromAxiosError(error));
    },
  );

  return client;
}

export async function apiGet<T>(
  client: AxiosInstance,
  url: string,
  config?: AxiosRequestConfig,
): Promise<T> {
  const res = await client.get<{ data: T }>(url, config);

  return res.data.data;
}

export async function apiPost<TBody, TResponse>(
  client: AxiosInstance,
  url: string,
  body: TBody,
  config?: AxiosRequestConfig,
): Promise<TResponse> {
  const res = await client.post<{ data: TResponse }>(url, body, config);

  return res.data.data;
}

export async function apiPatch<TBody, TResponse>(
  client: AxiosInstance,
  url: string,
  body: TBody,
  config?: AxiosRequestConfig,
): Promise<TResponse> {
  const res = await client.patch<{ data: TResponse }>(url, body, config);

  return res.data.data;
}

export async function apiDelete(
  client: AxiosInstance,
  url: string,
  config?: AxiosRequestConfig,
): Promise<void> {
  await client.delete(url, config);
}
