# GardenRL - Project Context

## Overview
**GardenRL** is a reinforcement learning environment for the OpenEnv Hackathon (March 2026) that teaches AI agents to grow hydroponic lettuce through long-horizon planning. The project combines a scientifically-grounded Python simulation with a high-quality Next.js landing page.

**Core Value Proposition:**
- 30-day episodes with delayed rewards requiring genuine long-horizon planning
- Verifiable outcomes (harvest weight in grams, no LLM judge)
- Scientifically grounded in HydroGrowNet dataset (390k+ images)
- Targeting Mercor sub-bounty for reasoning rewards

## Project Structure

```
GardenRL/
├── server/                        # Python OpenEnv environment
│   ├── GardenRL_environment.py   # Core hydroponic simulation logic
│   ├── app.py                    # FastAPI server
│   └── Dockerfile                # Container for HuggingFace Spaces
├── landing-page/                  # Next.js marketing site
│   ├── app/                       # App router pages
│   ├── components/                # React components
│   │   ├── sections/             # Scroll-based section components
│   │   └── GantryRobotDemo.tsx   # Three.js robot visualization
│   └── public/                    # Static assets
├── tests/                         # pytest test suite
├── models.py                      # GardenrlAction & GardenrlObservation
├── client.py                      # Python client for the environment
├── gpu-service.json              # Northflank H100 GPU deployment config
└── _files/                        # HydroGrowNet dataset samples
```

## Tech Stack

### Backend (Python)
- **OpenEnv** - Environment framework
- **FastAPI** - HTTP/WebSocket server
- **pytest** - Testing framework
- Python 3.10+

### Frontend (Next.js Landing Page)
- **Next.js 16** with App Router
- **React 19** - UI framework
- **TypeScript 5** - Type safety
- **Tailwind CSS 4** - Styling
- **Framer Motion** - Animations
- **Three.js** - 3D robot visualization
- **D3.js** - Data visualization

### Infrastructure
- **Northflank** - H100-80 GPU deployment (4 CPU cores, 16GB RAM, 30GB SSD)
- **Hugging Face Spaces** - Environment hosting
- **Docker** - Containerization

## Landing Page Design System

### Visual Identity
- **Color Palette:** Emerald green primary (`emerald-400`, `emerald-500`), dark slate backgrounds (`slate-950`, `slate-900`)
- **Typography:** Display classes for headers, clean sans-serif
- **Layout:** Scroll-based storytelling with snap sections (`snap-section` class)
- **Animations:** Framer Motion for smooth transitions, fade-ins on scroll

### Component Patterns
- Use client components (`'use client'`) for interactive elements
- Sections should be full viewport height with `snap-section` class
- Gradient backgrounds: `bg-gradient-to-b from-black to-gray-950`
- Grid backgrounds: `grid-bg opacity-20` for depth
- Cards with blur: `bg-slate-900/50 backdrop-blur-sm border border-emerald-900/30`

### Three.js Conventions
- Robot demos use basic geometry (boxes, cylinders) with metallic materials
- Animation loops at 60fps with `requestAnimationFrame`
- Responsive canvas sizing with window resize handlers

## Development Guidelines

### Code Quality
- **TypeScript:** Use strict types, avoid `any`
- **Python:** Type hints for all function signatures
- **Testing:** Write tests for environment logic before deploying
- **No over-engineering:** Keep solutions simple and focused

### Git Workflow
- **Commits:** Create semantic commits with clear messages
- **Testing:** Run `pytest` before committing environment changes
- **Build:** Run `npm run build` in `landing-page/` before pushing frontend changes
- **Main branch:** Direct pushes are fine (solo project)

### Deployment

#### Hugging Face Spaces (Environment)
```bash
openenv push --repo-id <username>/GardenRL
```

