'use client';

export default function FontExample() {
  return (
    <div className="p-6 space-y-8">
      <h2 className="text-2xl font-bold text-text-primary">Typography Example</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Primary Font (Cal Sans) */}
        <div className="space-y-4">
          <h3 className="font-semibold text-xl text-text-primary border-b border-border-accent pb-2">
            Primary Font: Cal Sans
          </h3>
          
          <div className="space-y-4">
            <div>
              <p className="font-primary text-5xl mb-2">Cal Sans Display</p>
              <p className="font-primary text-3xl mb-2">Crisp and Modern</p>
              <p className="font-primary text-2xl">Perfect for Headings</p>
            </div>
            
            <div className="bg-secondary p-4 rounded-lg">
              <h4 className="font-primary text-xl text-primary mb-2">
                Primary Font in Headings
              </h4>
              <p className="font-primary text-lg text-primary">
                Cal Sans gives your interface a crisp, contemporary feel with excellent readability for titles and headings.
              </p>
            </div>
          </div>
        </div>
        
        {/* Secondary Font (Open Sans) */}
        <div className="space-y-4">
          <h3 className="font-semibold text-xl text-text-primary border-b border-border-accent pb-2">
            Secondary Font: Open Sans
          </h3>
          
          <div className="space-y-4">
            <div>
              <p className="font-secondary text-lg font-light mb-2">Light 300: The quick brown fox jumps over the lazy dog.</p>
              <p className="font-secondary text-lg font-normal mb-2">Regular 400: The quick brown fox jumps over the lazy dog.</p>
              <p className="font-secondary text-lg font-medium mb-2">Medium 500: The quick brown fox jumps over the lazy dog.</p>
              <p className="font-secondary text-lg font-semibold mb-2">Semibold 600: The quick brown fox jumps over the lazy dog.</p>
              <p className="font-secondary text-lg font-bold">Bold 700: The quick brown fox jumps over the lazy dog.</p>
            </div>
            
            <div className="bg-tertiary p-4 rounded-lg">
              <h4 className="font-primary text-xl text-text-light mb-2">
                Content with Secondary Font
              </h4>
              <p className="font-secondary text-text-light">
                Open Sans provides excellent readability for body content. It's a versatile, friendly sans-serif typeface that works well across various screen sizes and devices. The clean design pairs perfectly with Cal Sans headings to create a harmonious typography system.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-tertiary p-6 rounded-lg border-2 border-border-accent mt-8 shadow-accent-offset">
        <h3 className="font-primary text-2xl text-text-light mb-4">Typography Combination Example</h3>
        
        <div className="space-y-4">
          <div>
            <h4 className="font-primary text-xl text-text-light mb-2">Project Dashboard</h4>
            <p className="font-secondary text-text-secondary">
              Combining Cal Sans for headings with Open Sans for body text creates a modern, professional look that enhances readability and visual hierarchy in your application.
            </p>
          </div>
          
          <div className="mt-6">
            <h4 className="font-primary text-lg text-accent mb-2">Feature Highlight</h4>
            <p className="font-secondary text-text-secondary">
              The contrast between the distinctive personality of Cal Sans and the neutrality of Open Sans helps users quickly scan and comprehend information.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 