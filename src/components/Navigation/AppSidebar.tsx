import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  AppShell,
  NavLink,
  Stack,
  Divider,
  ScrollArea,
  rem,
  useMantineTheme
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
import { SidebarProps, NavigationItem } from '../../types/schema';

export const AppSidebar: React.FC<SidebarProps> = ({
  navigationState,
  navigationItems,
  activeTab,
  onTabChange,
  onToggleCollapse
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useMantineTheme();

  const getCurrentPath = () => {
    const path = location.pathname;
    if (path === '/' || path === '/dashboard') return 'dashboard';
    return path.substring(1); // Remove leading slash
  };

  const currentPath = getCurrentPath();
  const getIcon = (iconName: string) => {
    const iconProps = { size: 18 };
    
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

  const handleNavigation = (item: NavigationItem) => {
    navigate(item.path);
    if (onTabChange) {
      onTabChange(item.id);
    }
  };

  const items = navigationItems.length > 0 ? navigationItems : defaultNavigationItems;

  return (
    <AppShell.Navbar
      w={navigationState.isCollapsed ? theme.other.sidebarCollapsedWidth : theme.other.sidebarWidth}
      style={{
        transition: theme.other.navigationTransition
      }}
    >
      <ScrollArea h="100%">
        <Stack gap={0} p={navigationState.isCollapsed ? "xs" : "md"}>
          {/* Main navigation items */}
          {items.map((item) => (
            <NavLink
              key={item.id}
              label={navigationState.isCollapsed ? undefined : item.label}
              leftSection={getIcon(item.icon)}
              active={item.isActive}
              onClick={() => handleNavigation(item)}
              style={{
                borderRadius: theme.other.navLinkBorderRadius,
                marginBottom: theme.other.navLinkMargin
              }}
              styles={{
                root: {
                  padding: theme.other.navLinkPadding,
                  justifyContent: navigationState.isCollapsed ? 'center' : 'flex-start'
                },
                label: {
                  fontSize: theme.other.navLinkFontSize,
                  fontWeight: 500
                },
                section: {
                  marginRight: navigationState.isCollapsed ? 0 : theme.other.navLinkIconMargin
                }
              }}
            />
          ))}

          {!navigationState.isCollapsed && <Divider my="md" />}

          {/* User navigation items */}
          {userNavigationItems.map((item) => (
            <NavLink
              key={item.id}
              label={navigationState.isCollapsed ? undefined : item.label}
              leftSection={getIcon(item.icon)}
              active={item.isActive}
              onClick={() => handleNavigation(item)}
              style={{
                borderRadius: theme.other.navLinkBorderRadius,
                marginBottom: theme.other.navLinkMargin
              }}
              styles={{
                root: {
                  padding: theme.other.navLinkPadding,
                  justifyContent: navigationState.isCollapsed ? 'center' : 'flex-start'
                },
                label: {
                  fontSize: theme.other.navLinkFontSize,
                  fontWeight: 500
                },
                section: {
                  marginRight: navigationState.isCollapsed ? 0 : theme.other.navLinkIconMargin
                }
              }}
            />
          ))}
        </Stack>
      </ScrollArea>
    </AppShell.Navbar>
  );
};