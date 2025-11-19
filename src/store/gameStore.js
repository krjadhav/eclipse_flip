import { create } from 'zustand';

const GRID_SIZE = 5;

const LEVELS = [
  {
    id: 1,
    name: "The Spark",
    lore: "A single spark can ignite the stars.",
    // Pattern: A 2x2 black square in the top-left (0,0 to 1,1)
    initialGrid: [
      [1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1],
    ]
  },
  {
    id: 2,
    name: "The Void",
    lore: "Stare into the abyss.",
    // Pattern: A 3x3 black square in the center with a white center (Hollow square)
    initialGrid: [
      [1, 1, 1, 1, 1],
      [1, 0, 0, 0, 1],
      [1, 0, 0, 0, 1],
      [1, 0, 0, 0, 1],
      [1, 1, 1, 1, 1],
    ]
  },
  {
    id: 3,
    name: "The Corner",
    lore: "Darkness hides in the angles.",
    // Pattern: An L shape (3x3 bottom-left corner, missing top-right)
    initialGrid: [
      [1, 1, 0, 0, 0],
      [1, 1, 0, 0, 0],
      [0, 0, 1, 1, 1],
      [0, 0, 1, 1, 1],
      [0, 0, 1, 1, 1],
    ]
  },
  {
    id: 4,
    name: "Fragmentation",
    lore: "The unity is breaking.",
    // Pattern: A 2x2 block and a separate 1x1
    initialGrid: [
      [0, 0, 0, 0, 0],
      [0, 0, 1, 1, 0],
      [0, 1, 0, 1, 0],
      [0, 1, 1, 0, 0],
      [0, 0, 0, 0, 0],
    ]
  },
  {
    id: 5,
    name: "Duality",
    lore: "Two sides of the same coin.",
    // Pattern: Two vertical bars
    initialGrid: [
      [0, 1, 0, 1, 0],
      [1, 0, 1, 0, 1],
      [1, 0, 0, 0, 1],
      [0, 1, 0, 1, 0],
      [0, 0, 1, 0, 0],
    ]
  }
];

export const useGameStore = create((set, get) => ({
  levelIndex: 0,
  grid: LEVELS[0].initialGrid,
  isWon: false,
  moves: 0,

  resetLevel: () => {
    const { levelIndex } = get();
    set({
      grid: JSON.parse(JSON.stringify(LEVELS[levelIndex].initialGrid)),
      isWon: false,
      moves: 0
    });
  },

  nextLevel: () => {
    const { levelIndex } = get();
    if (levelIndex < LEVELS.length - 1) {
      const nextIndex = levelIndex + 1;
      set({
        levelIndex: nextIndex,
        grid: JSON.parse(JSON.stringify(LEVELS[nextIndex].initialGrid)),
        isWon: false,
        moves: 0
      });
    } else {
      console.log("Game Completed!");
    }
  },

  flipRegion: (r, c, w, h) => {
    const { grid, isWon } = get();
    if (isWon) return;

    const newGrid = grid.map(row => [...row]);

    for (let i = r; i < r + h; i++) {
      for (let j = c; j < c + w; j++) {
        if (i >= 0 && i < GRID_SIZE && j >= 0 && j < GRID_SIZE) {
          newGrid[i][j] = newGrid[i][j] === 0 ? 1 : 0;
        }
      }
    }

    // Check win condition (All 0s / Black / Moon)
    const allBlack = newGrid.every(row => row.every(cell => cell === 0));

    set((state) => ({
      grid: newGrid,
      moves: state.moves + 1,
      isWon: allBlack
    }));
  },

  getCurrentLevel: () => LEVELS[get().levelIndex],
}));
