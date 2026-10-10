export const appConfig = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL?.trim() ?? '',
  useMocks: import.meta.env.VITE_USE_MOCKS !== 'false',
  productName: 'Koinogram',
} as const;
