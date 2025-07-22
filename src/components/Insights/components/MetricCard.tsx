import React from 'react';
import { Card, Text } from '@mantine/core';

interface MetricCardProps {
  label: string;
  value: string;
  subtitle?: string;
  color?: string;
  withBorder?: boolean;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  subtitle,
  color,
  withBorder = true
}) => {
  return (
    <Card p="md" withBorder={withBorder}>
      <Text size="sm" c="dimmed">{label}</Text>
      <Text size="xl" fw={600} c={color}>
        {value}
      </Text>
      {subtitle && (
        <Text size="xs" c="dimmed">{subtitle}</Text>
      )}
    </Card>
  );
};