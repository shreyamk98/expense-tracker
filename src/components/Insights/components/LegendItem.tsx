import React, { ReactNode } from 'react';
import { Group, Text, Badge } from '@mantine/core';

interface LegendItemProps {
  color: string;
  label: string;
  value?: string;
  badge?: {
    text: string;
    color?: string;
    variant?: string;
  };
  rightContent?: ReactNode;
}

export const LegendItem: React.FC<LegendItemProps> = ({
  color,
  label,
  value,
  badge,
  rightContent
}) => {
  return (
    <Group justify="space-between">
      <Group gap="xs">
        <div
          style={{
            width: 12,
            height: 12,
            backgroundColor: color,
            borderRadius: 2
          }}
        />
        <Text size="sm">{label}</Text>
      </Group>
      <Group gap="xs">
        {value && (
          <Text size="sm" fw={500}>{value}</Text>
        )}
        {badge && (
          <Badge 
            variant={badge.variant || "light"} 
            color={badge.color}
            size="xs"
          >
            {badge.text}
          </Badge>
        )}
        {rightContent}
      </Group>
    </Group>
  );
};