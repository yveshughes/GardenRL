---
title: GardenRL - Hydroponic Farming Environment
emoji: 🌱
colorFrom: green
colorTo: blue
sdk: docker
pinned: false
app_port: 8000
base_path: /web
tags:
  - openenv
  - reinforcement-learning
  - agriculture
  - long-horizon
---

# GardenRL 🌱

**Teaching AI agents to grow food through long-horizon planning in realistic hydroponic environments.**

GardenRL is an OpenEnv environment that simulates hydroponic lettuce farming. Agents must manage pH, nutrients, and temperature over a 30-day growth cycle to maximize harvest yield. Every decision today affects plant health days later — requiring genuine long-horizon reasoning and world modeling.

## Why GardenRL?

### Real-World Impact
Optimizing food production with fewer resources. Hydroponic farming uses 90% less water than traditional agriculture, but requires careful nutrient management. AI agents that master this environment could help scale sustainable food production.

### Verifiable Rewards
No LLM judge needed — harvest weight is measured in grams. A healthy Batavia lettuce yields 150-250g, a stressed plant yields 50-100g, and poor management results in 0g (plant death).

### Genuine Long-Horizon Planning
- **Delayed Consequences**: Today's pH adjustment affects nutrient uptake 3-5 days later
- **Multi-Variable Causality**: pH drift causes calcium lockout, which manifests as brown leaf tips, which reduces photosynthesis, which lowers final yield
- **Sparse Feedback**: Primary reward only comes at harvest (day 30), with intermediate stress signals

### Scientifically Grounded
Based on the **HydroGrowNet of Batavia** dataset (390,000+ images from real NFT hydroponic systems), our simulation captures realistic growth dynamics, nutrient interactions, and stress responses observed in commercial hydroponic farms.

## Quick Start

The simplest way to use GardenRL is through the `GardenEnv` class:

```python
from GardenRL import GardenAction, GardenEnv

# Connect to the environment
env = GardenEnv(base_url="https://huggingface.co/spaces/<your-space>/web")

# Start a new growing cycle
result = env.reset()
print(f"Day {result.observation.day}: pH={result.observation.ph:.2f}, EC={result.observation.ec:.2f}")
print(f"Plant status: {result.observation.growth_stage}")

# Agent manages the garden over 30 days
for day in range(30):
    # Agent decides action based on observations
    if result.observation.ph > 6.5:
        action = GardenAction(
            action_type="adjust_ph_down",
            amount=0.3,
            reasoning="pH too high, risk of phosphorus lockout"
        )
    elif result.observation.ec < 1.2:
        action = GardenAction(
            action_type="add_nutrients",
            amount=0.4,
            reasoning="EC low, plants showing nutrient deficiency"
        )
    else:
        action = GardenAction(
            action_type="maintain",
            reasoning="Conditions optimal, monitoring for drift"
        )

    result = env.step(action)

    # Check plant health
    print(f"Day {result.observation.day}:")
    print(f"  pH: {result.observation.ph:.2f}, EC: {result.observation.ec:.2f}mS/cm")
    print(f"  Leaves: {result.observation.leaf_color} ({result.observation.estimated_leaf_count} leaves)")
    print(f"  Warnings: {result.observation.warnings}")

    if result.observation.done:
        print(f"\n🌱 Harvest! Final yield: {result.reward / 10:.1f}g")
        break

env.close()
```

### Example Output
```
Day 0: pH=6.0, EC=1.6
Plant status: seedling

Day 15: pH=6.2, EC=1.4mS/cm
  Leaves: healthy_green (12 leaves)
  Warnings: []

Day 30:
🌱 Harvest! Final yield: 187.3g
Reward: 1873.0
```

## The Science Behind GardenRL

Our simulation is grounded in the **HydroGrowNet of Batavia** dataset:
- **390,000+ images** from 3 months of NFT hydroponic cultivation
- **Real growth curves** under varying pH, EC, and temperature
- **Validated parameter ranges** from commercial lettuce production

We've distilled this data into a fast, deterministic simulation that captures the essential dynamics without requiring image processing or ML models during runtime.

## Building the Docker Image

```bash
# From project root
docker build -t GardenRL-env:latest -f server/Dockerfile .
```

## Deploying to Hugging Face Spaces

You can easily deploy your OpenEnv environment to Hugging Face Spaces using the `openenv push` command:

