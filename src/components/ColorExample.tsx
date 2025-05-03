'use client';

import { colors } from '@/styles/colors';

export default function ColorExample() {
  // Helper function to safely get gray colors
  const getGrayColor = (weight: number): string => {
    const key = `gray${weight}` as keyof typeof colors;
    return (typeof colors[key] === 'string') ? colors[key] as string : '#cccccc';
  };

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold">Application Colors</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Brand Colors */}
        <div className="space-y-2">
          <h3 className="font-semibold">Brand Colors</h3>
          
          <div className="h-20 w-full rounded-lg flex items-end p-2 bg-primary">
            <span className="text-white text-sm font-mono">Primary: {colors.primary}</span>
          </div>
          
          <div className="h-20 w-full rounded-lg flex items-end p-2 bg-secondary">
            <span className="text-white text-sm font-mono">Secondary: {colors.secondary}</span>
          </div>
          
          <div className="h-20 w-full rounded-lg flex items-end p-2 bg-accent">
            <span className="text-white text-sm font-mono">Accent: {colors.accent}</span>
          </div>
        </div>
        
        {/* Background Colors */}
        <div className="space-y-2">
          <h3 className="font-semibold">Background Colors</h3>
          
          <div className="h-20 w-full rounded-lg border flex items-end p-2 bg-bg-main">
            <span className="text-text-primary text-sm font-mono">Main: {colors.bgMain}</span>
          </div>
          
          <div className="h-20 w-full rounded-lg border flex items-end p-2 bg-bg-card">
            <span className="text-text-primary text-sm font-mono">Card: {colors.bgCard}</span>
          </div>
          
          <div className="h-20 w-full rounded-lg flex items-end p-2 bg-bg-dark">
            <span className="text-white text-sm font-mono">Dark: {colors.bgDark}</span>
          </div>
        </div>
        
        {/* Status Colors */}
        <div className="space-y-2">
          <h3 className="font-semibold">Status Colors</h3>
          
          <div className="h-12 w-full rounded-lg flex items-center justify-center bg-status-success">
            <span className="text-white font-medium">Success</span>
          </div>
          
          <div className="h-12 w-full rounded-lg flex items-center justify-center bg-status-warning">
            <span className="text-white font-medium">Warning</span>
          </div>
          
          <div className="h-12 w-full rounded-lg flex items-center justify-center bg-status-error">
            <span className="text-white font-medium">Error</span>
          </div>
          
          <div className="h-12 w-full rounded-lg flex items-center justify-center bg-status-info">
            <span className="text-white font-medium">Info</span>
          </div>
        </div>
      </div>
      
      {/* Gray Scale */}
      <div>
        <h3 className="font-semibold mb-2">Gray Scale</h3>
        <div className="grid grid-cols-5 md:grid-cols-10 gap-1">
          {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map((weight) => (
            <div key={weight} className="space-y-1 text-center">
              <div 
                className={`h-12 rounded-md ${weight >= 500 ? 'text-white' : 'text-black'}`}
                style={{ backgroundColor: getGrayColor(weight) }}
              >
                {weight}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="bg-bg-card p-6 rounded-lg mt-8">
        <h3 className="font-semibold mb-4 text-text-primary">How to Use Colors</h3>
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium mb-2">Tailwind Classes</h4>
            <code className="block bg-gray-100 p-3 rounded text-sm">
              {'<div className="bg-primary text-white">Primary Button</div>'}
            </code>
          </div>
          
          <div>
            <h4 className="text-sm font-medium mb-2">CSS Variables</h4>
            <code className="block bg-gray-100 p-3 rounded text-sm">
              {'.my-class { color: var(--color-primary); }'}
            </code>
          </div>
          
          <div>
            <h4 className="text-sm font-medium mb-2">Import in JavaScript</h4>
            <code className="block bg-gray-100 p-3 rounded text-sm">
              {'import { colors } from \'@/styles/colors\';\n\n<div style={{ backgroundColor: colors.primary }}>...</div>'}
            </code>
          </div>
        </div>
      </div>
    </div>
  );
} 