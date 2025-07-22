import React from 'react';
import { Text, Stack } from '@mantine/core';

interface EmptyStateProps {
  title: string;
  description?: string;
  py?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  py = "xl"
}) => {
  return (
    <Stack gap="sm" align="center" py={py}>
      <Text ta="center" c="dimmed" size="lg">
        {title}
      </Text>
      {description && (
        <Text size="sm" ta="center" c="dimmed" maw={400}>
          {description}
        </Text>
      )}
    </Stack>
  );
};