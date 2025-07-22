import { createTheme, rem } from '@mantine/core';

const theme = createTheme({
  colors: {
    primary: [
      '#e8f5e8',
      '#d1ead1', 
      '#a8d4a8',
      '#7dbd7d',
      '#59a959',
      '#429842',
      '#358c35',
      '#2a7a2a',
      '#226622',
      '#1a5a1a'
    ],
    expense: [
      '#fff0f0',
      '#ffe0e0',
      '#ffb8b8',
      '#ff8e8e',
      '#ff6b6b',
      '#ff5252',
      '#e74c3c',
      '#d63031',
      '#c0392b',
      '#a93226'
    ],
    income: [
      '#e8f5e8',
      '#d1ead1',
      '#a8d4a8',
      '#7dbd7d',
      '#59a959',
      '#429842',
      '#27ae60',
      '#229954',
      '#1e8449',
      '#196f3d'
    ]
  },
  primaryColor: 'primary',
  fontFamily: 'Inter, system-ui, sans-serif',
  headings: {
    fontFamily: 'Inter, system-ui, sans-serif',
    fontWeight: '600'
  },
  defaultRadius: 'md',
  shadows: {
    sm: '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)',
    md: '0 4px 6px rgba(0, 0, 0, 0.07), 0 2px 4px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05)'
  },
  breakpoints: {
    xs: '36em',
    sm: '48em', 
    md: '62em',
    lg: '75em',
    xl: '88em'
  },
  // Add navigation-specific spacing and sizing
  other: {
    headerHeight: rem(60),
    sidebarWidth: rem(280),
    sidebarCollapsedWidth: rem(60),
    navigationTransition: '0.2s ease-in-out',
    navLinkPadding: rem(12),
    navLinkBorderRadius: rem(8),
    navLinkMargin: rem(4),
    navLinkFontSize: rem(14),
    navLinkIconMargin: rem(12)
  }
});

export default theme;