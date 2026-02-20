// Design System / Theme
// All colors, typography, and spacing definitions in one place

export const colors = {
  // Pantone Palette
  ribbonRed: '#C5003E',
  deepBlue: '#003D6A',
  piquantGreen: '#00A878',
  flax: '#EDD382',
  sandstorm: '#F4C95D',
  allure: '#E63946',
  cloudDancer: '#F0EEE4',
  
  // Grays
  textGray: '#374151', // gray-700
  textMuted: '#6B7280', // gray-500
  
  // Base
  white: '#FFFFFF',
  black: '#000000',
};

export const typography = {
  fonts: {
    heading: 'var(--font-taybigbird)',
    body: 'var(--font-taybirdie)',
  },
  
  sizes: {
    h1: '39px',      // Name
    h2: '18px',      // Section headers
    body: '13px',    // Body text
    subheading: '13px', // Bold subheadings
  },
  
  weights: {
    normal: 500,
    bold: 700,
    extraBold: 900,
  },
  
  lineHeights: {
    tight: 1,
    normal: 1.5,
    relaxed: 1.75,
  },
};

export const spacing = {
  section: '48px',        // mb-12 (3rem = 48px)
  sectionLarge: '64px',   // mb-16
  paragraph: '16px',      // space-y-4 (1rem = 16px)
  paragraphLarge: '24px', // space-y-6 (1.5rem = 24px)
  inline: '24px',         // gap-6 (1.5rem = 24px)
};

export const layout = {
  maxWidth: '768px',      // max-w-3xl
  padding: '48px',        // px-12
  paddingVertical: {
    mobile: '64px',       // py-16
    desktop: '96px',      // md:py-24
  },
};
