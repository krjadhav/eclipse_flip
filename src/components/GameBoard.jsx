import React, { useState, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import Tile from './Tile';
import { useGameStore } from '../store/gameStore';
import * as THREE from 'three';

// Inner component for the animated background to ensure useFrame is within Canvas context
const StarField = () => {
    const starsRef = useRef();

    useFrame((state, delta) => {
        if (starsRef.current) {
            starsRef.current.rotation.y += delta * 0.05;
            starsRef.current.rotation.x += delta * 0.02;
        }
    });

    return (
        <group ref={starsRef}>
            <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        </group>
    );
};

const ResponsiveCamera = () => {
    const { camera, viewport } = useThree();

    useFrame(() => {
        // Adjust camera Z position based on viewport aspect ratio to keep grid in view
        // Grid is roughly 6 units wide (5 tiles + spacing)
        // More aggressive zoom for portrait mobile
        let targetZ;
        if (viewport.aspect < 0.7) {
            targetZ = 16; // Very portrait (phones)
        } else if (viewport.aspect < 1) {
            targetZ = 14; // Portrait tablets
        } else {
            targetZ = 8; // Landscape/desktop
        }
        camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetZ, 0.1);
    });

    return null;
};

const GameBoard = () => {
    const grid = useGameStore(state => state.grid);
    const flipRegion = useGameStore(state => state.flipRegion);
    const isWon = useGameStore(state => state.isWon);

    const [selectionStart, setSelectionStart] = useState(null);
    const [currentPointer, setCurrentPointer] = useState(null);

    const handlePointerDown = (r, c) => {
        if (isWon) return;
        setSelectionStart({ r, c });
        setCurrentPointer({ r, c });
    };

    const handlePointerEnter = (r, c) => {
        if (selectionStart) {
            setCurrentPointer({ r, c });
        }
    };

    // Helper to calculate the valid square selection based on start and current pointer
    const getSquareSelection = () => {
        if (!selectionStart || !currentPointer) return null;

        const start = selectionStart;
        const current = currentPointer;

        const dr = current.r - start.r;
        const dc = current.c - start.c;

        const signR = dr >= 0 ? 1 : -1;
        const signC = dc >= 0 ? 1 : -1;

        // We want the largest square that fits in the direction of the drag
        // But constrained by the grid boundaries.

        let size = Math.max(Math.abs(dr), Math.abs(dc));

        // Check bounds constraints
        // If expanding positive R, max size is (4 - start.r)
        // If expanding negative R, max size is (start.r)
        const limitR = signR > 0 ? (4 - start.r) : start.r;
        const limitC = signC > 0 ? (4 - start.c) : start.c;

        // The actual size is limited by the tightest bound
        const actualSize = Math.min(size, limitR, limitC);

        const endR = start.r + signR * actualSize;
        const endC = start.c + signC * actualSize;

        const r1 = Math.min(start.r, endR);
        const r2 = Math.max(start.r, endR);
        const c1 = Math.min(start.c, endC);
        const c2 = Math.max(start.c, endC);

        return { r1, c1, r2, c2, size: actualSize + 1 }; // size is in tiles (e.g. 0..1 is size 2)
    };

    const handlePointerUp = () => {
        const selection = getSquareSelection();
        if (selection) {
            const { r1, c1, size } = selection;
            // Only flip if size >= 2 (2x2 or larger)
            if (size >= 2) {
                flipRegion(r1, c1, size, size);
            }
        }
        setSelectionStart(null);
        setCurrentPointer(null);
    };

    // Helper to check if a tile is currently selected
    const isSelected = (r, c) => {
        const selection = getSquareSelection();
        if (!selection) return false;
        const { r1, c1, r2, c2 } = selection;
        return r >= r1 && r <= r2 && c >= c1 && c <= c2;
    };

    // Helper to check if selection is valid (>= 2x2)
    const isValidSelection = () => {
        const selection = getSquareSelection();
        if (!selection) return false;
        return selection.size >= 2;
    };

    return (
        <div
            style={{ width: '100%', height: '100vh', position: 'relative', touchAction: 'none' }}
            onPointerUp={handlePointerUp}
        >
            <Canvas
                camera={{ position: [0, 0, 8], fov: 50 }}
                gl={{ preserveDrawingBuffer: true }}
                dpr={Math.min(window.devicePixelRatio, 2)}
            >
                <color attach="background" args={['#050505']} />
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} />

                <StarField />
                <ResponsiveCamera />

                <group>
                    {grid.map((row, r) =>
                        row.map((val, c) => (
                            <group key={`${r}-${c}`}>
                                <Tile
                                    row={r}
                                    col={c}
                                    value={val}
                                />
                                {/* Invisible interaction plane for each tile position */}
                                <mesh
                                    position={[c - 2, -(r - 2), 0.6]} // Slightly in front
                                    visible={false}
                                    onPointerDown={(e) => {
                                        e.stopPropagation();
                                        handlePointerDown(r, c);
                                    }}
                                    onPointerEnter={(e) => {
                                        e.stopPropagation();
                                        handlePointerEnter(r, c);
                                    }}
                                >
                                    <planeGeometry args={[0.9, 0.9]} />
                                </mesh>

                                {/* Selection Highlight */}
                                {isSelected(r, c) && (
                                    <mesh position={[c - 2, -(r - 2), 0.51]}>
                                        <planeGeometry args={[0.9, 0.9]} />
                                        <meshBasicMaterial
                                            color={isValidSelection() ? "#00ff00" : "#ff0000"}
                                            transparent
                                            opacity={0.3}
                                            side={THREE.DoubleSide}
                                        />
                                    </mesh>
                                )}
                            </group>
                        ))
                    )}
                </group>

                {/* OrbitControls restricted to avoid getting lost */}
                <OrbitControls enableRotate={false} enableZoom={false} enablePan={false} />
            </Canvas>
        </div>
    );
};

export default GameBoard;
