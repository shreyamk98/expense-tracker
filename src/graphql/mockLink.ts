import { ApolloLink, Observable, FetchResult } from "@apollo/client";

// ==================== TYPES ====================
type Variables = Record<string, any>;
type MockHandler = (variables: Variables) => any;
type MockHandlers = Record<string, MockHandler>;

interface MockOptions {
  logging?: boolean;
  delay?: number;
}

// ==================== CORE MOCK LINK ====================
export function createMockLink(
  handlers: MockHandlers,
  options: MockOptions = {}
) {
  const { logging = false, delay = 0 } = options;

  return new ApolloLink((operation) => {
    return new Observable<FetchResult>((observer) => {
      const execute = () => {
        try {
          const { operationName, variables } = operation;

          if (logging) {
            console.log(`[Mock] ${operationName}:`, variables);
          }

          const handler = handlers[operationName || ""];
          if (!handler) {
            throw new Error(`Unknown operation: ${operationName}`);
          }

          const result = handler(variables || {});
          observer.next(result);
          observer.complete();
        } catch (error) {
          observer.error(error);
        }
      };

      delay > 0 ? setTimeout(execute, delay) : execute();
    });
  });
}

// ==================== EXPORTS ====================
export type { MockOptions, MockHandler, MockHandlers };