#### Northflank (GPU Training)
- Use `gpu-service.json` for H100 deployment config
- Base image: `ubuntu:22.04` (customize in Dockerfile)
- Resources: 4 CPU cores, 16GB RAM, 1x H100-80 GPU
- Region: `meta-openenv`

#### Landing Page
- Build: `cd landing-page && npm run build`
- Deploy to Vercel or similar (TBD)

## Environment Simulation Details

### Core Mechanics
1. **pH Drift:** Naturally rises over time (agent must adjust)
2. **Nutrient Depletion:** EC drops as plants consume nutrients
3. **Nutrient Lockout:** Wrong pH prevents uptake (delayed symptoms)
4. **Stress Accumulation:** Mistakes compound over days
5. **Temperature Effects:** Suboptimal temps reduce yield

### Optimal Ranges
- pH: 5.5-6.5 (sweet spot: 6.0)
- EC: 1.2-2.0 mS/cm (sweet spot: 1.6)
- Water temp: 18-22°C (sweet spot: 20°C)

### Reward Structure
- **Healthy plant:** 150-250g harvest → 1,500-2,500 reward
- **Stressed plant:** 50-100g harvest → 500-1,000 reward
- **Dead plant:** 0g → 0 reward

## Standing Permissions

### You May (Without Asking)
- Read any file in the codebase
- Edit environment logic in `server/GardenRL_environment.py`
- Add/modify landing page components
- Run tests with `pytest`
- Create commits for completed features
- Install new dependencies (add to `pyproject.toml` or `package.json`)

### Ask Before
- Pushing to remote (always confirm before `git push`)
- Deploying to Hugging Face or Northflank
- Making breaking changes to the API (GardenrlAction/Observation)
- Deleting files or major refactors
- Force-pushing or rewriting git history

## Key Files to Remember

### Most Frequently Modified
- [server/GardenRL_environment.py](server/GardenRL_environment.py) - Environment logic
- [landing-page/components/sections/](landing-page/components/sections/) - Landing page sections
- [landing-page/app/tech-specs/page.tsx](landing-page/app/tech-specs/page.tsx) - Tech specs page
- [models.py](models.py) - Action/Observation types

### Configuration
- [gpu-service.json](gpu-service.json) - Northflank deployment
- [openenv.yaml](openenv.yaml) - OpenEnv manifest
- [pyproject.toml](pyproject.toml) - Python dependencies
- [landing-page/package.json](landing-page/package.json) - Frontend dependencies

## Common Tasks

### Running Tests
```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=server --cov-report=term-missing
```

### Local Development
```bash
# Start environment server
uvicorn server.app:app --reload

# Start landing page
cd landing-page && npm run dev
```

### Building Docker Image
```bash
docker build -t gardenrl-env:latest -f server/Dockerfile .
```

## Project Goals & Constraints

### What This Project IS
- A professional-grade RL environment for research
- A scientifically-grounded hydroponic simulation
- A high-quality landing page showcasing the environment
- A hackathon submission for OpenEnv

### What This Project is NOT
- A full-stack web app (no user accounts, databases, etc.)
- A production farming system (it's a simulation)
- Over-engineered (keep it simple and focused)

## Design Principles

1. **Scientific Accuracy:** All hydroponic parameters based on real data
2. **Verifiable Rewards:** No LLM judges, deterministic outcomes
3. **Long-Horizon Focus:** Emphasize delayed consequences and planning
4. **Clean Code:** Type hints, clear naming, minimal abstractions
5. **Visual Polish:** Landing page should look professional and distinctive

## Notes for Claude

- The `_files/` directory contains dataset samples - don't modify these
- The landing page uses scroll-based storytelling - maintain this pattern for new sections
- When editing environment logic, preserve the causal chain system (pH → nutrient lockout → symptoms → yield loss)
- Always run tests after modifying `GardenRL_environment.py`
- The Mercor sub-bounty rewards agents for reasoning - encourage token output in action design
- GPU service is for future training experiments - not yet active

---

*Last updated: 2026-03-07*
