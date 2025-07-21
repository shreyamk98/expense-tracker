import React from 'react';
import { LoadingOverlay as MantineLoadingOverlay, Text, Stack } from '@mantine/core';

interface LoadingOverlayProps {
  visible: boolean;
  message?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ 
  visible, 
  message = 'Loading...' 
}) => {
  return (
    <MantineLoadingOverlay
      visible={visible}
      overlayProps={{ blur: 2 }}
      loaderProps={{
        children: (
          <Stack align="center" gap="sm">
            <Text size="sm" c="dimmed">
              {message}
            </Text>
          </Stack>
        )
      }}
    />
  );
};