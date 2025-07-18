'use client';

import { useEffect, useRef } from 'react';

interface FluidSimulationProps {
  className?: string;
}

const FluidSimulation: React.FC<FluidSimulationProps> = ({ className = '' }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Configuration
    const config = {
      SIM_RESOLUTION: 128,
      DYE_RESOLUTION: 1024,
      DENSITY_DISSIPATION: 3.5,
      VELOCITY_DISSIPATION: 2,
      PRESSURE: 0.1,
      PRESSURE_ITERATIONS: 20,
      CURL: 3,
      SPLAT_RADIUS: 0.2,
      SPLAT_FORCE: 6000,
      SHADING: true,
      COLOR_UPDATE_SPEED: 10,
      PAUSED: false,
      BACK_COLOR: { r: 0.5, g: 0, b: 0 },
      TRANSPARENT: true,
    };

    // Get WebGL context
    const gl = canvas.getContext('webgl2', {
      alpha: true,
      depth: false,
      stencil: false,
      antialias: false,
      preserveDrawingBuffer: false,
    }) || canvas.getContext('webgl', {
      alpha: true,
      depth: false,
      stencil: false,
      antialias: false,
      preserveDrawingBuffer: false,
    });

    if (!gl) {
      console.error('WebGL not supported');
      return;
    }

    // Initialize canvas size
    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      const pixelRatio = window.devicePixelRatio || 1;
      canvas.width = rect.width * pixelRatio;
      canvas.height = rect.height * pixelRatio;
      gl.viewport(0, 0, canvas.width, canvas.height);
    };

    resizeCanvas();

    // Create shaders
    const vertexShader = gl.createShader(gl.VERTEX_SHADER);
    if (!vertexShader) {
      console.error('Failed to create vertex shader');
      return;
    }
    gl.shaderSource(vertexShader, `
      attribute vec2 a_position;
      varying vec2 v_uv;
      
      void main() {
        v_uv = a_position * 0.5 + 0.5;
        gl_Position = vec4(a_position, 0.0, 1.0);
      }
    `);
    gl.compileShader(vertexShader);

    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    if (!fragmentShader) {
      console.error('Failed to create fragment shader');
      return;
    }
    gl.shaderSource(fragmentShader, `
      precision highp float;
      varying vec2 v_uv;
      uniform float u_time;
      uniform vec2 u_resolution;
      uniform vec2 u_mouse;
      uniform float u_mouseDown;
      uniform vec2 u_mouseVelocity;
      
      // Noise functions
      float hash(vec2 p) {
        return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
      }
      
      float noise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        f = f * f * (3.0 - 2.0 * f);
        
        float a = hash(i);
        float b = hash(i + vec2(1.0, 0.0));
        float c = hash(i + vec2(0.0, 1.0));
        float d = hash(i + vec2(1.0, 1.0));
        
        return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
      }
      
      float fbm(vec2 p) {
        float value = 0.0;
        float amplitude = 0.5;
        float frequency = 1.0;
        
        for(int i = 0; i < 5; i++) {
          value += amplitude * noise(p * frequency);
          amplitude *= 0.5;
          frequency *= 2.0;
        }
        
        return value;
      }
      
      // Fluid simulation
      vec2 curl(vec2 p) {
        float eps = 0.01;
        float n1 = fbm(p + vec2(eps, 0.0));
        float n2 = fbm(p - vec2(eps, 0.0));
        float n3 = fbm(p + vec2(0.0, eps));
        float n4 = fbm(p - vec2(0.0, eps));
        float dx = (n3 - n4) / (2.0 * eps);
        float dy = (n1 - n2) / (2.0 * eps);
        return vec2(dy, -dx);
      }
      
      void main() {
        vec2 uv = v_uv;
        vec2 mouse = u_mouse / u_resolution;
        float time = u_time * 0.5;
        
        // Create fluid flow
        vec2 flow = curl(uv * 3.0 + time * 0.1);
        flow *= 0.1;
        
        // Add mouse interaction
        float dist = distance(uv, mouse);
        float mouseInfluence = exp(-dist * 8.0) * u_mouseDown;
        
        // Create fluid color with multiple layers
        vec3 fluidColor = vec3(0.1, 0.3, 0.8);
        
        // Add time-based color variation
        fluidColor += vec3(0.8, 0.2, 0.1) * sin(time + dist * 10.0) * 0.3;
        fluidColor += vec3(0.2, 0.8, 0.4) * sin(time * 0.7 + dist * 15.0) * 0.2;
        fluidColor += vec3(0.9, 0.6, 0.1) * sin(time * 1.3 + dist * 20.0) * 0.1;
        
        // Add flow distortion
        vec2 distortedUV = uv + flow * 0.2;
        float flowNoise = fbm(distortedUV * 4.0 + time * 0.3);
        
        // Create fluid density
        float fluid = flowNoise * 0.5 + 0.5;
        fluid *= exp(-dist * 4.0);
        fluid += mouseInfluence * 0.8;
        
        // Add velocity-based effects
        float velocity = length(u_mouseVelocity);
        float velocityEffect = exp(-velocity * 0.1) * 0.3;
        fluid += velocityEffect;
        
        // Add some sparkle and glow effects
        float sparkle = sin(uv.x * 200.0 + time * 3.0) * sin(uv.y * 200.0 + time * 2.0);
        sparkle = max(0.0, sparkle - 0.95) * 30.0;
        
        float glow = sin(uv.x * 50.0 + time) * sin(uv.y * 50.0 + time * 0.7);
        glow = glow * 0.5 + 0.5;
        glow *= exp(-dist * 2.0);
        
        // Combine all effects
        vec3 finalColor = fluidColor * fluid;
        finalColor += vec3(1.0, 0.8, 0.6) * sparkle * 0.4;
        finalColor += vec3(0.6, 0.8, 1.0) * glow * 0.3;
        
        float alpha = fluid * 0.9 + sparkle * 0.6 + glow * 0.4;
        alpha = min(alpha, 1.0);
        
        gl_FragColor = vec4(finalColor, alpha);
      }
    `);
    gl.compileShader(fragmentShader);

    // Create program
    const program = gl.createProgram();
    if (!program) {
      console.error('Failed to create program');
      return;
    }
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Program link error:', gl.getProgramInfoLog(program));
      return;
    }

    // Create buffer
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      -1, -1,
       1, -1,
      -1,  1,
       1,  1,
    ]), gl.STATIC_DRAW);

    // Get attribute and uniform locations
    const positionLocation = gl.getAttribLocation(program, 'a_position');
    const timeLocation = gl.getUniformLocation(program, 'u_time');
    const resolutionLocation = gl.getUniformLocation(program, 'u_resolution');
    const mouseLocation = gl.getUniformLocation(program, 'u_mouse');
    const mouseDownLocation = gl.getUniformLocation(program, 'u_mouseDown');
    const mouseVelocityLocation = gl.getUniformLocation(program, 'u_mouseVelocity');

    // Mouse tracking
    let mouseX = 0.5;
    let mouseY = 0.5;
    let prevMouseX = 0.5;
    let prevMouseY = 0.5;
    let isMouseDown = false;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      prevMouseX = mouseX;
      prevMouseY = mouseY;
      mouseX = (e.clientX - rect.left) / rect.width;
      mouseY = (e.clientY - rect.top) / rect.height;
    };

    const handleMouseDown = () => {
      isMouseDown = true;
    };

    const handleMouseUp = () => {
      isMouseDown = false;
    };

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const touch = e.touches[0];
      prevMouseX = mouseX;
      prevMouseY = mouseY;
      mouseX = (touch.clientX - rect.left) / rect.width;
      mouseY = (touch.clientY - rect.top) / rect.height;
    };

    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      isMouseDown = true;
    };

    const handleTouchEnd = () => {
      isMouseDown = false;
    };

    // Add event listeners
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchstart', handleTouchStart, { passive: false });
    window.addEventListener('touchend', handleTouchEnd);

    // Animation loop
    let startTime = Date.now();
    const animate = () => {
      const time = (Date.now() - startTime) * 0.001;

      // Calculate mouse velocity
      const mouseVelocityX = mouseX - prevMouseX;
      const mouseVelocityY = mouseY - prevMouseY;

      // Clear canvas
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);

      // Use program
      gl.useProgram(program);

      // Set uniforms
      gl.uniform1f(timeLocation, time);
      gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
      gl.uniform2f(mouseLocation, mouseX, mouseY);
      gl.uniform1f(mouseDownLocation, isMouseDown ? 1.0 : 0.0);
      gl.uniform2f(mouseVelocityLocation, mouseVelocityX, mouseVelocityY);

      // Set up attributes
      gl.enableVertexAttribArray(positionLocation);
      gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

      // Draw
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    // Handle resize
    const handleResize = () => {
      resizeCanvas();
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 w-full h-full pointer-events-none z-50 ${className}`}
      style={{ mixBlendMode: 'screen' }}
    />
  );
};

export default FluidSimulation; 