```bash
# From the environment directory (where openenv.yaml is located)
openenv push

# Or specify options
openenv push --namespace my-org --private
```

The `openenv push` command will:
1. Validate that the directory is an OpenEnv environment (checks for `openenv.yaml`)
2. Prepare a custom build for Hugging Face Docker space (enables web interface)
3. Upload to Hugging Face (ensuring you're logged in)

### Prerequisites

- Authenticate with Hugging Face: The command will prompt for login if not already authenticated

### Options

- `--directory`, `-d`: Directory containing the OpenEnv environment (defaults to current directory)
- `--repo-id`, `-r`: Repository ID in format 'username/repo-name' (defaults to 'username/env-name' from openenv.yaml)
- `--base-image`, `-b`: Base Docker image to use (overrides Dockerfile FROM)
- `--private`: Deploy the space as private (default: public)

### Examples

```bash
# Push to your personal namespace (defaults to username/env-name from openenv.yaml)
openenv push

# Push to a specific repository
openenv push --repo-id my-org/my-env

# Push with a custom base image
openenv push --base-image ghcr.io/meta-pytorch/openenv-base:latest

# Push as a private space
openenv push --private

# Combine options
openenv push --repo-id my-org/my-env --base-image custom-base:latest --private
```

After deployment, your space will be available at:
`https://huggingface.co/spaces/<repo-id>`

The deployed space includes:
- **Web Interface** at `/web` - Interactive UI for exploring the environment
- **API Documentation** at `/docs` - Full OpenAPI/Swagger interface
- **Health Check** at `/health` - Container health monitoring
- **WebSocket** at `/ws` - Persistent session endpoint for low-latency interactions

## Environment Details

### Action Space
**GardenAction**: Agent actions for managing the hydroponic system

```python
action_type: str  # One of:
                  # - "adjust_ph_up" / "adjust_ph_down"
                  # - "add_nutrients" / "dilute_nutrients"
                  # - "heat_water" / "cool_water"
                  # - "maintain" (do nothing)
                  # - "harvest" (only after day 25+)

amount: float     # Action magnitude (0.1-0.5 for pH/EC adjustments)
reasoning: str    # Agent's diagnosis/reasoning (encouraged for better outcomes)
```

### Observation Space
**GardenObservation**: Rich sensory data about plant and system state

```python
# Time
day: int                    # Current day (0-30)

# Water chemistry (sensor readings)
ph: float                   # 0-14 scale (optimal: 5.5-6.5)
ec: float                   # Electrical conductivity in mS/cm (optimal: 1.2-2.0)
water_temp: float           # Celsius (optimal: 18-22°C)

# Plant metrics (visual observations)
leaf_color: str            # "healthy_green" | "light_green" | "yellowing" | "brown_tips" | "purple_veins"
estimated_leaf_count: int  # Number of visible leaves
plant_height_cm: float     # Estimated height

# Growth tracking
growth_stage: str          # "seedling" | "vegetative" | "mature" | "declining"

# Agent reasoning signals
warnings: List[str]        # ["pH drift detected", "nutrient lockout risk", etc.]

# Reward/termination
reward: float             # 0 until harvest, then harvest_weight × 10
done: bool                # True after harvest or plant death
```

### Reward Function

**Primary Reward** (deterministic, no LLM judge):
```python
harvest_reward = harvest_weight_grams × 10
```

- **Healthy plant** (optimal management): 150-250g → **1,500-2,500 reward**
- **Stressed plant** (suboptimal conditions): 50-100g → **500-1,000 reward**
- **Dead plant** (severe mismanagement): 0g → **0 reward**

**Daily Penalties** (optional, for training signals):
```python
daily_penalty = -abs(ph - 6.0) × 5        # pH deviation
daily_penalty += -abs(ec - 1.6) × 5       # EC deviation
daily_penalty += -stress_indicator × 10   # Visible stress
```

### Growth Dynamics

The simulation models real hydroponic interactions:

1. **pH Drift**: pH naturally rises over time; agent must adjust
2. **Nutrient Depletion**: EC drops as plants consume nutrients
3. **Nutrient Lockout**: Wrong pH prevents nutrient uptake (even if EC is fine)
4. **Stress Accumulation**: Today's mistakes compound over days
5. **Temperature Effects**: Suboptimal temp slows growth, reduces final yield

**Example Causal Chain**:
```
Day 5: pH drifts to 7.2 (too high)
  ↓
Day 6-8: Calcium uptake blocked (nutrient lockout)
  ↓
Day 9: Brown leaf tips appear (calcium deficiency symptom)
  ↓
Day 10-15: Reduced photosynthesis (damaged leaves)
  ↓
Day 30: Harvest 80g instead of 200g (60% yield loss)
```

This delayed causality forces agents to plan ahead and maintain conditions proactively.

## Advanced Usage

### Connecting to an Existing Server

If you already have a Gardenrl environment server running, you can connect directly:

```python
from GardenRL import GardenrlEnv

# Connect to existing server
GardenRLenv = GardenrlEnv(base_url="<ENV_HTTP_URL_HERE>")

# Use as normal
result = GardenRLenv.reset()
result = GardenRLenv.step(GardenrlAction(message="Hello!"))
```

Note: When connecting to an existing server, `GardenRLenv.close()` will NOT stop the server.

### Using the Context Manager

The client supports context manager usage for automatic connection management:

```python
from GardenRL import GardenrlAction, GardenrlEnv

# Connect with context manager (auto-connects and closes)
with GardenrlEnv(base_url="http://localhost:8000") as env:
    result = env.reset()
    print(f"Reset: {result.observation.echoed_message}")
    # Multiple steps with low latency
    for msg in ["Hello", "World", "!"]:
        result = env.step(GardenrlAction(message=msg))
        print(f"Echoed: {result.observation.echoed_message}")
```

The client uses WebSocket connections for:
- **Lower latency**: No HTTP connection overhead per request
- **Persistent session**: Server maintains your environment state
- **Efficient for episodes**: Better for many sequential steps

### Concurrent WebSocket Sessions

The server supports multiple concurrent WebSocket connections. To enable this,
modify `server/app.py` to use factory mode:

```python
# In server/app.py - use factory mode for concurrent sessions
app = create_app(
    GardenrlEnvironment,  # Pass class, not instance
    GardenrlAction,
    GardenrlObservation,
    max_concurrent_envs=4,  # Allow 4 concurrent sessions
)
```

Then multiple clients can connect simultaneously:

```python
from GardenRL import GardenrlAction, GardenrlEnv
from concurrent.futures import ThreadPoolExecutor

def run_episode(client_id: int):
    with GardenrlEnv(base_url="http://localhost:8000") as env:
        result = env.reset()
        for i in range(10):
            result = env.step(GardenrlAction(message=f"Client {client_id}, step {i}"))
        return client_id, result.observation.message_length

# Run 4 episodes concurrently
with ThreadPoolExecutor(max_workers=4) as executor:
    results = list(executor.map(run_episode, range(4)))
```

## Development & Testing

### Direct Environment Testing

Test the environment logic directly without starting the HTTP server:

```bash
# From the server directory
python3 server/GardenRL_environment.py
```

This verifies that:
- Environment resets correctly
- Step executes actions properly
- State tracking works
- Rewards are calculated correctly

### Running Locally

Run the server locally for development:

```bash
uvicorn server.app:app --reload
```

## Use Cases

### Research
- Study long-horizon planning algorithms
- Test world modeling capabilities
- Benchmark causal reasoning in LLMs

### Training
- RL training with delayed rewards
- Imitation learning from expert gardeners
- Multi-step reasoning fine-tuning

### Education
- Learn hydroponic principles through simulation
- Explore nutrient chemistry interactively
- Practice troubleshooting plant deficiencies

## Project Structure

```
GardenRL/
├── README.md                      # This file (what judges see)
├── PROJECT_SCOPE.md               # Detailed hackathon scope
├── openenv.yaml                   # OpenEnv manifest
├── pyproject.toml                 # Dependencies
├── models.py                      # GardenAction & GardenObservation
├── client.py                      # GardenEnv client
└── server/
    ├── GardenRL_environment.py   # Core simulation logic
    ├── app.py                     # FastAPI server
    └── Dockerfile                 # Container build
```

## Acknowledgments

Built for the **OpenEnv Hackathon** (March 2026) by an avid hydroponic gardener with 10+ years of hands-on experience. Every parameter, stress response, and deficiency symptom in this simulation reflects real lessons learned from building greenhouses and managing NFT systems.

**Dataset**: [HydroGrowNet of Batavia](https://data.mendeley.com/datasets/g6cm3v3wdp/5) - Mendeley Data

---

*🌱 Teaching AI to grow food, one lettuce at a time.*
