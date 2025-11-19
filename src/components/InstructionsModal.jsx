import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const DemoGrid = ({ step }) => {
    // Use the provided GIF for the first step
    if (step === 0) {
        return (
            <div style={{
                width: '160px',
                height: '160px',
                margin: '20px auto',
                background: '#333',
                borderRadius: '8px',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <img
                    src="https://unflipgame.com/drag.gif"
                    alt="Drag demonstration"
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />
            </div>
        );
    }

    // Use the provided GIF for the second step (Flip Tiles)
    if (step === 1) {
        return (
            <div style={{
                width: '160px',
                height: '160px',
                margin: '20px auto',
                background: '#333',
                borderRadius: '8px',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <img
                    src="https://unflipgame.com/flip.gif"
                    alt="Flip demonstration"
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />
            </div>
        );
    }

    // Mini 4x4 grid for demo step 2
    const [grid, setGrid] = useState(Array(4).fill(Array(4).fill(1))); // All white initially

    // Animation logic for the demo
    useEffect(() => {
        const interval = setInterval(() => {
            if (step === 2) {
                // Win state (all black)
                setGrid(Array(4).fill(Array(4).fill(0)));
            }
        }, 2000);
        return () => clearInterval(interval);
    }, [step]);

    return (
        <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '4px',
            width: '160px',
            height: '160px',
            margin: '20px auto',
            background: '#333',
            padding: '4px',
            borderRadius: '8px'
        }}>
            {grid.map((row, r) => row.map((val, c) => (
                <motion.div
                    key={`${r}-${c}`}
                    animate={{
                        backgroundColor: val === 1 ? '#fff' : '#111',
                        rotateX: step === 1 && r >= 1 && r <= 2 && c >= 1 && c <= 2 ? [0, 180, 0] : 0
                    }}
                    transition={{ duration: 0.5 }}
                    style={{ borderRadius: '2px' }}
                />
            )))
            }
        </div>
    );
};

const InstructionsModal = ({ onClose }) => {
    const [step, setStep] = useState(0);

    const slides = [
        {
            title: "Select Squares",
            text: "Drag to select square areas on the grid.",
        },
        {
            title: "Flip Tiles",
            text: "Selected tiles flip colors.",
        },
        {
            title: "Total Eclipse",
            text: "Turn ALL tiles BLACK to complete the level.",
        }
    ];

    return (
        <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(0,0,0,0.9)',
            zIndex: 10000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        }}>
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                style={{
                    background: '#1a1a1a',
                    padding: '40px',
                    borderRadius: '20px',
                    maxWidth: '400px',
                    width: '90%',
                    textAlign: 'center',
                    border: '1px solid #333'
                }}
            >
                <h2 style={{ color: '#fff', marginBottom: '10px' }}>{slides[step].title}</h2>

                <DemoGrid step={step} />

                <p style={{ color: '#ccc', height: '50px' }}>{slides[step].text}</p>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
                    <button
                        onClick={() => setStep(s => Math.max(0, s - 1))}
                        disabled={step === 0}
                        style={{ opacity: step === 0 ? 0.3 : 1, background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}
                    >
                        &lt; Prev
                    </button>

                    <div style={{ display: 'flex', gap: '5px' }}>
                        {slides.map((_, i) => (
                            <div key={i} style={{
                                width: '8px',
                                height: '8px',
                                borderRadius: '50%',
                                background: i === step ? '#fff' : '#444'
                            }} />
                        ))}
                    </div>

                    {step < slides.length - 1 ? (
                        <button
                            onClick={() => setStep(s => s + 1)}
                            style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}
                        >
                            Next &gt;
                        </button>
                    ) : (
                        <button
                            onClick={onClose}
                            style={{
                                background: '#fff',
                                color: '#000',
                                border: 'none',
                                padding: '5px 15px',
                                borderRadius: '15px',
                                fontWeight: 'bold',
                                cursor: 'pointer'
                            }}
                        >
                            Play!
                        </button>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default InstructionsModal;
