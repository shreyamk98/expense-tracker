import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react';

// Base API configuration for IndexedDB backend
// Using fakeBaseQuery since we're not making HTTP requests
export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: fakeBaseQuery(),
  tagTypes: ['User', 'Expense', 'Budget', 'PaymentMethod', 'Card', 'UPIApp'],
  endpoints: () => ({}),
});