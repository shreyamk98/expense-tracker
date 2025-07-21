import React from 'react';
import { Center, Loader, Stack, Text } from '@mantine/core';
import { useAuth } from '../../context/AuthContext';
import { AuthStatus } from '../../types/enums';
import { AuthLayout } from './AuthLayout';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { authState } = useAuth();

  if (authState.authStatus === AuthStatus.LOADING) {
    return (
      <Center h="100vh">
        <Stack align="center" gap="md">
          <Loader size="lg" />
          <Text c="dimmed">Loading...</Text>
        </Stack>
      </Center>
    );
  }

  if (authState.authStatus === AuthStatus.UNAUTHENTICATED) {
    return <AuthLayout />;
  }

  return <>{children}</>;
};