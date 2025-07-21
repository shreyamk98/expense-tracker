import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AppShell,
  Group,
  Text,
  Avatar,
  Menu,
  ActionIcon,
  Burger,
  rem
} from '@mantine/core';
import {
  User,
  Settings as SettingsIcon,
  LogOut,
  ChevronDown,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react';
import { HeaderProps } from '../../types/schema';
import { formatUserInitials } from '../../utils/formatters';

export const AppHeader: React.FC<HeaderProps> = ({
  navigationState,
  onToggleNavigation,
  onToggleCollapse,
  currentUser,
  onSignOut
}) => {
  const navigate = useNavigate();

  const handleProfileClick = () => {
    navigate('/profile');
  };

  const handleSettingsClick = () => {
    navigate('/settings');
  };
  return (
    <AppShell.Header h={rem(60)}>
      <Group justify="space-between" h="100%" px="md">
        {/* Left side - Logo and navigation controls */}
        <Group gap="md">
          {/* Mobile hamburger menu */}
          <Burger
            opened={navigationState.isOpen}
            onClick={onToggleNavigation}
            hiddenFrom="md"
            size="sm"
          />
          
          {/* Desktop sidebar toggle */}
          <ActionIcon
            variant="subtle"
            size="sm"
            onClick={onToggleCollapse}
            visibleFrom="md"
            aria-label={navigationState.isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {navigationState.isCollapsed ? (
              <PanelLeftOpen size={18} />
            ) : (
              <PanelLeftClose size={18} />
            )}
          </ActionIcon>

          <Text size="xl" fw={600} c="primary.6">
            Expense Tracker
          </Text>
        </Group>

        {/* Right side - User menu */}
        {currentUser && (
          <Menu shadow="md" width={200} position="bottom-end">
            <Menu.Target>
              <Group style={{ cursor: 'pointer' }} gap="xs">
                <Avatar 
                  src={currentUser.profilePicture} 
                  size="sm" 
                  radius="xl"
                  color="primary"
                >
                  {formatUserInitials(currentUser.firstName, currentUser.lastName)}
                </Avatar>
                <Text size="sm" fw={500} visibleFrom="sm">
                  {currentUser.firstName}
                </Text>
                <ActionIcon variant="subtle" size="sm">
                  <ChevronDown size={14} />
                </ActionIcon>
              </Group>
            </Menu.Target>

            <Menu.Dropdown>
              <Menu.Label>Account</Menu.Label>
              <Menu.Item 
                leftSection={<User size={14} />}
                onClick={handleProfileClick}
              >
                My Profile
              </Menu.Item>
              <Menu.Item 
                leftSection={<SettingsIcon size={14} />}
                onClick={handleSettingsClick}
              >
                Settings
              </Menu.Item>
              <Menu.Divider />
              <Menu.Item 
                leftSection={<LogOut size={14} />} 
                color="red" 
                onClick={onSignOut}
              >
                Logout
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        )}
      </Group>
    </AppShell.Header>
  );
};