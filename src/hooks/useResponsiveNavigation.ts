import { useState, useEffect } from 'react';
import { useMediaQuery } from '@mantine/hooks';
import { NavigationStateType } from '../types/schema';

export const useResponsiveNavigation = () => {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [navigationState, setNavigationState] = useState<NavigationStateType>({
    isOpen: false,
    isCollapsed: false,
    isMobile: false
  });

  // Update mobile state when screen size changes
  useEffect(() => {
    setNavigationState(prev => ({
      ...prev,
      isMobile,
      isOpen: isMobile ? false : prev.isOpen // Close drawer when switching to desktop
    }));
  }, [isMobile]);

  // Load collapsed state from localStorage on mount
  useEffect(() => {
    const savedCollapsed = localStorage.getItem('sidebar_collapsed');
    if (savedCollapsed !== null && !isMobile) {
      setNavigationState(prev => ({
        ...prev,
        isCollapsed: JSON.parse(savedCollapsed)
      }));
    }
  }, [isMobile]);

  const toggleNavigation = () => {
    setNavigationState(prev => ({
      ...prev,
      isOpen: !prev.isOpen
    }));
  };

  const closeNavigation = () => {
    setNavigationState(prev => ({
      ...prev,
      isOpen: false
    }));
  };

  const toggleCollapse = () => {
    if (!isMobile) {
      const newCollapsed = !navigationState.isCollapsed;
      setNavigationState(prev => ({
        ...prev,
        isCollapsed: newCollapsed
      }));
      // Save to localStorage
      localStorage.setItem('sidebar_collapsed', JSON.stringify(newCollapsed));
    }
  };

  return {
    navigationState,
    toggleNavigation,
    closeNavigation,
    toggleCollapse,
    isMobile
  };
};