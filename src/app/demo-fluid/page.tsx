import React from 'react';
import FluidSimulation from '@/components/FluidSimulation';

export default function FluidDemo() {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="text-center z-10">
        <h1 className="text-6xl font-bold mb-4">Fluid Cursor Demo</h1>
        <p className="text-xl mb-8">Move your mouse around to see the fluid effect</p>
        <div className="space-y-4">
          <div className="p-4 bg-white/10 rounded-lg backdrop-blur-sm">
            <p>This is a test element to show the fluid effect</p>
          </div>
          <div className="p-4 bg-white/10 rounded-lg backdrop-blur-sm">
            <p>Another element to interact with</p>
          </div>
        </div>
      </div>
      <FluidSimulation />
    </div>
  );
} 