// Simplified GraphQL client for IndexedDB-based app
// Since we're using IndexedDB, we don't need a real GraphQL client
// This is a placeholder to maintain compatibility

import { ApolloClient, InMemoryCache } from '@apollo/client';

// Create a minimal Apollo Client for compatibility
// In IndexedDB mode, we bypass GraphQL and use services directly
export const apolloClient = new ApolloClient({
  cache: new InMemoryCache(),
  // No link needed since we're not making network requests
  defaultOptions: {
    watchQuery: {
      errorPolicy: 'all'
    },
    query: {
      errorPolicy: 'all'
    }
  }
});