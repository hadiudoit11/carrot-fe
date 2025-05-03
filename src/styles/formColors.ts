/**
 * Form-specific Colors
 * 
 * This file contains color configurations specifically for forms across the application.
 * These colors can be customized independently from the main app color scheme.
 */

export const formColors = {
  // Form backgrounds
  background: {
    main: '#ffffff',        // Main form background
    secondary: '#f8f9fa',   // Secondary elements like input backgrounds
    hover: '#f0f2f5',       // Hover state for interactive elements
  },
  
  // Form text colors
  text: {
    primary: '#323232',     // Main text color
    secondary: '#666666',   // Secondary text (labels, hints)
    placeholder: '#a0a0a0', // Placeholder text
    heading: '#1a1a1a',     // Form headings
  },
  
  // Form borders
  border: {
    light: '#e1e4e8',       // Default border
    focus: '#94bc20',       // Border when input is focused
    error: '#e34c4c',       // Border for error states
  },
  
  // Form button colors
  button: {
    primary: {
      bg: '#94bc20',        // Primary button background
      text: '#ffffff',      // Primary button text
      hover: '#7a9d18',     // Primary button hover
      active: '#648214',    // Primary button active/pressed
    },
    secondary: {
      bg: '#f8f9fa',        // Secondary button background
      text: '#323232',      // Secondary button text
      hover: '#e1e4e8',     // Secondary button hover
      active: '#c9cfd6',    // Secondary button active/pressed
    },
    danger: {
      bg: '#e34c4c',        // Danger button background
      text: '#ffffff',      // Danger button text
      hover: '#c83333',     // Danger button hover
      active: '#a82b2b',    // Danger button active/pressed
    }
  },
  
  // Form states
  states: {
    success: '#2ecc71',
    warning: '#f39c12',
    error: '#e34c4c',
    info: '#3498db',
  },
  
  // Form overlays
  overlay: 'rgba(0, 0, 0, 0.5)'
}; 