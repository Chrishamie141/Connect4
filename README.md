# Connect 4 vs AI

A polished browser-based **Connect 4** game built with plain HTML, CSS, and vanilla JavaScript.
You play as **Red** and the AI plays as **Yellow** on a classic **7x6** board. The game includes difficulty selection, live status messaging, restart controls, responsive UI styling, and a running scoreboard for player wins, AI wins, and draws.

## AI Difficulty Modes

- **Easy**
  - AI picks a random valid column.
  - Good for quick casual games.

- **Medium**
  - AI checks for immediate winning moves.
  - AI blocks your immediate winning moves.
  - Otherwise uses a heuristic scoring strategy (center preference + pattern scoring).

- **Hard**
  - AI first checks immediate win/block opportunities.
  - Then uses **Minimax with alpha-beta pruning** (depth-limited) plus board evaluation scoring.
  - Designed to be much harder to beat than Easy/Medium.

## How to Run Locally

You can run it directly as static files:

1. Download or clone the project.
2. Open `index.html` in your browser.

Optional (recommended) local server examples:

### Python

```bash
python3 -m http.server 8080
```

Then open: `http://localhost:8080`

### Node (serve)

```bash
npx serve .
```

## Deploy for Free on GitHub Pages

1. Create a new GitHub repository and push this project.
2. In GitHub, go to **Settings → Pages**.
3. Under **Build and deployment**, choose:
   - **Source**: `Deploy from a branch`
   - **Branch**: `main` (or your default branch), folder `/ (root)`
4. Save and wait for deployment.
5. GitHub will provide your live URL, usually:
   - `https://<your-username>.github.io/<repo-name>/`

## Short Class Project Description

**Connect 4 vs AI** is a fully client-side web game where the player competes against an AI opponent across three difficulty levels. The project demonstrates front-end architecture, game-state management, win-condition detection, decision-making algorithms (heuristics and minimax with alpha-beta pruning), responsive UI design, and deployment of a static web app.

## Project Structure

- `index.html` — app layout and UI elements
- `style.css` — modern responsive styling
- `script.js` — game state, rendering, event handling, and AI logic

