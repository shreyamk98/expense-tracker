import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Drawer,
  NavLink,
  Stack,
  Divider,
  ScrollArea,
  rem,
  Text,
  Group
} from '@mantine/core';
import {
  LayoutDashboard,
  Receipt,
  BarChart3,
  Download,
  Settings as SettingsIcon,
  User,
  Target
} from 'lucide-react';
import { NavigationItem } from '../../types/schema';

interface MobileDrawerProps {
  opened: boolean;
  onClose: () => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
  navigationItems?: NavigationItem[];
}

export const MobileDrawer: React.FC<MobileDrawerProps> = ({
  opened,
  onClose,
  activeTab,
  onTabChange,
  navigationItems = []
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const getCurrentPath = () => {
    const path = location.pathname;
    if (path === '/' || path === '/dashboard') return 'dashboard';
    return path.substring(1); // Remove leading slash
  };

  const currentPath = getCurrentPath();
  const getIcon = (iconName: string) => {
    const iconProps = { size: 20 };
    
    switch (iconName) {
      case 'dashboard':
        return <LayoutDashboard {...iconProps} />;
      case 'expenses':
        return <Receipt {...iconProps} />;
      case 'insights':
        return <BarChart3 {...iconProps} />;
      case 'budgets':
        return <Target {...iconProps} />;
      case 'export':
        return <Download {...iconProps} />;
      case 'profile':
        return <User {...iconProps} />;
      case 'settings':
        return <SettingsIcon {...iconProps} />;
      default:
        return <LayoutDashboard {...iconProps} />;
    }
  };

  const defaultNavigationItems: NavigationItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard', path: '/dashboard', isActive: currentPath === 'dashboard' },
    { id: 'expenses', label: 'Expenses', icon: 'expenses', path: '/expenses', isActive: currentPath === 'expenses' },
    { id: 'insights', label: 'Insights', icon: 'insights', path: '/insights', isActive: currentPath === 'insights' },
    { id: 'budgets', label: 'Budgets', icon: 'budgets', path: '/budgets', isActive: currentPath === 'budgets' },
    { id: 'export', label: 'Export', icon: 'export', path: '/export', isActive: currentPath === 'export' }
  ];

  const userNavigationItems: NavigationItem[] = [
    { id: 'profile', label: 'Profile', icon: 'profile', path: '/profile', isActive: currentPath === 'profile' },
    { id: 'settings', label: 'Settings', icon: 'settings', path: '/settings', isActive: currentPath === 'settings' }
  ];

  const items = navigationItems.length > 0 ? navigationItems : defaultNavigationItems;

  const handleTabChange = (item: NavigationItem) => {
    navigate(item.path);
    if (onTabChange) {
      onTabChange(item.id);
    }
    onClose();
  };

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      size="280px"
      padding="md"
      title={
        <Group>
          <Text size="lg" fw={600} c="primary.6">
            Navigation
          </Text>
        </Group>
      }
      styles={{
        header: {
          paddingBottom: rem(16)
        }
      }}
    >
      <ScrollArea h="calc(100vh - 80px)">
        <Stack gap="xs">
          {/* Main navigation items */}
          {items.map((item) => (
            <NavLink
              key={item.id}
              label={item.label}
              leftSection={getIcon(item.icon)}
              active={item.isActive}
              onClick={() => handleTabChange(item)}
              style={{
                borderRadius: rem(8)
              }}
              styles={{
                root: {
                  padding: rem(16),
                  minHeight: rem(48)
                },
                label: {
                  fontSize: rem(16),
                  fontWeight: 500
                },
                section: {
                  marginRight: rem(16)
                }
              }}
            />
          ))}

          <Divider my="md" />

          {/* User navigation items */}
          {userNavigationItems.map((item) => (
            <NavLink
              key={item.id}
              label={item.label}
              leftSection={getIcon(item.icon)}
              active={item.isActive}
              onClick={() => handleTabChange(item)}
              style={{
                borderRadius: rem(8)
              }}
              styles={{
                root: {
                  padding: rem(16),
                  minHeight: rem(48)
                },
                label: {
                  fontSize: rem(16),
                  fontWeight: 500
                },
                section: {
                  marginRight: rem(16)
                }
              }}
            />
          ))}
        </Stack>
      </ScrollArea>
    </Drawer>
  );
};