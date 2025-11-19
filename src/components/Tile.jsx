import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../store/gameStore';

// Simple shader to make it look interesting
const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  uniform float uTime;
  uniform vec3 uColor;
  uniform float uIsSun; // 1.0 for Sun, 0.0 for Moon
  varying vec2 vUv;

  // Noise function
  float random (in vec2 st) {
      return fract(sin(dot(st.xy,
                           vec2(12.9898,78.233)))*
          43758.5453123);
  }

  float noise (in vec2 st) {
      vec2 i = floor(st);
      vec2 f = fract(st);

      // Four corners in 2D of a tile
      float a = random(i);
      float b = random(i + vec2(1.0, 0.0));
      float c = random(i + vec2(0.0, 1.0));
      float d = random(i + vec2(1.0, 1.0));

      vec2 u = f * f * (3.0 - 2.0 * f);

      return mix(a, b, u.x) +
              (c - a)* u.y * (1.0 - u.x) +
              (d - b) * u.x * u.y;
  }

  void main() {
    vec2 uv = vUv;
    
    // Dynamic pulse (breathing)
    float pulse = sin(uTime * 2.0) * 0.05;
    float breathing = sin(uTime * 1.5) * 0.1 + 0.9; // 0.8 to 1.0 scale effect on light
    
    // Pattern based on Sun or Moon
    float n = noise(uv * 5.0 + uTime * 0.2);
    
    vec3 color = uColor;
    
    if (uIsSun > 0.5) {
        // Sun: Bright, glowing center
        float dist = distance(uv, vec2(0.5));
        float glow = 1.0 - smoothstep(0.2, 0.6, dist);
        
        // Add breathing to the glow
        glow *= breathing;
        
        color += vec3(0.2, 0.2, 0.0) * glow * (1.0 + pulse);
        color += n * 0.1;
        
        // Extra sparkle
        float sparkle = step(0.98, random(uv * uTime)) * 0.5;
        color += vec3(sparkle);
    } else {
        // Moon: Darker, crater-like noise
        color -= n * 0.2;
        color *= 0.8;
        
        // Subtle rim light
        float dist = distance(uv, vec2(0.5));
        float rim = smoothstep(0.6, 0.8, dist) * 0.2;
        color += vec3(0.1, 0.1, 0.3) * rim * breathing;
    }

    gl_FragColor = vec4(color, 1.0);
  }
`;

const Tile = ({ row, col, value }) => {
    const mesh = useRef();
    const material = useRef();

    // Target rotation: 0 for Sun (1), PI for Moon (0)? 
    // Wait, user said "white tiles flip to black".
    // Let's say 1 = White (Sun), 0 = Black (Moon).
    // If I flip, I want to visually rotate the tile.
    // But the grid value changes instantly. I need to animate the visual state.

    // Actually, let's keep the tile static in position, but rotate it 180 degrees on X axis when it flips.
    // We need to track the *accumulated* rotation to keep flipping in one direction or oscillate.
    // Simpler: Target rotation = value === 1 ? 0 : Math.PI.

    const targetRotationX = useRef(value === 1 ? 0 : Math.PI);

    // Update target when value changes
    // If value changes from 0 to 1, we want to rotate to 0 (or 2PI).
    // To make it always flip "forward", we might need to track current visual state.
    // For now, let's just lerp to 0 or PI.

    useFrame((state, delta) => {
        if (mesh.current) {
            // Smooth rotation
            const target = value === 1 ? 0 : Math.PI;

            // Basic lerp for rotation
            mesh.current.rotation.x = THREE.MathUtils.lerp(mesh.current.rotation.x, target, delta * 10);

            // Update shader uniforms
            if (material.current) {
                material.current.uniforms.uTime.value = state.clock.elapsedTime;
                // Interpolate color/state in shader if needed, but rotation handles the "side" flip
                // Actually, if we rotate, we see the back face.
                // BoxGeometry has 6 faces.
                // Front (Z+) is Sun? Back (Z-) is Moon?
                // If we rotate 180 deg on X, Back becomes Front.
            }
        }
    });

    const uniforms = useMemo(() => ({
        uTime: { value: 0 },
        uColor: { value: new THREE.Color('#ffffff') }, // Base color
        uIsSun: { value: 1.0 }
    }), []);

    // We need two materials? One for front (Sun), one for back (Moon).
    // Or one shader that handles both based on normal?
    // Simplest: Array of materials for Box.
    // 0: Right, 1: Left, 2: Top, 3: Bottom, 4: Front (Sun), 5: Back (Moon)

    const sunUniforms = useMemo(() => ({
        uTime: { value: 0 },
        uColor: { value: new THREE.Color('#ffddaa') }, // Warm white
        uIsSun: { value: 1.0 }
    }), []);

    const moonUniforms = useMemo(() => ({
        uTime: { value: 0 },
        uColor: { value: new THREE.Color('#333344') }, // Dark blue-ish grey
        uIsSun: { value: 0.0 }
    }), []);

    return (
        <mesh
            ref={mesh}
            position={[col - 2, -(row - 2), 0]} // Center the 5x5 grid
            rotation={[value === 1 ? 0 : Math.PI, 0, 0]} // Initial rotation
            onClick={(e) => {
                e.stopPropagation();
                // We handle click in the parent (GameBoard) usually, or here?
                // The user selects a "region". This suggests drag or hover-click.
                // "Select square areas (2x2) or larger".
                // This implies a UI overlay or interaction logic.
            }}
        >
            <boxGeometry args={[0.9, 0.9, 0.1]} />
            {/* Sides - dark */}
            <meshStandardMaterial attach="material-0" color="#111" />
            <meshStandardMaterial attach="material-1" color="#111" />
            <meshStandardMaterial attach="material-2" color="#111" />
            <meshStandardMaterial attach="material-3" color="#111" />

            {/* Front - Sun */}
            <shaderMaterial
                attach="material-4"
                vertexShader={vertexShader}
                fragmentShader={fragmentShader}
                uniforms={sunUniforms}
            />

            {/* Back - Moon */}
            <shaderMaterial
                attach="material-5"
                vertexShader={vertexShader}
                fragmentShader={fragmentShader}
                uniforms={moonUniforms}
            />
        </mesh>
    );
};

export default Tile;
