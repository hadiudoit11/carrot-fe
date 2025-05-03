'use client';

import { useTheme } from './ThemeProvider';

export default function ThemeExample() {
  const theme = useTheme();
  
  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold">Theme Colors Example</h2>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {/* Brand Colors */}
        <div className="space-y-2">
          <h3 className="font-semibold">Brand Colors</h3>
          <div 
            className="h-20 w-full rounded-lg bg-brand-primary flex items-end p-2"
            style={{ backgroundColor: theme.brandPrimary }}
          >
            <span className="text-white text-sm font-mono">Primary: {theme.brandPrimary}</span>
          </div>
          <div 
            className="h-20 w-full rounded-lg bg-brand-secondary flex items-end p-2"
            style={{ backgroundColor: theme.brandSecondary }}
          >
            <span className="text-white text-sm font-mono">Secondary: {theme.brandSecondary}</span>
          </div>
          <div 
            className="h-20 w-full rounded-lg bg-brand-accent flex items-end p-2"
            style={{ backgroundColor: theme.brandAccent }}
          >
            <span className="text-white text-sm font-mono">Accent: {theme.brandAccent}</span>
          </div>
        </div>
        
        {/* Background Colors */}
        <div className="space-y-2">
          <h3 className="font-semibold">Background Colors</h3>
          <div 
            className="h-20 w-full rounded-lg border flex items-end p-2"
            style={{ backgroundColor: theme.backgroundMain }}
          >
            <span className="text-text-primary text-sm font-mono">Main: {theme.backgroundMain}</span>
          </div>
          <div 
            className="h-20 w-full rounded-lg border flex items-end p-2"
            style={{ backgroundColor: theme.backgroundCard }}
          >
            <span className="text-text-primary text-sm font-mono">Card: {theme.backgroundCard}</span>
          </div>
        </div>
        
        {/* Text Colors */}
        <div className="space-y-2">
          <h3 className="font-semibold">Text Colors</h3>
          <div className="h-20 w-full rounded-lg border bg-bg-card flex items-center justify-center">
            <span style={{ color: theme.textPrimary }}>
              Primary Text: {theme.textPrimary}
            </span>
          </div>
          <div className="h-20 w-full rounded-lg border bg-bg-card flex items-center justify-center">
            <span style={{ color: theme.textSecondary }}>
              Secondary Text: {theme.textSecondary}
            </span>
          </div>
        </div>
      </div>
      
      <div className="mt-8">
        <h3 className="font-semibold mb-2">Using Theme Variables in Components</h3>
        <div className="space-y-4">
          <p>You can use the theme in two ways:</p>
          <ol className="list-decimal list-inside space-y-2">
            <li>Through Tailwind classes: <code className="bg-gray-100 px-2 py-1 rounded">bg-brand-primary</code></li>
            <li>Directly in style attributes: <code className="bg-gray-100 px-2 py-1 rounded">style=&#123;&#123; color: theme.textPrimary &#125;&#125;</code></li>
          </ol>
        </div>
      </div>
    </div>
  );
} 