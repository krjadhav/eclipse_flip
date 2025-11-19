import React, { useState } from 'react';
import GameBoard from './components/GameBoard';
import { useGameStore } from './store/gameStore';
import { motion, AnimatePresence } from 'framer-motion';
import InstructionsModal from './components/InstructionsModal';

function App() {
  const { levelIndex, nextLevel, resetLevel, isWon, getCurrentLevel, moves } = useGameStore();
  const currentLevel = getCurrentLevel();
  const [showInstructions, setShowInstructions] = useState(true);

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      {showInstructions && <InstructionsModal onClose={() => setShowInstructions(false)} />}

      <GameBoard />

      {/* UI Overlay */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        padding: '20px',
        pointerEvents: 'none', // Let clicks pass through to canvas
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        boxSizing: 'border-box',
        zIndex: 10
      }}>
        <div style={{ pointerEvents: 'auto' }}>
          <h1 style={{ margin: 0, fontSize: '2rem', textShadow: '0 0 10px rgba(255,255,255,0.5)' }}>
            {currentLevel.name}
          </h1>
          <p style={{ margin: '5px 0', opacity: 0.8 }}>{currentLevel.lore}</p>
          <p style={{ margin: '5px 0', fontSize: '0.9rem' }}>Level {levelIndex + 1} | Moves: {moves}</p>
        </div>

        <div style={{ pointerEvents: 'auto', display: 'flex', gap: '10px' }}>
          <button
            onClick={() => setShowInstructions(true)}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: 'white',
              padding: '10px 20px',
              borderRadius: '5px',
              cursor: 'pointer',
              backdropFilter: 'blur(5px)'
            }}
          >
            Help
          </button>
          <button
            onClick={resetLevel}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: 'white',
              padding: '10px 20px',
              borderRadius: '5px',
              cursor: 'pointer',
              backdropFilter: 'blur(5px)'
            }}
          >
            Reset
          </button>
        </div>
      </div>

      {/* Win Modal */}
      <AnimatePresence>
        {isWon && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              background: 'rgba(0, 0, 0, 0.8)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 9999, // High Z-Index to ensure visibility
              pointerEvents: 'auto'
            }}
          >
            <motion.div
              initial={{ scale: 0.8, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              transition={{ type: 'spring', damping: 12 }}
              style={{
                background: '#111',
                padding: '40px',
                borderRadius: '20px',
                border: '1px solid #333',
                textAlign: 'center',
                maxWidth: '400px'
              }}
            >
              <h2 style={{ fontSize: '2.5rem', margin: '0 0 20px 0', color: '#fff' }}>Eclipse Cleared</h2>
              <p style={{ marginBottom: '30px', color: '#aaa' }}>The light has been restored.</p>

              <div style={{
                width: '150px',
                height: '150px',
                background: 'radial-gradient(circle, #fff, #ffaa00, transparent)',
                borderRadius: '50%',
                margin: '0 auto 30px auto',
                boxShadow: '0 0 50px #ffaa00'
              }} />

              <button
                onClick={nextLevel}
                style={{
                  background: '#fff',
                  color: '#000',
                  border: 'none',
                  padding: '15px 30px',
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  borderRadius: '30px',
                  cursor: 'pointer',
                  boxShadow: '0 0 20px rgba(255, 255, 255, 0.5)'
                }}
              >
                Next Level
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
