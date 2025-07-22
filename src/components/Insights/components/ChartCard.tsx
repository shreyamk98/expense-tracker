import React, { ReactNode } from 'react';
import { Card, Text, Group, Badge } from '@mantine/core';

interface ChartCardProps {
  title: string;
  badge?: {
    text: string;
    color?: string;
    icon?: ReactNode;
  };
  children: ReactNode;
  withBorder?: boolean;
}

export const ChartCard: React.FC<ChartCardProps> = ({
  title,
  badge,
  children,
  withBorder = true
}) => {
  return (
    <Card p="md" withBorder={withBorder}>
      <Group justify="space-between" mb="md">
        <Text fw={500}>{title}</Text>
        {badge && (
          <Badge 
            variant="light" 
            color={badge.color}
            leftSection={badge.icon}
          >
            {badge.text}
          </Badge>
        )}
      </Group>
      {children}
    </Card>
  );
};