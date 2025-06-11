# Ball Collision Simulation

BallCollisionSimulation is an interactive 2D sandbox built with TypeScript, HTML, and CSS that allows users to visualize and compare different collision detection algorithms in real time. Designed for curious developers and learners, the simulation offers hands-on control over environmental factors such as gravity, object count, and collision logic.

Users can dynamically switch between collision detection methods—including quadtrees, K-D trees, and uniform grids—to explore how each performs under various conditions. The simulation demonstrates not only the theoretical behavior of these structures but also their practical trade-offs in terms of performance and accuracy.

This is a solo project, built from the ground up to reinforce my understanding of software architecture, physics simulations, and system design patterns like MVC, observer, and dependency injection. One of the key features is a custom-built, Angular-inspired component system that allowed me to keep the code modular and extensible. This system made it easy to nest UI components and even stack collision handlers (e.g., embedding a naïve handler within a grid cell), enabling a high degree of experimentation with minimal coupling.

Whether you're exploring how spatial partitioning affects performance or just want to watch bouncing balls behave under different forces, BallCollisionSimulation is designed to be a fun, educational tool that makes complex systems easy to understand.

---

## Project Structure

```
/project-root
│
├── src/                  # TypeScript source files
├── dist/                 # Compiled JavaScript (output)
├── .eslintrc.js          # ESLint configuration
├── .prettierrc           # Prettier configuration
├── tsconfig.json         # TypeScript configuration
├── package.json
└── README.md
```

---

## Installation

```
# Clone the repo
git clone https://github.com/rockclimber147/BallCollisionSimulation.git

# Navigate to the project folder
cd BallCollisionSimulation

# Install dependencies
npm install
```

---

## 🔧 Scripts

```
# Build the project
npm run build

# Run the project with auto rebuild on changes
npm run watch

# Lint the code
npm run lint

# Format code using Prettier
npm run format
```

---

## 🧪 Linting and Formatting

This project uses:

- [ESLint](https://eslint.org/) for static code analysis
- [Prettier](https://prettier.io/) for code formatting

### ESLint

Configured via `.eslintrc.js` (or `.eslintrc.json`)

```
npm run lint
```

### Prettier

Configured via `.prettierrc`

```
npm run format
```

---

## 🛠 Technologies Used

- TypeScript
- Node.js
- ESLint
- Prettier

---
