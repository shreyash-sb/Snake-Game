# 🐍 Hungry Snake Game

An elegant, large-scale, and sweet browser-based Snake arcade game built with pure **HTML5 Canvas**, **Modern CSS3**, and **Vanilla JavaScript**. Features zero external asset dependencies, dark & light theme modes, and real-time Web Audio synthesis.

---

## ✨ Features & Highlights

- 🖥️ **Large, Spacious Game Board**: Scaled up to a generous 650px responsive container with a high-resolution (600×600) retina-ready canvas for a clear, immersive view.
- 🌙 **Dark & ☀️ Light Themes**: Instant 1-click theme switcher in the top bar (or press <kbd>T</kbd>) with automatic `localStorage` preference saving.
- 🎨 **Sweet & Friendly Start UI**:
  - Welcoming animated mascot avatar (`🐍 🍎`) with gentle float and wiggle effects.
  - Clean in-overlay instruction card showing all controls before starting.
  - Beautiful, distraction-free board during gameplay with bottom clutter removed.
- 🔊 **Built-in Web Audio Synthesizer**: Pure JavaScript audio synthesis generating pleasant eating chimes, soft turn clicks, and game-over tones with no audio files or loading lag (toggleable via 🔊 icon or <kbd>M</kbd>).
- 🏆 **High Score Tracking**: Automatically preserves your personal best score locally across sessions.
- 🕹️ **Smooth & Responsive Controls**:
  - **Input Buffering**: Eliminates missed rapid turns and prevents suicidal 180° turns.
  - **Mobile Touch**: Fluid touch swipe detection directly on the canvas + virtual on-screen directional buttons.

---

## 🎮 How to Play & Controls

Guide the hungry snake to eat as many red apples as possible. Each apple increases your score by **+10 points** and grows the snake longer. Avoid crashing into the outer walls or running into your own body!

### ⌨️ Desktop Keyboard Shortcuts

| Shortcut | Action | Description |
| :--- | :--- | :--- |
| <kbd>W</kbd> <kbd>A</kbd> <kbd>S</kbd> <kbd>D</kbd> or <kbd>↑</kbd> <kbd>←</kbd> <kbd>↓</kbd> <kbd>→</kbd> | **Move Snake** | Change travel direction (Up, Left, Down, Right) |
| <kbd>Space</kbd> or <kbd>P</kbd> | **Pause / Resume** | Pause or unpause the game at any moment |
| <kbd>R</kbd> | **Restart** | Immediately reset and start a fresh round |
| <kbd>T</kbd> | **Toggle Theme** | Switch between Dark Mode 🌙 and Light Mode ☀️ |
| <kbd>M</kbd> | **Mute Audio** | Toggle sound effects on or off |

### 📱 Mobile & Touch Controls

- **Touch Swiping**: Swipe anywhere on the game board in the desired direction.
- **Virtual D-Pad**: Tap the directional buttons (`▲`, `◀`, `▼`, `▶`) located below the canvas.

---

## 🚀 How to Run

No installation, build step, or Node.js environment required!

### Option 1: Direct File (Quickest)
Double-click [`index.html`](index.html) in your file explorer to open and play immediately in any web browser.

### Option 2: Local HTTP Server (Optional)
Run a lightweight local server in the project folder:

```bash
# Using Python
python -m http.server 8000

# Using Node (npx)
npx serve .
```

Open `http://localhost:8000` in your browser.

---

## 📁 Project Architecture

```
Snake game/
├── index.html       # Semantic layout, top header, large board canvas & sweet start overlay
├── style.css        # Clean design system, dark/light theme variables & responsive sizing
├── script.js        # Game engine, Web Audio synth, high-DPI canvas renderer & input queue
└── README.md        # Complete game documentation and guide
```

---

## 🛠️ Customization

You can tweak the core game settings directly in [`script.js`](script.js):

- **Grid Resolution**: Adjust `GRID_SIZE` (default is `20` for a 20×20 grid).
- **Movement Speed**: Adjust `TICK_SPEED` (default is `105ms` per step; lower is faster).

---