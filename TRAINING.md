# GardenRL Training Guide

## Quick Start

### 1. Install Dependencies

```bash
pip install -e .  # Installs W&B and other dependencies
```

### 2. Configure W&B

```bash
wandb login  # Enter your W&B API key when prompted
```

Or set environment variable:
```bash
export WANDB_API_KEY=your_api_key_here
```

### 3. Run Training

**Optimal Policy (Recommended for demo):**
```bash
python train.py --episodes 500 --strategy optimal
```

**Random Policy (Baseline comparison):**
```bash
python train.py --episodes 500 --strategy random
```

**Comparison (Alternating random/optimal):**
```bash
python train.py --episodes 1000 --strategy comparison
```

### 4. Export Data for Frontend

After training completes, export the data:

```bash
# Copy training data to frontend
cp training_logs/episodes_*.json landing-page/public/data/training-episodes.json

# Export best episode for replay mode
python scripts/export_episode.py training_logs/episodes_*.json \
    --output landing-page/public/data/episode-replay.json
```

## Training Strategies

### Optimal (Rule-Based)
- Maintains pH between 5.5-6.5
- Keeps EC between 1.2-2.0
- Harvests at day 27-30
- **Expected:** 150-250g harvest (1500-2500 reward)
- **Success rate:** ~80-90%

### Random
- Random actions each day
- No parameter management
- **Expected:** 0-100g harvest (0-1000 reward)
- **Death rate:** ~60-80%

### Comparison
- Alternates between optimal and random
- Shows learning progression
- Useful for before/after visualizations

## Output Files

### Training Logs
- **Location:** `training_logs/episodes_YYYYMMDD_HHMMSS.json`
- **Contains:** All episode data with per-day metrics
- **Format:**
  ```json
  {
    "total_episodes": 500,
    "episodes": [
      {
        "episode": 1,
        "strategy": "optimal",
        "reward": 2230,
        "harvest_weight": 223,
        "days_survived": 30,
        "final_ph": 6.1,
        "final_ec": 1.7,
        "steps": [...]
      }
    ]
  }
  ```

### W&B Dashboard
- **Project:** `gardenrl-training`
- **Metrics tracked:**
  - `episode` - Episode number
  - `reward` - Total reward (harvest weight × 10)
  - `harvest_weight` - Final harvest in grams
  - `days_survived` - Episode length
  - `final_ph` - pH at episode end
  - `final_ec` - EC at episode end
  - `died` - Whether plant died (1) or survived (0)
  - `success` - Whether harvest >= 150g

## Running on H100 GPU (Northflank)

### 1. Deploy GPU Service

```bash
# Service is already configured in gpu-service.json
# Deploy via Northflank dashboard or CLI
```

### 2. SSH into GPU Instance

```bash
# Get SSH credentials from Northflank dashboard
ssh user@gpu-instance-url
```

### 3. Install Dependencies

```bash
cd /workspace
git clone https://github.com/yveshughes/GardenRL.git
cd GardenRL
pip install -e .
wandb login
```

### 4. Run Training

```bash
# Run 1000 episodes (takes ~2-6 hours depending on GPU)
python train.py --episodes 1000 --strategy comparison
```

### 5. Download Results

```bash
# From your local machine
scp user@gpu-instance:/workspace/GardenRL/training_logs/*.json ./training_logs/
```

## Verification Checklist

Before using training data for visualizations:

- [ ] W&B dashboard shows all episodes logged
- [ ] Training logs JSON file exists
- [ ] Episode data includes per-day metrics
- [ ] Success rate makes sense for strategy (optimal: ~80%, random: ~10%)
- [ ] Best episode has 150g+ harvest
- [ ] Data is REAL (not synthetic) - critical for hackathon integrity

## Troubleshooting

### W&B Not Installing
```bash
pip install wandb --upgrade
```

### Import Errors
```bash
# Make sure you're in project root
cd /Users/yves/Developer/GardenRL
pip install -e .
```

### Training Takes Too Long
```bash
# Start with fewer episodes for testing
python train.py --episodes 50 --strategy optimal
```

### Memory Issues
```bash
# Disable W&B if needed
python train.py --episodes 500 --strategy optimal --no-wandb
```

## Next Steps

After training completes:

1. **Verify data quality**
   - Check W&B dashboard for learning curves
   - Inspect JSON file for completeness
   - Confirm best episode has good harvest

2. **Export for frontend**
   - Copy training data to `landing-page/public/data/`
   - Export best episode for replay mode

3. **Build visualizations**
   - Create D3.js charts using real data
   - Add TrainingResults section to landing page
   - Update tech specs with W&B screenshots

---

**Remember:** All data MUST be real. No synthetic/fake data allowed per hackathon rules.
